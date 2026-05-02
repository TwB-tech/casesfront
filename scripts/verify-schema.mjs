import fs from 'fs';
import path from 'path';

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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
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

const endpoint = (env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = env.APPWRITE_PROJECT_ID;
const apiKey = env.APPWRITE_API_KEY;
const databaseId = env.APPWRITE_DATABASE_ID || 'default';

const headers = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

async function api(method, path) {
  const url = `${endpoint}${path}`;
  const res = await fetch(url, { method, headers });
  return res.json();
}

async function main() {
  console.log('=== Verifying Database Schema ===\n');
  
  const collections = [
    'users', 'cases', 'tasks', 'documents', 'communications', 
    'invoices', 'chat_messages', 'chat_rooms', 'audit_logs', 
    'expenses', 'payroll_runs', 'subscriptions', 'onboarding', 
    'invites', 'notes', 'organizations', 'courts'
  ];
  
  const requiredAttrs = {
    users: ['id', 'email', 'role', 'organization_id'],
    cases: ['id', 'organization_id', 'client_id', 'advocate_id', 'created_by'],
    tasks: ['id', 'organization_id', 'assigned_to', 'created_by', 'client_id'],
    documents: ['id', 'organization_id', 'owner', 'shared_with'],
    communications: ['id', 'organization_id', 'created_by'],
    invoices: ['id', 'organization_id'],
    chat_messages: ['id', 'room', 'sender', 'organization_id'],
    chat_rooms: ['id', 'organization_id'],
    audit_logs: ['id', 'organization_id', 'user_id'],
    expenses: ['id', 'organization_id', 'submitted_by'],
    payroll_runs: ['id', 'organization_id'],
    subscriptions: ['id', 'organization_id'],
    onboarding: ['id', 'organization_id'],
    invites: ['id', 'organization_id', 'invited_by'],
    notes: ['id', 'organization_id', 'user_id'],
    organizations: ['id', 'name'],
    courts: ['id', 'name'],
  };
  
  let allGood = true;
  
  for (const coll of collections) {
    try {
      const data = await api('GET', `/databases/${databaseId}/collections/${coll}`);
      const attrs = data.attributes || [];
      const attrNames = attrs.map(a => a.key);
      
      const required = requiredAttrs[coll] || [];
      const missing = required.filter(r => !attrNames.includes(r));
      
      if (missing.length > 0) {
        console.log(`✗ ${coll}: MISSING attributes: ${missing.join(', ')}`);
        allGood = false;
      } else {
        console.log(`✓ ${coll}: OK (${attrNames.length} attributes)`);
      }
    } catch (e) {
      console.log(`✗ ${coll}: ${e.message || 'Error'}`);
      allGood = false;
    }
  }
  
  console.log('\n=== Verification Complete ===');
  if (allGood) {
    console.log('✅ All collections have required attributes!');
  } else {
    console.log('❌ Some collections are missing attributes - run: node scripts/setup-appwrite.js');
  }
}

main().catch(console.error);
