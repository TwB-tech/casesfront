#!/usr/bin/env node

/**
 * Bulk License Key Generator
 * Generates multiple license keys for batch client onboarding
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const LICENSE_PREFIX = 'TWB-LF';

/**
 * Generate a single license key
 */
function generateLicenseKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let key = '';

  // 4 groups of 4 characters
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 3) key += '-';
  }

  return `${LICENSE_PREFIX}-${key}`;
}

/**
 * Generate multiple license keys
 */
function generateBulkLicenses(count = 10, options = {}) {
  const licenses = [];
  const now = new Date();
  const expiryDate =
    options.expiryDate ||
    new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];

  console.log(`🔑 Generating ${count} license keys...`);

  for (let i = 0; i < count; i++) {
    const license = {
      id: crypto.randomUUID(),
      licenseKey: generateLicenseKey(),
      clientName: options.clientName || `Client ${i + 1}`,
      organization: options.organization || '',
      email: options.email || `client${i + 1}@example.com`,
      expiryDate,
      status: 'active',
      paymentStatus: 'pending',
      amount: options.amount || 250000,
      maintenanceFee: options.maintenanceFee || 40000,
      createdBy: 'Anthony Kerige (Tony Kamau)',
      createdAt: now.toISOString(),
      notes: options.notes || 'Generated via bulk script',
      installationId: null, // To be set during activation
      activatedAt: null,
    };

    licenses.push(license);
  }

  return licenses;
}

/**
 * Save licenses to local storage (admin use)
 */
function saveLicensesToStorage(licenses) {
  const storageFile = path.join(__dirname, '..', 'src', 'data', 'licenses.json');

  // Ensure directory exists
  const dir = path.dirname(storageFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Load existing licenses
  let existingLicenses = [];
  if (fs.existsSync(storageFile)) {
    existingLicenses = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
  }

  // Add new licenses
  existingLicenses.push(...licenses);

  // Save back
  fs.writeFileSync(storageFile, JSON.stringify(existingLicenses, null, 2));

  console.log(`💾 Saved ${licenses.length} licenses to ${storageFile}`);
}

/**
 * Export licenses to CSV
 */
function exportToCSV(licenses, filename = 'twb-licenses.csv') {
  const headers = [
    'License Key',
    'Client Name',
    'Organization',
    'Email',
    'Expiry Date',
    'Amount (KES)',
    'Maintenance (KES)',
    'Created Date',
    'Created By',
  ];

  const rows = licenses.map((license) => [
    license.licenseKey,
    license.clientName,
    license.organization,
    license.email,
    license.expiryDate,
    license.amount,
    license.maintenanceFee,
    license.createdAt.split('T')[0],
    license.createdBy,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(','))
    .join('\n');

  fs.writeFileSync(filename, csvContent);
  console.log(`📄 Exported ${licenses.length} licenses to ${filename}`);
}

/**
 * Generate licenses for different tiers
 */
function generateTieredLicenses() {
  const tiers = {
    solo: { count: 50, amount: 150000, maintenanceFee: 25000, clientName: 'Solo Practitioner' },
    standard: { count: 30, amount: 300000, maintenanceFee: 40000, clientName: 'Growing Firm' },
    enterprise: {
      count: 10,
      amount: 500000,
      maintenanceFee: 60000,
      clientName: 'Enterprise Client',
    },
  };

  const allLicenses = [];

  Object.entries(tiers).forEach(([tier, config]) => {
    console.log(`\n🏷️  Generating ${config.count} ${tier} tier licenses...`);
    const licenses = generateBulkLicenses(config.count, {
      ...config,
      clientName: config.clientName,
    });
    allLicenses.push(...licenses);
  });

  return allLicenses;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'bulk':
      const count = parseInt(args[1]) || 10;
      const licenses = generateBulkLicenses(count, {
        expiryDate: args[2], // YYYY-MM-DD format
        amount: parseInt(args[3]) || 250000,
      });

      console.log('\n📋 Generated Licenses:');
      licenses.forEach((license, index) => {
        console.log(`${index + 1}. ${license.licenseKey} - ${license.clientName}`);
      });

      // Save to storage
      saveLicensesToStorage(licenses);

      // Export to CSV
      exportToCSV(licenses);
      break;

    case 'tiers':
      const tieredLicenses = generateTieredLicenses();
      saveLicensesToStorage(tieredLicenses);
      exportToCSV(tieredLicenses, 'twb-tiered-licenses.csv');
      break;

    case 'single':
      const singleLicense = generateBulkLicenses(1, {
        clientName: args[1] || 'Test Client',
        organization: args[2] || 'Test Org',
        email: args[3] || 'test@example.com',
      })[0];

      console.log('\n🎫 Single License Generated:');
      console.log(`Key: ${singleLicense.licenseKey}`);
      console.log(`Client: ${singleLicense.clientName}`);
      console.log(`Expiry: ${singleLicense.expiryDate}`);
      console.log(`Amount: KES ${singleLicense.amount.toLocaleString()}`);

      saveLicensesToStorage([singleLicense]);
      break;

    default:
      console.log(`
🔑 TwB License Key Generator

Usage:
  npm run license:generate bulk [count] [expiry] [amount]
  npm run license:generate tiers
  npm run license:generate single [client] [org] [email]

Examples:
  npm run license:generate bulk 25 2025-12-31 300000
  npm run license:generate tiers
  npm run license:generate single "Law Firm XYZ" "xyz.com" "admin@xyz.com"

Generated keys are saved to src/data/licenses.json and exported to CSV.
      `);
      break;
  }
}

main();
