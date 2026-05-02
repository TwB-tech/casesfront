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
    // If an upstream middleware already parsed the body, rebuild it here.
    if (req.body !== undefined) {
      const serialized =
        typeof req.body === 'string' || Buffer.isBuffer(req.body)
          ? req.body
          : JSON.stringify(req.body);
      resolve(Buffer.from(serialized || ''));
      return;
    }

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  const { method, headers } = req;

  // Parse URL to extract the path after /api/appwrite-proxy
  const url = new URL(req.url, `http://${req.headers.host}`);
  // Works both for direct serverless route:
  //   /api/appwrite-proxy/account
  // and Express-mounted route:
  //   /account
  const normalizedPath = url.pathname.replace(/^\/+/, '');
  const appwritePath = normalizedPath
    .replace(/^api\/appwrite-proxy\/?/, '')
    .replace(/^appwrite-proxy\/?/, '');
  
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

   if (!projectId) {
     res.status(500).json({
       error: 'Appwrite project ID not configured',
       message: 'APPWRITE_PROJECT_ID must be set in Vercel environment variables',
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
     } catch (err) {
       console.error('Failed to read request body:', err);
       res.status(400).json({ error: 'Failed to read request body' });
       return;
     }
   }

   // Prepare headers for Appwrite
   const appwriteHeaders = {
     'X-Appwrite-Project': projectId,
     'Content-Type': headers['content-type'] || 'application/json',
   };

   if (headers['x-fallback-cookies']) {
     appwriteHeaders['X-Fallback-Cookies'] = headers['x-fallback-cookies'];
   }

   // Forward session for authenticated user requests (takes precedence over API key)
   if (headers['x-appwrite-session']) {
     appwriteHeaders['X-Appwrite-Session'] = headers['x-appwrite-session'];
   } else if (headers['x-appwrite-jwt']) {
     appwriteHeaders['X-Appwrite-JWT'] = headers['x-appwrite-jwt'];
   } else if (headers['authorization']) {
     appwriteHeaders['Authorization'] = headers['authorization'];
   } else {
    // Only use API key if no user session provided (server-to-server)
    if (apiKey) {
      appwriteHeaders['X-Appwrite-Key'] = apiKey;
    }
  }

  // Determine allowed CORS origins (comma-separated env var, fallback to production domain + localhost)
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['https://www.kwakorti.live', 'http://localhost:3000'];
  const requestOrigin = headers.origin || '';
  // In development, allow any origin; in production, check allowlist
  const isAllowed = process.env.NODE_ENV !== 'production' || allowedOrigins.includes(requestOrigin);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    const originToSend = isAllowed ? requestOrigin : allowedOrigins[0];
    res.setHeader('Access-Control-Allow-Origin', originToSend);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, X-Appwrite-Project, X-Appwrite-Key, X-Appwrite-Session, X-Appwrite-JWT, X-Fallback-Cookies, Authorization'
    );
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
    const corsOrigin = isAllowed ? requestOrigin : allowedOrigins[0];
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Forward important headers from Appwrite
    const forwardHeaders = [
      'x-appwrite-id',
      'x-appwrite-active',
      'x-appwrite-logs',
      'x-appwrite-message',
      'x-appwrite-code',
      'x-appwrite-version',
      'x-fallback-cookies',
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
