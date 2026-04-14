const DB_KEY = 'wakiliworld.frontend.db.v1';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const today = new Date();
const addDays = (days) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const seedDb = () => ({
  users: [
    {
      id: 1,
      username: 'Amina Wanjiru',
      email: 'advocate@wakiliworld.local',
      password: 'demo1234',
      role: 'advocate',
      phone_number: '+254700000001',
      alternative_phone_number: '+254711000001',
      id_number: '12345678',
      passport_number: 'A1234567',
      date_of_birth: '1990-06-14',
      gender: 'Female',
      address: 'Nairobi, Kenya',
      nationality: 'Kenyan',
      occupation: 'Advocate',
      marital_status: 'Single',
      status: 'Active',
      timezone: 'EAT',
      messaging: true,
      clientCommunication: true,
      taskManagement: true,
      deadlineNotifications: true,
    },
    {
      id: 2,
      username: 'Brian Otieno',
      email: 'client@wakiliworld.local',
      password: 'demo1234',
      role: 'individual',
      phone_number: '+254700000002',
      alternative_phone_number: '+254711000002',
      id_number: '22345678',
      passport_number: 'B1234567',
      date_of_birth: '1992-03-02',
      gender: 'Male',
      address: 'Mombasa, Kenya',
      nationality: 'Kenyan',
      occupation: 'Business Owner',
      marital_status: 'Married',
      status: 'Active',
      timezone: 'EAT',
      messaging: true,
      clientCommunication: true,
      taskManagement: true,
      deadlineNotifications: true,
    },
    {
      id: 3,
      username: 'Mercy Njeri',
      email: 'mercy@wakiliworld.local',
      password: 'demo1234',
      role: 'individual',
      phone_number: '+254700000003',
      alternative_phone_number: '+254711000003',
      id_number: '32345678',
      passport_number: 'C1234567',
      date_of_birth: '1988-10-22',
      gender: 'Female',
      address: 'Kisumu, Kenya',
      nationality: 'Kenyan',
      occupation: 'HR Manager',
      marital_status: 'Single',
      status: 'Active',
      timezone: 'EAT',
      messaging: true,
      clientCommunication: false,
      taskManagement: true,
      deadlineNotifications: true,
    },
    {
      id: 4,
      username: 'Admin User',
      email: 'admin@wakiliworld.local',
      password: 'demo1234',
      role: 'admin',
      phone_number: '+254700000004',
      alternative_phone_number: '+254711000004',
      id_number: '42345678',
      passport_number: 'D1234567',
      date_of_birth: '1986-01-05',
      gender: 'Male',
      address: 'Nairobi, Kenya',
      nationality: 'Kenyan',
      occupation: 'Administrator',
      marital_status: 'Married',
      status: 'Active',
      timezone: 'EAT',
      messaging: true,
      clientCommunication: true,
      taskManagement: true,
      deadlineNotifications: true,
    },
  ],
  courts: [
    { id: 1, name: 'Milimani Commercial Court' },
    { id: 2, name: 'Nairobi High Court' },
    { id: 3, name: 'Kisumu Law Courts' },
  ],
  cases: [
    {
      id: 1,
      case_number: 'CW-2026-001',
      title: 'Supply Agreement Dispute',
      description: 'Contract performance dispute involving delayed delivery and penalty clauses.',
      status: 'open',
      start_date: addDays(-12).slice(0, 10),
      end_date: addDays(18).slice(0, 10),
      client_id: 2,
      advocate_id: 1,
      court_id: 1,
      organization: { name: 'TwB Cases' },
      documents: [{ name: 'Agreement Draft' }],
    },
    {
      id: 2,
      case_number: 'CW-2026-002',
      title: 'Employment Claim Review',
      description: 'Advisory and documentation support for wrongful termination claim.',
      status: 'pending',
      start_date: addDays(-5).slice(0, 10),
      end_date: addDays(25).slice(0, 10),
      client_id: 3,
      advocate_id: 1,
      court_id: 2,
      organization: { name: 'TwB Cases' },
      documents: [],
    },
  ],
  tasks: [
    {
      id: 1,
      title: 'Prepare witness bundle',
      description: 'Compile and review all exhibits before hearing.',
      assigned_to: 1,
      case: 1,
      priority: 'high',
      deadline: addDays(2),
      status: false,
    },
    {
      id: 2,
      title: 'Send client update',
      description: 'Share matter status and next court date.',
      assigned_to: 1,
      case: 2,
      priority: 'medium',
      deadline: addDays(1),
      status: false,
    },
    {
      id: 3,
      title: 'Archive closed correspondence',
      description: 'Clean up inbox and attach correspondence to matter.',
      assigned_to: 1,
      case: 1,
      priority: 'low',
      deadline: addDays(-1),
      status: true,
    },
  ],
  documents: [
    {
      id: 1,
      title: 'Statement of Facts',
      description: 'Primary matter brief for the client file.',
      owner: 1,
      shared_with: [2],
      file: 'local://statement-of-facts.pdf',
      uploaded_at: addDays(-7),
      created_at: addDays(-7),
      updated_at: addDays(-2),
    },
    {
      id: 2,
      title: 'Demand Letter',
      description: 'Draft demand letter for settlement.',
      owner: 1,
      shared_with: [3],
      file: 'local://demand-letter.docx',
      uploaded_at: addDays(-4),
      created_at: addDays(-4),
      updated_at: addDays(-1),
    },
  ],
  communications: [
    {
      id: 1,
      email: 'client@wakiliworld.local',
      subject: 'Matter status update',
      message: 'We have filed the latest response and are awaiting a hearing date.',
      google_meet_link: '',
      created_at: addDays(-1),
    },
  ],
  invoices: [
    {
      id: 1,
      invoiceNumber: 'INV001',
      clientName: 'Brian Otieno',
      date: addDays(-4).slice(0, 10),
      totalAmount: '$500.00',
      clientAddress: 'Mombasa, Kenya',
      crn: 'CRN123456',
      items: [
        { description: 'Legal Consultation', rate: '$100.00', hours: '3', total: '$300.00' },
        { description: 'Contract Drafting', rate: '$200.00', hours: '1', total: '$200.00' },
      ],
      accountNumber: '12345678',
      accountName: 'TwB Cases',
      bankDetail: 'Demo Bank',
      total: '$500.00',
      tax: '$0.00',
      amountDue: '$500.00',
      terms: 'Payment due within 14 days.',
      signature: 'Amina Wanjiru',
    },
  ],
  chatRooms: [
    { room_name: 'room-1-2', participants: [1, 2] },
  ],
  chatMessages: [
    {
      id: 1,
      room: 'room-1-2',
      sender: 1,
      content: 'Hello Brian, I have shared the latest update on your matter.',
      timestamp: addDays(-1),
    },
    {
      id: 2,
      room: 'room-1-2',
      sender: 2,
      content: 'Thanks, I have reviewed it.',
      timestamp: addDays(-1),
    },
  ],
  onboarding: [],
  subscriptions: [],
  adminSettings: {
    caseStatus: 'open',
    caseAssignment: true,
    progressTracking: true,
    milestones: true,
    clientFields: true,
    clientPortalAccess: true,
  },
  passwordResetRequests: [],
});

