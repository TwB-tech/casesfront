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

  // Determine database mode (check both prefixed and non-prefixed)
  const dbMode = allEnv.REACT_APP_DATABASE_MODE || allEnv.DATABASE_MODE || 'standalone';

  console.log(
    'Database Mode:',
    dbMode === 'supabase' ? 'Supabase (PostgreSQL)' : 'Standalone (localStorage mock)\n'
  );

  if (dbMode === 'supabase') {
    const requiredSupabase = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const altKeys = ['REACT_APP_SUPABASE_URL', 'REACT_APP_SUPABASE_ANON_KEY'];

    console.log('Supabase Required Variables:\n');
    requiredSupabase.forEach((key, idx) => {
      const alt = altKeys[idx];
      const value = allEnv[key] || allEnv[alt];
      if (!value) {
        errors.push(key);
        console.log(`  ✗ ${key} (or ${alt}): Missing`);
      } else {
        success.push(key);
        console.log(`  ✓ ${key}: Set`);
      }
    });

    const url = allEnv.SUPABASE_URL || allEnv.REACT_APP_SUPABASE_URL;
    if (url && !url.includes('supabase.co')) {
      warnings.push('SUPABASE_URL should be a valid Supabase URL');
      console.log(`  ⚠ SUPABASE_URL: Does not look like a Supabase URL`);
    }
  } else {
    console.log('  ℹ Standalone mode - no external database required');
  }

  // Security settings (check both prefixed and non-prefixed if needed)
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

  if (dbMode === 'supabase') {
    console.log('✅ Configuration is valid for Supabase production mode');
    console.log('\nNext steps:');
    console.log('  1. Create database tables in Supabase (run supabase-schema.sql)');
    console.log('  2. Set proper Row Level Security (RLS) policies if required');
    console.log('  3. Configure Supabase Auth for user management');
    console.log('  4. Set environment variables in Vercel:');
    console.log('     - DATABASE_MODE=supabase');
    console.log('     - SUPABASE_URL=...');
    console.log('     - SUPABASE_ANON_KEY=...');
  } else {
    console.log('✅ Configuration is valid for Standalone mode');
    console.log('\nApp will use localStorage for data storage.');
    console.log('Set DATABASE_MODE=supabase to enable Supabase.');
  }

  console.log('\n' + '='.repeat(50) + '\n');
  process.exit(0);
}

validateConfig();
