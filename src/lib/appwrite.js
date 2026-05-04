import { Client, Account, Databases, Storage, Query, ID, Functions } from 'appwrite';

// Detect database mode early
const dbMode =
  import.meta.env.DATABASE_MODE ||
  import.meta.env.VITE_DATABASE_MODE ||
  import.meta.env.REACT_APP_DATABASE_MODE ||
  'standalone';
const isAppwriteMode = dbMode === 'appwrite';

// Configuration (only used in Appwrite mode)
const appwriteEndpoint = import.meta.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = import.meta.env.APPWRITE_PROJECT_ID;

// In browser (both dev and prod), use same-origin proxy to avoid CORS
// The proxy is at /api/appwrite-proxy and forwards to Appwrite
let endpoint = appwriteEndpoint;
if (typeof window !== 'undefined') {
  // Build absolute URL to proxy
  endpoint = `${window.location.origin}/api/appwrite-proxy`;
}

// Validate only when in Appwrite mode
if (isAppwriteMode && !projectId) {
  throw new Error(
    'APPWRITE_PROJECT_ID is required when DATABASE_MODE=appwrite. ' + 'Set it in .env.local or .env'
  );
}

// Initialize Appwrite services (null when not in Appwrite mode)
let client = null;
let account = null;
let databases = null;
let storage = null;
let functions = null;
const SESSION_STORAGE_KEY = 'appwrite_session_secret';

if (isAppwriteMode) {
  client = new Client();
  client.setEndpoint(endpoint);
  client.setProject(projectId);
  if (typeof window !== 'undefined') {
    const storedSessionSecret = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSessionSecret) {
      client.setSession(storedSessionSecret);
    }
  }
  // No JWT set here — user sessions are managed by Account methods
  account = new Account(client);
  databases = new Databases(client);
  storage = new Storage(client);
  functions = new Functions(client);
}

// Database ID (use 'default' or set via env)
export const DATABASE_ID = import.meta.env.APPWRITE_DATABASE_ID || 'default';

// Collection/Table mappings (match Supabase TABLES)
export const COLLECTIONS = {
  ORGANIZATIONS: 'organizations',
  USERS: 'users',
  CASES: 'cases',
  TASKS: 'tasks',
  DOCUMENTS: 'documents',
  COMMUNICATIONS: 'communications',
  INVOICES: 'invoices',
  INVOICE_ITEMS: 'invoice_items',
  CHAT_ROOMS: 'chat_rooms',
  CHAT_MESSAGES: 'chat_messages',
  AUDIT_LOGS: 'audit_logs',
  EXPENSES: 'expenses',
   PAYROLL_RUNS: 'payroll_runs',
   ADMIN_SETTINGS: 'admin_settings',
   SUBSCRIPTIONS: 'subscriptions',
   ONBOARDING: 'onboarding',
   INVITES: 'invites',
   COURTS: 'courts',
   NOTES: 'notes',
 };

// Storage buckets (matching Supabase)
export const BUCKETS = {
  DOCUMENTS: 'documents',
};

// ============================================
// AUTH HELPERS
// Mirror Supabase auth API signatures
// ============================================
export const auth = {
  async createEmailSession(email, password) {
    try {
      // Use direct fetch to avoid SDK's internal session check
      const baseEndpoint = import.meta.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
      // In browser, go through Vercel proxy to avoid CORS
      const url = typeof window !== 'undefined'
        ? `${window.location.origin}/api/appwrite-proxy/account/sessions/email`
        : `${baseEndpoint}/account/sessions/email`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const err = new Error(errBody.message || 'Failed to create session');
        err.status = res.status;
        err.body = errBody;
        return { error: err };
      }

      const data = await res.json();

      // Store session secret in client and localStorage
      if (data?.secret) {
        client.setSession(data.secret);
        if (typeof window !== 'undefined') {
          localStorage.setItem(SESSION_STORAGE_KEY, data.secret);
        }
      } else {
        // No secret returned — clear any existing session
        client.setSession(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }

      return { data };
    } catch (error) {
      return { error };
    }
  },

   async create(userId, email, password, username) {
     try {
       // Always provide a userId. Appwrite SDK requires 4 arguments: (userId, email, password, name)
       // If not provided, generate a secure unique ID.
       const uid = userId || ID.unique();
       const user = await account.create(uid, email, password, username);
       return { data: { user } };
     } catch (error) {
       return { error };
     }
   },

  async get() {
    try {
      const user = await account.get();
      return { data: user };
    } catch (error) {
      // No session
      return { data: null };
    }
  },

  async updatePrefs(userId, prefs) {
    try {
      const result = await account.updatePrefs(userId, prefs);
      return { data: result };
    } catch (error) {
      return { error };
    }
  },

  async updatePassword(newPassword) {
    try {
      const result = await account.updatePassword({ password: newPassword });
      return { data: result };
    } catch (error) {
      return { error };
    }
  },

  async updateRecovery(newPassword) {
    // Simplified: in production integrate with password reset flow
    console.warn('Password recovery should use dedicated reset flow');
    return { data: {} };
  },

   async deleteSession() {
     try {
       // Use direct fetch to be explicit
       const baseEndpoint = import.meta.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
       const url = typeof window !== 'undefined'
         ? `${window.location.origin}/api/appwrite-proxy/account/sessions/current`
         : `${baseEndpoint}/account/sessions/current`;
       const res = await fetch(url, {
         method: 'DELETE',
         headers: { 'Content-Type': 'application/json' },
       });
       // Clear local session regardless of response
       client.setSession(null);
       if (typeof window !== 'undefined') {
         localStorage.removeItem(SESSION_STORAGE_KEY);
       }
       if (!res.ok) {
         return { error: new Error('Logout failed') };
       }
       return { data: await res.json() };
     } catch (error) {
       return { error };
     }
   },

  setSessionSecret(secret) {
    if (!client || typeof secret !== 'string') {
      return;
    }
    client.setSession(secret);
  },

  // Get current session user ID
  async getCurrentUserId() {
    try {
      const session = await account.get();
      return session.userId || session.$id;
    } catch {
      return null;
    }
  },
};