const readDb = () => {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      localStorage.removeItem(DB_KEY);
    }
  }
  const seed = seedDb();
  localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return seed;
};

const writeDb = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
};

const nextId = (items) => (items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1);

const currentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('userInfo') || 'null');
  } catch (error) {
    return null;
  }
};

const publicUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

const enrichCase = (db, item) => {
  const client = db.users.find((user) => user.id === item.client_id);
  const advocate = db.users.find((user) => user.id === item.advocate_id);
  const court = db.courts.find((entry) => entry.id === item.court_id);
  return {
    ...item,
    name: client?.username || 'Unknown Client',
    client: client ? { id: client.id, name: client.username, username: client.username, avatar: null } : null,
    advocate: advocate ? { id: advocate.id, username: advocate.username } : null,
    court: court || null,
    court_name: court?.name || 'Not assigned',
    organization: item.organization || { name: 'TwB Cases' },
  };
};

const enrichTask = (db, task) => {
  const assignee = db.users.find((user) => user.id === task.assigned_to);
  const caseItem = db.cases.find((item) => item.id === task.case);
  return {
    ...task,
    assigned_to_id: task.assigned_to,
    case_id: task.case,
    assigned_to_name: assignee?.username || 'Unassigned',
    case_title: caseItem?.title || 'No case',
  };
};

