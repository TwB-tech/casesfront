#!/usr/bin/env node

/**
 * Integrity Hash Generator
 * Generates SHA-384 hashes for all build files for tamper detection
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const distPath = path.join(__dirname, '..', 'dist');
const assetsPath = path.join(distPath, 'assets');
const integrityFile = path.join(distPath, 'integrity-hashes.json');

console.log('🔐 Generating integrity hashes...');

if (!fs.existsSync(assetsPath)) {
  console.error('❌ No dist/assets directory found. Run build first.');
  process.exit(1);
}

const integrityMap = {
  generated: new Date().toISOString(),
  version: process.env.npm_package_version || '2.0.0',
  build: process.env.BUILD_HASH || crypto.randomBytes(16).toString('hex'),
  files: {},
};

const files = fs.readdirSync(assetsPath, { recursive: true }).filter((file) => {
  const ext = path.extname(file);
  return ['.js', '.css', '.map'].includes(ext);
});

files.forEach((file) => {
  const filePath = path.join(assetsPath, file);
  const stat = fs.statSync(filePath);

  if (stat.isFile()) {
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha384').update(content).digest('base64');
    integrityMap.files[file] = {
      hash: `sha384-${hash}`,
      size: stat.size,
      modified: stat.mtime.toISOString(),
    };
  }
});

// Save integrity map
fs.writeFileSync(integrityFile, JSON.stringify(integrityMap, null, 2));

console.log(`✅ Generated integrity hashes for ${Object.keys(integrityMap.files).length} files`);
console.log(`📄 Saved to: ${integrityFile}`);

// Also create a simple integrity check script for runtime verification
const checkScript = `
/**
 * Runtime Integrity Checker
 * Verifies that build files haven't been tampered with
 */
window.checkIntegrity = async () => {
  try {
    const response = await fetch('/integrity-hashes.json');
    const integrityMap = await response.json();

    const results = { valid: true, violations: [] };

    for (const [file, expected] of Object.entries(integrityMap.files)) {
      try {
        const fileResponse = await fetch(\`/assets/\${file}\`);
        const content = await fileResponse.arrayBuffer();
        const hash = await crypto.subtle.digest('SHA-384', content);
        const actualHash = btoa(String.fromCharCode(...new Uint8Array(hash)));

        if (actualHash !== expected.hash.replace('sha384-', '')) {
          results.valid = false;
          results.violations.push({
            file,
            expected: expected.hash,
            actual: \`sha384-\${actualHash}\`
          });
        }
      } catch (error) {
        results.violations.push({ file, error: error.message });
      }
    }

    if (!results.valid) {
      console.error('🚨 INTEGRITY VIOLATION DETECTED!', results.violations);
      // Trigger tamper response
      window.dispatchEvent(new CustomEvent('integrityViolation', {
        detail: results.violations
      }));
    } else {
      console.log('✅ Integrity check passed');
    }

    return results;
  } catch (error) {
    console.error('Integrity check failed:', error);
    return { valid: false, error: error.message };
  }
};
`;

fs.writeFileSync(path.join(assetsPath, 'integrity-check.js'), checkScript);
console.log('📜 Runtime integrity checker generated');
