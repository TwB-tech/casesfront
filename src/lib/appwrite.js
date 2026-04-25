import { Client, Account, Databases, Storage, Query, ID, Functions } from 'appwrite';

// Detect database mode early
const dbMode =
  import.meta.env.DATABASE_MODE ||
  import.meta.env.VITE_DATABASE_MODE ||
  import.meta.env.REACT_APP_DATABASE_MODE ||
  'standalone';
const isAppwriteMode = dbMode === 'appwrite';

// Configuration (only used in Appwrite mode)
const endpoint = import.meta.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = import.meta.env.APPWRITE_PROJECT_ID;

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

if (isAppwriteMode) {
  client = new Client();
  client.setEndpoint(endpoint);
  client.setProject(projectId);
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
      const session = await account.createEmailSession(email, password);
      return { data: session };
    } catch (error) {
      return { error };
    }
  },

  async create(userId, email, password, username, metadata = {}) {
    try {
      // Create user with ID (Appwrite allows specifying ID)
      const user = await account.create(userId || ID.unique(), email, password, username);

      // Store metadata in user prefs
      if (Object.keys(metadata).length > 0) {
        await account.updatePrefs(user.$id, metadata);
      }

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
      const result = await account.updatePassword(newPassword);
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
      await account.deleteSession();
      return { data: {} };
    } catch (error) {
      return { error };
    }
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

export const getCurrentOrganizationId = () => {
  const user = getCurrentUser();
  return localStorage.getItem('organization_id') || user?.organization_id || user?.id;
};

// Organization isolation filter (replaces RLS)
export const withOrganization = (queries = [], userId = null) => {
  const orgId = getCurrentOrganizationId();
  if (orgId) {
    queries.push(Query.equal('organization_id', orgId));
  }
  // Also allow user's own records (client_id, advocate_id, owner, etc.)
  if (userId) {
    queries.push(
      Query.or(
        Query.equal('organization_id', orgId),
        Query.equal('client_id', userId),
        Query.equal('advocate_id', userId),
        Query.equal('assigned_to', userId),
        Query.equal('created_by', userId),
        Query.equal('owner', userId),
        Query.contains('shared_with', userId)
      )
    );
  }
   return queries;
 };

// Collections that have organization_id field and need org isolation
// Note: 'organizations' and 'courts' are excluded — they are top-level
export const ORG_SCOPED = new Set([
  'users',
  'cases',
  'tasks',
  'documents',
  'communications',
  'invoices',
  'invoice_items',
  'chat_rooms',
  'chat_messages',
  'audit_logs',
  'expenses',
  'payroll_runs',
  'admin_settings',
  'subscriptions',
  'onboarding',
  'invites',
  // 'courts' is global, not org-scoped
]);

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
         queries = withOrganization(queries, userId);
       }

       const result = await databases.listDocuments(DATABASE_ID, collection, queries);
       const documents = result.documents.map((doc) => this.normalize(doc));
       return { data: documents };
     } catch (error) {
       console.error(`Appwrite list ${collection}:`, error);
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
       console.error(`Appwrite create ${collection}:`, error);
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
};
