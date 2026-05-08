/* eslint-disable no-console */
/**
 * Appwrite Configuration Validation Script
 * Run with: node src/config/validate-config.js
 *
 * Validates that all required Appwrite environment variables are set.
 */

const fs = require('fs');
const path = require('path');

function validateConfig() {
  const envPath = path.resolve(__dirname, '../../.env');
  const errors = [];
  const warnings = [];
  const success = [];

  console.log('🔍 Validating Appwrite Configuration\n');

  // Load environment variables from .env if exists
  const envFromFile = {};
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('#'));
    envLines.forEach((line) => {
      const [key, ...valueParts] = line.split('=');
      if (key) {
        envFromFile[key.trim()] = valueParts
          .join('=')
          .trim()
          .replace(/^["']|["']$/g, '');
      }
    });
  }

  // Merge with process.env (captures Vercel runtime env)
  const allEnv = { ...envFromFile, ...process.env };

  // Determine database mode
  const dbMode = allEnv.REACT_APP_DATABASE_MODE || allEnv.DATABASE_MODE || 'standalone';

  console.log('Database Mode:', dbMode === 'appwrite' ? 'Appwrite' : 'Standalone (localStorage mock)\n');

  if (dbMode === 'appwrite') {
    const requiredAppwrite = ['APPWRITE_PROJECT_ID', 'APPWRITE_ENDPOINT', 'APPWRITE_DATABASE_ID'];
    console.log('Appwrite Required Variables:\n');
    requiredAppwrite.forEach((key) => {
      const value = allEnv[key];
      if (!value) {
        errors.push(key);
        console.log(`  ✗ ${key}: Missing`);
      } else {
        success.push(key);
        console.log(`  ✓ ${key}: Set`);
      }
    });
  } else {
    console.log('  ℹ Standalone mode - no external database required');
  }

  // Security settings
  console.log('\nSecurity Settings:\n');
  const securityVars = ['REACT_APP_SESSION_COOKIE_SECURE', 'REACT_APP_SESSION_COOKIE_SAMESITE'];
  securityVars.forEach((key) => {
    const value = allEnv[key];
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

  if (dbMode === 'appwrite') {
    console.log('✅ Configuration is valid for Appwrite production mode');
    console.log('\nNext steps:');
    console.log('  1. Ensure Appwrite collections are set up (run npm run db:setup)');
    console.log('  2. Set environment variables in Vercel:');
    console.log('     - DATABASE_MODE=appwrite');
    console.log('     - APPWRITE_PROJECT_ID=...');
    console.log('     - APPWRITE_ENDPOINT=...');
    console.log('     - APPWRITE_DATABASE_ID=...');
  } else {
    console.log('✅ Configuration is valid for Standalone mode');
    console.log('\nApp will use localStorage for data storage.');
    console.log('Set DATABASE_MODE=appwrite to enable Appwrite.');
  }

  console.log('\n' + '='.repeat(50) + '\n');
  process.exit(0);
}

validateConfig();