const enrichDocument = (db, document) => {
  const owner = db.users.find((user) => user.id === document.owner);
  const sharedWith = document.shared_with
    .map((id) => db.users.find((user) => user.id === id))
    .filter(Boolean)
    .map(publicUser);

  return {
    ...document,
    owner: owner ? publicUser(owner) : null,
    shared_with: sharedWith,
  };
};

const normalizeUrl = (input) => {
  let url = input;
  if (url.startsWith('http')) {
    url = new URL(url).pathname;
  }
  url = url.replace(/^\/api/, '/');
  if (!url.startsWith('/')) {
    url = `/${url}`;
  }
  return url.replace(/\/+/g, '/');
};

const success = async (data, status = 200) => {
  await delay();
  return { data, status };
};

const failure = async (message, status = 400, errors) => {
  await delay();
  const error = new Error(message);
  error.response = {
    status,
    data: errors || { message },
  };
  throw error;
};

export const standaloneApi = {
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
  async get(url) {
    const path = normalizeUrl(url);
    const db = readDb();
    const user = currentUser();

    if (path === '/advocate/') {
      return success({ results: db.users.filter((item) => item.role === 'advocate').map(publicUser) });
    }

    if (path === '/individual/' || path === '/client/') {
      return success({
        results: db.users.filter((item) => item.role === 'individual' || item.role === 'client').map(publicUser),
      });
    }

    if (path === '/advocate/firm-advocates/' || path === '/individual/case-advocates/') {
      return success(db.users.filter((item) => item.role === 'advocate').map(publicUser));
    }

    if (path === '/court/') {
      return success({ results: db.courts });
    }

    if (path === '/case/') {
      // ORGANIZATION ISOLATION: Only return cases belonging to current user's organization
      const userOrg = user?.organization_id || user?.id;
      const filteredCases = db.cases.filter((item) => 
        !userOrg || 
        item.organization_id === userOrg || 
        item.client_id === user.id || 
        item.advocate_id === user.id
      );
      return success({ results: filteredCases.map((item) => enrichCase(db, item)) });
    }

    if (path === '/case/individual-cases/') {
      const clientCases = db.cases
        .filter((item) => !user || item.client_id === user.id || item.advocate_id === user.id)
        .map((item) => enrichCase(db, item));
      return success(clientCases);
    }

    if (path === '/advocate/cases/') {
      const advocateCases = db.cases.filter((item) => !user || item.advocate_id === user.id);
      return success({ cases_count: advocateCases.length, results: advocateCases.map((item) => enrichCase(db, item)) });
    }

    if (path === '/advocate/clients/') {
      const clientIds = new Set(db.cases.filter((item) => !user || item.advocate_id === user.id).map((item) => item.client_id));
      return success({
        clients_count: Array.from(clientIds).length,
        results: db.users.filter((item) => clientIds.has(item.id)).map(publicUser),
      });
    }

    if (path === '/tasks/' || path === '/tasks') {
      // ORGANIZATION ISOLATION: Only return tasks assigned to current user or organization
      const userOrg = user?.organization_id || user?.id;
      const filteredTasks = db.tasks.filter((task) => 
        !userOrg || 
        task.organization_id === userOrg || 
        task.assigned_to === user.id
      );
      return success({ results: filteredTasks.map((task) => enrichTask(db, task)) });
    }

    if (path === '/document_management/api/documents/') {
      // ORGANIZATION ISOLATION: Only return documents owned by or shared with current user
      const filteredDocs = db.documents.filter((doc) => 
        !user || 
        doc.owner === user.id || 
        (doc.shared_with && doc.shared_with.includes(user.id)) ||
        doc.organization_id === user?.organization_id
      );
      return success({ results: filteredDocs.map((item) => enrichDocument(db, item)) });
    }

    if (path.startsWith('/api/documents/')) {
      const id = Number(path.split('/').filter(Boolean).pop());
      const document = db.documents.find((item) => item.id === id);
      if (!document) return failure('Document not found', 404);
      return success(enrichDocument(db, document));
    }

    if (path === '/clientcomm/api/clientcommunications/') {
      // ORGANIZATION ISOLATION: Only return communications created by current user
      const filteredComms = db.communications.filter((comm) => 
        !user || comm.created_by === user.id || comm.organization_id === user?.organization_id
      );
      return success({ results: [...filteredComms].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) });
    }

    if (path.startsWith('/clientcomm/api/clientcommunications/')) {
      const id = Number(path.split('/').filter(Boolean).pop());
      const item = db.communications.find((entry) => entry.id === id);
      if (!item) return failure('Communication not found', 404);
      return success(item);
    }

    if (path === '/api/invoices') {
      // ORGANIZATION ISOLATION: Only return invoices belonging to current user organization
      const userOrg = user?.organization_id || user?.id;
      const filteredInvoices = db.invoices.filter((inv) => 
        !userOrg || inv.organization_id === userOrg || inv.client_id === user.id
      );
      return success(filteredInvoices);
    }

    if (path.startsWith('/auth/user/')) {
      const id = Number(path.split('/').filter(Boolean).pop());
      const found = db.users.find((entry) => entry.id === id);
      if (!found) return failure('User not found', 404);
      return success(publicUser(found));
    }

    if (path.startsWith('/auth/email-verify/')) {
      return success({ detail: 'Email verified successfully.' });
    }

    if (path.startsWith('/chats/room-info/')) {
      const roomName = path.split('/').filter(Boolean).pop();
      const room = db.chatRooms.find((entry) => entry.room_name === roomName);
      if (!room) return failure('Room not found', 404);
      return success(room);
    }

    if (path.startsWith('/chats/get-messages/')) {
      const roomName = path.split('/').filter(Boolean).pop();
      return success(
        db.chatMessages
          .filter((item) => item.room === roomName)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      );
    }

    return failure(`GET ${path} is not implemented in standalone mode`, 404);
  },
  async post(url, payload = {}) {
    const path = normalizeUrl(url);
    const db = readDb();

    if (path === '/auth/login/') {
      const found = db.users.find(
        (user) => user.email.toLowerCase() === String(payload.email).toLowerCase() && user.password === payload.password
      );
      if (!found) {
        return failure('Invalid email or password', 401, { status_code: 401, errors: { detail: ['Invalid credentials'] } });
      }
      return success({
        id: found.id,
        email: found.email,
        username: found.username,
        role: found.role,
        tokens: JSON.stringify({
          access: `access-${found.id}-${Date.now()}`,
          refresh: `refresh-${found.id}-${Date.now()}`,
        }).replace(/"/g, "'"),
      });
    }

    if (path === '/auth/register/') {
      const exists = db.users.some((user) => user.email.toLowerCase() === String(payload.email).toLowerCase());
      if (exists) {
        return failure('Registration failed', 400, {
          status_code: 400,
          errors: { email: ['A user with that email already exists.'] },
        });
      }

      const user = {
        id: nextId(db.users),
        username: payload.username || payload.email,
        email: payload.email,
        password: payload.password,
        role: payload.role || 'individual',
        phone_number: payload.phone_number || '',
        alternative_phone_number: payload.alternative_phone_number || '',
        id_number: payload.id_passport_number || '',
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
        clientCommunication: true,
        taskManagement: true,
        deadlineNotifications: true,
      };
      db.users.push(user);
      writeDb(db);
      return success(publicUser(user), 201);
    }

    if (path === '/auth/verify-token') {
      return success({ valid: true });
    }

    if (path === '/auth/request-reset-email/') {
      db.passwordResetRequests.push({
        id: nextId(db.passwordResetRequests),
        email: payload.email,
        token: `reset-${Date.now()}`,
        created_at: new Date().toISOString(),
      });
      writeDb(db);
      return success({ detail: 'Reset instructions generated.' });
    }

    if (path.startsWith('/auth/password-reset/')) {
      return success({ detail: 'Password updated.' });
    }

    if (path === '/case/') {
      const current = currentUser();
      const created = {
        id: nextId(db.cases),
        case_number: payload.case_number || `CW-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        status: payload.status || 'open',
        start_date: payload.start_date,
        end_date: payload.end_date,
        client_id: Number(payload.individual) || current?.id || 2,
        advocate_id: current?.role === 'advocate' ? current.id : 1,
        court_id: Number(payload.court) || 1,
        organization: { name: 'TwB Cases' },
        documents: [],
      };
      db.cases.push(created);
      writeDb(db);
      return success(enrichCase(db, created), 201);
    }

    if (path === '/tasks/create/') {
      const created = {
        id: nextId(db.tasks),
        title: payload.title,
        description: payload.description,
        assigned_to: Number(payload.assigned_to),
        case: Number(payload.case),
        priority: payload.priority || 'low',
        deadline: payload.deadline,
        status: Boolean(payload.status),
      };
      db.tasks.push(created);
      writeDb(db);
      return success(enrichTask(db, created), 201);
    }

    if (path === '/document_management/api/documents/') {
      const created = {
        id: nextId(db.documents),
        title: payload.get ? payload.get('title') : payload.title,
        description: payload.get ? payload.get('description') : payload.description,
        owner: Number(payload.get ? payload.get('owner') : payload.owner),
        shared_with: payload.getAll ? payload.getAll('shared_with').map(Number) : payload.shared_with || [],
        file: payload.get && payload.get('file')?.name ? `local://${payload.get('file').name}` : 'local://uploaded-document',
        uploaded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.documents.push(created);
      writeDb(db);
      return success(enrichDocument(db, created), 201);
    }

    if (path === '/clientcomm/api/clientcommunications/') {
      const created = {
        id: nextId(db.communications),
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
        google_meet_link: payload.google_meet_link || '',
        created_at: new Date().toISOString(),
      };
      db.communications.push(created);
      writeDb(db);
      return success(created, 201);
    }

    if (path === '/api/invoices') {
      const created = {
        ...payload,
        id: nextId(db.invoices),
        date: payload.date?.format ? payload.date.format('YYYY-MM-DD') : payload.date,
        totalAmount: `$${Number(payload.amountDue || payload.total || 0).toFixed(2)}`,
        total: `$${Number(payload.total || 0).toFixed(2)}`,
        tax: `$${Number(payload.tax || 0).toFixed(2)}`,
        amountDue: `$${Number(payload.amountDue || 0).toFixed(2)}`,
        items: (payload.items || []).map((item) => ({
          ...item,
          rate: `$${Number(item.rate || 0).toFixed(2)}`,
          total: `$${Number(item.total || 0).toFixed(2)}`,
        })),
      };
      db.invoices.push(created);
      writeDb(db);
      return success(created, 201);
    }

    if (path === '/billing/subscribe/') {
      const created = {
        id: nextId(db.subscriptions),
        ...payload,
        created_at: new Date().toISOString(),
      };
      db.subscriptions.push(created);
      writeDb(db);
      return success({
        success: true,
        checkout_request_id: payload.payment_method === 'mpesa' ? `mpesa-${created.id}` : null,
        message: 'Subscription started in standalone mode.',
      });
    }

    if (path === '/billing/paypal/capture/') {
      return success({ success: true, message: 'Payment captured in standalone mode.' });
    }

    if (path === '/billing/onboarding/') {
      const created = { id: nextId(db.onboarding), ...payload, created_at: new Date().toISOString() };
      db.onboarding.push(created);
      writeDb(db);
      return success(created, 201);
    }

    if (path === '/chats/create-or-get-chat-room/') {
      const first = Number(payload.user_id);
      const second = Number(payload.other_user_id);
      const existing = db.chatRooms.find(
        (room) => room.participants.includes(first) && room.participants.includes(second)
      );
      if (existing) {
        return success(existing);
      }
      const room = {
        room_name: `room-${[first, second].sort((a, b) => a - b).join('-')}`,
        participants: [first, second],
      };
      db.chatRooms.push(room);
      writeDb(db);
      return success(room, 201);
    }

    if (path === '/chats/send-message/') {
      const created = {
        id: nextId(db.chatMessages),
        room: payload.room,
        sender: Number(payload.sender_id),
        content: payload.message,
        timestamp: new Date().toISOString(),
      };
      db.chatMessages.push(created);
      writeDb(db);
      return success(created, 201);
    }

    return failure(`POST ${path} is not implemented in standalone mode`, 404);
  },
  async put(url, payload = {}) {
    const path = normalizeUrl(url);
    const db = readDb();

    if (path.startsWith('/case/')) {
      const id = Number(path.split('/').filter(Boolean).pop());
      const index = db.cases.findIndex((item) => item.id === id);
      if (index === -1) return failure('Case not found', 404);
      db.cases[index] = {
        ...db.cases[index],
        ...payload,
        client_id: Number(payload.individual ?? db.cases[index].client_id),
        court_id: Number(payload.court ?? db.cases[index].court_id),
      };
      writeDb(db);
      return success(enrichCase(db, db.cases[index]));
    }

    if (path.startsWith('/tasks/tasks/')) {
      const id = Number(path.split('/').filter(Boolean).slice(-1)[0]);
      const index = db.tasks.findIndex((item) => item.id === id);
      if (index === -1) return failure('Task not found', 404);
      db.tasks[index] = {
        ...db.tasks[index],
        ...payload,
        assigned_to: Number(payload.assigned_to ?? db.tasks[index].assigned_to),
        case: Number(payload.case ?? db.tasks[index].case),
      };
      writeDb(db);
      return success(enrichTask(db, db.tasks[index]));
    }

    if (path.startsWith('/api/documents/')) {
      const id = Number(path.split('/').filter(Boolean).pop());
      const index = db.documents.findIndex((item) => item.id === id);
      if (index === -1) return failure('Document not found', 404);
      db.documents[index] = {
        ...db.documents[index],
        ...payload,
        updated_at: new Date().toISOString(),
      };
      writeDb(db);
      return success(enrichDocument(db, db.documents[index]));
    }

    if (path.startsWith('/individual/')) {
      const id = Number(path.split('/').filter(Boolean).pop());
      const index = db.users.findIndex((item) => item.id === id);
      if (index === -1) return failure('User not found', 404);
      db.users[index] = { ...db.users[index], ...payload };
      writeDb(db);
      return success(publicUser(db.users[index]));
    }

    if (path === '/user/communication-settings' || path === '/user/task-settings') {
      const user = currentUser();
      if (!user) return failure('Unauthorized', 401);
      const index = db.users.findIndex((item) => item.id === user.id);
      if (index === -1) return failure('User not found', 404);
      db.users[index] = { ...db.users[index], ...payload };
      writeDb(db);
      return success(publicUser(db.users[index]));
    }

    if (path.startsWith('/admin/')) {
      db.adminSettings = { ...db.adminSettings, ...payload };
      writeDb(db);
      return success(db.adminSettings);
    }

    return failure(`PUT ${path} is not implemented in standalone mode`, 404);
  },
  async delete(url) {
    const path = normalizeUrl(url);
    const db = readDb();

    if (path.startsWith('/tasks/tasks/') || path.startsWith('/tasks/')) {
      const id = Number(path.split('/').filter(Boolean).pop());
      db.tasks = db.tasks.filter((item) => item.id !== id);
      writeDb(db);
      return success({ success: true });
    }

    return failure(`DELETE ${path} is not implemented in standalone mode`, 404);
  },
};

export const resetStandaloneDb = () => {
  localStorage.removeItem(DB_KEY);
  return readDb();
};
