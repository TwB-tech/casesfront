import { URL } from 'url';

/**
 * Vercel Serverless Function: Appwrite API Proxy
 * 
 * Route: /api/appwrite-proxy/*
 * Purpose: Proxy all Appwrite API requests through Vercel to avoid CORS.
 * 
 * Example:
 *   Request: GET /api/appwrite-proxy/account
 *   Proxies to: GET https://tor.cloud.appwrite.io/v1/account
 */

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  const { method, headers } = req;

  // Debug: log incoming request headers (sanitized)
  if (method !== 'GET' && process.env.NODE_ENV !== 'production') {
    console.log('Proxy incoming headers:', {
      'content-type': headers['content-type'],
      'x-appwrite-project': headers['x-appwrite-project'] ? 'present' : 'absent',
      'x-appwrite-key': headers['x-appwrite-key'] ? 'present' : 'absent',
      'x-appwrite-session': headers['x-appwrite-session'] ? 'present' : 'absent',
      'x-appwrite-jwt': headers['x-appwrite-jwt'] ? 'present' : 'absent',
      'authorization': headers['authorization'] ? 'present' : 'absent',
    });
  }

  // Parse URL to extract the path after /api/appwrite-proxy
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  // Remove 'api' and 'appwrite-proxy' segments
  const appwritePath = pathSegments.slice(2).join('/');
  
  // If no specific path, return status
  if (!appwritePath) {
    res.status(200).json({
      service: 'appwrite-proxy',
      status: 'ok',
      message: 'Appwrite API proxy is running',
      endpoints: ['/api/appwrite-proxy/*'],
    });
    return;
  }

  // Get Appwrite credentials from Vercel environment
  const projectId = process.env.APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const endpoint = process.env.APPWRITE_ENDPOINT || 'https://tor.cloud.appwrite.io/v1';

  if (!projectId || !apiKey) {
    res.status(500).json({
      error: 'Appwrite credentials not configured',
      message: 'APPWRITE_PROJECT_ID and APPWRITE_API_KEY must be set in Vercel environment variables',
    });
    return;
  }

  // Build target URL to Appwrite
  const targetUrl = `${endpoint.replace(/\/$/, '')}/${appwritePath}${url.search}`;

   // Collect request body if present
   let reqBody = null;
   if (method !== 'GET' && method !== 'HEAD' && headers['content-type']) {
     try {
       reqBody = await collectBody(req);
       console.log('Collected request body size:', reqBody.length, 'bytes');
       if (reqBody.length < 200) {
         console.log('Body preview:', reqBody.toString('utf8'));
       }
     } catch (err) {
       console.error('Failed to read request body:', err);
       res.status(400).json({ error: 'Failed to read request body' });
       return;
     }
   } else {
     console.log('No body collection (method:', method, 'content-type:', headers['content-type'], ')');
   }

   // Prepare headers for Appwrite
   const appwriteHeaders = {
     'X-Appwrite-Project': projectId,
     'X-Appwrite-Key': apiKey,
     'Content-Type': headers['content-type'] || 'application/json',
   };

   // Forward session for authenticated user requests
   if (headers['x-appwrite-session']) {
     appwriteHeaders['X-Appwrite-Session'] = headers['x-appwrite-session'];
     console.log('Forwarding X-Appwrite-Session (length:', headers['x-appwrite-session'].length, ')');
   } else {
     console.log('No X-Appwrite-Session header from client');
   }
   if (headers['x-appwrite-jwt']) {
     appwriteHeaders['X-Appwrite-JWT'] = headers['x-appwrite-jwt'];
     console.log('Forwarding X-Appwrite-JWT');
   }
   if (headers['authorization']) {
     appwriteHeaders['Authorization'] = headers['authorization'];
     console.log('Forwarding Authorization');
   }

   // Log outgoing headers (redact key)
   console.log('Outgoing headers to Appwrite:', {
     'X-Appwrite-Project': appwriteHeaders['X-Appwrite-Project'],
     'X-Appwrite-Key': '***redacted***',
     'X-Appwrite-Session': appwriteHeaders['X-Appwrite-Session'] ? 'present' : 'absent',
     'Content-Type': appwriteHeaders['Content-Type']
   });

   // Handle CORS preflight
   if (method === 'OPTIONS') {
     res.setHeader('Access-Control-Allow-Origin', 'https://www.kwakorti.live');
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Appwrite-Project, X-Appwrite-Key, X-Appwrite-Session, X-Appwrite-JWT, Authorization');
     res.setHeader('Access-Control-Allow-Credentials', 'true');
     res.statusCode = 204;
     res.end();
     return;
   }

   try {
     // Forward request to Appwrite
     const appwriteRes = await fetch(targetUrl, {
       method,
       headers: appwriteHeaders,
       body: reqBody,
     });

     // Set status code
     res.statusCode = appwriteRes.status;

     // Set CORS headers for browser
     res.setHeader('Access-Control-Allow-Origin', 'https://www.kwakorti.live');
     res.setHeader('Access-Control-Allow-Credentials', 'true');

     // Forward important headers from Appwrite
     const forwardHeaders = [
       'x-appwrite-id',
       'x-appwrite-active',
       'x-appwrite-logs',
       'x-appwrite-message',
       'x-appwrite-code',
       'x-appwrite-version',
       'etag',
       'cache-control',
       'last-modified',
       'content-type',
     ];
     for (const header of forwardHeaders) {
       const value = appwriteRes.headers.get(header);
       if (value) {
         res.setHeader(header, value);
       }
     }

     // Read full response body and forward (simpler, reliable)
     const bodyBuffer = await appwriteRes.arrayBuffer();
     res.end(Buffer.from(bodyBuffer));

   } catch (error) {
     console.error('Appwrite proxy error:', error);
     res.statusCode = 500;
     res.setHeader('Content-Type', 'application/json');
     res.end(JSON.stringify({
       error: 'Proxy error',
       message: error.message,
       ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
     }));
   }
}
