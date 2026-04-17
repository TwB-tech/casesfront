/**
 * AppWrite Connection Test Script
 * Run with: node src/config/test-connection.js
 *
 * This script validates the AppWrite configuration and tests connectivity.
 */

const { Client, Account, Databases } = require('appwrite');

// Load environment from .env file
require('dotenv').config({ path: '../.env' });

const ENDPOINT = process.env.REACT_APP_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.REACT_APP_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.REACT_APP_APPWRITE_DATABASE_ID || 'main';

console.log('🔍 Testing AppWrite Connection...\n');
console.log('Configuration:');
console.log(`  Endpoint: ${ENDPOINT}`);
console.log(`  Project ID: ${PROJECT_ID ? '✓ Set' : '✗ Missing'}`);
console.log(`  Database ID: ${DATABASE_ID}\n`);

if (!PROJECT_ID) {
  console.error('❌ ERROR: REACT_APP_APPWRITE_PROJECT_ID is not set in .env');
  process.exit(1);
}

async function testConnection() {
  try {
    // Initialize client
    const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);

    console.log('✓ Client initialized');

    // Test account service
    const account = new Account(client);
    console.log('✓ Account service ready');

    // Test databases service
    const databases = new Databases(client);
    console.log('✓ Databases service ready');

    // Try to list collections (requires database ID)
    try {
      const collections = await databases.listCollections(DATABASE_ID);
      console.log(`✓ Connected to database "${DATABASE_ID}"`);
      console.log(`  Collections found: ${collections.collections.length}`);

      if (collections.collections.length === 0) {
        console.warn(
          '⚠️  Warning: Database is empty. Run appwrite_setup.md to create collections.'
        );
      } else {
        console.log('  Collections:');
        collections.collections.forEach((col) => {
          console.log(`    - ${col.name} (${col.$id})`);
        });
      }
    } catch (dbError) {
      console.error(`❌ Database error: ${dbError.message}`);
      console.error('   Make sure the database ID is correct and collections exist.');
      process.exit(1);
    }

    console.log('\n✅ All checks passed! AppWrite is properly configured.');
    console.log('\nNext steps:');
    console.log('1. Ensure collections are created (see appwrite_setup.md)');
    console.log('2. Set REACT_APP_USE_APPWRITE=true in .env');
    console.log('3. Run npm start or npm build');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