// ============================================
// DATABASE HELPERS
// Appwrite doesn't have RLS - we filter manually
// ============================================
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('userInfo') || '{}');
  } catch {
    return {};
  }
};

// Fix: handle string "null" and don't fall back to user.id for organization_id
export const getCurrentOrganizationId = () => {
  const user = getCurrentUser();
  const orgId = localStorage.getItem('organization_id') || user?.organization_id || null;
  // Handle string "null" that might be stored in localStorage
  if (orgId === 'null' || orgId === 'undefined' || orgId === '') {
    return null;
  }
  return orgId;
};

// Organization isolation filter (replaces RLS)
// Only queries attributes that exist in the collection schema
export const withOrganization = (queries = [], userId = null, collection = null) => {
   const orgId = getCurrentOrganizationId();
   // Skip organization_id query if orgId is null/undefined/empty
   if (orgId && orgId !== 'null' && orgId !== 'undefined') {
     queries.push(Query.equal('organization_id', orgId));
   }
   // Also allow user's own records - but only query attributes that exist
   if (userId && collection && COLLECTION_ORG_ATTRIBUTES[collection]) {
     const validAttrs = COLLECTION_ORG_ATTRIBUTES[collection];
     const orConditions = [];
     // Only add org condition if we have a valid orgId
     if (orgId && orgId !== 'null' && orgId !== 'undefined') {
       orConditions.push(Query.equal('organization_id', orgId));
     }
     if (validAttrs.includes('client_id')) orConditions.push(Query.equal('client_id', userId));
     if (validAttrs.includes('advocate_id')) orConditions.push(Query.equal('advocate_id', userId));
     if (validAttrs.includes('assigned_to')) orConditions.push(Query.equal('assigned_to', userId));
     if (validAttrs.includes('created_by')) orConditions.push(Query.equal('created_by', userId));
     if (validAttrs.includes('owner')) orConditions.push(Query.equal('owner', userId));
     if (validAttrs.includes('submitted_by')) orConditions.push(Query.equal('submitted_by', userId));
     if (validAttrs.includes('user_id')) orConditions.push(Query.equal('user_id', userId));
     if (validAttrs.includes('invited_by')) orConditions.push(Query.equal('invited_by', userId));
     if (validAttrs.includes('shared_with')) orConditions.push(Query.contains('shared_with', userId));
     // Use Query.or only if we have at least 2 conditions (Appwrite requirement)
     if (orConditions.length === 1) {
       queries.push(orConditions[0]);
     } else if (orConditions.length > 1) {
       queries.push(Query.or(orConditions));
     }
   }
   return queries;
 };

// Collections that have organization_id field and need org isolation
// Note: 'organizations', 'courts', 'chat_messages', 'admin_settings' are excluded — they don't have organization_id
export const ORG_SCOPED = new Set([
   'users',
   'cases',
   'tasks',
   'documents',
   'communications',
   'invoices',
   'invoice_items',
   'chat_rooms',
   'audit_logs',
   'expenses',
   'payroll_runs',
   'subscriptions',
   'onboarding',
   'invites',
   'notes',
   // 'courts' is global, not org-scoped
   // 'chat_messages' doesn't have organization_id
   // 'admin_settings' doesn't have organization_id
 ]);

// Map of collection -> attributes that exist in Appwrite schema for org-aware queries
// This prevents querying attributes that don't exist in the schema
const COLLECTION_ORG_ATTRIBUTES = {
   users: ['organization_id'],
   cases: ['organization_id', 'client_id', 'advocate_id', 'created_by'],
   tasks: ['organization_id', 'assigned_to', 'created_by'],
   documents: ['organization_id', 'owner', 'shared_with'],
   communications: ['organization_id', 'created_by'],
   invoices: ['organization_id'],
   invoice_items: ['organization_id'],
   chat_rooms: ['organization_id'],
   chat_messages: ['organization_id', 'room', 'sender'],
   audit_logs: ['organization_id', 'user_id'],
   expenses: ['organization_id', 'submitted_by'],
   payroll_runs: ['organization_id'],
   subscriptions: ['organization_id'],
   onboarding: ['organization_id'],
   invites: ['organization_id', 'invited_by'],
   notes: ['organization_id', 'user_id'],
 };

