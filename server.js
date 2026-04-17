const path = require('path');
const { promises: fsp } = require('fs');
const crypto = require('crypto');

// HTTPS redirect middleware for production
const enforceHTTPS = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
};

module.exports = async function (context) {
  const { req, res } = context;
  const requestPath = req.path.replace(/^\//, '') || 'index.html';
  const filePath = path.join(__dirname, 'dist', requestPath);

  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.map': 'application/json'
  };

  try {
    // Try to serve the requested file if it exists
    try {
      const stat = await fsp.stat(filePath);
      if (stat.isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const content = await fsp.readFile(filePath);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        // Security Headers
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        // HSTS - only in production
        if (process.env.NODE_ENV === 'production') {
          res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://cloud.appwrite.io https://*.appwrite.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self';");
        res.send(content);
        return;
      }
    } catch (err) {
      // File not found or not a file, fall through to SPA fallback
    }

    // Fallback to index.html for SPA routing
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    let indexContent = await fsp.readFile(indexPath);

    // Inject CSP nonce for inline scripts in production
    if (process.env.NODE_ENV === 'production') {
      const nonce = require('crypto').randomBytes(16).toString('hex');
      indexContent = indexContent.replace(
        /<head>/i,
        `<head><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://cloud.appwrite.io https://*.appwrite.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"><meta name="csrf-token" content="${nonce}">`
      );
    }

    res.setHeader('Content-Type', 'text/html');
    // Security headers for SPA fallback
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    res.send(indexContent);

  } catch (error) {
    res.statusCode = 500;
    res.send(`Error: ${error.message}`);
  }
};
