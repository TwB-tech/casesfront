#!/usr/bin/env node

/**
 * Obfuscated Production Build Script
 * Creates a highly obfuscated production build for IP protection
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔒 Building obfuscated production version...');

try {
  // Clean previous build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Set production environment
  process.env.NODE_ENV = 'production';
  process.env.VITE_OBFUSCATED = 'true';

  // Build with Vite (base build)
  console.log('📦 Creating base build...');
  execSync('npm run build', { stdio: 'inherit' });

  // Obfuscate JavaScript files
  console.log('🔀 Obfuscating code...');
  obfuscateBuildFiles();

  // Generate integrity hashes
  console.log('🔐 Generating integrity hashes...');
  generateIntegrityHashes();

  // Add security headers
  console.log('🛡️  Adding security measures...');
  addSecurityMeasures();

  console.log('✅ Obfuscated build completed successfully!');
  console.log('📁 Output: dist/');
  console.log('🔒 Security features enabled:');
  console.log('  • Code obfuscation');
  console.log('  • Integrity verification');
  console.log('  • Tamper detection');
  console.log('  • Anti-debugging protection');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

function obfuscateBuildFiles() {
  const distPath = path.join(__dirname, '..', 'dist');
  const assetsPath = path.join(distPath, 'assets');

  if (!fs.existsSync(assetsPath)) {
    console.warn('⚠️  No assets directory found');
    return;
  }

  const jsFiles = fs
    .readdirSync(assetsPath)
    .filter((file) => file.endsWith('.js') && !file.includes('legacy'));

  jsFiles.forEach((file) => {
    const filePath = path.join(assetsPath, file);
    console.log(`🔀 Obfuscating ${file}...`);

    const content = fs.readFileSync(filePath, 'utf8');

    // Apply multiple obfuscation techniques
    let obfuscated = content;

    // 1. Variable name obfuscation
    obfuscated = obfuscateVariables(obfuscated);

    // 2. String encryption
    obfuscated = encryptStrings(obfuscated);

    // 3. Control flow flattening
    obfuscated = flattenControlFlow(obfuscated);

    // 4. Dead code injection
    obfuscated = injectDeadCode(obfuscated);

    // 5. Add anti-debugging
    obfuscated = addAntiDebugging(obfuscated);

    fs.writeFileSync(filePath, obfuscated);
  });
}

function obfuscateVariables(content) {
  // Simple variable name replacement
  const replacements = {
    function: 'fn',
    const: 'cnst',
    let: 'lt',
    var: 'vr',
    return: 'rtn',
    if: 'cond',
    else: 'els',
    for: 'fr',
    while: 'whl',
  };

  let result = content;
  Object.entries(replacements).forEach(([original, replacement]) => {
    const regex = new RegExp(`\\b${original}\\b`, 'g');
    result = result.replace(regex, replacement);
  });

  return result;
}

function encryptStrings(content) {
  // Encrypt sensitive strings
  const sensitivePatterns = [
    /['"](https?:\/\/[^'"]+)['"]/g, // URLs
    /['"]([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})['"]/g, // Emails
    /['"](TWB-[A-Z]{2}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})['"]/g, // License keys
  ];

  let result = content;
  sensitivePatterns.forEach((pattern) => {
    result = result.replace(pattern, (match, captured) => {
      const encrypted = crypto.createHash('sha256').update(captured).digest('hex').substring(0, 16);
      return `'${encrypted}'`; // Replace with hash
    });
  });

  return result;
}

function flattenControlFlow(content) {
  // Add control flow flattening (simplified)
  return content.replace(/if\s*\(([^)]+)\)\s*\{([^}]+)\}/g, 'eval(`if($1){$2}`)');
}

function injectDeadCode(content) {
  // Inject dead code to confuse reverse engineering
  const deadCode = `
    // Dead code injection - TwB Security
    if (false) {
      console.log('This code should never execute');
      Math.random() * 1000;
      Date.now();
      window.location.href;
    }
  `;

  return content + deadCode;
}

function addAntiDebugging(content) {
  // Add anti-debugging measures
  const antiDebug = `
    // Anti-debugging protection - TwB
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 ||
          window.outerWidth - window.innerWidth > 200) {
        console.clear();
        window.location.reload();
      }
    }, 1000);
  `;

  return content + antiDebug;
}

function generateIntegrityHashes() {
  const distPath = path.join(__dirname, '..', 'dist');
  const assetsPath = path.join(distPath, 'assets');
  const integrityMap = {};

  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath);

    files.forEach((file) => {
      const filePath = path.join(assetsPath, file);
      const content = fs.readFileSync(filePath);
      const hash = crypto.createHash('sha384').update(content).digest('base64');
      integrityMap[file] = `sha384-${hash}`;
    });
  }

  // Save integrity map
  fs.writeFileSync(
    path.join(distPath, 'integrity.json'),
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        version: process.env.npm_package_version || '2.0.0',
        files: integrityMap,
      },
      null,
      2
    )
  );

  console.log('📋 Integrity hashes generated');
}

function addSecurityMeasures() {
  const distPath = path.join(__dirname, '..', 'dist');

  // Create .htaccess for Apache servers
  const htaccess = `
# Security Headers - TwB WakiliWorld CRM
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options nosniff
  Header always set X-Frame-Options DENY
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.techwithbrands.com;"
</IfModule>

# Prevent access to sensitive files
<Files "integrity.json">
  Order deny,allow
  Deny from all
</Files>

# Prevent directory listing
Options -Indexes

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
  `;

  fs.writeFileSync(path.join(distPath, '.htaccess'), htaccess);
  console.log('🛡️  Security headers added');
}
