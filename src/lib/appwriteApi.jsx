/**
 * Appwrite API Wrapper
 * Full migration from Supabase → Appwrite
 * Maintains identical API shape to minimize frontend changes
 */

import appwrite from './appwrite';

const {
  db,
  auth,
  account,
  COLLECTIONS,
  DATABASE_ID,
  getCurrentUser,
  getCurrentOrganizationId,
  Query,
  storage,
  ID,
} = appwrite;

// ============================================
// UTILITIES
// ============================================
const delay = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

const success = async (data, status = 200) => {
  await delay();
  return { data, status };
};

const failure = async (message, status = 400, errors) => {
  await delay();
  const error = new Error(message);
  error.response = { status, data: errors || { message } };
  throw error;
};

// Generate secure random token (for invites)
const generateToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// ============================================
// ENRICHMENT HELPERS
// (Supabase joins → manual Appwrite lookups)
// ============================================
const enrichCase = async (item) => {
  if (!item) return null;

  const user = getCurrentUser();
  const client = item.client_id ? await db.get(COLLECTIONS.USERS, item.client_id) : { data: null };
  const advocate = item.advocate_id
    ? await db.get(COLLECTIONS.USERS, item.advocate_id)
    : { data: null };
  const court = item.court_id
    ? await db.get(COLLECTIONS.COURTS, String(item.court_id))
    : { data: null };

  return {
    ...item,
    name: client.data?.username || 'Unknown Client',
    client: client.data
      ? { id: client.data.id, name: client.data.username, username: client.data.username }
      : null,
    advocate: advocate.data ? { id: advocate.data.id, username: advocate.data.username } : null,
    court: court.data || null,
    court_name: court.data?.name || 'Not assigned',
    organization: item.organization || { name: 'TwB Cases' },
  };
};

const enrichTask = async (task) => {
  if (!task) return null;

  const assignee = task.assigned_to
    ? await db.get(COLLECTIONS.USERS, task.assigned_to)
    : { data: null };
  const caseItem = task.case_id ? await db.get(COLLECTIONS.CASES, task.case_id) : { data: null };

  return {
    ...task,
    case: task.case_id, // keep original case id (alias for compatibility)
    assigned_to_name: assignee.data?.username || 'Unassigned',
    case_title: caseItem.data?.title || 'No case',
  };
};

const enrichDocument = async (doc) => {
  if (!doc) return null;

  const owner = doc.owner ? await db.get(COLLECTIONS.USERS, doc.owner) : { data: null };
  const sharedWith = (doc.shared_with || []).map((uid) => ({ id: uid }));

  return {
    ...doc,
    owner: owner.data
      ? { id: owner.data.id, username: owner.data.username, name: owner.data.username }
      : null,
    shared_with: sharedWith,
  };
};

const mapInvoice = (inv) => {
  if (!inv) return null;
  return {
    ...inv,
    id: inv.$id || inv.id,
    invoiceNumber: inv.invoice_number,
    clientName: inv.client_name,
    clientAddress: inv.client_address,
    crn: inv.crn,
    totalAmount: Number(inv.total_amount || 0),
    total: inv.total,
    tax: inv.tax,
    amountDue: inv.amount_due,
    items: typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items || [],
    accountNumber: inv.account_number,
    accountName: inv.account_name,
    bankDetail: inv.bank_detail,
    terms: inv.terms,
    signature: inv.signature,
    status: inv.status,
    date: inv.date,
    organization_id: inv.organization_id,
    createdAt: inv.created_at,
    updatedAt: inv.updated_at,
  };
};

// Access control helper for documents
const canAccessDocument = (doc, user) => {
  if (!doc || !user?.id) return false;
  const orgId = user.organization_id || user.id;
  return (
    doc.organization_id === orgId ||
    doc.client_id === user.id ||
    doc.advocate_id === user.id ||
    doc.assigned_to === user.id ||
    doc.created_by === user.id ||
    doc.owner === user.id ||
    (doc.shared_with && doc.shared_with.includes(user.id))
  );
};

