import axiosInstance from '../axiosConfig';

async function request(path, method = 'GET', payload = {}, options = {}) {
  const merged = { ...options, method };
  const data = await axiosInstance(path, merged);
  return data?.data || data;
}

export const reyaActions = {
  async cases_create(payload) {
    const result = await request('/case/', 'POST', payload);
    return { success: true, message: 'Case created.', result };
  },
  async cases_list() {
    const result = await request('/case/', 'GET');
    return { success: true, message: 'Cases loaded.', result };
  },
  async tasks_create(payload) {
    const result = await request('/tasks/create/', 'POST', payload);
    return { success: true, message: 'Task created.', result };
  },
  async tasks_list() {
    const result = await request('/tasks/', 'GET');
    return { success: true, message: 'Tasks loaded.', result };
  },
  async notes_create(payload) {
    const result = await request('/notes/', 'POST', payload);
    return { success: true, message: 'Note created.', result };
  },
  async notes_list() {
    const result = await request('/notes/', 'GET');
    return { success: true, message: 'Notes loaded.', result };
  },
  async calendar_list() {
    const result = await request('/calendar-tasks', 'GET');
    return { success: true, message: 'Calendar loaded.', result };
  },
  async documents_create(payload) {
    const result = await request('/new-document', 'POST', payload);
    return { success: true, message: 'Document created.', result };
  },
  async documents_list() {
    const result = await request('/documents/', 'GET');
    return { success: true, message: 'Documents loaded.', result };
  },
  async expenses_create(payload) {
    const result = await request('/expenses/', 'POST', payload);
    return { success: true, message: 'Expense logged.', result };
  },
  async expenses_list() {
    const result = await request('/expenses/', 'GET');
    return { success: true, message: 'Expenses loaded.', result };
  },
  async invoices_create(payload) {
    const result = await request('/new-invoice', 'POST', payload);
    return { success: true, message: 'Invoice created.', result };
  },
  async invoices_list() {
    const result = await request('/invoices/', 'GET');
    return { success: true, message: 'Invoices loaded.', result };
  },
  async financial_summary() {
    const result = await request('/reports/financial', 'GET');
    return { success: true, message: 'Financial summary loaded.', result };
  },
  async hr_invite(payload) {
    const result = await request('/hr/invites/', 'POST', payload);
    return { success: true, message: 'Invite sent.', result };
  },
  async client_invite(payload) {
    const result = await request('/clients/invite', 'POST', payload);
    return { success: true, message: 'Client invited.', result };
  },
  async mail_draft(payload) {
    const result = await request('/new-mail', 'POST', payload);
    return { success: true, message: 'Mail drafted/sent.', result };
  },
  async report_generate(payload) {
    const result = await request('/reports/', 'POST', payload);
    return { success: true, message: 'Report generated.', result };
  },
};

export async function executeReyaAction(action, payload = {}) {
  const fn = reyaActions[action];
  if (!fn) {
    return { success: false, message: `Unknown action: ${action}` };
  }
  try {
    return await fn(payload);
  } catch (error) {
    return { success: false, message: error?.response?.data?.message || error?.message || 'Action failed.' };
  }
}

export function getReyaActionSuggestions(context = {}) {
  const suggestions = [
    { label: 'Create case', key: 'cases_create_quick', action: 'cases_create', payload: { title: 'New Case from Reya', status: 'open' } },
    { label: 'Add task', key: 'tasks_create_quick', action: 'tasks_create', payload: { title: 'New Task from Reya', status: false } },
    { label: 'Log expense', key: 'expenses_create_quick', action: 'expenses_create', payload: { title: 'Expense', amount: 0, date: new Date().toISOString().slice(0, 10), status: 'pending' } },
    { label: 'Generate invoice', key: 'invoices_create_quick', action: 'invoices_create', payload: { invoice_number: `INV-${Date.now()}`, client_name: '', total_amount: 0 } },
    { label: 'Draft document', key: 'documents_create_quick', action: 'documents_create', payload: { title: 'New Document', description: '' } },
  ];
  return suggestions;
}

export function getModuleContext(context = {}) {
  const counts = {
    cases_count: Array.isArray(context.cases) ? context.cases.length : 0,
    tasks_count: Array.isArray(context.tasks) ? context.tasks.length : 0,
    invoices_count: Array.isArray(context.invoices) ? context.invoices.length : 0,
    clients_count: Array.isArray(context.clients) ? context.clients.length : 0,
    upcoming_deadlines: Array.isArray(context.deadlines) ? context.deadlines.length : 0,
    user_role: context.user_role || '',
    organization_name: context.organization_name || '',
  };
  return counts;
}

export default { executeReyaAction, getReyaActionSuggestions, getModuleContext };
