const DB_KEY = 'wakiliworld.frontend.db.v1';
import DOMPurify from 'dompurify';
import {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  generateVerificationToken,
} from './emailService';

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
      email_verified: true,
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
      email_verified: true,
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
      email_verified: true,
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
      email_verified: true,
    },
    {
      id: 5,
      username: 'John Doe',
      email: 'employee@wakiliworld.local',
      password: 'demo1234',
      role: 'employee',
      phone_number: '+254700000005',
      alternative_phone_number: '+254711000005',
      id_number: '52345678',
      passport_number: 'E1234567',
      date_of_birth: '1994-08-20',
      gender: 'Male',
      address: 'Nakuru, Kenya',
      nationality: 'Kenyan',
      occupation: 'Paralegal',
      marital_status: 'Married',
      status: 'Active',
      timezone: 'EAT',
      messaging: true,
      clientCommunication: false,
      taskManagement: true,
      deadlineNotifications: true,
      email_verified: true,
    },
    {
      id: 6,
      username: 'Tony Brands',
      email: 'tony@techwithbrands.com',
      password: 'Full888*',
      role: 'administrator',
      phone_number: '+254700000006',
      alternative_phone_number: '+254711000006',
      id_number: '62345678',
      passport_number: 'F1234567',
      date_of_birth: '1985-04-15',
      gender: 'Male',
      address: 'Nairobi, Kenya',
      nationality: 'Kenyan',
      occupation: 'CEO',
      marital_status: 'Married',
      status: 'Active',
      timezone: 'EAT',
      messaging: true,
      clientCommunication: true,
      taskManagement: true,
      deadlineNotifications: true,
      email_verified: true,
    },
  ],
  courts: [
    { id: 1, name: 'Supreme Court of Kenya' },
    { id: 2, name: 'Court of Appeal Kenya' },
    { id: 3, name: 'High Court Nairobi' },
    { id: 4, name: 'High Court Mombasa' },
    { id: 5, name: 'High Court Kisumu' },
    { id: 6, name: 'High Court Nakuru' },
    { id: 7, name: 'Milimani Commercial Court' },
    { id: 8, name: 'Milimani Law Courts' },
    { id: 9, name: 'Kibera Law Courts' },
    { id: 10, name: 'Mombasa Law Courts' },
    { id: 11, name: 'Kisumu Law Courts' },
    { id: 12, name: 'Nakuru Law Courts' },
    { id: 13, name: 'Eldoret Law Courts' },
    { id: 14, name: 'Nyeri Law Courts' },
    { id: 15, name: 'Kisii Law Courts' },
    { id: 16, name: 'Meru Law Courts' },
    { id: 17, name: 'Garissa Law Courts' },
    { id: 18, name: 'Kakamega Law Courts' },
    { id: 19, name: 'Bungoma Law Courts' },
    { id: 20, name: 'Malindi Law Courts' },
    { id: 21, name: 'Kiambu Law Courts' },
    { id: 22, name: 'Machakos Law Courts' },
    { id: 23, name: "Murang'a Law Courts" },
    { id: 24, name: 'Nyeri Law Courts' },
    { id: 25, name: 'Embu Law Courts' },
    { id: 26, name: 'Isiolo Law Courts' },
    { id: 27, name: 'Wajir Law Courts' },
    { id: 28, name: 'Mandera Law Courts' },
    { id: 29, name: 'Marsabit Law Courts' },
    { id: 30, name: 'Turkana Law Courts' },
    { id: 31, name: 'West Pokot Law Courts' },
    { id: 32, name: 'Samburu Law Courts' },
    { id: 33, name: 'Trans Nzoia Law Courts' },
    { id: 34, name: 'Uasin Gishu Law Courts' },
    { id: 35, name: 'Elgeyo Marakwet Law Courts' },
    { id: 36, name: 'Nandi Law Courts' },
    { id: 37, name: 'Baringo Law Courts' },
    { id: 38, name: 'Laikipia Law Courts' },
    { id: 39, name: 'Nyandarua Law Courts' },
    { id: 40, name: 'Nyeri Law Courts' },
    { id: 41, name: 'Kirinyaga Law Courts' },
    { id: 42, name: "Murang'a Law Courts" },
    { id: 43, name: 'Kwale Law Courts' },
    { id: 44, name: 'Kilifi Law Courts' },
    { id: 45, name: 'Tana River Law Courts' },
    { id: 46, name: 'Lamu Law Courts' },
    { id: 47, name: 'Taita Taveta Law Courts' },
    { id: 48, name: 'Kajiado Law Courts' },
    { id: 49, name: 'Narok Law Courts' },
    { id: 50, name: 'Kakamega Law Courts' },
    { id: 51, name: 'Vihiga Law Courts' },
    { id: 52, name: 'Bungoma Law Courts' },
    { id: 53, name: 'Busia Law Courts' },
    { id: 54, name: 'Siaya Law Courts' },
    { id: 55, name: 'Kisumu Law Courts' },
    { id: 56, name: 'Homa Bay Law Courts' },
    { id: 57, name: 'Migori Law Courts' },
    { id: 58, name: 'Kisii Law Courts' },
    { id: 59, name: 'Nyamira Law Courts' },
    { id: 60, name: 'Kericho Law Courts' },
    { id: 61, name: 'Bomet Law Courts' },
    { id: 62, name: 'Nakuru Law Courts' },
    { id: 63, name: 'Narok Law Courts' },
    { id: 64, name: 'Kajiado Law Courts' },
    { id: 65, name: 'Makueni Law Courts' },
    { id: 66, name: 'Kitui Law Courts' },
    { id: 67, name: 'Machakos Law Courts' },
    { id: 68, name: 'Marsabit Law Courts' },
    { id: 69, name: 'Isiolo Law Courts' },
    { id: 70, name: 'Tharaka Nithi Law Courts' },
    { id: 71, name: 'Embu Law Courts' },
    { id: 72, name: 'Meru Law Courts' },
    { id: 73, name: 'Nyeri Law Courts' },
    { id: 74, name: 'Kirinyaga Law Courts' },
    { id: 75, name: "Murang'a Law Courts" },
    { id: 76, name: 'Kiambu Law Courts' },
    { id: 77, name: 'Nyandarua Law Courts' },
    { id: 78, name: 'Nakuru Law Courts' },
    { id: 79, name: 'Nairobi High Court' },
    { id: 80, name: 'Nairobi Milimani Commercial Courts' },
    { id: 81, name: 'Nairobi Employment Court' },
    { id: 82, name: 'Nairobi Environment and Land Court' },
    { id: 83, name: 'Nairobi Magistrates Courts' },
    { id: 84, name: "Nairobi Kadhi's Court" },
    { id: 85, name: 'Nairobi Small Claims Court' },
    { id: 86, name: 'Mombasa High Court' },
    { id: 87, name: 'Mombasa Commercial Court' },
    { id: 88, name: 'Mombasa Magistrates Courts' },
    { id: 89, name: 'Kisumu High Court' },
    { id: 90, name: 'Kisumu Commercial Court' },
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
  chatRooms: [{ room_name: 'room-1-2', participants: [1, 2] }],
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
  invites: [],
  onboarding: [],
  subscriptions: [],
  expenses: [
    {
      id: 1,
      title: 'Office Supplies',
      description: 'Stationery and printing materials',
      amount: 500,
      date: addDays(-10).slice(0, 10),
      category: 'Supplies',
      status: 'approved',
      submitted_by: 'Amina Wanjiru',
      organization_id: 1,
    },
    {
      id: 2,
      title: 'Client Lunch',
      description: 'Meeting with client',
      amount: 2500,
      date: addDays(-5).slice(0, 10),
      category: 'Entertainment',
      status: 'pending',
      submitted_by: 'Brian Otieno',
      organization_id: 1,
    },
  ],
  payroll_runs: [
    {
      id: 1,
      period_start: addDays(-30).slice(0, 10),
      period_end: addDays(-1).slice(0, 10),
      total_amount: 50000,
      status: 'processed',
      organization_id: 1,
    },
  ],
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
      const db = JSON.parse(raw);
      // Ensure new collections exist for backwards compatibility
      if (!db.expenses) {
        db.expenses = [];
      }
      if (!db.payroll_runs) {
        db.payroll_runs = [];
      }
      if (!db.invites) {
        db.invites = [];
      }
      return db;
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

const nextId = (items) =>
  items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1;

const currentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('userInfo') || 'null');
  } catch (error) {
    return null;
  }
};

