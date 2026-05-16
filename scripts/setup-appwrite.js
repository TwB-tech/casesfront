/**
 * Appwrite Database Setup using REST API
 *
 * Creates all 18 collections with attributes and indexes.
 * Run: node scripts/setup-appwrite.js
 *
 * Prerequisites:
 *   - .env file with APPWRITE_PROJECT_ID and APPWRITE_API_KEY
 */

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

const endpoint = (env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = env.APPWRITE_PROJECT_ID;
const apiKey = env.APPWRITE_API_KEY;
const databaseId = env.APPWRITE_DATABASE_ID || 'default';

if (!projectId) {
  console.error('❌ Missing APPWRITE_PROJECT_ID in .env');
  process.exit(1);
}
if (!apiKey) {
  console.error('❌ Missing APPWRITE_API_KEY in .env (needed for setup)');
  process.exit(1);
}

const apiHeaders = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json',
};

const log = {
  info: (msg) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m⚠\x1b[0m ${msg}`),
};

async function api(method, path, body) {
  const url = `${endpoint}${path}`;
  const options = { method, headers: apiHeaders };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }
  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Ensure database exists
async function ensureDatabase() {
  try {
    await api('GET', `/databases/${databaseId}`);
    log.success(`Database '${databaseId}' ready`);
  } catch (e) {
    if (e.status === 404) {
      log.warn(`Database '${databaseId}' not found — creating...`);
      try {
        await api('POST', '/databases', { databaseId, name: 'Default Database' });
        log.success(`✓ Database created`);
      } catch (err) {
        log.error(`Failed to create database: ${err.message}`);
        process.exit(1);
      }
    } else {
      log.error(`Failed to check database: ${e.message}`);
      process.exit(1);
    }
  }
}

// Collection definitions
const collections = [
  {
    name: 'organizations',
    attributes: [
      { key: 'id', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'registration_number', type: 'string', size: 255 },
      { key: 'address', type: 'text' },
      { key: 'phone', type: 'string', size: 50 },
      { key: 'email', type: 'string', size: 255 },
      { key: 'plan_type', type: 'string', size: 50, default: 'free' },
      { key: 'is_verified', type: 'boolean', default: false },
      { key: 'created_at', type: 'datetime' },
      { key: 'updated_at', type: 'datetime' },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
  },
  {
    name: 'users',
    attributes: [
      { key: 'id', type: 'string', size: 255, required: true },
      { key: 'organization_id', type: 'string', size: 255 },
      { key: 'username', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'phone', type: 'string', size: 50 },
      { key: 'role', type: 'string', size: 50, default: 'individual' },
      { key: 'title', type: 'string', size: 255 },
      { key: 'bio', type: 'text' },
      { key: 'practice_areas', type: 'string', array: true },
      { key: 'timezone', type: 'string', size: 50, default: 'EAT' },
      { key: 'status', type: 'string', size: 50, default: 'Active' },
      { key: 'messaging_enabled', type: 'boolean', default: true },
      { key: 'deadline_notifications', type: 'boolean', default: true },
      { key: 'verification_token', type: 'string', size: 255 },
      { key: 'email_verified', type: 'boolean', default: false },
      // Additional fields used by the application
      { key: 'id_passport_number', type: 'string', size: 50 },
      { key: 'marital_status', type: 'string', size: 50 },
      { key: 'nationality', type: 'string', size: 100 },
      { key: 'occupation', type: 'string', size: 100 },
       { key: 'date_of_birth', type: 'string', size: 20 },
       { key: 'registration_number', type: 'string', size: 100 },
       // Extended profile and HR fields
       { key: 'name', type: 'string', size: 255 },
       { key: 'phone_number', type: 'string', size: 50 },
       { key: 'address', type: 'text' },
       { key: 'department', type: 'string', size: 100 },
       { key: 'salary', type: 'float' },
       { key: 'hire_date', type: 'string', size: 20 },
       { key: 'leave_balance', type: 'integer', default: 30 },
       { key: 'billable_rate', type: 'float' },
        { key: 'messaging', type: 'boolean', default: true },
        { key: 'task_management', type: 'boolean', default: true },
        { key: 'client_communication', type: 'boolean', default: false },
        { key: 'invited_by', type: 'string', size: 255 },
        { key: 'currency', type: 'string', size: 10, default: 'KES' },
        { key: 'created_at', type: 'datetime' },
        { key: 'updated_at', type: 'datetime' },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
  },
  {
    name: 'courts',
    attributes: [
      { key: 'id', type: 'integer', required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'jurisdiction', type: 'string', size: 100 },
      { key: 'address', type: 'text' },
      { key: 'created_at', type: 'datetime' },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
  },
   {
     name: 'cases',
     attributes: [
       { key: 'id', type: 'string', size: 255, required: true },
       { key: 'organization_id', type: 'string', size: 255 },
       { key: 'case_number', type: 'string', size: 100, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'text' },
      { key: 'status', type: 'string', size: 50, default: 'open' },
      { key: 'start_date', type: 'string', size: 20 },
      { key: 'end_date', type: 'string', size: 20 },
      { key: 'client_id', type: 'string', size: 255 },
      { key: 'advocate_id', type: 'string', size: 255 },
      { key: 'court_id', type: 'integer' },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'created_at', type: 'datetime' },
      { key: 'updated_at', type: 'datetime' },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
  },
   {
     name: 'tasks',
     attributes: [
       { key: 'id', type: 'string', size: 255, required: true },
       { key: 'organization_id', type: 'string', size: 255 },
       { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'text' },
      { key: 'assigned_to', type: 'string', size: 255 },
      { key: 'case_id', type: 'string', size: 255 },
      { key: 'priority', type: 'string', size: 50, default: 'low' },
      { key: 'deadline', type: 'datetime' },
      { key: 'status', type: 'boolean', default: false },
      { key: 'created_by', type: 'string', size: 255 },
      { key: 'created_at', type: 'datetime' },
      { key: 'updated_at', type: 'datetime' },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
  },
   {
     name: 'documents',
     attributes: [
       { key: 'id', type: 'string', size: 255, required: true },
       { key: 'organization_id', type: 'string', size: 255 },
       { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'text' },
      { key: 'owner', type: 'string', size: 255, required: true },
      { key: 'file_path', type: 'text' },
      { key: 'file_size', type: 'integer' },
      { key: 'mime_type', type: 'string', size: 100 },
      { key: 'shared_with', type: 'string', array: true },
      { key: 'created_at', type: 'datetime' },
      { key: 'updated_at', type: 'datetime' },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
  },
   {
     name: 'communications',
     attributes: [
       { key: 'id', type: 'string', size: 255, required: true },
       { key: 'organization_id', type: 'string', size: 255 },
       { key: 'email', type: 'string', size: 255, required: true },
      { key: 'subject', type: 'string', size: 255, required: true },
      { key: 'message', type: 'text', required: true },
      { key: 'google_meet_link', type: 'text' },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'created_at', type: 'datetime' },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
  },
  {
    name: 'invites',
    attributes: [
      { key: 'id', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'role', type: 'string', size: 50, default: 'employee' },
      { key: 'department', type: 'string', size: 100, default: '' },
      { key: 'organization_id', type: 'string', size: 255, required: true },
      { key: 'status', type: 'string', size: 50, default: 'pending' },
      { key: 'invited_by', type: 'string', size: 255 },
      { key: 'token', type: 'string', size: 255, required: true },
      { key: 'expires_at', type: 'datetime', required: true },
      { key: 'created_at', type: 'datetime' },
    ],
    permissions: ['read("users")', 'create("users")', 'update("users")', 'delete("users")'],
  },
   {
     name: 'invoices',
     attributes: [
       { key: 'id', type: 'string', size: 255, required: true },
       { key: 'organization_id', type: 'string', size: 255 },
       { key: 'invoice_number', type: 'string', size: 100, required: true },
      { key: 'client_name', type: 'string', size: 255, required: true },
      { key: 'client_address', type: 'text' },
      { key: 'crn', type: 'string', size: 100 },
      { key: 'total_amount', type: 'float' },
      { key: 'amount_due', type: 'float' },
      { key: 'tax', type: 'float' },
      { key: 'items', type: 'text' },
      { key: 'account_number', type: 'string', size: 100 },
      { key: 'account_name', type: 'string', size: 255 },
      { key: 'bank_detail', type: 'text' },
      { key: 'terms', type: 'text' },
      { key: 'signature', type: 'text' },
      { key: 'status', type: 'string', size: 50 },
      { key: 'date', type: 'string', size: 20 },
      { key: 'created_at', type: 'datetime' },
      { key: 'updated_at', type: 'datetime' },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
  },
   {
     name: 'invoice_items',
     attributes: [
       { key: 'id', type: 'string', size: 255, required: true },
       { key: 'organization_id', type: 'string', size: 255 },
       { key: 'invoice_id', type: 'string', size: 255, required: true },
       { key: 'description', type: 'string', size: 255, required: true },
       { key: 'quantity', type: 'integer' },
       { key: 'unit_price', type: 'float' },
       { key: 'total', type: 'float' },
     ],
     permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
   },
  {
    name: 'chat_rooms',
    attributes: [
      { key: 'id', type: 'string', size: 255, required: true },
      { key: 'organization_id', type: 'string', size: 255 },
      { key: 'room_name', type: 'string', size: 255, required: true },
      { key: 'participants', type: 'string', array: true, required: true },
      { key: 'created_at', type: 'datetime' },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
  },
    {
      name: 'chat_messages',
      attributes: [
        { key: 'id', type: 'string', size: 255, required: true },
        { key: 'room', type: 'string', size: 255, required: true },
        { key: 'sender', type: 'string', size: 255, required: true },
        { key: 'content', type: 'text', required: true },
        { key: 'timestamp', type: 'datetime', required: true },
        { key: 'attachments', type: 'string', array: true },
        { key: 'organization_id', type: 'string', size: 255 },
        { key: 'created_at', type: 'datetime' },
      ],
      permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
    },
    {
      name: 'service_requests',
      attributes: [
        { key: 'id', type: 'string', size: 255, required: true },
        { key: 'organization_id', type: 'string', size: 255 },
        { key: 'client_id', type: 'string', size: 255, required: true },
        { key: 'lawyer_id', type: 'string', size: 255, required: true },
        { key: 'service_category', type: 'string', size: 100 },
        { key: 'case_description', type: 'text' },
        { key: 'preferred_time', type: 'string', size: 50, default: 'flexible' },
        { key: 'urgency', type: 'string', size: 50, default: 'normal' },
        { key: 'status', type: 'string', size: 50, default: 'pending' },
        { key: 'created_at', type: 'datetime' },
        { key: 'updated_at', type: 'datetime' },
      ],
      permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
    },
    {
      name: 'reviews',
      attributes: [
        { key: 'id', type: 'string', size: 255, required: true },
        { key: 'organization_id', type: 'string', size: 255 },
        { key: 'lawyer_id', type: 'string', size: 255, required: true },
        { key: 'client_id', type: 'string', size: 255, required: true },
        { key: 'rating', type: 'integer', required: true },
        { key: 'comment', type: 'text' },
        { key: 'service_type', type: 'string', size: 100, default: 'general' },
        { key: 'status', type: 'string', size: 50, default: 'active' },
        { key: 'created_at', type: 'datetime' },
      ],
      permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
    },
   {
     name: 'audit_logs',
    attributes: [
      { key: 'id', type: 'string', size: 255, required: true },
      { key: 'organization_id', type: 'string', size: 255 },
      { key: 'user_id', type: 'string', size: 255 },
      { key: 'action', type: 'string', size: 100, required: true },
      { key: 'table_name', type: 'string', size: 100, required: true },
      { key: 'record_id', type: 'string', size: 255, required: true },
      { key: 'changes', type: 'text' },
      { key: 'user_agent', type: 'string', size: 500 },
      { key: 'created_at', type: 'datetime' },
    ],
    permissions: ['read("users")', 'create("users")', 'update("users")', 'delete("users")'],
  },
   {
     name: 'expenses',
     attributes: [
       { key: 'id', type: 'string', size: 255, required: true },
       { key: 'organization_id', type: 'string', size: 255 },
       { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'text' },
      { key: 'amount', type: 'float', required: true },
      { key: 'date', type: 'string', size: 20, required: true },
      { key: 'category', type: 'string', size: 100 },
      { key: 'status', type: 'string', size: 50, default: 'pending' },
      { key: 'submitted_by', type: 'string', size: 255 },
      { key: 'created_at', type: 'datetime' },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
  },
   {
     name: 'payroll_runs',
     attributes: [
       { key: 'id', type: 'string', size: 255, required: true },
       { key: 'organization_id', type: 'string', size: 255 },
       { key: 'total_amount', type: 'float', required: true },
      { key: 'period_start', type: 'string', size: 20, required: true },
      { key: 'period_end', type: 'string', size: 20, required: true },
      { key: 'status', type: 'string', size: 50 },
      { key: 'created_at', type: 'datetime' },
    ],
    permissions: ['read("users")', 'create("users")', 'update("users")', 'delete("users")'],
  },
  {
    name: 'admin_settings',
    attributes: [
      { key: 'id', type: 'string', size: 255, required: true },
      { key: 'case_status', type: 'boolean', default: false },
      { key: 'case_assignment', type: 'boolean', default: false },
      { key: 'progress_tracking', type: 'boolean', default: false },
      { key: 'milestones', type: 'boolean', default: false },
      { key: 'client_fields', type: 'boolean', default: false },
      { key: 'client_portal_access', type: 'boolean', default: false },
      { key: 'updated_at', type: 'datetime' },
    ],
    permissions: ['read("users")', 'create("users")', 'update("users")', 'delete("users")'],
  },
   {
     name: 'subscriptions',
     attributes: [
       { key: 'id', type: 'string', size: 255, required: true },
       { key: 'organization_id', type: 'string', size: 255 },
       { key: 'payment_method', type: 'string', size: 50 },
      { key: 'status', type: 'string', size: 50 },
      { key: 'current_period_end', type: 'string', size: 20 },
      { key: 'created_at', type: 'datetime' },
    ],
    permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
  },
    {
      name: 'onboarding',
      attributes: [
        { key: 'id', type: 'string', size: 255, required: true },
        { key: 'organization_id', type: 'string', size: 255 },
        { key: 'step', type: 'string', size: 100, required: true },
       { key: 'completed', type: 'boolean', default: false },
       { key: 'created_at', type: 'datetime' },
     ],
     permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
   },
    {
      name: 'notes',
      attributes: [
        { key: 'id', type: 'string', size: 255, required: true },
        { key: 'user_id', type: 'string', size: 255, required: true },
        { key: 'organization_id', type: 'string', size: 255 },
        { key: 'title', type: 'string', size: 255 },
        { key: 'content', type: 'text', required: true },
        { key: 'created_at', type: 'datetime' },
        { key: 'updated_at', type: 'datetime' },
      ],
      permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],
    },
    {
      name: 'leave_requests',
      attributes: [
        { key: 'id', type: 'string', size: 255, required: true },
        { key: 'organization_id', type: 'string', size: 255 },
        { key: 'employee_id', type: 'string', size: 255, required: true },
        { key: 'start_date', type: 'string', size: 20, required: true },
        { key: 'end_date', type: 'string', size: 20, required: true },
        { key: 'leave_type', type: 'string', size: 50, default: 'annual' },
        { key: 'reason', type: 'text' },
        { key: 'status', type: 'string', size: 50, default: 'pending' },
        { key: 'created_at', type: 'datetime' },
        { key: 'updated_at', type: 'datetime' },
      ],
      permissions: ['read("users")', 'create("users")', 'update("users")', 'delete("users")'],
    },
  ];

async function ensureCollection(def) {
  try {
    await api('GET', `/databases/${databaseId}/collections/${def.name}`);
    log.info(`  Collection ${def.name} exists`);
    return;
  } catch (e) {
    if (e.status !== 404) throw e;
  }

  const payload = {
    collectionId: def.name,
    name: def.name.charAt(0).toUpperCase() + def.name.slice(1),
    documentSecurity: false, // use collection-level permissions
  };
  // Build read/write permissions from def.permissions (supports both legacy array and new object formats)
  if (Array.isArray(def.permissions)) {
    // Legacy array format, e.g. ['read("any")', 'create("users")', ...]
    // Extract role from each permission string
    const extractRole = (str) => {
      const match = str.match(/\(\s*['"]?([^'"]+)['"]?\s*\)/);
      return match ? match[1] : 'users';
    };
    // Read permission is the first 'read' entry
    const readEntry = def.permissions.find(p => p.startsWith('read('));
    const readRole = extractRole(readEntry);
    // Write permissions include create, update, delete entries; they usually share the same role
    // Take the role from the first create/update/delete entry
    const writeEntry = def.permissions.find(p => p.startsWith('create(') || p.startsWith('update(') || p.startsWith('delete('));
    const writeRole = extractRole(writeEntry);
    // Convert to Appwrite format: 'any' -> 'role:all', 'users' -> 'role:users', otherwise 'role:<value>'
    const toAppwrite = (r) => {
      if (r === 'any') return 'role:all';
      if (r === 'users') return 'role:users';
      return `role:${r}`;
    };
    payload.read = [toAppwrite(readRole)];
    payload.write = [toAppwrite(writeRole)];
  } else if (def.permissions && typeof def.permissions === 'object') {
    // New format: { read: ['role:all'], write: ['role:users'] }
    payload.read = def.permissions.read;
    payload.write = def.permissions.write;
  }
  await api('POST', `/databases/${databaseId}/collections`, payload);
  log.success(`  ✓ Created collection ${def.name}`);
}

async function ensureAttributes(collectionName, attributes) {
  for (const attr of attributes) {
    const type = attr.type;
    const endpoint = `/databases/${databaseId}/collections/${collectionName}/attributes/${type}`;
    const payload = {
      key: attr.key,
      required: attr.required || false,
    };
    if (type === 'string') {
      payload.size = attr.size || 255;
      if (attr.array) payload.array = true;
    } else if (type === 'text') {
      if (attr.array) payload.array = true;
    } else if (
      type === 'integer' ||
      type === 'double' ||
      type === 'boolean' ||
      type === 'datetime'
    ) {
      // no extra properties needed
    }
    if (attr.default !== undefined) {
      payload.default = attr.default;
    }
    try {
      await api('POST', endpoint, payload);
      log.info(`    ✓ Attribute ${attr.key} (${type})`);
    } catch (e) {
      if (e.status === 409 || (e.message && e.message.toLowerCase().includes('already exists'))) {
        // ignore
      } else {
        const details = e.data && e.data.message ? ` - ${e.data.message}` : '';
        log.error(`    ✗ Failed ${attr.key}: ${e.message}${details}`);
      }
    }
  }
}

 async function ensureIndexes() {
   const indexes = [
     { collection: 'invites', key: 'token', type: 'unique' },
     { collection: 'invites', key: 'email', type: 'key' },
     { collection: 'users', key: 'email', type: 'unique' },
     { collection: 'users', key: 'verification_token', type: 'key' },
     { collection: 'cases', key: 'organization_id', type: 'key' },
     { collection: 'tasks', key: 'organization_id', type: 'key' },
   ];

  for (const idx of indexes) {
    try {
      await api('POST', `/databases/${databaseId}/collections/${idx.collection}/indexes`, {
        key: idx.key,
        type: idx.type,
        attributes: [idx.key],
      });
      log.success(`  ✓ Index ${idx.collection}.${idx.key}`);
    } catch (e) {
      if (e.status === 409) {
        log.info(`  ✓ Index exists ${idx.collection}.${idx.key}`);
      } else {
        log.error(`  ✗ Index failed ${idx.collection}.${idx.key}: ${e.message}`);
      }
    }
  }
}

async function main() {
  console.log('\n=== Appwrite Database Setup ===\n');
  console.log('Config:', { endpoint, projectId: projectId?.slice(0,10)+'...', databaseId });

  await ensureDatabase();

  // Delete all existing collections to ensure fresh permissions and schema
  console.log('Cleaning up existing collections...');
  for (const coll of collections) {
    try {
      await api('GET', `/databases/${databaseId}/collections/${coll.name}`);
      // Collection exists, delete it
      await api('DELETE', `/databases/${databaseId}/collections/${coll.name}`);
      log.warn(`  Deleted existing collection "${coll.name}"`);
    } catch (e) {
      if (e.status !== 404) {
        log.error(`  Failed to delete ${coll.name}: ${e.message}`);
      } else {
        // Doesn't exist, that's fine
      }
    }
  }

  // Schema fix: chat_messages sender changed from integer to string
  // (No longer need special deletion since we delete all above)
  // This placeholder kept for backward compatibility but not needed

  // Create all collections with correct attributes and permissions
  for (const coll of collections) {
    log.info(`Collection: ${coll.name}`);
    try {
      await ensureCollection(coll);
      await ensureAttributes(coll.name, coll.attributes);
    } catch (err) {
      log.error(`  Failed: ${err.message}`);
    }
  }

  log.info('\nCreating indexes...');
  await ensureIndexes();

  log.info('\nCreating storage bucket...');
  await ensureStorageBucket('documents', 'Documents', {
    permissions: ['read("users")', 'write("users")'],
    maximumFileSize: 50000000, // 50MB (max allowed by Appwrite)
    allowedFileExtensions: [
      // Documents
      'pdf', 'PDF', 'doc', 'DOC', 'docx', 'DOCX', 'txt', 'TXT', 'rtf', 'RTF', 'odt', 'ODT',
      // Spreadsheets
      'xls', 'XLS', 'xlsx', 'XLSX', 'csv', 'CSV',
      // Presentations
      'ppt', 'PPT', 'pptx', 'PPTX',
      // Images
      'jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF', 'bmp', 'BMP', 'tiff', 'TIFF', 'svg', 'SVG',
      // Audio/Video
      'mp3', 'MP3', 'mp4', 'MP4', 'wav', 'WAV', 'avi', 'AVI', 'mov', 'MOV', 'mkv', 'MKV',
      // Archives
      'zip', 'ZIP', 'rar', 'RAR', '7z', '7Z',
      // Data & Code
      'json', 'JSON', 'xml', 'XML', 'html', 'HTML', 'htm', 'HTM',
      'py', 'PY', 'js', 'JS', 'ts', 'TS', 'java', 'JAVA', 'c', 'C', 'cpp', 'CPP', 'cs', 'CS',
    ],
  });

  console.log('\n\x1b[1m✅ Setup Complete!\x1b[0m');
  console.log('Next steps:');
  console.log('  1. node scripts/create-user-docs.mjs  # create test user profiles');
  console.log('  2. npm run dev');
}

// Ensure storage bucket exists and has correct permissions
async function ensureStorageBucket(bucketId, name, options = {}) {
  try {
    // Check if bucket exists
    const bucket = await api('GET', `/storage/buckets/${bucketId}`);
    log.info(`Storage bucket '${bucketId}' exists`);
    // Delete existing bucket to recreate with fresh settings (dev only)
    try {
      await api('DELETE', `/storage/buckets/${bucketId}`);
      log.info(`  Deleted existing bucket '${bucketId}'`);
    } catch (delErr) {
      log.warn(`Could not delete existing bucket: ${delErr.message}`);
    }
  } catch (e) {
    // Bucket does not exist, will create below
  }

  // Create bucket with correct options
  try {
    const created = await api('POST', '/storage/buckets', {
      bucketId,
      name: name || bucketId,
      permissions: options.permissions || ['read("users")', 'write("users")'],
      maximumFileSize: options.maximumFileSize || 10485760,
      allowedFileExtensions: options.allowedFileExtensions || [],
      encryption: false,
      antivirus: false,
    });
    log.success(`✓ Storage bucket created with correct settings`);
    return created;
  } catch (err) {
    log.error(`Failed to create storage bucket: ${err.message}`);
    // Don't fail setup - storage can be created later
  }
}

// Invoke main
main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
