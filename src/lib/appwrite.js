import { Client, Account, Databases, Storage, Realtime } from 'appwrite';

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

// Initialize AppWrite Client
const client = new Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Initialize Services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const realtime = new Realtime(client);

// Database IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'main';

// Collection IDs
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
};

// Storage Buckets
export const BUCKETS = {
  DOCUMENTS: 'documents',
};

// Security Utilities
export const withOrganizationId = (query = []) => {
  const organizationId = localStorage.getItem('organization_id');
  if (organizationId) {
    query.push(`organization_id=${organizationId}`);
  }
  return query;
};

// Audit Logger
export const logAudit = async (action, tableName, recordId, changes = {}) => {
  try {
    await databases.createDocument(DATABASE_ID, COLLECTIONS.AUDIT_LOGS, 'unique()', {
      organization_id: localStorage.getItem('organization_id'),
      user_id: (await account.get()).$id,
      action,
      table_name: tableName,
      record_id: recordId,
      changes: JSON.stringify(changes),
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.warn('Audit log failed:', error);
  }
};

export default client;
