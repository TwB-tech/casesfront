const express = require('express');
const path = require('path');

module.exports = async (req, res) => {
  const app = express();
  
  // Serve static files from dist folder
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
  
  return app(req, res);
};
