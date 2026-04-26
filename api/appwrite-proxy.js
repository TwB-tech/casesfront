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
 * 
 *   Request: POST /api/appwrite-proxy/databases/123/collections/users/documents
 *   Proxies to: POST https://.../databases/123/collections/users/documents
 */

export default async function handler(req, res) {
  const { method, headers, body } = req;

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

  // Prepare headers for Appwrite
  const appwriteHeaders = {
    'X-Appwrite-Project': projectId,
    'X-Appwrite-Key': apiKey,
    'Content-Type': headers['content-type'] || 'application/json',
  };

  // Forward session for authenticated user requests
  if (headers['x-appwrite-session']) {
    appwriteHeaders['X-Appwrite-Session'] = headers['x-appwrite-session'];
  }
  if (headers['x-appwrite-jwt']) {
    appwriteHeaders['X-Appwrite-JWT'] = headers['x-appwrite-jwt'];
  }
  if (headers['authorization']) {
    appwriteHeaders['Authorization'] = headers['authorization'];
  }

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.kwakorti.live');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Appwrite-Project, X-Appwrite-Key, X-Appwrite-Session, X-Appwrite-JWT, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(204).end();
    return;
  }

  try {
    // Forward request to Appwrite
    const appwriteRes = await fetch(targetUrl, {
      method,
      headers: appwriteHeaders,
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });

    // Parse response
    let responseBody;
    const contentType = appwriteRes.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseBody = await appwriteRes.json();
    } else {
      responseBody = await appwriteRes.text();
    }

    // Set CORS headers for browser
    res.setHeader('Access-Control-Allow-Origin', 'https://www.kwakorti.live');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Forward specific Appwrite headers
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

    // Return response
    res.status(appwriteRes.status);
    if (contentType && contentType.includes('application/json')) {
      res.json(responseBody);
    } else {
      res.send(responseBody);
    }

  } catch (error) {
    console.error('Appwrite proxy error:', error);
    res.status(500).json({
      error: 'Proxy error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
}
