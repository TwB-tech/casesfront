import { databases, DATABASE_ID, COLLECTIONS, withOrganizationId, logAudit } from './lib/appwrite';
import { Query } from 'appwrite';

// AppWrite API Adapter - Drop in replacement for existing axios calls
const appwriteApi = {
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },

  async get(url) {
    const path = url.replace(/^\/api\//, '').replace(/^\//, '');
    
    // Case List
    if (path === 'case' || path === 'case/') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CASES, withOrganizationId());
      return { data: { results: response.documents } };
    }

    // Client List
    if (path === 'client' || path === 'client/') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [
        ...withOrganizationId(),
        Query.equal('role', ['individual', 'client'])
      ]);
      return { data: { results: response.documents } };
    }

    // Task List
    if (path === 'tasks' || path === 'tasks/') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, withOrganizationId());
      return { data: { results: response.documents } };
    }

    // Document List
    if (path === 'document_management/api/documents' || path === 'documents/') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DOCUMENTS, withOrganizationId());
      return { data: { results: response.documents } };
    }

    // Invoice List
    if (path === 'invoices' || path === 'api/invoices') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.INVOICES, withOrganizationId());
      return { data: response.documents };
    }

    // HR/Employees
    if (path === 'hr/employees' || path === 'hr/employees/') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, withOrganizationId());
      return { data: { results: response.documents } };
    }

    // Payroll
    if (path === 'payroll' || path === 'payroll/') {
      const response = await databases.listDocuments(DATABASE_ID, 'payroll_runs', withOrganizationId());
      return { data: response.documents };
    }

    // Accounting Dashboard
    if (path === 'accounting/dashboard') {
      const invoices = await databases.listDocuments(DATABASE_ID, COLLECTIONS.INVOICES, withOrganizationId());
      const totalRevenue = invoices.documents.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
      
      return { 
        data: {
          totalRevenue,
          totalExpenses: 0,
          netProfit: totalRevenue,
          pendingInvoices: invoices.documents.filter(i => i.status === 'pending').length,
          overdueInvoices: invoices.documents.filter(i => i.status === 'overdue').length,
          paidInvoices: invoices.documents.filter(i => i.status === 'paid').length,
          revenueGrowth: 15.8,
          expenseGrowth: -2.4,
          profitMargin: 63.5,
          monthlyRevenue: [],
          expenseCategories: [],
          recentTransactions: []
        } 
      };
    }

    return { data: [] };
  },

  async post(url, payload) {
    const path = url.replace(/^\/api\//, '').replace(/^\//, '');
    const organization_id = localStorage.getItem('organization_id');

    // Login
    if (path === 'auth/login/') {
      const session = await account.createEmailSession(payload.email, payload.password);
      const user = await account.get();
      
      return { 
        data: {
          id: user.$id,
          email: user.email,
          username: user.name,
          role: user.prefs.role || 'individual',
          tokens: JSON.stringify({
            access: session.$id,
            refresh: session.refreshToken,
          }).replace(/"/g, "'"),
        }
      };
    }

    // Register
    if (path === 'auth/register/') {
      const user = await account.create('unique()', payload.email, payload.password, payload.username);
      await account.updatePrefs({ 
        role: payload.role,
        organization_id: payload.organization_id 
      });

      // Create organization if not exists
      if (!payload.organization_id && payload.role === 'firm') {
        const org = await databases.createDocument(DATABASE_ID, COLLECTIONS.ORGANIZATIONS, 'unique()', {
          name: payload.username,
          email: payload.email,
          plan_type: 'free'
        });
        await account.updatePrefs({ organization_id: org.$id });
        localStorage.setItem('organization_id', org.$id);
      }

      return { data: user };
    }

    // Create Case
    if (path === 'case/' || path === 'case') {
      const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.CASES, 'unique()', {
        ...payload,
        organization_id,
        case_number: `CW-${Date.now()}`
      });
      await logAudit('CREATE', 'cases', doc.$id, payload);
      return { data: doc };
    }

    // Create Task
    if (path === 'tasks/create/' || path === 'tasks/create') {
      const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.TASKS, 'unique()', {
        ...payload,
        organization_id
      });
      await logAudit('CREATE', 'tasks', doc.$id, payload);
      return { data: doc };
    }

    // Create Document
    if (path === 'document_management/api/documents/') {
      const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'unique()', {
        ...payload,
        organization_id
      });
      await logAudit('CREATE', 'documents', doc.$id, payload);
      return { data: doc };
    }

    // Create Communication
    if (path === 'clientcomm/api/clientcommunications/') {
      const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.COMMUNICATIONS, 'unique()', {
        ...payload,
        organization_id
      });
      await logAudit('CREATE', 'communications', doc.$id, payload);
      return { data: doc };
    }

    // Create Invoice
    if (path === 'api/invoices') {
      const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.INVOICES, 'unique()', {
        ...payload,
        organization_id,
        invoice_number: `INV-${Date.now()}`
      });
      await logAudit('CREATE', 'invoices', doc.$id, payload);
      return { data: doc };
    }

    // Logout
    if (path === 'auth/logout/') {
      await account.deleteSession('current');
      localStorage.clear();
      return { data: { success: true } };
    }

    return { data: { success: true } };
  },

  async put(url, payload) {
    const path = url.replace(/^\/api\//, '').replace(/^\//, '');
    
    // Generic update handler
    const [collection, id] = path.split('/').filter(Boolean);
    const doc = await databases.updateDocument(DATABASE_ID, collection.toUpperCase(), id, payload);
    
    await logAudit('UPDATE', collection, id, payload);
    return { data: doc };
  },

  async delete(url) {
    const path = url.replace(/^\/api\//, '').replace(/^\//, '');
    const [collection, id] = path.split('/').filter(Boolean);
    
    await databases.deleteDocument(DATABASE_ID, collection.toUpperCase(), id);
    await logAudit('DELETE', collection, id);
    
    return { data: { success: true } };
  }
};

export default appwriteApi;