// ============================================
// CRUD OPERATIONS
// ============================================
export const db = {
  // Normalize Appwrite document to Supabase-like shape
   normalize(doc) {
     if (!doc) return doc;
     const { $id, $createdAt, $updatedAt, ...rest } = doc;
     return {
       id: $id,
       created_at: $createdAt,
       updated_at: $updatedAt,
       ...rest,
     };
   },

   // LIST documents with optional filters
   // Auto-applies organization isolation for org-scoped collections
   async list(collection, queries = []) {
     try {
       const userId = getCurrentUser()?.id;
       if (ORG_SCOPED.has(collection)) {
         queries = withOrganization(queries, userId, collection);
       }

       const result = await databases.listDocuments(DATABASE_ID, collection, queries);
       const documents = (result.documents || []).map((doc) => this.normalize(doc));
       return { data: documents };
     } catch (error) {
       console.error(`Appwrite list ${collection}:`, error);
       // Return empty array on error to prevent crashes
       return { error, data: [] };
     }
   },

   // GET single document
   async get(collection, docId) {
     try {
       const doc = await databases.getDocument(DATABASE_ID, collection, docId);
       return { data: this.normalize(doc) };
     } catch (error) {
       return { error };
     }
   },

    // CREATE document
    async create(collection, data, docId = ID.unique()) {
      try {
        const orgId = getCurrentOrganizationId();
        const enriched = {
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        // Only add organization_id for org-scoped collections
        if (ORG_SCOPED.has(collection)) {
          enriched.organization_id = orgId;
        }
        const doc = await databases.createDocument(DATABASE_ID, collection, docId, enriched);
        return { data: this.normalize(doc) };
      } catch (error) {
        // Handle duplicate ID conflict (409) - document already exists
        if (error.code === 'document_already_exists' || error.message?.includes('already exists')) {
          try {
            const existing = await databases.getDocument(DATABASE_ID, collection, docId);
            return { data: this.normalize(existing) };
          } catch (fetchErr) {
            return { error: fetchErr };
          }
        }
        console.error(`Appwrite create ${collection} failed:`, error.message || error);
        return { error };
      }
    },

  // UPDATE document
  async update(collection, docId, data) {
    try {
      const updated = await databases.updateDocument(DATABASE_ID, collection, docId, {
        ...data,
        updated_at: new Date().toISOString(),
      });
      return { data: this.normalize(updated) };
    } catch (error) {
      console.error(`Appwrite update ${collection}:`, error);
      return { error };
    }
  },

  // DELETE document
  async delete(collection, docId) {
    try {
      await databases.deleteDocument(DATABASE_ID, collection, docId);
      return { data: { success: true } };
    } catch (error) {
      console.error(`Appwrite delete ${collection}:`, error);
      return { error };
    }
  },
};

// ============================================
// AUDIT LOGGING
// ============================================
export const logAudit = async (action, tableName, recordId, changes = {}) => {
  try {
    const user = getCurrentUser();
    await db.create(COLLECTIONS.AUDIT_LOGS, {
      organization_id: getCurrentOrganizationId(),
      user_id: user?.id || null,
      action,
      table_name: tableName,
      record_id: recordId,
      changes: JSON.stringify(changes),
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
    });
  } catch (error) {
    console.warn('Audit log failed:', error);
  }
};

// Ping status tracking
let pingStatus = null;
let pingError = null;

export async function verifyConnection() {
  try {
    const result = await client.ping();
    pingStatus = 'connected';
    pingError = null;
    console.log('✅ Appwrite connection verified:', result);
    return true;
  } catch (error) {
    pingStatus = 'error';
    pingError = error;
    console.error('❌ Appwrite connection failed:', error.message);
    return false;
  }
}

export function getPingStatus() {
  return { status: pingStatus, error: pingError };
}

// Auto-ping on module load (non-blocking)
if (isAppwriteMode) {
  verifyConnection().catch(console.error);
}

// ============================================
// NAMED EXPORTS (for direct named imports)
// ============================================
export { client, account, databases, storage, functions };

// ============================================
// DEFAULT EXPORT BUNDLE
// ============================================
 export default {
   client,
   account,
   databases,
   storage,
   functions,
   Query,
   COLLECTIONS,
   DATABASE_ID,
   BUCKETS,
   auth,
   db,
   logAudit,
   getCurrentUser,
   getCurrentOrganizationId,
   withOrganization,
   ID,
   verifyConnection,
   getPingStatus,
 };

