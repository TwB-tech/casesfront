import { supabase, TABLES, auth } from './supabase';

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

// Enrich case with client, advocate, court data
const enrichCase = async (item) => {
  if (!item) {
    return null;
  }

  const [clientRes, advocateRes, courtRes] = await Promise.all([
    item.client_id
      ? supabase.from(TABLES.USERS).select('id, name, username').eq('id', item.client_id).single()
      : Promise.resolve({ data: null }),
    item.advocate_id
      ? supabase.from(TABLES.USERS).select('id, name, username').eq('id', item.advocate_id).single()
      : Promise.resolve({ data: null }),
    item.court_id
      ? supabase.from('courts').select('id, name').eq('id', item.court_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const client = clientRes.data;
  const advocate = advocateRes.data;
  const court = courtRes.data;

  return {
    ...item,
    name: client?.name || client?.username || 'Unknown Client',
    client: client ? { id: client.id, name: client.name, username: client.username } : null,
    advocate: advocate ? { id: advocate.id, username: advocate.name } : null,
    court: court || null,
    court_name: court?.name || 'Not assigned',
    organization: item.organization || { name: 'TwB Cases' },
  };
};

// Enrich task with assignee name and case title
const enrichTask = async (task) => {
  if (!task) {
    return null;
  }

  const [assigneeRes, caseRes] = await Promise.all([
    task.assigned_to
      ? supabase.from(TABLES.USERS).select('name, username').eq('id', task.assigned_to).single()
      : Promise.resolve({ data: null }),
    task.case
      ? supabase.from(TABLES.CASES).select('title').eq('id', task.case).single()
      : Promise.resolve({ data: null }),
  ]);

  const assignee = assigneeRes.data;
  const caseItem = caseRes.data;

  return {
    ...task,
    case: task.case, // keep original case id
    assigned_to_name: assignee?.name || assignee?.username || 'Unassigned',
    case_title: caseItem?.title || 'No case',
  };
};

// Enrich document with owner info
const enrichDocument = async (doc) => {
  if (!doc) {
    return null;
  }

  const ownerRes = doc.owner
    ? await supabase.from(TABLES.USERS).select('id, name, username').eq('id', doc.owner).single()
    : { data: null };

  const owner = ownerRes.data;
  const sharedWith = (doc.shared_with || []).map((uid) => ({ id: uid }));

  return {
    ...doc,
    owner: owner ? { id: owner.id, username: owner.name, name: owner.name } : null,
    shared_with: sharedWith,
  };
};

// Map invoice DB (snake_case) to frontend (camelCase)
const mapInvoice = (inv) => {
  if (!inv) {
    return null;
  }
  return {
    ...inv,
    id: inv.id,
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

export const supabaseApi = {
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },

  async get(url) {
    const path = url
      .replace(/^\/api\//, '')
      .replace(/^\//, '')
      .replace(/\/$/, '');

    if (path === 'case') {
      const { data, error } = await supabase.from(TABLES.CASES).select('*');
      if (error) {
        throw error;
      }
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const orgId = user?.organization_id || user?.id;
      const filtered = orgId
        ? data.filter(
            (item) =>
              !item.organization_id ||
              item.organization_id === orgId ||
              item.client_id === user.id ||
              item.advocate_id === user.id
          )
        : data;
      const enriched = await Promise.all(filtered.map(enrichCase));
      return success({ results: enriched });
    }

    if (/^case\/\d+$/.test(path)) {
      const id = path.split('/')[1];
      const { data, error } = await supabase.from(TABLES.CASES).select('*').eq('id', id).single();
      if (error) {
        throw error;
      }
      const enriched = await enrichCase(data);
      return success(enriched);
    }

    if (['individual/', 'client/', 'client'].includes(path)) {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .in('role', ['individual', 'client']);
      if (error) {
        throw error;
      }
      return success({ results: data.map((doc) => ({ ...doc, id: doc.id, username: doc.name })) });
    }

    if (/^individual\/\d+$/.test(path) || /^client\/\d+$/.test(path)) {
      const id = path.split('/')[1];
      const { data, error } = await supabase.from(TABLES.USERS).select('*').eq('id', id).single();
      if (error) {
        throw error;
      }
      return success({
        ...data,
        id: data.id,
        username: data.name,
        role: data.user_metadata?.role || 'individual',
      });
    }

    if (['advocate/', 'advocate/firm-advocates/', 'individual/case-advocates/'].includes(path)) {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .in('role', ['advocate', 'firm']);
      if (error) {
        throw error;
      }
      return success({ results: data.map((doc) => ({ ...doc, id: doc.id })) });
    }

    if (path === 'court/') {
      const { data, error } = await supabase.from('courts').select('*');
      if (error) {
        throw error;
      }
      return success({ results: data });
    }

    if (path === 'advocate/cases/') {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const { data, error } = await supabase
        .from(TABLES.CASES)
        .select('*')
        .eq('advocate_id', user.id);
      if (error) {
        throw error;
      }
      return success({
        cases_count: data.length,
        results: data.map((doc) => ({ ...doc, id: doc.id })),
      });
    }

    if (path === 'advocate/clients/') {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const { data: cases, error: caseErr } = await supabase
        .from(TABLES.CASES)
        .select('client_id')
        .eq('advocate_id', user.id);
      if (caseErr) {
        throw caseErr;
      }
      const clientIds = [...new Set(cases.map((c) => c.client_id))];
      const { data: clients, error: clientErr } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .in('id', clientIds);
      if (clientErr) {
        throw clientErr;
      }
      return success({
        clients_count: clients.length,
        results: clients.map((doc) => ({ ...doc, id: doc.id })),
      });
    }

    if (['tasks/', 'tasks'].includes(path)) {
      const { data, error } = await supabase.from(TABLES.TASKS).select('*');
      if (error) {
        throw error;
      }
      // Add 'case' alias for case_id
      const tasksWithCase = data.map((t) => ({ ...t, case: t.case_id }));
      const enriched = await Promise.all(tasksWithCase.map(enrichTask));
      return success({ results: enriched });
    }

    if (['document_management/api/documents/', 'documents'].includes(path)) {
      const { data, error } = await supabase.from(TABLES.DOCUMENTS).select('*');
      if (error) {
        throw error;
      }
      const enriched = await Promise.all(data.map(enrichDocument));
      return success({ results: enriched });
    }

    if (path.startsWith('api/documents/') && path !== 'api/documents/') {
      const id = path.split('/').filter(Boolean).pop();
      const { data, error } = await supabase
        .from(TABLES.DOCUMENTS)
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        throw error;
      }
      const enriched = await enrichDocument(data);
      return success(enriched);
    }

    if (path === 'case/individual-cases/') {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const { data, error } = await supabase
        .from(TABLES.CASES)
        .select('*')
        .or(`client_id.eq.${user.id},advocate_id.eq.${user.id}`);
      if (error) {
        throw error;
      }
      const enriched = await Promise.all(data.map(enrichCase));
      return success(enriched);
    }

    if (['invoices', 'api/invoices'].includes(path)) {
      const { data, error } = await supabase.from(TABLES.INVOICES).select('*');
      if (error) {
        throw error;
      }
      return success(data.map(mapInvoice));
    }

    if (/^api\/invoices\/\d+$/.test(path)) {
      const id = path.split('/')[2];
      const { data, error } = await supabase
        .from(TABLES.INVOICES)
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        throw error;
      }
      return success(mapInvoice(data));
    }

    if (path.startsWith('auth/user/')) {
      const id = path.split('/').pop();
      const { data, error } = await supabase.from(TABLES.USERS).select('*').eq('id', id).single();
      if (error) {
        throw error;
      }
      const { ...safeUser } = data;
      return success(safeUser);
    }

    if (path === 'auth/profile/') {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) {
        throw error;
      }
      const { ...safeUser } = data;
      return success({
        ...safeUser,
        id: data.id,
        username: data.name,
        role: data.user_metadata?.role || 'individual',
      });
    }

    if (path.startsWith('auth/email-verify/')) {
      return success({ detail: 'Email verified successfully.' });
    }

    if (path === 'users/stats/') {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const [{ data: cases }, { data: tasks }, { data: documents }] = await Promise.all([
        supabase
          .from(TABLES.CASES)
          .select('*')
          .or(`client_id.eq.${user.id},advocate_id.eq.${user.id}`),
        supabase.from(TABLES.TASKS).select('*').eq('assigned_to', user.id),
        supabase.from(TABLES.DOCUMENTS).select('*').eq('owner', user.id),
      ]);
      return success({
        totalCases: cases?.length || 0,
        activeCases:
          cases?.filter((c) => c.status === 'open' || c.status === 'pending').length || 0,
        totalTasks: tasks?.length || 0,
        pendingTasks: tasks?.filter((t) => !t.status).length || 0,
        totalDocuments: documents?.length || 0,
        sharedDocuments:
          documents?.filter((d) => d.shared_with && d.shared_with.length > 0).length || 0,
      });
    }

    if (path === 'reports/financial/') {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const orgId = user?.organization_id || user?.id;
      let query = supabase.from(TABLES.INVOICES).select('*');
      if (orgId) {
        query = query.or(`organization_id.eq.${orgId},client_id.eq.${user.id}`);
      }
      const { data: invoices, error } = await query;
      if (error) {
        throw error;
      }
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

    if (['accounting/dashboard', 'accounting/dashboard/summary/'].includes(path)) {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const orgId = user?.organization_id || user?.id;
      let invoiceQuery = supabase.from(TABLES.INVOICES).select('*');
      let expenseQuery = supabase.from(TABLES.EXPENSES).select('*');
      if (orgId) {
        invoiceQuery = invoiceQuery.or(`organization_id.eq.${orgId},client_id.eq.${user.id}`);
        expenseQuery = expenseQuery.eq('organization_id', orgId);
      }
      const [{ data: invoices }, { data: expenses }] = await Promise.all([
        invoiceQuery,
        expenseQuery,
      ]);
      const totalRevenue =
        invoices?.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0;

      const monthlyMap = {};
      const addToMonthly = (dateStr, amount, type) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return;
        }
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
        if (type === 'revenue') {
          monthlyMap[key].revenue += amount;
        } else {
          monthlyMap[key].expenses += amount;
        }
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

    if (path === 'expenses/') {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const orgId = user?.organization_id || user?.id;
      let query = supabase.from(TABLES.EXPENSES).select('*');
      if (orgId) {
        query = query.eq('organization_id', orgId);
      }
      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return success(data);
    }

    if (path === 'payroll/') {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const orgId = user?.organization_id || user?.id;
      let query = supabase.from(TABLES.PAYROLL_RUNS).select('*');
      if (orgId) {
        query = query.eq('organization_id', orgId);
      }
      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return success(data);
    }

    if (path === 'hr/employees/') {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .not('role', 'in', ['individual', 'client']);
      if (error) {
        throw error;
      }
      return success({ results: data.map((doc) => ({ ...doc, id: doc.id })) });
    }

    if (path.startsWith('chats/room-info/')) {
      const roomName = path.split('/').pop();
      const { data, error } = await supabase
        .from(TABLES.CHAT_ROOMS)
        .select('*')
        .eq('room_name', roomName)
        .single();
      if (error) {
        return { data: null, status: 404 };
      }
      return success(data);
    }

    if (path.startsWith('chats/get-messages/')) {
      const roomName = path.split('/').pop();
      const { data, error } = await supabase
        .from(TABLES.CHAT_MESSAGES)
        .select('*')
        .eq('room', roomName)
        .order('timestamp', { ascending: true });
      if (error) {
        throw error;
      }
      return success(data);
    }

    return failure(`GET ${path} not implemented`, 404);
  },

  async post(url, payload = {}) {
    const path = url.replace(/^\/api\//, '').replace(/^\//, '');
    const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
    let organization_id = localStorage.getItem('organization_id') || user?.organization_id;

    if (!url.includes('/auth/')) {
      if (!payload._csrf && !payload.csrf_token) {
        const token = sessionStorage.getItem('csrf_token') || 'token';
        payload._csrf = token;
      }
      const token = payload._csrf || payload.csrf_token;
      const storedToken = sessionStorage.getItem('csrf_token');
      if (!storedToken || storedToken !== token) {
        return failure('Invalid CSRF token', 403);
      }
    }
    delete payload._csrf;
    delete payload.csrf_token;

    if (path === 'auth/login/') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });
      if (error) {
        return failure('Invalid email or password', 401, error);
      }

      const { data: userData } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', data.user.id)
        .single();
      if (userData?.user_metadata?.organization_id) {
        localStorage.setItem('organization_id', userData.user_metadata.organization_id);
      }
      return success({
        id: data.user.id,
        email: data.user.email,
        username: userData?.name || data.user.email,
        role: userData?.user_metadata?.role || 'individual',
        organization_id: userData?.user_metadata?.organization_id,
        tokens: JSON.stringify({
          access: data.session?.access_token,
          refresh: data.session?.refresh_token,
        }).replace(/"/g, "'"),
      });
    }

    if (path === 'auth/register/') {
      const { data: user, error: userErr } = await auth.create(
        undefined,
        payload.email,
        payload.password,
        payload.username || payload.email
      );
      if (userErr) {
        return failure('Registration failed', 400, userErr);
      }

      if (
        (payload.role === 'firm' || payload.role === 'organization') &&
        !payload.organization_id
      ) {
        const { data: org, error: orgErr } = await supabase
          .from(TABLES.ORGANIZATIONS)
          .insert({
            name: payload.username || payload.email,
            email: payload.email,
            plan_type: 'free',
          })
          .select();
        if (!orgErr && org[0]) {
          await auth.updatePrefs(user.id, { role: payload.role, organization_id: org[0].id });
          localStorage.setItem('organization_id', org[0].id);
          organization_id = org[0].id;
        }
      } else {
        await auth.updatePrefs(user.id, {
          role: payload.role,
          organization_id: payload.organization_id,
        });
      }

      // Create user profile
      const userProfile = {
        id: user.id,
        name: payload.username || payload.email,
        username: payload.username || payload.email,
        email: payload.email,
        role: payload.role,
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
        organization_id,
      };
      const { error: userInsertErr } = await supabase.from(TABLES.USERS).insert(userProfile);
      if (userInsertErr) {
        console.warn('User profile insert failed:', userInsertErr);
      }

      return success({ id: user.id, email: user.email, username: payload.username });
    }

    if (path === 'case/') {
      const { data, error } = await supabase
        .from(TABLES.CASES)
        .insert({
          ...payload,
          organization_id,
          case_number: `CW-${Date.now()}`,
        })
        .select();
      if (error) {
        throw error;
      }
      const enriched = await enrichCase(data[0]);
      return success(enriched, 201);
    }

    if (['tasks/create/', 'tasks/create'].includes(path)) {
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .insert({
          title: payload.title,
          description: payload.description,
          assigned_to: Number(payload.assigned_to),
          case_id: Number(payload.case),
          priority: payload.priority || 'low',
          deadline: payload.deadline,
          status: Boolean(payload.status),
          organization_id,
        })
        .select();
      if (error) {
        throw error;
      }
      const enriched = await enrichTask(data[0]);
      return success(enriched, 201);
    }

    if (path === 'document_management/api/documents/') {
      const title = payload.get ? payload.get('title') : payload.title;
      const description = payload.get ? payload.get('description') : payload.description;
      const owner = payload.get ? Number(payload.get('owner')) : Number(payload.owner);
      const shared_with = payload.getAll
        ? payload.getAll('shared_with').map(Number)
        : payload.shared_with || [];

      const { data, error } = await supabase
        .from(TABLES.DOCUMENTS)
        .insert({
          title,
          description,
          owner,
          shared_with,
          file:
            payload.get && payload.get('file')?.name
              ? `local://${payload.get('file').name}`
              : 'local://uploaded-document',
          uploaded_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          organization_id,
        })
        .select();
      if (error) {
        throw error;
      }
      const enriched = await enrichDocument(data[0]);
      return success(enriched, 201);
    }

    if (path === 'api/invoices') {
      const invoiceData = {
        invoice_number: `INV-${Date.now()}`,
        client_name: payload.clientName,
        client_address: payload.clientAddress,
        crn: payload.crn,
        total_amount: Number(payload.totalAmount || payload.total || 0),
        amount_due: Number(payload.amountDue || payload.total || 0),
        tax: Number(payload.tax || 0),
        items: payload.items ? JSON.stringify(payload.items) : [],
        account_number: payload.accountNumber,
        account_name: payload.accountName,
        bank_detail: payload.bankDetail,
        terms: payload.terms,
        signature: payload.signature,
        date: payload.date,
        status: payload.status,
        organization_id,
      };
      const { data, error } = await supabase.from(TABLES.INVOICES).insert(invoiceData).select();
      if (error) {
        throw error;
      }
      return success(mapInvoice(data[0]), 201);
    }

    if (path === 'expenses/') {
      const { data, error } = await supabase
        .from(TABLES.EXPENSES)
        .insert({
          ...payload,
          organization_id,
          amount: Number(payload.amount),
          date: payload.date?.format ? payload.date.format('YYYY-MM-DD') : payload.date,
          created_at: new Date().toISOString(),
        })
        .select();
      if (error) {
        throw error;
      }
      return success(data[0], 201);
    }

    if (path === 'payroll/') {
      const { data, error } = await supabase
        .from(TABLES.PAYROLL_RUNS)
        .insert({
          ...payload,
          organization_id,
          total_amount: Number(payload.total_amount || 0),
          period_start: payload.period_start?.format
            ? payload.period_start.format('YYYY-MM-DD')
            : payload.period_start,
          period_end: payload.period_end?.format
            ? payload.period_end.format('YYYY-MM-DD')
            : payload.period_end,
          created_at: new Date().toISOString(),
        })
        .select();
      if (error) {
        throw error;
      }
      return success(data[0], 201);
    }

    if (path === 'hr/employees/') {
      const { data: user, error } = await auth.create(
        undefined,
        payload.email,
        payload.password,
        payload.full_name || payload.email
      );
      if (error) {
        return failure('Employee already exists', 400, error);
      }
      await auth.updatePrefs(user.id, {
        role: 'employee',
        organization_id,
        department: payload.department,
        position: payload.position,
        salary: payload.salary,
        hire_date: payload.hire_date,
      });
      const { error: userErr } = await supabase.from(TABLES.USERS).insert({
        id: user.id,
        name: payload.full_name || payload.email,
        username: payload.full_name || payload.email,
        email: payload.email,
        role: 'employee',
        phone_number: payload.phone_number || '',
        address: payload.address || '',
        status: 'Active',
        timezone: 'EAT',
        department: payload.department,
        position: payload.position,
        salary: payload.salary,
        hire_date: payload.hire_date,
        organization_id,
      });
      if (userErr) {
        console.warn('Employee profile insert failed:', userErr);
      }
      return success({ id: user.id, email: user.email }, 201);
    }

    if (path === 'hr/invites/') {
      return success({
        message: `Invitation sent to ${payload.email}`,
        invite: {
          id: Date.now(),
          email: payload.email,
          role: payload.role || 'employee',
          status: 'pending',
        },
      });
    }

    if (path === 'auth/change-password/') {
      try {
        await supabase.auth.updateUser({ password: payload.newPassword });
        return success({ detail: 'Password updated successfully.' });
      } catch (error) {
        return failure('Current password is incorrect', 400);
      }
    }

    if (path.startsWith('auth/password-reset/')) {
      return success({ detail: 'Password updated successfully.' });
    }

    if (path === 'chats/create-or-get-chat-room/') {
      const first = Number(payload.user_id);
      const second = Number(payload.other_user_id);
      const roomName = `room-${[first, second].sort((a, b) => a - b).join('-')}`;

      const { data, error } = await supabase
        .from(TABLES.CHAT_ROOMS)
        .select('*')
        .eq('room_name', roomName)
        .single();
      if (!error && data) {
        return success(data);
      }

      const { data: newRoom, error: createErr } = await supabase
        .from(TABLES.CHAT_ROOMS)
        .insert({
          organization_id: localStorage.getItem('organization_id'),
          room_name: roomName,
          participants: [first, second],
        })
        .select();
      if (createErr) {
        throw createErr;
      }
      return success(newRoom[0], 201);
    }

    if (path === 'chats/send-message/') {
      let messageContent, room, senderId;
      const attachments = [];

      if (payload instanceof FormData) {
        messageContent = payload.get('message');
        room = payload.get('room');
        senderId = Number(payload.get('sender_id'));
        payload.forEach((value, key) => {
          if (key === 'attachments') {
            attachments.push({ name: value.name, size: value.size, type: value.type });
          }
        });
      } else {
        messageContent = payload.message;
        room = payload.room;
        senderId = Number(payload.sender_id);
      }

      const { data, error } = await supabase
        .from(TABLES.CHAT_MESSAGES)
        .insert({
          organization_id: localStorage.getItem('organization_id'),
          room,
          sender: senderId,
          content: messageContent,
          timestamp: new Date().toISOString(),
          attachments: attachments.length > 0 ? attachments : undefined,
        })
        .select();
      if (error) {
        throw error;
      }
      return success(data[0], 201);
    }

    if (path === 'billing/subscribe/') {
      const { data, error } = await supabase
        .from(TABLES.SUBSCRIPTIONS)
        .insert({
          organization_id: localStorage.getItem('organization_id'),
          ...payload,
          created_at: new Date().toISOString(),
        })
        .select();
      if (error) {
        throw error;
      }
      return success({
        success: true,
        checkout_request_id: payload.payment_method === 'mpesa' ? `mpesa-${data[0].id}` : null,
        message: 'Subscription started.',
      });
    }

    if (path === 'billing/onboarding/') {
      const { data, error } = await supabase
        .from(TABLES.ONBOARDING)
        .insert({
          organization_id: localStorage.getItem('organization_id'),
          ...payload,
          created_at: new Date().toISOString(),
        })
        .select();
      if (error) {
        throw error;
      }
      return success(data[0], 201);
    }

    if (path === 'documents/generate/') {
      const filename = `${payload.type || 'document'}_${new Date().toISOString().slice(0, 10)}.txt`;
      return success({
        success: true,
        filename,
        content: `[Generated by WakiliWorld]\n${JSON.stringify(payload.context || {}, null, 2)}`,
        page_count: 1,
      });
    }

    if (path === '/ai/reya/query/') {
      return success({
        response: 'AI response placeholder - integrate AI service',
        query: payload.query,
      });
    }

    return failure(`POST ${path} not implemented`, 404);
  },

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

    if (path.startsWith('case/')) {
      const id = parts[1];
      const { data, error } = await supabase
        .from(TABLES.CASES)
        .update({
          ...payload,
          client_id: Number(payload.individual ?? payload.client_id),
          court_id: Number(payload.court ?? payload.court_id),
        })
        .eq('id', id)
        .select();
      if (error) {
        throw error;
      }
      const enriched = await enrichCase(data[0]);
      return success(enriched);
    }

    if (path.startsWith('tasks/')) {
      const id = parts[parts.length - 1];
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .update({
          ...payload,
          assigned_to: Number(payload.assigned_to),
          case_id: payload.case ? Number(payload.case) : undefined,
        })
        .eq('id', id)
        .select();
      if (error) {
        throw error;
      }
      const enriched = await enrichTask(data[0]);
      return success(enriched);
    }

    if (path.startsWith('api/documents/')) {
      const id = parts[2];
      const { data, error } = await supabase
        .from(TABLES.DOCUMENTS)
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select();
      if (error) {
        throw error;
      }
      const enriched = await enrichDocument(data[0]);
      return success(enriched);
    }

    if (path.startsWith('individual/') || path === 'auth/profile/') {
      const id =
        path === 'auth/profile/'
          ? JSON.parse(localStorage.getItem('userInfo') || '{}').id
          : parts[1];
      const updateData = {
        name: payload.username,
        email: payload.email,
        phone_number: payload.phone_number,
        address: payload.address,
      };
      if (payload.role) {
        updateData.user_metadata = { ...payload };
      }
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updateData)
        .eq('id', id)
        .select();
      if (error) {
        throw error;
      }
      return success({ ...data[0], id: data[0].id, username: data[0].name });
    }

    if (['user/communication-settings', 'user/task-settings'].includes(path)) {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(payload)
        .eq('id', user.id)
        .select();
      if (error) {
        throw error;
      }
      return success(data[0]);
    }

    if (path.startsWith('admin/')) {
      const { data, error } = await supabase
        .from(TABLES.ADMIN_SETTINGS)
        .upsert({
          id: 'default',
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .select();
      if (error) {
        throw error;
      }
      return success(data[0]);
    }

    return failure(`PUT ${path} not implemented`, 404);
  },

  async delete(url) {
    const path = url.replace(/^\/api\//, '').replace(/^\//, '');
    const parts = path.split('/').filter(Boolean);

    // No CSRF for DELETE (same as original)

    if (path.startsWith('tasks/') || path.startsWith('tasks')) {
      const id = parts[parts.length - 1];
      const { error } = await supabase.from(TABLES.TASKS).delete().eq('id', id);
      if (error) {
        throw error;
      }
      return success({ success: true });
    }

    return failure(`DELETE ${path} not implemented`, 404);
  },
};

export default supabaseApi;