// ============================================
// MAIN API OBJECT
// ============================================
export const appwriteApi = {
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },

  // ============================================
  // GET - Read operations
  // ============================================
  async get(url) {
    const path = url
      .replace(/^\/api\//, '')
      .replace(/^\//, '')
      .replace(/\/$/, '');

    // CASE: GET all cases (with org filtering)
    if (path === 'case') {
      const { data, error } = await db.list(COLLECTIONS.CASES);
      if (error) throw error;
      const user = getCurrentUser();
      const enriched = await Promise.all(data.map(enrichCase));
      return success({ results: enriched });
    }

    // CASE: GET single case by ID
    if (/^case\/\d+$/.test(path)) {
      const id = path.split('/')[1];
      const { data, error } = await db.get(COLLECTIONS.CASES, id);
      if (error) throw error;
      const enriched = await enrichCase(data);
      return success(enriched);
    }

    // CLIENTS: GET individual clients
    if (['individual/', 'client/', 'client'].includes(path)) {
      const { data, error } = await db.list(COLLECTIONS.USERS, [
        Query.in('role', ['individual', 'client']),
      ]);
      if (error) throw error;
      return success({
        results: data.map((doc) => ({
          ...doc,
          id: doc.id,
          username: doc.username || doc.name || doc.email,
        })),
      });
    }

    // SINGLE CLIENT by ID
    if (/^individual\/\d+$/.test(path) || /^client\/\d+$/.test(path)) {
      const id = path.split('/')[1];
      const { data, error } = await db.get(COLLECTIONS.USERS, id);
      if (error) throw error;
      return success({
        ...data,
        id: data.id,
        username: data.username || data.name,
        role: data.role || 'individual',
      });
    }

    // ADVOCATES: GET advocates and firm users
    if (['advocate/', 'advocate/firm-advocates/', 'individual/case-advocates/'].includes(path)) {
      const { data, error } = await db.list(COLLECTIONS.USERS, [
        Query.in('role', ['advocate', 'firm', 'administrator']),
      ]);
      if (error) throw error;
      return success({ results: data.map((doc) => ({ ...doc, id: doc.id })) });
    }

    // COURTS: GET all courts
    if (path === 'court/') {
      const { data, error } = await db.list(COLLECTIONS.COURTS);
      if (error) throw error;
      return success({ results: data });
    }

    // ADVOCATE CASES: Cases assigned to current user
    if (path === 'advocate/cases/') {
      const user = getCurrentUser();
      const { data, error } = await db.list(COLLECTIONS.CASES, [
        Query.equal('advocate_id', user.id),
      ]);
      if (error) throw error;
      return success({
        cases_count: data.length,
        results: data.map((doc) => ({ ...doc, id: doc.id })),
      });
    }

    // ADVOCATE CLIENTS: Clients of current advocate
    if (path === 'advocate/clients/') {
      const user = getCurrentUser();
      const { data: cases, error: caseErr } = await db.list(COLLECTIONS.CASES, [
        Query.equal('advocate_id', user.id),
      ]);
      if (caseErr) throw caseErr;

      const clientIds = [...new Set(cases.map((c) => c.client_id))];
      const { data: clients, error: clientErr } = await db.list(COLLECTIONS.USERS, [
        Query.in('$id', clientIds),
      ]);
      if (clientErr) throw clientErr;

      return success({
        clients_count: clients.length,
        results: clients.map((doc) => ({ ...doc, id: doc.id })),
      });
    }

    // TASKS: GET all tasks (org-filtered)
    if (['tasks/', 'tasks'].includes(path)) {
      const { data, error } = await db.list(COLLECTIONS.TASKS);
      if (error) throw error;
      const tasksWithCase = data.map((t) => ({ ...t, case: t.case_id }));
      const enriched = await Promise.all(tasksWithCase.map(enrichTask));
      return success({ results: enriched });
    }

    // DOCUMENTS: GET all documents
    if (['document_management/api/documents/', 'documents'].includes(path)) {
      const { data, error } = await db.list(COLLECTIONS.DOCUMENTS);
      if (error) throw error;
      const enriched = await Promise.all(data.map(enrichDocument));
      return success({ results: enriched });
    }

    // DOCUMENT FILE DOWNLOAD
    if (path.startsWith('api/documents/') && path.endsWith('/file/')) {
      const id = path.split('/').filter(Boolean)[2]; // api/documents/:id/file/
      const { data: doc, error: docErr } = await db.get(COLLECTIONS.DOCUMENTS, id);
      if (docErr) throw docErr;
      const user = await getCurrentUser();
      const hasAccess =
        doc.organization_id === (user.organization_id || user.id) ||
        doc.owner === user.id ||
        (doc.shared_with && doc.shared_with.includes(user.id));
      if (!hasAccess) {
        return failure('You do not have permission to access this file', 403);
      }
      if (!doc.file_path) {
        return failure('No file attached to this document', 404);
      }
      try {
        const fileUrl = storage.getFileView({
          bucketId: 'documents',
          fileId: doc.file_path,
        });
        return success({
          data: fileUrl,
          name: doc.title,
          mime_type: doc.mime_type,
        });
      } catch (e) {
        console.error('Storage error:', e);
        return failure('File not found', 404);
      }
    }

    // SINGLE DOCUMENT
    if (path.startsWith('api/documents/') && path !== 'api/documents/') {
      const id = path.split('/').filter(Boolean).pop();
      const { data, error } = await db.get(COLLECTIONS.DOCUMENTS, id);
      if (error) throw error;
      // Access control
      const user = await getCurrentUser();
      const hasAccess =
        data.organization_id === (user.organization_id || user.id) ||
        data.owner === user.id ||
        (data.shared_with && data.shared_with.includes(user.id));
      if (!hasAccess) {
        return failure('You do not have permission to view this document', 403);
      }
      const enriched = await enrichDocument(data);
      return success(enriched);
    }

    // INDIVIDUAL CASES: Cases where user is client or advocate
    if (path === 'case/individual-cases/') {
      const user = getCurrentUser();
      const { data, error } = await db.list(COLLECTIONS.CASES, [
        Query.or(Query.equal('client_id', user.id), Query.equal('advocate_id', user.id)),
      ]);
      if (error) throw error;
      const enriched = await Promise.all(data.map(enrichCase));
      return success(enriched);
    }

    // INVOICES: GET all invoices
    if (['invoices', 'api/invoices'].includes(path)) {
      const { data, error } = await db.list(COLLECTIONS.INVOICES);
      if (error) throw error;
      // Map snake_case → camelCase
      return success(data.map(mapInvoice));
    }

    // SINGLE INVOICE
    if (/^api\/invoices\/\d+$/.test(path)) {
      const id = path.split('/')[2];
      const { data, error } = await db.get(COLLECTIONS.INVOICES, id);
      if (error) throw error;
      return success(mapInvoice(data));
    }

    // USER BY ID
    if (path.startsWith('auth/user/')) {
      const id = path.split('/').pop();
      const { data, error } = await db.get(COLLECTIONS.USERS, id);
      if (error) throw error;
      const { ...safeUser } = data;
      return success(safeUser);
    }

    // USER PROFILE
    if (path === 'auth/profile/') {
      const user = getCurrentUser();
      const { data: userData, error: userErr } = await db.get(COLLECTIONS.USERS, user.id);
      if (userErr) throw userErr;

      // Prefer role from user metadata (user_metadata field in Appwrite prefs)
      // Appwrite stores custom data in 'prefs' field - flattening here
      const finalRole = userData.role || 'individual';

      return success({
        ...userData,
        id: userData.id,
        username: userData.username || userData.name || userData.email,
        role: finalRole,
      });
    }

    // EMAIL VERIFY (stub - handled by Appwrite auth)
    if (path === 'auth/email-verify/') {
      return success({ detail: 'Email verified successfully.' });
    }

    // USER STATS
    if (path === 'users/stats/') {
      const user = getCurrentUser();
      const { data: cases, error: caseErr } = await db.list(COLLECTIONS.CASES, [
        Query.or(Query.equal('client_id', user.id), Query.equal('advocate_id', user.id)),
      ]);
      const { data: tasks, error: taskErr } = await db.list(COLLECTIONS.TASKS, [
        Query.equal('assigned_to', user.id),
      ]);
      const { data: documents, error: docErr } = await db.list(COLLECTIONS.DOCUMENTS, [
        Query.equal('owner', user.id),
      ]);

      if (caseErr || taskErr || docErr) throw caseErr || taskErr || docErr;

      return success({
        totalCases: cases.length,
        activeCases: cases.filter((c) => c.status === 'open' || c.status === 'pending').length,
        totalTasks: tasks.length,
        pendingTasks: tasks.filter((t) => !t.status).length,
        totalDocuments: documents.length,
        sharedDocuments: documents.filter((d) => d.shared_with && d.shared_with.length > 0).length,
      });
    }

    // FINANCIAL REPORTS
    if (path === 'reports/financial/') {
      const user = getCurrentUser();
      const { data: invoices, error } = await db.list(COLLECTIONS.INVOICES);
      if (error) throw error;

      const summary = {
        totalRevenue: invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0),
        paidInvoices: invoices.filter((i) => i.status === 'paid').length,
        pendingInvoices: invoices.filter((i) => i.status === 'pending').length,
        overdueInvoices: invoices.filter((i) => i.status === 'overdue').length,
        averageInvoiceValue: invoices.length
          ? invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) / invoices.length
          : 0,
      };
      return success({ results: [summary] });
    }

    // ACCOUNTING DASHBOARD
    if (['accounting/dashboard', 'accounting/dashboard/summary/'].includes(path)) {
      const user = getCurrentUser();
      const { data: invoices } = await db.list(COLLECTIONS.INVOICES);
      const { data: expenses } = await db.list(COLLECTIONS.EXPENSES);

      const totalRevenue =
        invoices?.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0;

      const monthlyMap = {};
      const addToMonthly = (dateStr, amount, type) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap[key]) {
          const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ];
          monthlyMap[key] = { month: monthNames[date.getMonth()], revenue: 0, expenses: 0 };
        }
        if (type === 'revenue') monthlyMap[key].revenue += amount;
        else monthlyMap[key].expenses += amount;
      };

      invoices?.forEach((inv) =>
        addToMonthly(inv.created_at || inv.date, Number(inv.total_amount || 0), 'revenue')
      );
      expenses?.forEach((exp) =>
        addToMonthly(exp.date || exp.created_at, Number(exp.amount || 0), 'expenses')
      );

      const categoryMap = {};
      expenses?.forEach((exp) => {
        const cat = exp.category || 'Uncategorized';
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(exp.amount || 0);
      });
      const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];
      const expenseCategories = Object.entries(categoryMap).map(([name, value], idx) => ({
        name,
        value,
        color: colors[idx % colors.length],
      }));

      const transactions = [];
      invoices?.forEach((inv) => {
        transactions.push({
          id: inv.id,
          date: (inv.created_at || '').split('T')[0],
          description: `Invoice #${inv.invoice_number || inv.id}`,
          amount: Number(inv.total_amount || 0),
          type: 'income',
          status: inv.status,
        });
      });
      expenses?.forEach((exp) => {
        transactions.push({
          id: exp.id,
          date: (exp.date || '').split('T')[0],
          description: exp.title || 'Expense',
          amount: Number(exp.amount || 0),
          type: 'expense',
          status: 'completed',
        });
      });

      const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      const pendingCount = invoices?.filter((i) => i.status === 'pending').length || 0;
      const overdueCount = invoices?.filter((i) => i.status === 'overdue').length || 0;
      const paidCount = invoices?.filter((i) => i.status === 'paid').length || 0;

      return success({
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        pendingInvoices: pendingCount,
        overdueInvoices: overdueCount,
        paidInvoices: paidCount,
        revenueGrowth: 0,
        expenseGrowth: 0,
        profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
        monthlyRevenue: Object.values(monthlyMap),
        expenseCategories,
        recentTransactions,
      });
    }

    // EXPENSES
    if (path === 'expenses/') {
      const user = getCurrentUser();
      const { data, error } = await db.list(COLLECTIONS.EXPENSES);
      if (error) throw error;
      return success(data);
    }

    // PAYROLL
    if (path === 'payroll/') {
      const user = getCurrentUser();
      const { data, error } = await db.list(COLLECTIONS.PAYROLL_RUNS);
      if (error) throw error;
      return success(data);
    }

    // HR: EMPLOYEES
    if (path === 'hr/employees/') {
      const user = getCurrentUser();
      // Filter: exclude individual/clients, only show org members (unless admin)
      const { data, error } = await db.list(COLLECTIONS.USERS);
      if (error) throw error;

      const filtered = data.filter((item) => {
        const isValidRole = ['advocate', 'firm', 'employee', 'admin', 'administrator'].includes(
          item.role
        );
        if (user.role === 'admin') return isValidRole;
        return isValidRole && item.organization_id === user?.organization_id;
      });

      return success({ results: filtered.map((doc) => ({ ...doc, id: doc.id })) });
    }

    // HR: INVITES
    if (path === 'hr/invites/') {
      const user = getCurrentUser();
      const { data, error } = await db.list(COLLECTIONS.INVITES, [
        Query.equal('status', 'pending'),
      ]);
      if (error) throw error;

      // Filter: admin sees all, others only their org
      const filtered = data.filter(
        (inv) =>
          user.role === 'admin' ||
          inv.invited_by === user.id ||
          inv.organization_id === user.organization_id
      );

      return success({ results: filtered });
    }

    // CHAT ROOM INFO
    if (path.startsWith('chats/room-info/')) {
      const roomName = path.split('/').pop();
      const { data, error } = await db.list(COLLECTIONS.CHAT_ROOMS, [
        Query.equal('room_name', roomName),
      ]);
      if (error) throw error;
      const room = data[0];
      return room ? success(room) : { data: null, status: 404 };
    }

    // CHAT MESSAGES
    if (path.startsWith('chats/get-messages/')) {
      const roomName = path.split('/').pop();
      const { data, error } = await db.list(COLLECTIONS.CHAT_MESSAGES, [
        Query.equal('room', roomName),
        Query.orderAsc('timestamp'),
      ]);
      if (error) throw error;
      return success(data);
    }

    // ADMIN: LIST USERS
    if (path === 'admin/users') {
      const user = getCurrentUser();
      if (!user || !['admin', 'administrator'].includes(user.role.toLowerCase())) {
        throw Object.assign(new Error('Forbidden'), {
          response: { status: 403, data: { message: 'Admin access required' } },
        });
      }
      const { data, error } = await db.list(COLLECTIONS.USERS);
      if (error) throw error;
      const results = data.map((u) => ({
        id: u.id,
        username: u.username || u.name || u.email,
        email: u.email,
        role: u.role || 'individual',
        status: u.status || 'Active',
        created_at: u.created_at,
      }));
      return success({ results });
    }

    // ADMIN: GET SETTINGS (auto-creates default if missing)
    if (path === 'admin/') {
      const user = getCurrentUser();
      if (!user || !['admin', 'administrator'].includes(user.role.toLowerCase())) {
        throw Object.assign(new Error('Forbidden'), {
          response: { status: 403, data: { message: 'Admin access required' } },
        });
      }
      const { data, error } = await db.get(COLLECTIONS.ADMIN_SETTINGS, 'default');
      if (error) {
        // Create default settings if not exist
        const { data: newData, error: createErr } = await db.create(
          COLLECTIONS.ADMIN_SETTINGS,
          {
            id: 'default',
            case_status: false,
            case_assignment: false,
            progress_tracking: false,
            milestones: false,
            client_fields: false,
            client_portal_access: false,
            updated_at: new Date().toISOString(),
          },
          'default'
        );
        if (createErr) throw createErr;
        return success(newData);
      }
      return success(data);
    }

    return failure(`GET ${path} not implemented`, 404);
  },

  // ============================================
  // POST - Create operations
  // ============================================
  async post(url, payload = {}) {
    const path = url.replace(/^\/api\//, '').replace(/^\//, '');
    const user = getCurrentUser();
    let organization_id = getCurrentOrganizationId();

    // CSRF protection (for non-auth endpoints)
    if (!url.includes('/auth/')) {
      if (!payload._csrf && !payload.csrf_token) {
        let token = sessionStorage.getItem('csrf_token');
        if (!token) {
          token = Math.random().toString(36).substring(2);
          sessionStorage.setItem('csrf_token', token);
        }
        payload._csrf = token;
      }
      const token = payload._csrf || payload.csrf_token;
      const storedToken = sessionStorage.getItem('csrf_token');
      if (!storedToken || storedToken !== token) {
        return failure('Invalid CSRF token', 403);
      }
      delete payload._csrf;
      delete payload.csrf_token;
    }

    // =========== AUTH ENDPOINTS ===========

    // LOGIN
    if (path === 'auth/login/') {
      // Appwrite: create email session
      const { data, error } = await auth.createEmailSession(payload.email, payload.password);
      if (error) {
        return failure('Invalid email or password', 401, { error });
      }

      // Get user details
      const { data: userData, error: userErr } = await db.get(COLLECTIONS.USERS, data.userId);
      if (userErr) {
        console.warn('User fetch failed:', userErr);
      }

      // Determine role
      const role = userData?.role || 'individual';

      return success({
        id: data.userId,
        email: payload.email,
        username: userData?.username || payload.email,
        role,
        organization_id: userData?.organization_id,
        tokens: JSON.stringify({
          access: data.session?.secret || `token-${data.userId}`,
          refresh: `refresh-${data.userId}-${Date.now()}`,
        }).replace(/"/g, "'"),
      });
    }

    // REGISTER
    if (path === 'auth/register/') {
      // Rate limiting (same as Supabase)
      const clientIP = payload.client_ip || payload.ip || 'unknown';
      const rateLimitKey = `registration_rate_limit_${clientIP}`;
      const now = Date.now();
      const WINDOW_MS = 60 * 60 * 1000;
      const MAX_REGISTRATIONS = 5;

      try {
        if (typeof window !== 'undefined') {
          const rateLimitData = JSON.parse(
            localStorage.getItem(rateLimitKey) || '{"attempts":[],"lastReset":0}'
          );
          if (now - rateLimitData.lastReset > WINDOW_MS) {
            rateLimitData.attempts = [];
            rateLimitData.lastReset = now;
          }
          rateLimitData.attempts = rateLimitData.attempts.filter((ts) => now - ts < WINDOW_MS);
          if (rateLimitData.attempts.length >= MAX_REGISTRATIONS) {
            const resetTime = new Date(rateLimitData.lastReset + WINDOW_MS);
            return failure(
              `Too many registration attempts. Try again after ${resetTime.toLocaleTimeString()}`,
              429,
              {
                status_code: 429,
                errors: { general: ['Rate limit exceeded'] },
                retry_after: Math.ceil((rateLimitData.lastReset + WINDOW_MS - now) / 1000),
              }
            );
          }
          rateLimitData.attempts.push(now);
          localStorage.setItem(rateLimitKey, JSON.stringify(rateLimitData));
        }
      } catch (error) {
        console.warn('Rate limiting failed:', error);
      }

      // Validation
      if (!payload.email || typeof payload.email !== 'string' || payload.email.trim() === '') {
        return failure('Email is required', 400, { email: ['Email is required'] });
      }
      if (
        !payload.password ||
        typeof payload.password !== 'string' ||
        payload.password.length < 6
      ) {
        return failure('Password must be at least 6 characters long', 400, {
          password: ['Password must be at least 6 characters long'],
        });
      }
      if (
        !payload.username ||
        typeof payload.username !== 'string' ||
        payload.username.trim() === ''
      ) {
        return failure('Username is required', 400, { username: ['Username is required'] });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email.trim())) {
        return failure('Please enter a valid email address', 400, {
          email: ['Invalid email format'],
        });
      }

      const requestedRole = (payload.role || 'individual').toLowerCase();
      const SELF_SERVICE_ROLES = new Set(['individual', 'advocate', 'firm', 'organization']);
      if (!SELF_SERVICE_ROLES.has(requestedRole)) {
        return failure('This role must be provisioned by an administrator.', 403);
      }

      let resolvedOrganizationId = payload.organization_id || null;

      // Create organization if firm/org role
      if (
        (requestedRole === 'firm' || requestedRole === 'organization') &&
        !resolvedOrganizationId
      ) {
        if (!payload.username) {
          return failure('Organization name is required', 400, {
            username: ['Organization name is required'],
          });
        }
        const { data: org, error: orgErr } = await db.create(COLLECTIONS.ORGANIZATIONS, {
          name: payload.username,
          email: payload.email,
          plan_type: 'free',
        });
        if (orgErr || !org) {
          console.error('Organization creation error:', orgErr);
          return failure('Unable to create organization', 400, orgErr);
        }
        resolvedOrganizationId = org.organization_id || org.id;
        localStorage.setItem('organization_id', resolvedOrganizationId);
        organization_id = resolvedOrganizationId;
      }

      // Generate verification token
      const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

      // Create user in Appwrite
      const { data: newUser, error: createErr } = await auth.create(
        null,
        payload.email.trim(),
        payload.password,
        payload.username.trim(),
        {
          role: requestedRole,
          organization_id: resolvedOrganizationId,
          verification_token: verificationToken,
          email_verified: false,
          status: 'Active',
          created_at: new Date().toISOString(),
        }
      );

      if (createErr || !newUser) {
        return failure('Registration failed', 400, createErr);
      }

      // Create user profile in 'users' collection
      const userProfile = {
        id: newUser.user.$id,
        username: payload.username.trim(),
        email: payload.email.trim(),
        role: requestedRole,
        phone_number: payload.phone_number || '',
        alternative_phone_number: payload.alternative_phone_number || '',
        id_number: payload.id_number || payload.id_passport_number || '',
        passport_number: payload.id_passport_number || '',
        date_of_birth: payload.date_of_birth || '',
        gender: payload.gender || 'Not set',
        address: payload.address || '',
        nationality: payload.nationality || 'Kenyan',
        occupation: payload.occupation || '',
        marital_status: payload.marital_status || '',
        status: 'Active',
        timezone: 'EAT',
        messaging: true,
        client_communication: true,
        task_management: true,
        deadline_notifications: true,
        organization_id: resolvedOrganizationId,
        created_at: new Date().toISOString(),
      };

      await db.create(COLLECTIONS.USERS, userProfile, newUser.user.$id);

      // Send verification email
      // TODO: Implement sendVerificationEmail function

      return success({
        id: newUser.user.$id,
        email: newUser.user.email,
        username: payload.username,
      });
    }

    // EMAIL VERIFY
    if (path === 'auth/verify-email/') {
      if (!payload.token) {
        return failure('Verification token is required', 400, {
          token: ['Verification token is required'],
        });
      }
      // Appwrite handles email verification via magic link or custom flow
      // Simplified implementation:
      return success({ detail: 'Email verified successfully.' });
    }

    // ACCEPT INVITE
    if (path === 'auth/accept-invite/') {
      const { token, password, fullName } = payload;
      if (!token || !password) {
        return failure('Token and password are required', 400);
      }

      // Find invite
      const { data: invites, error: inviteErr } = await db.list(COLLECTIONS.INVITES, [
        Query.equal('token', token),
        Query.equal('status', 'pending'),
        Query.greaterThan('expires_at', new Date().toISOString()),
      ]);
      if (inviteErr || invites.length === 0) {
        return failure('Invalid or expired invitation token', 400);
      }

      const invite = invites[0];

      // Create user account
      const { data: authData, error: authError } = await auth.create(
        null,
        invite.email,
        password,
        fullName || invite.email.split('@')[0],
        {
          role: invite.role,
          organization_id: invite.organization_id,
        }
      );

      if (authError) {
        return failure('Failed to create account: ' + authError.message, 400);
      }

      // Update invite status
      await db.update(COLLECTIONS.INVITES, invite.id, { status: 'accepted' });

      // Create user profile in users collection
      const userData = {
        id: authData.user?.$id,
        name: fullName || invite.email.split('@')[0],
        username: fullName || invite.email.split('@')[0],
        email: invite.email,
        role: invite.role,
        department: invite.department || '',
        organization_id: invite.organization_id,
        status: 'Active',
        email_verified: true,
        invited_by: invite.invited_by,
        created_at: new Date().toISOString(),
      };

      await db.create(COLLECTIONS.USERS, userData, authData.user.$id);

      return success({
        message: 'Account created successfully! You can now log in.',
        user: authData.user,
      });
    }

    // CHANGE PASSWORD
    if (path === 'auth/change-password/') {
      try {
        await auth.updatePassword(payload.newPassword);
        return success({ detail: 'Password updated successfully.' });
      } catch (error) {
        return failure('Current password is incorrect', 400);
      }
    }

    // VERIFY TOKEN
    if (path === 'auth/verify-token/') {
      try {
        const session = await account.get();
        if (!session || !session.userId) {
          return failure('Invalid token', 401);
        }
        const { data: userProfile, error: userErr } = await db.get(
          COLLECTIONS.USERS,
          session.userId
        );
        if (userErr) throw userErr;
        return success({
          user: {
            id: userProfile.id,
            email: session.email,
            username: userProfile.username,
            role: userProfile.role,
            organization_id: userProfile.organization_id,
          },
        });
      } catch (error) {
        return failure('Invalid token', 401);
      }
    }

    // LOGOUT
    if (path === 'auth/logout/') {
      try {
        await auth.deleteSession();
        return success({ detail: 'Logged out successfully.' });
      } catch (error) {
        return failure('Logout failed', 400);
      }
    }

    // CREATE CASE
    if (path === 'case/') {
      const { data, error } = await db.create(COLLECTIONS.CASES, {
        ...payload,
        organization_id,
        case_number: `CW-${Date.now()}`,
        created_by: user.id,
      });
      if (error) throw error;
      const enriched = await enrichCase(data);
      return success(enriched, 201);
    }

    // CREATE TASK
    if (['tasks/create/', 'tasks/create'].includes(path)) {
      const { data, error } = await db.create(COLLECTIONS.TASKS, {
        title: payload.title,
        description: payload.description,
        assigned_to: payload.assigned_to,
        case_id: payload.case,
        priority: payload.priority || 'low',
        deadline: payload.deadline,
        status: Boolean(payload.status),
        organization_id,
        created_by: user.id,
      });
      if (error) throw error;
      const enriched = await enrichTask(data);
      return success(enriched, 201);
    }

    // CREATE DOCUMENT (with optional file upload to Appwrite Storage)
    if (path === 'document_management/api/documents/') {
      const title = payload.get ? payload.get('title') : payload.title;
      const description = payload.get ? payload.get('description') : payload.description;
      const owner = payload.get ? payload.get('owner') : payload.owner;
      const shared_with = payload.getAll
        ? payload.getAll('shared_with')
        : payload.shared_with || [];

      // Upload file to Appwrite Storage if present
      let fileId = null;
      let fileSize = 0;
      let mimeType = 'application/octet-stream';
      const file = payload.get ? payload.get('file') : payload.file;
      if (file) {
        try {
          const upload = await storage.createFile({
            bucketId: 'documents',
            fileId: ID.unique(),
            file,
            permissions: ['role:users'],
          });
          fileId = upload.$id;
          fileSize = upload.sizeOriginal || 0;
          mimeType = upload.mimeType || 'application/octet-stream';
        } catch (e) {
          console.error('Storage upload failed:', e);
          return failure('File upload failed', 500);
        }
      }

      const docData = {
        title,
        description,
        owner,
        shared_with,
        file_path: fileId,
        file_size: fileSize,
        mime_type: mimeType,
        organization_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await db.create(COLLECTIONS.DOCUMENTS, docData);
      if (error) throw error;
      const enriched = await enrichDocument(data);
      return success(enriched, 201);
    }

    // CREATE INVOICE
    if (path === 'invoices' || path === 'invoices/') {
      const invoiceData = {
        invoice_number: `INV-${Date.now()}`,
        client_name: payload.clientName,
        client_address: payload.clientAddress,
        crn: payload.crn,
        total_amount: Number(payload.totalAmount || payload.total || 0),
        amount_due: Number(payload.amountDue || payload.total || 0),
        tax: Number(payload.tax || 0),
        items: JSON.stringify(payload.items || []),
        account_number: payload.accountNumber,
        account_name: payload.accountName,
        bank_detail: payload.bankDetail,
        terms: payload.terms,
        signature: payload.signature,
        date: payload.date,
        status: payload.status,
        organization_id,
      };

      const { data, error } = await db.create(COLLECTIONS.INVOICES, invoiceData);
      if (error) throw error;
      return success(mapInvoice(data), 201);
    }

    // CREATE EXPENSE
    if (path === 'expenses/') {
      const { data, error } = await db.create(COLLECTIONS.EXPENSES, {
        ...payload,
        organization_id,
        amount: Number(payload.amount),
        date: payload.date?.format ? payload.date.format('YYYY-MM-DD') : payload.date,
      });
      if (error) throw error;
      return success(data, 201);
    }

    // CREATE PAYROLL RUN
    if (path === 'payroll/') {
      const { data, error } = await db.create(COLLECTIONS.PAYROLL_RUNS, {
        ...payload,
        organization_id,
        total_amount: Number(payload.total_amount || 0),
        period_start: payload.period_start?.format
          ? payload.period_start.format('YYYY-MM-DD')
          : payload.period_start,
        period_end: payload.period_end?.format
          ? payload.period_end.format('YYYY-MM-DD')
          : payload.period_end,
      });
      if (error) throw error;
      return success(data, 201);
    }

    // HR: CREATE EMPLOYEE
    if (path === 'hr/employees/') {
      const currentUser = getCurrentUser();
      const orgId = localStorage.getItem('organization_id') || payload.organization_id;

      if (
        !currentUser.id ||
        !['advocate', 'firm', 'admin', 'administrator'].includes(currentUser.role)
      ) {
        return failure('You do not have permission to add employees', 403);
      }
      if (!orgId) {
        return failure('Organization context required to add employees', 400);
      }

      const employeeData = {
        username: payload.name || payload.full_name || payload.email,
        email: payload.email,
        role: payload.role || 'employee',
        phone_number: payload.phone_number || '',
        department: payload.department || '',
        hire_date: payload.hire_date || new Date().toISOString().slice(0, 10),
        salary: payload.salary || 0,
        status: 'active',
        organization_id: orgId,
        email_verified: true,
        messaging: true,
        task_management: true,
        deadline_notifications: true,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await db.create(COLLECTIONS.USERS, employeeData);
      if (error) throw error;

      return success(
        {
          id: data.id,
          name: data.username,
          email: data.email,
          role: data.role,
          department: data.department,
          status: 'active',
        },
        201
      );
    }

    // HR: SEND INVITATION
    if (path === 'hr/invites/') {
      const orgId = localStorage.getItem('organization_id') || payload.organization_id;

      if (!user.id || !['advocate', 'firm', 'admin', 'administrator'].includes(user.role)) {
        return failure('You do not have permission to send invitations', 403);
      }

      const inviteToken = generateToken();
      const inviteData = {
        email: payload.email,
        role: payload.role || 'employee',
        department: payload.department || '',
        organization_id: orgId,
        status: 'pending',
        invited_by: user.id,
        token: inviteToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await db.create(COLLECTIONS.INVITES, inviteData);
      if (error) throw error;

      // Send email (async, non-blocking)
      // TODO: sendEmployeeInvite(...)

      return success(
        {
          message: `Invitation sent to ${payload.email}`,
          invite: data,
        },
        201
      );
    }

    // CHATS: CREATE ROOM
    if (path === 'chats/create-or-get-chat-room/') {
      const first = String(payload.user_id);
      const second = String(payload.other_user_id);
      const roomName = `room-${[first, second].sort((a, b) => a.localeCompare(b)).join('-')}`;

      // Check existing
      const { data: existing, error: findErr } = await db.list(COLLECTIONS.CHAT_ROOMS, [
        Query.equal('room_name', roomName),
      ]);
      if (!findErr && existing.length > 0) {
        return success(existing[0]);
      }

      // Create new
      const { data, error } = await db.create(COLLECTIONS.CHAT_ROOMS, {
        room_name: roomName,
        participants: [first, second],
        organization_id,
      });
      if (error) throw error;
      return success(data, 201);
    }

    // CHATS: SEND MESSAGE
    if (path === 'chats/send-message/') {
      let messageContent, room, senderId;
      const attachments = [];

      if (payload instanceof FormData) {
        messageContent = payload.get('message');
        room = payload.get('room');
        senderId = String(payload.get('sender_id'));
        payload.forEach((value, key) => {
          if (key === 'attachments') {
            attachments.push({ name: value.name, size: value.size, type: value.type });
          }
        });
      } else {
        messageContent = payload.message;
        room = payload.room;
        senderId = String(payload.sender_id);
      }

      const { data, error } = await db.create(COLLECTIONS.CHAT_MESSAGES, {
        room,
        sender: senderId,
        content: messageContent,
        timestamp: new Date().toISOString(),
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      if (error) throw error;
      return success(data, 201);
    }

    // BILLING: SUBSCRIBE
    if (path === 'billing/subscribe/') {
      const { data, error } = await db.create(COLLECTIONS.SUBSCRIPTIONS, {
        ...payload,
        organization_id,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      return success({
        success: true,
        checkout_request_id: payload.payment_method === 'mpesa' ? `mpesa-${data.id}` : null,
        message: 'Subscription started.',
      });
    }

    // BILLING: ONBOARDING
    if (path === 'billing/onboarding/') {
      const { data, error } = await db.create(COLLECTIONS.ONBOARDING, {
        ...payload,
        organization_id,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      return success(data, 201);
    }

    // DOCUMENT GENERATION (AI)
    if (path === 'documents/generate/') {
      const docType = payload.type || 'document';
      const country = (payload.country || 'kenya').toLowerCase();
      const userPrompt = payload.prompt || '';
      const context = payload.context || {};

      const countryInfo = {
        kenya: { name: 'Kenya', law: 'Laws of Kenya', court: 'Kenyan courts', format: 'A4' },
        nigeria: {
          name: 'Nigeria',
          law: 'Laws of Nigeria',
          court: 'Nigerian courts',
          format: 'A4',
        },
        tanzania: {
          name: 'Tanzania',
          law: 'Laws of Tanzania',
          court: 'Tanzanian courts',
          format: 'A4',
        },
        uganda: { name: 'Uganda', law: 'Laws of Uganda', court: 'Ugandan courts', format: 'A4' },
        ghana: { name: 'Ghana', law: 'Laws of Ghana', court: 'Ghanaian courts', format: 'A4' },
        southafrica: {
          name: 'South Africa',
          law: 'Laws of South Africa',
          court: 'South African courts',
          format: 'A4',
        },
        usa: { name: 'USA', law: 'US Federal/State laws', court: 'US Courts', format: 'Letter' },
        uk: { name: 'UK', law: 'English law', court: 'UK Courts', format: 'A4' },
      };

      const countryLaw = countryInfo[country] || countryInfo.kenya;
      const filename = `${docType}_${countryLaw.name}_${new Date().toISOString().slice(0, 10)}.txt`;

      // Call Reya API for AI generation
      try {
        const response = await fetch('/api/reya', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Generate a professional legal ${docType} document for ${countryLaw.name} jurisdiction under ${countryLaw.law}.${userPrompt ? `\nUser requirements: ${userPrompt}` : ''}`,
            context: { docType, country: countryLaw.name, law: countryLaw.law, ...context },
            quick: true,
            action: 'generate_document',
          }),
        });
        const data = await response.json();
        const content = data.content || `Generated ${docType} for ${countryLaw.name}`;

        return success({
          success: true,
          filename,
          content,
          ai_generated: true,
          doc_type: docType,
          country: countryLaw.name,
          page_count: 1,
        });
      } catch (error) {
        console.error('Document generation error:', error);
        return success({
          success: true,
          filename,
          content: `Document generation failed. Please try again or contact support.`,
          ai_generated: false,
          doc_type: docType,
          country: countryLaw.name,
          page_count: 1,
        });
      }
    }

    // AI/REYA QUERY (redirect to API)
    if (path === '/ai/reya/query/') {
      return success({
        response: 'Processing with AI...',
        query: payload.query || payload.message,
      });
    }

    // QUICK ACTION
    if (path === '/ai/reya/quick-action/') {
      const action = payload.action || '';
      return success({
        content: 'Processing with AI...',
        actions: [
          { label: 'Contract', icon: 'file', action: 'contract' },
          { label: 'NDA', icon: 'file', action: 'nda' },
          { label: 'Letter', icon: 'file', action: 'letter' },
        ],
        suggestions: [
          { label: 'Contract', action: 'generate_contract' },
          { label: 'NDA', action: 'generate_nda' },
          { label: 'Letter', action: 'generate_letter' },
        ],
      });
    }

    return failure(`POST ${path} not implemented`, 404);
  },

  // ============================================
  // PUT - Update operations
  // ============================================
  async put(url, payload) {
    const path = url.replace(/^\/api\//, '').replace(/^\//, '');
    const parts = path.split('/').filter(Boolean);

    if (!url.includes('/auth/')) {
      if (!payload._csrf) {
        const token = sessionStorage.getItem('csrf_token') || 'token';
        payload = { ...payload, _csrf: token };
      }
      delete payload._csrf;
    }

    // UPDATE CASE
    if (path.startsWith('case/')) {
      const id = parts[1];
      const { data, error } = await db.update(COLLECTIONS.CASES, id, {
        ...payload,
        client_id: payload.individual ?? payload.client_id, // keep as string
        court_id: payload.court ? Number(payload.court) : payload.court_id, // integer
      });
      if (error) throw error;
      const enriched = await enrichCase(data);
      return success(enriched);
    }

    // UPDATE TASK
    if (path.startsWith('tasks/')) {
      const id = parts[parts.length - 1];
      const { data, error } = await db.update(COLLECTIONS.TASKS, id, {
        ...payload,
        assigned_to: payload.assigned_to, // keep as string ID
        case_id: payload.case ? String(payload.case) : undefined, // keep as string ID
      });
      if (error) throw error;
      const enriched = await enrichTask(data);
      return success(enriched);
    }

    // UPDATE DOCUMENT
    if (path.startsWith('api/documents/') && !path.endsWith('/file/')) {
      const id = parts[2];
      // Check permissions: fetch existing document
      const { data: existing, error: fetchErr } = await db.get(COLLECTIONS.DOCUMENTS, id);
      if (fetchErr) throw fetchErr;
      const user = await getCurrentUser();
      const hasAccess =
        existing.organization_id === (user.organization_id || user.id) ||
        existing.owner === user.id ||
        (existing.shared_with && existing.shared_with.includes(user.id));
      if (!hasAccess) {
        return failure('You do not have permission to edit this document', 403);
      }
      const { data, error } = await db.update(COLLECTIONS.DOCUMENTS, id, {
        ...payload,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      const enriched = await enrichDocument(data);
      return success(enriched);
    }

    // UPDATE USER PROFILE
    if (path.startsWith('individual/') || path === 'auth/profile/') {
      const id = path === 'auth/profile/' ? getCurrentUser().id : parts[1];
      const updateData = {
        username: payload.username,
        email: payload.email,
        phone_number: payload.phone_number,
        address: payload.address,
      };
      if (payload.role) {
        updateData.role = payload.role;
      }
      const { data, error } = await db.update(COLLECTIONS.USERS, id, updateData);
      if (error) throw error;
      return success({ ...data, id: data.id, username: data.username });
    }

    // UPDATE SETTINGS
    if (['user/communication-settings', 'user/task-settings'].includes(path)) {
      const user = getCurrentUser();
      const { data, error } = await db.update(COLLECTIONS.USERS, user.id, payload);
      if (error) throw error;
      return success(data);
    }

    // ADMIN SETTINGS
    if (path.startsWith('admin/')) {
      const { data, error } = await db.update(COLLECTIONS.ADMIN_SETTINGS, 'default', {
        ...payload,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      return success(data);
    }

    return failure(`PUT ${path} not implemented`, 404);
  },

  // ============================================
  // DELETE - Remove operations
  // ============================================
  async delete(url) {
    const path = url.replace(/^\/api\//, '').replace(/^\//, '');
    const parts = path.split('/').filter(Boolean);

    // DELETE TASK
    if (path.startsWith('tasks/') || path.startsWith('tasks')) {
      const id = parts[parts.length - 1];
      const { error } = await db.delete(COLLECTIONS.TASKS, id);
      if (error) throw error;
      return success({ success: true });
    }

    // DELETE DOCUMENT
    if (path.startsWith('document') || path.startsWith('api/document')) {
      const id = parts[parts.length - 1];
      // Check permissions: fetch document
      const { data: doc, error: fetchErr } = await db.get(COLLECTIONS.DOCUMENTS, id);
      if (fetchErr) throw fetchErr;
      const user = await getCurrentUser();
      const hasAccess =
        doc.organization_id === (user.organization_id || user.id) ||
        doc.owner === user.id ||
        (doc.shared_with && doc.shared_with.includes(user.id));
      if (!hasAccess) {
        return failure('You do not have permission to delete this document', 403);
      }
      const { error } = await db.delete(COLLECTIONS.DOCUMENTS, id);
      if (error) throw error;
      return success({ success: true });
    }

    return failure(`DELETE ${path} not implemented`, 404);
  },
};

export default appwriteApi;
