/**
 * Supabase → Appwrite Data Migration Script
 *
 * Usage:
 *   node scripts/migrate-to-appwrite.js
 *
 * Prerequisites:
 *   - .env file with SUPABASE_* and APPWRITE_* variables set
 *   - npm install appwrite @supabase/supabase-js
 *
 * This script migrates all data from Supabase to Appwrite.
 * Friendly re-runs: safe (may error on duplicates but continues).
 */

import { createClient } from '@supabase/supabase-js';
import { Client, Databases, ID } from 'appwrite';
import path from 'path';
import fs from 'fs';

// Simple .env parser
function loadEnv(filePath) {
  const env = {};
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.substring(0, eqIdx).trim();
      let value = trimmed.substring(eqIdx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  } catch (err) {
    console.warn('Could not read .env:', err.message);
  }
  return env;
}

const env = loadEnv(path.resolve(process.cwd(), '.env'));

// Configuration from environment
const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

const APPWRITE_ENDPOINT = env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = env.APPWRITE_API_KEY;
const APPWRITE_DATABASE_ID = env.APPWRITE_DATABASE_ID || 'default';

// Validate
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY required in .env');
  console.error('   Get from Supabase Dashboard → Settings → API → Service Role Key');
  process.exit(1);
}
if (!APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  console.error('❌ Error: APPWRITE_PROJECT_ID and APPWRITE_API_KEY required in .env');
  console.error('   Get from Appwrite Console → Project → Settings → API Keys');
  process.exit(1);
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const appwrite = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);
const appwriteDb = new Databases(appwrite);

// Logging
const log = {
  info: (msg) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m⚠\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
};

const stats = { total: 0, success: 0, failed: 0 };

/**
 * Convert snake_case keys to camelCase for Appwrite
 * Keep createdAt/updatedAt mapping
 */
function transformRecord(tableName, record) {
  const { id, created_at, updated_at, ...rest } = record;

  const toCamel = (s) => s.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

  const transformed = {};
  for (const [key, value] of Object.entries(rest)) {
    transformed[toCamel(key)] = value;
  }

  if (created_at) transformed.createdAt = created_at;
  if (updated_at) transformed.updatedAt = updated_at;

  // $id is used by Appwrite internally; we will pass it as docId separately
  return transformed;
}

/**
 * Migrate a single collection
 */
async function migrateCollection(tableName) {
  log.info(`Migrating ${tableName}...`);

  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      log.error(`${tableName} fetch error: ${error.message}`);
      stats.failed++;
      return;
    }
    if (!data || data.length === 0) {
      log.warn(`  Empty table, skipping`);
      return;
    }

    log.info(`  Found ${data.length} records`);

    for (const record of data) {
      try {
        const transformed = transformRecord(tableName, record);
        // Use original ID if valid, else generate
        const docId = record.id ? String(record.id).replace(/-/g, '') : ID.unique();

        await appwriteDb.createDocument(APPWRITE_DATABASE_ID, tableName, docId, transformed);
        stats.success++;
      } catch (err) {
        // Duplicate ID or other error → log and continue
        console.error(`  Failed record ${record.id}:`, err.message);
        stats.failed++;
      }
    }
    log.success(`  ${tableName}: done (${data.length} records)`);
    stats.total += data.length;
  } catch (err) {
    log.error(`  ${tableName} failed: ${err.message}`);
    stats.failed++;
  }
}

/**
 * Main migration (order respecting FKs)
 */
async function migrateAll() {
  console.log('\n\x1b[1m=== Supabase → Appwrite Data Migration ===\x1b[0m\n');

  // Phase 1: Reference tables (no dependencies)
  log.info('PHASE 1: Reference tables');
  await migrateCollection('courts');

  // Phase 2: Core entities
  log.info('\nPHASE 2: Core entities');
  await migrateCollection('organizations');
  await migrateCollection('users');

  // Phase 3: Business data (depends on orgs/users)
  log.info('\nPHASE 3: Business data');
  await migrateCollection('cases');
  await migrateCollection('tasks');
  await migrateCollection('documents');
  await migrateCollection('invoices');
  await migrateCollection('communications');
  await migrateCollection('expenses');
  await migrateCollection('payroll_runs');

  // Phase 4: Support tables
  log.info('\nPHASE 4: Support tables');
  await migrateCollection('invites');
  await migrateCollection('chat_rooms');
  await migrateCollection('chat_messages');
  await migrateCollection('audit_logs');
  await migrateCollection('subscriptions');
  await migrateCollection('onboarding');
  await migrateCollection('admin_settings');

  // Summary
  console.log(`\n\x1b[1m=== Migration Summary ===\x1b[0m`);
  console.log(`Total records: ${stats.total}`);
  console.log(`\x1b[32m✓ Success: ${stats.success}\x1b[0m`);
  console.log(`\x1b[31m✗ Failed: ${stats.failed}\x1b[0m`);
  console.log(`Success rate: ${((stats.success / Math.max(stats.total, 1)) * 100).toFixed(1)}%\n`);

  if (stats.failed === 0) {
    log.success('All data migrated successfully!');
  } else {
    log.warn('Some records failed. Review errors above. Re-run individual tables if needed.');
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    source: SUPABASE_URL,
    destination: `${APPWRITE_ENDPOINT}/v1/projects/${APPWRITE_PROJECT_ID}`,
    stats,
  };
  fs.writeFileSync('migration-report.json', JSON.stringify(report, null, 2));
  log.info('Report saved to migration-report.json');
}

// Run
migrateAll().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
