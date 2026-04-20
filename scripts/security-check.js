#!/usr/bin/env node

/**
 * Security Vulnerability Scanner
 * Scans the codebase for security issues and license compliance
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔍 Scanning for security vulnerabilities...\n');

const issues = [];
const warnings = [];

// Check for sensitive data exposure
function checkSensitiveData() {
  console.log('🔐 Checking for sensitive data exposure...');

  const files = scanFiles(['.js', '.jsx', '.ts', '.tsx', '.json', '.env']);
  let apiKeys = 0;
  let hardcodedSecrets = 0;

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');

    // Check for API keys
    const apiKeyPatterns = [
      /['"`](sk-[a-zA-Z0-9_-]{20,})['"`]/gi, // Stripe keys
      /['"`](xoxb-[0-9]+-[0-9]+-[a-zA-Z0-9_-]+)['"`]/gi, // Slack tokens
      /['"`](AIza[0-9A-Za-z_-]{35})['"`]/gi, // Firebase keys
    ];

    apiKeyPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        apiKeys += matches.length;
        issues.push({
          type: 'CRITICAL',
          file: path.relative(process.cwd(), file),
          issue: 'Hardcoded API key detected',
          line: getLineNumber(content, matches[0]),
        });
      }
    });

    // Check for Supabase keys (should be in env)
    if (content.includes('supabase') && content.includes('anon') && !file.includes('.env')) {
      warnings.push({
        type: 'WARNING',
        file: path.relative(process.cwd(), file),
        issue: 'Supabase anon key should be in environment variables',
      });
    }

    // Check for license server credentials
    if (content.includes('techwithbrands.com') && content.includes('Bearer')) {
      warnings.push({
        type: 'WARNING',
        file: path.relative(process.cwd(), file),
        issue: 'License server credentials should be environment variables',
      });
    }
  });

  console.log(`  📊 Found ${apiKeys} potential API keys`);
  console.log(`  📊 Found ${hardcodedSecrets} hardcoded secrets\n`);
}

// Check license compliance
function checkLicenseCompliance() {
  console.log('📋 Checking license compliance...');

  const licenseFile = path.join(__dirname, '..', 'LICENSE_AGREEMENT.md');
  if (!fs.existsSync(licenseFile)) {
    issues.push({
      type: 'CRITICAL',
      file: 'LICENSE_AGREEMENT.md',
      issue: 'License agreement file missing',
    });
  }

  // Check for license watermark in key files
  const keyFiles = [
    'src/index.jsx',
    'src/App.jsx',
    'src/components/LicenseManager/LicenseVerification.jsx',
  ];

  keyFiles.forEach((file) => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (!content.includes('Anthony Kerige') && !content.includes('Tech with Brands')) {
        warnings.push({
          type: 'WARNING',
          file: path.relative(process.cwd(), file),
          issue: 'Missing IP ownership watermark',
        });
      }
    }
  });

  console.log('  ✅ License compliance check completed\n');
}

// Check for insecure patterns
function checkInsecurePatterns() {
  console.log('🚨 Checking for insecure patterns...');

  const files = scanFiles(['.js', '.jsx', '.ts', '.tsx']);
  let insecurePatterns = 0;

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');

    // Check for eval usage
    if (content.includes('eval(')) {
      warnings.push({
        type: 'WARNING',
        file: path.relative(process.cwd(), file),
        issue: 'Use of eval() detected - potential security risk',
      });
      insecurePatterns++;
    }

    // Check for innerHTML usage
    if (content.includes('innerHTML')) {
      warnings.push({
        type: 'WARNING',
        file: path.relative(process.cwd(), file),
        issue: 'Use of innerHTML detected - use textContent or createElement instead',
      });
      insecurePatterns++;
    }

    // Check for console.log in production
    const consoleLogs = (content.match(/console\.log/g) || []).length;
    if (consoleLogs > 10) {
      warnings.push({
        type: 'INFO',
        file: path.relative(process.cwd(), file),
        issue: `${consoleLogs} console.log statements - consider removing for production`,
      });
    }
  });

  console.log(`  📊 Found ${insecurePatterns} insecure patterns\n`);
}

// Check dependencies for vulnerabilities
function checkDependencies() {
  console.log('📦 Checking dependencies...');

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  // Check for known vulnerable packages
  const riskyDeps = [
    'webpack-dev-server', // Should not be in production
    'http-proxy-middleware', // Potential security issues
  ];

  riskyDeps.forEach((dep) => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      warnings.push({
        type: 'WARNING',
        file: 'package.json',
        issue: `Potentially risky dependency: ${dep}`,
      });
    }
  });

  console.log('  ✅ Dependency check completed\n');
}

// Utility functions
function scanFiles(extensions) {
  const files = [];

  function scan(dir) {
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith('.') &&
        item !== 'node_modules' &&
        item !== 'dist'
      ) {
        scan(fullPath);
      } else if (stat.isFile() && extensions.some((ext) => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }

  scan(process.cwd());
  return files;
}

function getLineNumber(content, searchString) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchString)) {
      return i + 1;
    }
  }
  return 'unknown';
}

// Run all checks
async function runSecurityScan() {
  try {
    checkSensitiveData();
    checkLicenseCompliance();
    checkInsecurePatterns();
    checkDependencies();

    // Report results
    console.log('📊 SECURITY SCAN RESULTS\n');

    if (issues.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      issues.forEach((issue) => {
        console.log(`  ❌ ${issue.file}:${issue.line || ''} - ${issue.issue}`);
      });
      console.log('');
    }

    if (warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      warnings.forEach((warning) => {
        console.log(`  ⚠️  ${warning.file} - ${warning.issue}`);
      });
      console.log('');
    }

    const totalIssues = issues.length + warnings.length;
    if (totalIssues === 0) {
      console.log('✅ No security issues found!');
    } else {
      console.log(`📈 Total: ${issues.length} critical, ${warnings.length} warnings`);
    }

    // Exit with error code if critical issues found
    if (issues.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Security scan failed:', error.message);
    process.exit(1);
  }
}

runSecurityScan();
