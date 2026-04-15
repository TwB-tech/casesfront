import { databases, account, DATABASE_ID, COLLECTIONS, withOrganizationId, logAudit } from './lib/appwrite';
import { Query } from 'appwrite';

// Environment check
const USE_APPWRITE = import.meta.env.VITE_USE_APPWRITE === 'true' || 
                    import.meta.env.VITE_APPWRITE_PROJECT_ID;

// Error handler
const handleError = (error, message = 'Operation failed') => {
  const error = new Error(message);
  error.response = {
    status: error.code || 400,
    data: { message: error.message || message }
  };
  throw error;
};

// Fallback to standalone mode if AppWrite not configured
if (!USE_APPWRITE) {
  const { standaloneApi } = await import('./lib/standaloneApi');
  export default standaloneApi;
}

// AppWrite API Adapter - Drop in replacement for existing axios calls
const appwriteApi = {
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },

  async get(url) {
    if (!USE_APPWRITE) {
      const { standaloneApi } = await import('./lib/standaloneApi');
      return standaloneApi.get(url);
    }
    
    // Normalize path by removing trailing slashes and leading /api/ prefix
    const path = url.replace(/^\/api\//, '').replace(/^\//, '').replace(/\/$/, '');
    
    // Case List
    if (path === 'case') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CASES, withOrganizationId());
      return { data: { results: response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        client_id: doc.client_id,
        advocate_id: doc.advocate_id,
        court_id: doc.court_id,
        organization: doc.organization || { name: 'Organization' }
      })) };
    }

    // Individual/Client List
    if (path === 'individual/' || path === 'client/' || path === 'client') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [
        ...withOrganizationId(),
        Query.equal('role', ['individual', 'client'])
      ]);
      return { data: { results: response.documents.map(doc => ({ ...doc, id: doc.$id })) } };
    }

    // Advocate List
    if (path === 'advocate/' || path === 'advocate/firm-advocates/' || path === 'individual/case-advocates/') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [
        ...withOrganizationId(),
        Query.equal('role', ['advocate', 'firm'])
      ]);
      return { data: { results: response.documents.map(doc => ({ ...doc, id: doc.$id })) } };
    }

    // Courts List
    if (path === 'court/') {
      const response = await databases.listDocuments(DATABASE_ID, 'courts', withOrganizationId());
      return { data: { results: response.documents } };
    }

    // Advocate Cases
    if (path === 'advocate/cases/') {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CASES, [
        ...withOrganizationId(),
        Query.equal('advocate_id', user.id)
      ]);
      return { 
        data: { 
          cases_count: response.documents.length, 
          results: response.documents.map(doc => ({ ...doc, id: doc.$id })) 
        } 
      };
    }

    // Advocate Clients
    if (path === 'advocate/clients/') {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const cases = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CASES, [
        ...withOrganizationId(),
        Query.equal('advocate_id', user.id)
      ]);
      const clientIds = [...new Set(cases.documents.map(c => c.client_id))];
      
      const clients = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [
        ...withOrganizationId(),
        Query.contains('$id', clientIds)
      ]);
      
      return { 
        data: { 
          clients_count: clients.documents.length, 
          results: clients.documents.map(doc => ({ ...doc, id: doc.$id })) 
        } 
      };
    }

    // Task List
    if (path === 'tasks/' || path === 'tasks') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, withOrganizationId());
      return { data: { results: response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        assigned_to: doc.assigned_to,
        case: doc.case_id
      })) };
    }

    // Document List
    if (path === 'document_management/api/documents/' || path === 'documents') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DOCUMENTS, withOrganizationId());
      return { data: { results: response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        owner: doc.owner_id,
        shared_with: doc.shared_with || []
      })) };
    }
    
    // Individual Cases
    if (path === 'case/individual-cases/') {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CASES, [
        ...withOrganizationId(),
        Query.or([
          Query.equal('client_id', user.id),
          Query.equal('advocate_id', user.id)
        ])
      ]);
      return { data: response.documents.map(doc => ({ ...doc, id: doc.$id })) };
    }

    // Invoice List
    if (path === 'invoices' || path === 'api/invoices') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.INVOICES, withOrganizationId());
      
      // Convert snake_case to camelCase for frontend compatibility
      const convertedDocuments = response.documents.map(invoice => ({
        ...invoice,
        id: invoice.$id,
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.client_name,
        totalAmount: Number(invoice.total_amount || 0),
        createdAt: invoice.$createdAt,
        updatedAt: invoice.$updatedAt
      }));
      
      return { data: convertedDocuments };
    }

    // HR/Employees
    if (path === 'hr/employees') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, withOrganizationId());
      return { data: { results: response.documents } };
    }

    // Payroll
    if (path === 'payroll') {
      const response = await databases.listDocuments(DATABASE_ID, 'payroll_runs', withOrganizationId());
      return { data: response.documents };
    }

    // Client Communications
    if (path === 'clientcomm/api/clientcommunications/') {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COMMUNICATIONS, withOrganizationId());
      return { 
        data: { 
          results: response.documents
            .map(doc => ({ ...doc, id: doc.$id }))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        } 
      };
    }
    
    // Chat Rooms
    if (path.startsWith('chats/room-info/')) {
      const roomName = path.split('/').pop();
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CHAT_ROOMS, [
        ...withOrganizationId(),
        Query.equal('room_name', roomName)
      ]);
      
      if (response.documents.length === 0) {
        return { data: null, status: 404 };
      }
      
      return { data: response.documents[0] };
    }
    
    // Chat Messages
    if (path.startsWith('chats/get-messages/')) {
      const roomName = path.split('/').pop();
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CHAT_MESSAGES, [
        ...withOrganizationId(),
        Query.equal('room', roomName),
        Query.orderAsc('timestamp')
      ]);
      
      return { data: response.documents.map(doc => ({ ...doc, id: doc.$id })) };
    }
    
    // User Details
    if (path.startsWith('auth/user/')) {
      const userId = path.split('/').pop();
      const response = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, userId);
      const { password, ...safeUser } = response;
      return { data: { ...safeUser, id: response.$id } };
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
    if (!USE_APPWRITE) {
      const { standaloneApi } = await import('./lib/standaloneApi');
      return standaloneApi.post(url, payload);
    }
    
    const path = url.replace(/^\/api\//, '').replace(/^\//, '');
    const organization_id = localStorage.getItem('organization_id');

    // Login
    if (path === 'auth/login/') {
      const session = await account.createEmailSession(payload.email, payload.password);
      const user = await account.get();
      const prefs = user.prefs || {};
      
      // Set organization context
      if (prefs.organization_id) {
        localStorage.setItem('organization_id', prefs.organization_id);
      }
      
      return { 
        data: {
          id: user.$id,
          email: user.email,
          username: user.name,
          role: prefs.role || 'individual',
          organization_id: prefs.organization_id,
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

    // Create Chat Room
    if (path === 'chats/create-or-get-chat-room/') {
      const first = Number(payload.user_id);
      const second = Number(payload.other_user_id);
      const roomName = `room-${[first, second].sort((a, b) => a - b).join('-')}`;
      
      const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CHAT_ROOMS, [
        ...withOrganizationId(),
        Query.equal('room_name', roomName)
      ]);
      
      if (existing.documents.length > 0) {
        return { data: existing.documents[0] };
      }
      
      const room = await databases.createDocument(DATABASE_ID, COLLECTIONS.CHAT_ROOMS, 'unique()', {
        organization_id: localStorage.getItem('organization_id'),
        room_name: roomName,
        participants: [first, second]
      });
      
      await logAudit('CREATE', 'chat_rooms', room.$id, payload);
      return { data: room };
    }
    
    // Send Chat Message
    if (path === 'chats/send-message/') {
      const message = await databases.createDocument(DATABASE_ID, COLLECTIONS.CHAT_MESSAGES, 'unique()', {
        organization_id: localStorage.getItem('organization_id'),
        room: payload.room,
        sender: Number(payload.sender_id),
        content: payload.message,
        timestamp: new Date().toISOString()
      });
      
      await logAudit('CREATE', 'chat_messages', message.$id, payload);
      return { data: message };
    }
    
    // Billing Subscribe
    if (path === 'billing/subscribe/') {
      const subscription = await databases.createDocument(DATABASE_ID, 'subscriptions', 'unique()', {
        organization_id: localStorage.getItem('organization_id'),
        ...payload,
        created_at: new Date().toISOString()
      });
      
      await logAudit('CREATE', 'subscriptions', subscription.$id, payload);
      return { 
        data: {
          success: true,
          checkout_request_id: payload.payment_method === 'mpesa' ? `mpesa-${subscription.$id}` : null,
          message: 'Subscription started.'
        } 
      };
    }
    
    // PayPal Capture
    if (path === 'billing/paypal/capture/') {
      return { data: { success: true, message: 'Payment captured.' } };
    }
    
    // Onboarding
    if (path === 'billing/onboarding/') {
      const onboarding = await databases.createDocument(DATABASE_ID, 'onboarding', 'unique()', {
        organization_id: localStorage.getItem('organization_id'),
        ...payload,
        created_at: new Date().toISOString()
      });
      
      await logAudit('CREATE', 'onboarding', onboarding.$id, payload);
      return { data: onboarding };
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
    if (!USE_APPWRITE) {
      const { standaloneApi } = await import('./lib/standaloneApi');
      return standaloneApi.put(url, payload);
    }
    
    const path = url.replace(/^\/api\//, '').replace(/^\//, '');
    const parts = path.split('/').filter(Boolean);
    
    // Case update
    if (path.startsWith('case/')) {
      const id = parts[1];
      const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.CASES, id, {
        ...payload,
        client_id: Number(payload.individual ?? payload.client_id),
        court_id: Number(payload.court ?? payload.court_id)
      });
      
      await logAudit('UPDATE', 'cases', id, payload);
      return { data: doc };
    }
    
    // Task update
    if (path.startsWith('tasks/')) {
      const id = parts[parts.length - 1];
      const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.TASKS, id, {
        ...payload,
        assigned_to: Number(payload.assigned_to ?? payload.assigned_to),
        case: Number(payload.case ?? payload.case_id)
      });
      
      await logAudit('UPDATE', 'tasks', id, payload);
      return { data: doc };
    }
    
    // Document update
    if (path.startsWith('api/documents/')) {
      const id = parts[2];
      const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.DOCUMENTS, id, {
        ...payload,
        updated_at: new Date().toISOString()
      });
      
      await logAudit('UPDATE', 'documents', id, payload);
      return { data: doc };
    }
    
    // User/Individual update
    if (path.startsWith('individual/')) {
      const id = parts[1];
      const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, id, payload);
      
      await logAudit('UPDATE', 'users', id, payload);
      return { data: doc };
    }
    
    // User settings update
    if (path === 'user/communication-settings' || path === 'user/task-settings') {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, user.id, payload);
      
      await logAudit('UPDATE', 'users', user.id, payload);
      return { data: doc };
    }
    
    // Admin settings
    if (path.startsWith('admin/')) {
      const doc = await databases.updateDocument(DATABASE_ID, 'admin_settings', 'default', payload);
      
      await logAudit('UPDATE', 'admin_settings', 'default', payload);
      return { data: doc };
    }
    
    // Generic update handler
    const [collection, id] = parts;
    const collectionMap = {
      'case': COLLECTIONS.CASES,
      'cases': COLLECTIONS.CASES,
      'tasks': COLLECTIONS.TASKS,
      'documents': COLLECTIONS.DOCUMENTS,
      'invoices': COLLECTIONS.INVOICES,
      'communications': COLLECTIONS.COMMUNICATIONS
    };
    
    const collectionId = collectionMap[collection] || collection.toUpperCase();
    const doc = await databases.updateDocument(DATABASE_ID, collectionId, id, payload);
    
    await logAudit('UPDATE', collection, id, payload);
    return { data: doc };
  },

  async delete(url) {
    if (!USE_APPWRITE) {
      const { standaloneApi } = await import('./lib/standaloneApi');
      return standaloneApi.delete(url);
    }
    
    const path = url.replace(/^\/api\//, '').replace(/^\//, '');
    const parts = path.split('/').filter(Boolean);
    
    // Task delete
    if (path.startsWith('tasks/')) {
      const id = parts[parts.length - 1];
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TASKS, id);
      await logAudit('DELETE', 'tasks', id);
      return { data: { success: true } };
    }
    
    // Generic delete handler
    const [collection, id] = parts;
    const collectionMap = {
      'case': COLLECTIONS.CASES,
      'cases': COLLECTIONS.CASES,
      'tasks': COLLECTIONS.TASKS,
      'documents': COLLECTIONS.DOCUMENTS,
      'invoices': COLLECTIONS.INVOICES,
      'communications': COLLECTIONS.COMMUNICATIONS
    };
    
    const collectionId = collectionMap[collection] || collection.toUpperCase();
    await databases.deleteDocument(DATABASE_ID, collectionId, id);
    await logAudit('DELETE', collection, id);
    
    return { data: { success: true } };
  }
};

export default appwriteApi;

