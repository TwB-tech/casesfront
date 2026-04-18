import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate configuration at module load
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase configuration error: REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY must be set in .env'
  );
}

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Collection/Table name mappings (mirrors Appwrite COLLECTIONS)
export const TABLES = {
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

// Storage buckets
export const BUCKETS = {
  DOCUMENTS: 'documents',
};

// Helper: Apply organization isolation to queries
export const withOrganizationId = (query = []) => {
  const organizationId = localStorage.getItem('organization_id');
  if (organizationId) {
    query.push(['organization_id', 'eq', organizationId]);
  }
  return query;
};

// Audit Logger
export const logAudit = async (action, tableName, recordId, changes = {}) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    await supabase.from(TABLES.AUDIT_LOGS).insert({
      organization_id:
        typeof window !== 'undefined' ? localStorage.getItem('organization_id') : null,
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

// Auth helpers (mirrors Appwrite Account API)
export const auth = {
  async createEmailSession(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    return data;
  },

  async create(userId, email, password, username) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, role: 'individual' },
    });
    if (error) {
      throw error;
    }
    return data;
  },

  async get() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      throw error;
    }
    return data.user;
  },

  async updatePrefs(userId, prefs) {
    const { error } = await supabase.auth.admin.updateUserById(userId, { user_metadata: prefs });
    if (error) {
      throw error;
    }
  },

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      throw error;
    }
  },

  async updateRecovery(newPassword) {
    // Supabase handles password reset via recovery flow
    // This is a simplified implementation
    console.warn('Password reset token verification not fully implemented - use Supabase recovery');
    return { data: {} };
  },

  async deleteSession() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },
};

export default supabase;
