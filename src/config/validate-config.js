/**
 * AppWrite Configuration Validation Script
 * Run with: node src/config/validate-config.js
 *
 * Validates that all required environment variables are set
 * for AppWrite production deployment.
 */

const fs = require('fs');
const path = require('path');

function validateConfig() {
  const envPath = path.resolve(__dirname, '../../.env');
  const errors = [];
  const warnings = [];
  const success = [];

  console.log('🔍 Validating AppWrite Configuration\n');

  // Check if .env exists
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found at:', envPath);
    console.error('   Copy .env.example to .env and configure your settings.');
    process.exit(1);
  }

  // Read .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'));

  const envVars = {};
  envLines.forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key) {
      envVars[key.trim()] = valueParts
        .join('=')
        .trim()
        .replace(/^["']|["']$/g, '');
    }
  });

  // Check required variables
  const required = [
    'REACT_APP_USE_APPWRITE',
    'REACT_APP_APPWRITE_ENDPOINT',
    'REACT_APP_APPWRITE_PROJECT_ID',
    'REACT_APP_APPWRITE_DATABASE_ID',
  ];

  console.log('Required Environment Variables:\n');

  required.forEach((key) => {
    const value = envVars[key];
    if (!value) {
      errors.push(key);
      console.log(`  ✗ ${key}: Missing`);
    } else {
      if (key === 'REACT_APP_USE_APPWRITE') {
        if (value === 'true') {
          success.push(key);
          console.log(`  ✓ ${key}: ${value} (Production Mode)`);
        } else {
          warnings.push(key);
          console.log(`  ⚠ ${key}: ${value} (Standalone Mode - No database)`);
        }
      } else {
        success.push(key);
        console.log(`  ✓ ${key}: Set`);
      }
    }
  });

  // Check security settings
  console.log('\nSecurity Settings:\n');

  const securityVars = ['REACT_APP_SESSION_COOKIE_SECURE', 'REACT_APP_SESSION_COOKIE_SAMESITE'];

  securityVars.forEach((key) => {
    const value = envVars[key];
    if (value) {
      console.log(`  ✓ ${key}: ${value}`);
    } else {
      warnings.push(key);
      console.log(`  ⚠ ${key}: Not set (using defaults)`);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(50) + '\n');

  if (errors.length > 0) {
    console.error('❌ ERRORS (must fix):');
    errors.forEach((err) => console.error(`   - ${err}`));
    console.error('\nPlease set all required environment variables.');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  WARNINGS:');
    warnings.forEach((warn) => console.warn(`   - ${warn}`));
    console.log();
  }

  if (envVars.REACT_APP_USE_APPWRITE === 'true') {
    console.log('✅ Configuration is valid for PRODUCTION mode');
    console.log('\nAppWrite will be used as the backend.');
    console.log('Make sure you have:');
    console.log('  1. Created all collections (see appwrite_setup.md)');
    console.log('  2. Set up proper security permissions');
    console.log('  3. Enabled storage bucket for documents');
  } else {
    console.log('✅ Configuration is valid for STANDALONE mode');
    console.log('\nApp will use localStorage for data storage.');
    console.log('Set REACT_APP_USE_APPWRITE=true to enable AppWrite.');
  }

  console.log('\n' + '='.repeat(50) + '\n');
  process.exit(0);
}

validateConfig();
