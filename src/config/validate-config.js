/**
 * Database Configuration Validation Script
 * Run with: node src/config/validate-config.js
 *
 * Validates that all required environment variables are set
 * for Supabase or standalone mode.
 */

const fs = require('fs');
const path = require('path');

function validateConfig() {
  const envPath = path.resolve(__dirname, '../../.env');
  const errors = [];
  const warnings = [];
  const success = [];

  console.log('🔍 Validating Database Configuration\n');

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

  // Check database mode
  const dbMode = envVars['REACT_APP_DATABASE_MODE'] || 'standalone';

  console.log(
    'Database Mode:',
    dbMode === 'supabase' ? 'Supabase (PostgreSQL)' : 'Standalone (localStorage mock)\n'
  );

  if (dbMode === 'supabase') {
    const requiredSupabase = ['REACT_APP_SUPABASE_URL', 'REACT_APP_SUPABASE_ANON_KEY'];

    console.log('Supabase Required Variables:\n');
    requiredSupabase.forEach((key) => {
      const value = envVars[key];
      if (!value) {
        errors.push(key);
        console.log(`  ✗ ${key}: Missing`);
      } else {
        success.push(key);
        console.log(`  ✓ ${key}: Set`);
      }
    });

    if (envVars.REACT_APP_SUPABASE_URL && !envVars.REACT_APP_SUPABASE_URL.includes('supabase.co')) {
      warnings.push('REACT_APP_SUPABASE_URL should be a valid Supabase URL');
      console.log(`  ⚠ REACT_APP_SUPABASE_URL: Does not look like a Supabase URL`);
    }
  } else {
    console.log('  ℹ Standalone mode - no external database required');
  }

  // Security settings
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

  if (dbMode === 'supabase') {
    console.log('✅ Configuration is valid for Supabase production mode');
    console.log('\nNext steps:');
    console.log('  1. Create database tables in Supabase (run supabase-schema.sql)');
    console.log('  2. Set up Row Level Security (RLS) policies if needed');
    console.log('  3. Configure Supabase Auth for user management');
  } else {
    console.log('✅ Configuration is valid for Standalone mode');
    console.log('\nApp will use localStorage for data storage.');
    console.log('Set REACT_APP_DATABASE_MODE=supabase to enable Supabase.');
  }

  console.log('\n' + '='.repeat(50) + '\n');
  process.exit(0);
}

validateConfig();