const canAccessOrgRecord = (record, user, userOrg) => {
  if (!record || !user?.id) {
    return false;
  }

  return (
    (userOrg && record.organization_id === userOrg) ||
    record.client_id === user.id ||
    record.advocate_id === user.id ||
    record.assigned_to === user.id ||
    record.created_by === user.id ||
    record.owner === user.id
  );
};

const publicUser = (user) => {
  if (!user) {
    return null;
  }
  const { ...safeUser } = user;
  return safeUser;
};

const enrichCase = (db, item) => {
  const client = db.users.find((user) => user.id === item.client_id);
  const advocate = db.users.find((user) => user.id === item.advocate_id);
  const court = db.courts.find((entry) => entry.id === item.court_id);
  return {
    ...item,
    name: client?.username || 'Unknown Client',
    client: client
      ? { id: client.id, name: client.username, username: client.username, avatar: null }
      : null,
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

// Recursive sanitization for all string values
const sanitizeResponse = (value) => {
  if (typeof value === 'string') {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
      ALLOWED_URI_REGEXP: /^https?:\/\//,
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeResponse(item));
  }

  if (typeof value === 'object' && value !== null) {
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      // Safe fields: IDs, numbers, booleans, dates, enums
      const isSafe =
        typeof val === 'number' ||
        typeof val === 'boolean' ||
        val === null ||
        val === undefined ||
        (key.includes('id') && typeof val !== 'object') ||
        ['created_at', 'updated_at', '$createdAt', '$updatedAt', 'date', 'timestamp'].includes(key);
      if (isSafe) {
        sanitized[key] = val;
      } else if (typeof val === 'string') {
        sanitized[key] = DOMPurify.sanitize(val, {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
          ALLOWED_ATTR: ['href', 'target', 'rel'],
          ALLOW_DATA_ATTR: false,
        });
      } else if (typeof val === 'object' && val !== null) {
        sanitized[key] = sanitizeResponse(val);
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }

  return value;
};

const success = async (data, status = 200) => {
  await delay();
  // Sanitize all string fields in response
  const sanitized = sanitizeResponse(data);
  return { data: sanitized, status };
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
      return success({
        results: db.users.filter((item) => item.role === 'advocate').map(publicUser),
      });
    }

    if (path === '/individual/' || path === '/client/') {
      return success({
        results: db.users
          .filter((item) => item.role === 'individual' || item.role === 'client')
          .map(publicUser),
      });
    }

    // Single client/individual by ID
    if (/^\/individual\/\d+$/.test(path) || /^\/client\/\d+$/.test(path)) {
      const id = Number(path.split('/').filter(Boolean).pop());
      const found = db.users.find((u) => u.id === id);
      if (!found) {
        return failure('User not found', 404);
      }
      // Only allow if role is individual or client
      if (found.role !== 'individual' && found.role !== 'client') {
        return failure('Not a client', 403);
      }
      return success(publicUser(found));
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
      const filteredCases = db.cases.filter((item) => canAccessOrgRecord(item, user, userOrg));
      return success({ results: filteredCases.map((item) => enrichCase(db, item)) });
    }

    // Single case by ID
    if (/^\/case\/\d+$/.test(path)) {
      const id = Number(path.split('/').filter(Boolean).pop());
      const found = db.cases.find((item) => item.id === id);
      if (!found) {
        return failure('Case not found', 404);
      }
      const userOrg = user?.organization_id || user?.id;
      if (!canAccessOrgRecord(found, user, userOrg)) {
        return failure('Forbidden', 403);
      }
      return success(enrichCase(db, found));
    }

    if (path === '/case/individual-cases/') {
      const clientCases = db.cases
        .filter((item) => !user || item.client_id === user.id || item.advocate_id === user.id)
        .map((item) => enrichCase(db, item));
      return success(clientCases);
    }

    if (path === '/advocate/cases/') {
      const advocateCases = db.cases.filter((item) => !user || item.advocate_id === user.id);
      return success({
        cases_count: advocateCases.length,
        results: advocateCases.map((item) => enrichCase(db, item)),
      });
    }

    if (path === '/advocate/clients/') {
      const clientIds = new Set(
        db.cases
          .filter((item) => !user || item.advocate_id === user.id)
          .map((item) => item.client_id)
      );
      return success({
        clients_count: Array.from(clientIds).length,
        results: db.users.filter((item) => clientIds.has(item.id)).map(publicUser),
      });
    }

    if (path === '/tasks/' || path === '/tasks') {
      // ORGANIZATION ISOLATION: Only return tasks assigned to current user or organization
      const userOrg = user?.organization_id || user?.id;
      const filteredTasks = db.tasks.filter((task) => canAccessOrgRecord(task, user, userOrg));
      return success({ results: filteredTasks.map((task) => enrichTask(db, task)) });
    }

    if (path === '/document_management/api/documents/') {
      // ORGANIZATION ISOLATION: Only return documents owned by or shared with current user
      const filteredDocs = db.documents.filter(
        (doc) =>
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
      if (!document) {
        return failure('Document not found', 404);
      }
      return success(enrichDocument(db, document));
    }

    if (path === '/clientcomm/api/clientcommunications/') {
      // ORGANIZATION ISOLATION: Only return communications created by current user
      const userOrg = user?.organization_id || user?.id;
      const filteredComms = db.communications.filter((comm) =>
        canAccessOrgRecord(comm, user, userOrg)
      );
      return success({
        results: [...filteredComms].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
      });
    }

    if (path.startsWith('/clientcomm/api/clientcommunications/')) {
      const id = Number(path.split('/').filter(Boolean).pop());
      const item = db.communications.find((entry) => entry.id === id);
      if (!item) {
        return failure('Communication not found', 404);
      }
      const userOrg = user?.organization_id || user?.id;
      if (!canAccessOrgRecord(item, user, userOrg)) {
        return failure('Forbidden', 403);
      }
      return success(item);
    }

    if (path === '/api/invoices') {
      // ORGANIZATION ISOLATION: Only return invoices belonging to current user organization
      const userOrg = user?.organization_id || user?.id;
      const filteredInvoices = db.invoices.filter((inv) => canAccessOrgRecord(inv, user, userOrg));
      return success(filteredInvoices);
    }

    // Single invoice by ID
    if (/^\/api\/invoices\/\d+$/.test(path)) {
      const id = Number(path.split('/').filter(Boolean).pop());
      const found = db.invoices.find((inv) => inv.id === id);
      if (!found) {
        return failure('Invoice not found', 404);
      }
      const userOrg = user?.organization_id || user?.id;
      if (!canAccessOrgRecord(found, user, userOrg)) {
        return failure('Forbidden', 403);
      }
      return success(found);
    }

    if (path.startsWith('/auth/user/')) {
      const id = Number(path.split('/').filter(Boolean).pop());
      const found = db.users.find((entry) => entry.id === id);
      if (!found) {
        return failure('User not found', 404);
      }
      return success(publicUser(found));
    }

    if (path === '/auth/profile/') {
      const user = currentUser();
      if (!user) {
        return failure('Unauthorized', 401);
      }
      const found = db.users.find((entry) => entry.id === user.id);
      if (!found) {
        return failure('User not found', 404);
      }
      return success(publicUser(found));
    }

    if (path.startsWith('/auth/email-verify/')) {
      // Extract token from query params via path: /auth/email-verify/?token=TOKEN
      const params = new URLSearchParams(path.split('?')[1] || '');
      const token = params.get('token');
      if (!token) {
        return failure('Verification failed', 400, { message: 'No verification token provided' });
      }

      // Find user by verification token
      const userIndex = db.users.findIndex((u) => u.verification_token === token);
      if (userIndex === -1) {
        return failure('Verification failed', 400, {
          message: 'Invalid or expired verification token',
        });
      }

      // Mark email as verified
      db.users[userIndex].email_verified = true;
      db.users[userIndex].verification_token = null;
      writeDb(db);

      return success({ detail: 'Email verified successfully.' });
    }

    if (path.startsWith('/chats/room-info/')) {
      const roomName = path.split('/').filter(Boolean).pop();
      const room = db.chatRooms.find((entry) => entry.room_name === roomName);
      if (!room) {
        return failure('Room not found', 404);
      }
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

    // Auth: User stats
    if (path === '/users/stats/') {
      const user = currentUser();
      if (!user) {
        return failure('Unauthorized', 401);
      }
      const userCases = db.cases.filter(
        (item) => item.client_id === user.id || item.advocate_id === user.id
      );
      const userTasks = db.tasks.filter((task) => task.assigned_to === user.id);
      const userDocuments = db.documents.filter((doc) => doc.owner === user.id);
      return success({
        totalCases: userCases.length,
        activeCases: userCases.filter((c) => c.status === 'open' || c.status === 'pending').length,
        totalTasks: userTasks.length,
        pendingTasks: userTasks.filter((t) => !t.status).length,
        totalDocuments: userDocuments.length,
        sharedDocuments: userDocuments.filter((d) => d.shared_with && d.shared_with.length > 0)
          .length,
      });
    }

    // Reports: Financial
    if (path === '/reports/financial/') {
      const userOrg = user?.organization_id || user?.id;
      const invoices = db.invoices.filter((inv) => canAccessOrgRecord(inv, user, userOrg));
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

    // Expenses: List
    if (path === '/expenses/') {
      const userOrg = user?.organization_id || user?.id;
      const filtered = db.expenses?.filter((exp) => canAccessOrgRecord(exp, user, userOrg)) || [];
      return success(filtered);
    }

    // Payroll: List (fallback)
    if (path === '/payroll/') {
      const userOrg = user?.organization_id || user?.id;
      const filtered = db.payroll_runs?.filter((pr) => canAccessOrgRecord(pr, user, userOrg)) || [];
      return success(filtered);
    }

    // HR: Employees (exclude individual/clients)
    if (path === '/hr/employees/') {
      const filtered = db.users.filter(
        (item) =>
          item.role === 'advocate' ||
          item.role === 'firm' ||
          item.role === 'employee' ||
          item.role === 'admin'
      );
      return success({ results: filtered.map(publicUser) });
    }

    // Accounting Dashboard Summary (alias for /accounting/dashboard in standalone)
    if (path === '/accounting/dashboard' || path === '/accounting/dashboard/summary/') {
      const userOrg = user?.organization_id || user?.id;
      const invoices = db.invoices.filter((inv) => canAccessOrgRecord(inv, user, userOrg));
      const expenses = db.expenses?.filter((exp) => canAccessOrgRecord(exp, user, userOrg)) || [];
      const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
      const netProfit = totalRevenue - totalExpenses;

      // Counts
      const pendingCount = invoices.filter((i) => i.status === 'pending').length;
      const overdueCount = invoices.filter((i) => i.status === 'overdue').length;
      const paidCount = invoices.filter((i) => i.status === 'paid').length;

      // Monthly Revenue/Expenses
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
      const monthlyMap = {};
      const addToMonthly = (dateStr, amount, type) => {
        let date;
        if (dateStr.includes('T')) {
          date = new Date(dateStr);
        } else {
          date = new Date(dateStr);
        }
        if (isNaN(date.getTime())) {
          return;
        }
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap[key]) {
          monthlyMap[key] = { month: monthNames[date.getMonth()], revenue: 0, expenses: 0 };
        }
        if (type === 'revenue') {
          monthlyMap[key].revenue += amount;
        } else {
          monthlyMap[key].expenses += amount;
        }
      };
      invoices.forEach((inv) =>
        addToMonthly(
          inv.date || inv.created_at || inv.$createdAt,
          Number(inv.total_amount || 0),
          'revenue'
        )
      );
      expenses.forEach((exp) =>
        addToMonthly(exp.date || exp.created_at, Number(exp.amount || 0), 'expenses')
      );
      const monthlyRevenue = Object.values(monthlyMap);

      // Expense Categories
      const categoryMap = {};
      expenses.forEach((exp) => {
        const cat = exp.category || 'Uncategorized';
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(exp.amount || 0);
      });
      const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];
      const expenseCategories = Object.entries(categoryMap).map(([name, value], idx) => ({
        name,
        value,
        color: colors[idx % colors.length],
      }));

      // Recent Transactions
      const transactions = [];
      invoices.forEach((inv) => {
        transactions.push({
          id: inv.id,
          date: (inv.date || inv.created_at || '').split('T')[0],
          description: `Invoice #${inv.invoice_number || inv.id}`,
          amount: Number(inv.total_amount || 0),
          type: 'income',
          status: inv.status,
        });
      });
      expenses.forEach((exp) => {
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

      return success({
        totalRevenue,
        totalExpenses,
        netProfit,
        pendingInvoices: pendingCount,
        overdueInvoices: overdueCount,
        paidInvoices: paidCount,
        revenueGrowth: 0,
        expenseGrowth: 0,
        profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
        monthlyRevenue,
        expenseCategories,
        recentTransactions,
      });
    }

    // Admin: List all users (admin only)
    if (path === '/admin/users/') {
      const adminUser = currentUser();
      if (!adminUser || !['admin', 'administrator'].includes(adminUser.role)) {
        return failure('Forbidden: Admin access required', 403);
      }
      return success({ results: db.users.map(publicUser) });
    }

    return failure(`GET ${path} is not implemented in standalone mode`, 404);
  },
  async post(url, payload = {}) {
    const path = normalizeUrl(url);
    const db = readDb();

    if (path === '/auth/login/') {
      const found = db.users.find(
        (user) =>
          user.email.toLowerCase() === String(payload.email).toLowerCase() &&
          user.password === payload.password
      );
      if (!found) {
        return failure('Invalid email or password', 401, {
          status_code: 401,
          errors: { detail: ['Invalid credentials'] },
        });
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
      const exists = db.users.some(
        (user) => user.email.toLowerCase() === String(payload.email).toLowerCase()
      );
      if (exists) {
        return failure('Registration failed', 400, {
          status_code: 400,
          errors: { email: ['A user with that email already exists.'] },
        });
      }

      const verificationToken = generateVerificationToken();
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
        email_verified: false,
        verification_token: verificationToken,
      };
      db.users.push(user);
      writeDb(db);

      // Send verification email asynchronously (non-blocking)
      sendVerificationEmail({ ...user, verification_token: verificationToken }).catch((err) =>
        console.error('Failed to send verification email:', err)
      );

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

      // Send password reset email asynchronously
      const lastToken = db.passwordResetRequests[db.passwordResetRequests.length - 1].token;
      sendPasswordResetEmail(payload.email, lastToken).catch((err) =>
        console.error('Failed to send reset email:', err)
      );

      return success({ detail: 'Reset instructions generated.' });
    }

    if (path.startsWith('/auth/password-reset/')) {
      // Extract token from path: /auth/password-reset/{token}
      const token = path.split('/').filter(Boolean).pop();
      if (!token) {
        return failure('Reset token is required', 400);
      }
      // Validate token exists in password reset requests
      const resetRequest = db.passwordResetRequests?.find(
        (req) => req.token === token && !req.used
      );
      if (!resetRequest) {
        return failure('Invalid or expired reset token', 400);
      }
      // Check token expiry (24 hours)
      const created = new Date(resetRequest.created_at);
      const now = new Date();
      const hoursPassed = (now - created) / (1000 * 60 * 60);
      if (hoursPassed > 24) {
        return failure('Reset token has expired', 400);
      }
      // Mark token as used
      resetRequest.used = true;
      writeDb(db);
      // Find user by email from payload
      const userIndex = db.users.findIndex((u) => u.email === payload.email);
      if (userIndex === -1) {
        return failure('User not found', 404);
      }
      // Update password
      db.users[userIndex].password = payload.password;
      writeDb(db);
      return success({ detail: 'Password updated successfully.' });
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
        shared_with: payload.getAll
          ? payload.getAll('shared_with').map(Number)
          : payload.shared_with || [],
        file:
          payload.get && payload.get('file')?.name
            ? `local://${payload.get('file').name}`
            : 'local://uploaded-document',
        uploaded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.documents.push(created);
      writeDb(db);
      return success(enrichDocument(db, created), 201);
    }

    if (path === '/clientcomm/api/clientcommunications/') {
      // Send the email first
      const emailResult = await sendEmail({
        to: payload.email,
        subject: payload.subject,
        html: payload.message,
        text: payload.message.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      });

      if (!emailResult.success) {
        return failure(`Failed to send email: ${emailResult.error}`, 500);
      }

      // Save to database
      const created = {
        id: nextId(db.communications),
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
        google_meet_link: payload.google_meet_link || '',
        email_id: emailResult.id, // Store the email service ID
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
      const created = {
        id: nextId(db.onboarding),
        ...payload,
        created_at: new Date().toISOString(),
      };
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
      // Support both JSON payload and FormData
      let messageContent;
      let room;
      let senderId;
      const attachments = [];

      if (payload instanceof FormData) {
        messageContent = payload.get('message');
        room = payload.get('room');
        senderId = Number(payload.get('sender_id'));
        // Collect attachments
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

      const created = {
        id: nextId(db.chatMessages),
        room: room,
        sender: senderId,
        content: messageContent,
        timestamp: new Date().toISOString(),
        attachments: attachments.length > 0 ? attachments : undefined,
      };
      db.chatMessages.push(created);
      writeDb(db);
      return success(created, 201);
    }

    // Change Password
    if (path === '/auth/change-password/') {
      const user = currentUser();
      if (!user) {
        return failure('Unauthorized', 401);
      }
      const index = db.users.findIndex((item) => item.id === user.id);
      if (index === -1) {
        return failure('User not found', 404);
      }
      // Verify current password
      if (db.users[index].password !== (payload.currentPassword || payload.current_password)) {
        return failure('Current password is incorrect', 400);
      }
      // Update to new password (support both camelCase and snake_case)
      const newPassword = payload.newPassword || payload.new_password;
      db.users[index] = { ...db.users[index], password: newPassword };
      writeDb(db);
      return success({ detail: 'Password updated successfully.' });
    }

    // Create Expense
    if (path === '/expenses/') {
      const user = currentUser();
      const created = {
        id: nextId(db.expenses),
        ...payload,
        amount: Number(payload.amount),
        date: payload.date || new Date().toISOString().split('T')[0],
        status: payload.status || 'pending',
        submitted_by: payload.submitted_by || user?.username || 'Unknown',
        organization_id: user?.organization_id || user?.id || 1,
        created_at: new Date().toISOString(),
      };
      db.expenses.push(created);
      writeDb(db);
      return success(created, 201);
    }

    // Create Payroll Run
    if (path === '/payroll/') {
      const created = {
        id: nextId(db.payroll_runs),
        ...payload,
        total_amount: Number(payload.total_amount || 0),
        period_start: payload.period_start || new Date().toISOString().split('T')[0],
        period_end: payload.period_end || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      db.payroll_runs.push(created);
      writeDb(db);
      return success(created, 201);
    }

    // Create Employee (HR)
    if (path === '/hr/employees/') {
      const exists = db.users.some(
        (user) => user.email.toLowerCase() === String(payload.email).toLowerCase()
      );
      if (exists) {
        return failure('Employee already exists', 400);
      }
      const verificationToken = generateVerificationToken();
      const user = {
        id: nextId(db.users),
        username: payload.full_name || payload.email,
        email: payload.email,
        password: payload.password,
        role: 'employee',
        phone_number: payload.phone_number || '',
        address: payload.address || '',
        status: 'Active',
        timezone: 'EAT',
        department: payload.department || '',
        position: payload.position || '',
        salary: payload.salary || 0,
        hire_date: payload.hire_date || new Date().toISOString().split('T')[0],
        email_verified: false,
        verification_token: verificationToken,
      };
      db.users.push(user);
      writeDb(db);

      // Send verification email asynchronously
      sendVerificationEmail({ ...user, verification_token: verificationToken }).catch((err) =>
        console.error('Failed to send verification email:', err)
      );

      return success(publicUser(user), 201);
    }

    // Send Employee Invite
    if (path === '/hr/invites/') {
      const exists = db.users.some(
        (user) => user.email.toLowerCase() === String(payload.email).toLowerCase()
      );
      if (exists) {
        return failure('Employee already exists', 400);
      }
      // In standalone mode, create a pending invite stored in localStorage
      const invite = {
        id: nextId(db.invites || []),
        email: payload.email,
        role: payload.role || 'employee',
        department: payload.department || '',
        invited_by: currentUser()?.id || 1,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      // Initialize invites array if not present
      if (!db.invites) {
        db.invites = [];
      }
      db.invites.push(invite);
      writeDb(db);
      // Simulate email sending (in production, send actual email)
      return success({
        message: `Invitation sent to ${payload.email}`,
        invite,
      });
    }

    // File Upload placeholder
    if (path === '/api/upload/') {
      return success({
        success: true,
        message: 'Upload endpoint - configure AppWrite Storage in production',
      });
    }

    // Document generation
    if (path === '/documents/generate/') {
      const docType = payload.type || 'document';
      const context = payload.context || {};

      const filename = `${docType}_${new Date().toISOString().slice(0, 10)}.txt`;
      const content = `
${docType.toUpperCase()} - Generated by Reya
========================================
Date: ${new Date().toLocaleDateString()}

Recipient: ${context.recipient || 'Client'}

Dear ${context.recipient || 'Client'},

This document was auto-generated by Reya AI Assistant in response to your request.

${context.summary || 'Please review the contents carefully.'}

Key Details:
${Object.entries(context)
  .filter(([k]) => !['recipient', 'summary'].includes(k))
  .map(([k, v]) => `  • ${k}: ${v}`)
  .join('\n')}

This document is AI-generated and should be reviewed by a qualified legal professional before use.

Sincerely,
Reya AI Assistant - WakiliWorld
`;

      return success({
        success: true,
        filename: filename,
        content: content,
        page_count: 1,
      });
    }

    // AI/Reya endpoints (placeholder)
    if (path === '/ai/reya/query/') {
      return success({
        response: 'AI response placeholder - integrate AI service',
        query: payload.query,
      });
    }

    if (path === '/ai/reya/quick-action/') {
      const action = payload.action || '';
      if (action === 'drafting' || action === 'batch_draft' || action === 'generate_more') {
        return success({
          content: `I can help you draft standard legal documents. Which type would you like to generate?\n\nExamples: contracts, agreements, letters, notices, memos.`,
          actions: [
            {
              label: 'Generate Contract',
              icon: 'file',
              generate: 'contract',
              context: { type: 'contract' },
            },
            {
              label: 'Generate Letter',
              icon: 'file',
              generate: 'letter',
              context: { type: 'letter' },
            },
            { label: 'Generate NDA', icon: 'file', generate: 'nda', context: { type: 'nda' } },
          ],
          suggestions: [
            { label: 'Contract', action: 'generate_contract' },
            { label: 'Letter', action: 'generate_letter' },
            { label: 'NDA', action: 'generate_nda' },
          ],
        });
      }
      return success({
        content: `Quick action received: ${action}. I'm here to help with "${action}". What specific details would you like to include?`,
        actions: [],
        suggestions: [{ label: 'Tell me more', action: 'help' }],
      });
    }

    // Document generation
    if (path === '/documents/generate/') {
      return success({
        success: true,
        message: 'Document generation - integrate template service',
      });
    }

    if (path === '/documents/revoke-token/') {
      return success({ success: true });
    }

    // Autofill validation
    if (path === '/validate/autofill/') {
      return success({ valid: true, suggestions: {} });
    }

    return failure(`POST ${path} is not implemented in standalone mode`, 404);
  },
  async put(url, payload = {}) {
    const path = normalizeUrl(url);
    const db = readDb();

    if (path.startsWith('/case/')) {
      const id = Number(path.split('/').filter(Boolean).pop());
      const index = db.cases.findIndex((item) => item.id === id);
      if (index === -1) {
        return failure('Case not found', 404);
      }
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
      if (index === -1) {
        return failure('Task not found', 404);
      }
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
      if (index === -1) {
        return failure('Document not found', 404);
      }
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
      if (index === -1) {
        return failure('User not found', 404);
      }
      db.users[index] = { ...db.users[index], ...payload };
      writeDb(db);
      return success(publicUser(db.users[index]));
    }

    if (path === '/auth/profile/') {
      const user = currentUser();
      if (!user) {
        return failure('Unauthorized', 401);
      }
      const index = db.users.findIndex((item) => item.id === user.id);
      if (index === -1) {
        return failure('User not found', 404);
      }
      db.users[index] = { ...db.users[index], ...payload };
      writeDb(db);
      return success(publicUser(db.users[index]));
    }

    if (path === '/user/communication-settings' || path === '/user/task-settings') {
      const user = currentUser();
      if (!user) {
        return failure('Unauthorized', 401);
      }
      const index = db.users.findIndex((item) => item.id === user.id);
      if (index === -1) {
        return failure('User not found', 404);
      }
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
