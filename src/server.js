const fs = require('fs');
const path = require('path');

module.exports = async function (context) {
  const { req, res } = context;
  const requestPath = req.path.replace(/^\//, '') || 'index.html';
  const filePath = path.join(__dirname, 'dist', requestPath);
  
  // MIME types mapping
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
    // Check if file exists
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      const content = fs.readFileSync(filePath);
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(content);
      return;
    }
    
    // Fallback to index.html for SPA routing
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    const indexContent = fs.readFileSync(indexPath);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(indexContent);
    
  } catch (error) {
    res.setStatusCode(500);
    res.send(`Error: ${error.message}`);
  }
};
