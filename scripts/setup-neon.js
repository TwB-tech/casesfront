import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NEON_DATABASE_URL;
if (!DATABASE_URL) {
  console.error('NEON_DATABASE_URL is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL, { fetchConnectionCache: true });

const log = {
  info: (msg) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m⚠\x1b[0m ${msg}`),
};

async function exec(text, params = []) {
  const trimmed = text.trim();
  await sql.query(trimmed, params);
}

async function ensureUsersTable() {
  log.info('Ensuring users table exists...');
  await sql.query(`CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    organization_id VARCHAR(255),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'individual',
    title VARCHAR(255),
    bio TEXT,
    practice_areas TEXT[],
    timezone VARCHAR(50) DEFAULT 'EAT',
    status VARCHAR(50) DEFAULT 'Active',
    messaging_enabled BOOLEAN DEFAULT TRUE,
    deadline_notifications BOOLEAN DEFAULT TRUE,
    verification_token VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    id_passport_number VARCHAR(50),
    marital_status VARCHAR(50),
    nationality VARCHAR(100),
    occupation VARCHAR(100),
    date_of_birth VARCHAR(20),
    registration_number VARCHAR(100),
    name VARCHAR(255),
    phone_number VARCHAR(50),
    address TEXT,
    department VARCHAR(100),
    salary FLOAT,
    hire_date VARCHAR(20),
    leave_balance INTEGER DEFAULT 30,
    billable_rate FLOAT,
    messaging BOOLEAN DEFAULT TRUE,
    task_management BOOLEAN DEFAULT TRUE,
    client_communication BOOLEAN DEFAULT FALSE,
    invited_by VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'KES',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`);
  await sql.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  await sql.query('CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token)');
  await sql.query('CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id)');
  log.success('users table ready');
}

async function ensureStandardTables() {
  const statements = [
    { name: 'organizations', sql: `CREATE TABLE IF NOT EXISTS organizations (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      registration_number VARCHAR(255),
      address TEXT,
      phone VARCHAR(50),
      email VARCHAR(255),
      plan_type VARCHAR(50) DEFAULT 'free',
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`, indexes: ['CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name)'] },
    { name: 'cases', sql: `CREATE TABLE IF NOT EXISTS cases (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      case_number VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'open',
      start_date VARCHAR(20),
      end_date VARCHAR(20),
      client_id VARCHAR(255),
      advocate_id VARCHAR(255),
      court_id INTEGER,
      created_by VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`, indexes: [
      'CREATE INDEX IF NOT EXISTS idx_cases_organization_id ON cases(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number)',
      'CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id)',
      'CREATE INDEX IF NOT EXISTS idx_cases_advocate_id ON cases(advocate_id)',
    ] },
    { name: 'tasks', sql: `CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      assigned_to VARCHAR(255),
      case_id VARCHAR(255),
      priority VARCHAR(50) DEFAULT 'low',
      deadline TIMESTAMP,
      status BOOLEAN DEFAULT FALSE,
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`, indexes: [
      'CREATE INDEX IF NOT EXISTS idx_tasks_organization_id ON tasks(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON tasks(case_id)',
    ] },
    { name: 'documents', sql: `CREATE TABLE IF NOT EXISTS documents (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      owner VARCHAR(255) NOT NULL,
      file_path TEXT,
      file_size INTEGER,
      mime_type VARCHAR(100),
      shared_with TEXT[],
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`, indexes: [
      'CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON documents(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner)',
    ] },
    { name: 'communications', sql: `CREATE TABLE IF NOT EXISTS communications (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      google_meet_link TEXT,
      created_by VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`, indexes: [
      'CREATE INDEX IF NOT EXISTS idx_communications_organization_id ON communications(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_communications_created_by ON communications(created_by)',
    ] },
    { name: 'invites', sql: `CREATE TABLE IF NOT EXISTS invites (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'employee',
      department VARCHAR(100) DEFAULT '',
      organization_id VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      invited_by VARCHAR(255),
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`, indexes: [
      'CREATE INDEX IF NOT EXISTS idx_invites_organization_id ON invites(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_invites_invited_by ON invites(invited_by)',
      'CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token)',
    ] },
    { name: 'invoices', sql: `CREATE TABLE IF NOT EXISTS invoices (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      invoice_number VARCHAR(100) UNIQUE NOT NULL,
      client_name VARCHAR(255) NOT NULL,
      client_address TEXT,
      crn VARCHAR(100),
      total_amount FLOAT,
      amount_due FLOAT,
      tax FLOAT,
      items TEXT,
      account_number VARCHAR(100),
      account_name VARCHAR(255),
      bank_detail TEXT,
      terms TEXT,
      signature TEXT,
      status VARCHAR(50),
      date VARCHAR(20),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`, indexes: [
      'CREATE INDEX IF NOT EXISTS idx_invoices_organization_id ON invoices(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number)',
    ] },
    { name: 'invoice_items', sql: `CREATE TABLE IF NOT EXISTS invoice_items (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      invoice_id VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      quantity INTEGER,
      unit_price FLOAT,
      total FLOAT
    )`, indexes: ['CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id)'] },
    { name: 'chat_rooms', sql: `CREATE TABLE IF NOT EXISTS chat_rooms (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      room_name VARCHAR(255) UNIQUE NOT NULL,
      participants TEXT[] NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`, indexes: ['CREATE INDEX IF NOT EXISTS idx_chat_rooms_organization_id ON chat_rooms(organization_id)'] },
    { name: 'chat_messages', sql: `CREATE TABLE IF NOT EXISTS chat_messages (
      id VARCHAR(255) PRIMARY KEY,
      room VARCHAR(255) NOT NULL,
      sender VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL,
      attachments TEXT[],
      organization_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )`, indexes: [
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room)',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender)',
    ] },
    { name: 'service_requests', sql: `CREATE TABLE IF NOT EXISTS service_requests (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      client_id VARCHAR(255) NOT NULL,
      lawyer_id VARCHAR(255) NOT NULL,
      service_category VARCHAR(100),
      case_description TEXT,
      preferred_time VARCHAR(50) DEFAULT 'flexible',
      urgency VARCHAR(50) DEFAULT 'normal',
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`, indexes: [
      'CREATE INDEX IF NOT EXISTS idx_service_requests_organization_id ON service_requests(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON service_requests(client_id)',
      'CREATE INDEX IF NOT EXISTS idx_service_requests_lawyer_id ON service_requests(lawyer_id)',
    ] },
    { name: 'reviews', sql: `CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      lawyer_id VARCHAR(255) NOT NULL,
      client_id VARCHAR(255) NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      service_type VARCHAR(100) DEFAULT 'general',
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    )`, indexes: [
      'CREATE INDEX IF NOT EXISTS idx_reviews_organization_id ON reviews(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_reviews_lawyer_id ON reviews(lawyer_id)',
      'CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON reviews(client_id)',
    ] },
    { name: 'audit_logs', sql: `CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      user_id VARCHAR(255),
      action VARCHAR(100) NOT NULL,
      table_name VARCHAR(100) NOT NULL,
      record_id VARCHAR(255) NOT NULL,
      changes TEXT,
      user_agent VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW()
    )`, indexes: [
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
    ] },
    { name: 'expenses', sql: `CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      amount FLOAT NOT NULL,
      date VARCHAR(20) NOT NULL,
      category VARCHAR(100),
      status VARCHAR(50) DEFAULT 'pending',
      submitted_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )`, indexes: [
      'CREATE INDEX IF NOT EXISTS idx_expenses_organization_id ON expenses(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_expenses_submitted_by ON expenses(submitted_by)',
    ] },
    { name: 'payroll_runs', sql: `CREATE TABLE IF NOT EXISTS payroll_runs (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      total_amount FLOAT NOT NULL,
      period_start VARCHAR(20) NOT NULL,
      period_end VARCHAR(20) NOT NULL,
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    )`, indexes: ['CREATE INDEX IF NOT EXISTS idx_payroll_runs_organization_id ON payroll_runs(organization_id)'] },
    { name: 'notes', sql: `CREATE TABLE IF NOT EXISTS notes (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      organization_id VARCHAR(255),
      title VARCHAR(255),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`, indexes: [
      'CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_notes_organization_id ON notes(organization_id)',
    ] },
    { name: 'leave_requests', sql: `CREATE TABLE IF NOT EXISTS leave_requests (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      employee_id VARCHAR(255) NOT NULL,
      start_date VARCHAR(20) NOT NULL,
      end_date VARCHAR(20) NOT NULL,
      leave_type VARCHAR(50) DEFAULT 'annual',
      reason TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )`, indexes: [
      'CREATE INDEX IF NOT EXISTS idx_leave_requests_organization_id ON leave_requests(organization_id)',
      'CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id)',
    ] },
    { name: 'admin_settings', sql: `CREATE TABLE IF NOT EXISTS admin_settings (
      id VARCHAR(255) PRIMARY KEY,
      case_status BOOLEAN DEFAULT FALSE,
      case_assignment BOOLEAN DEFAULT FALSE,
      progress_tracking BOOLEAN DEFAULT FALSE,
      milestones BOOLEAN DEFAULT FALSE,
      client_fields BOOLEAN DEFAULT FALSE,
      client_portal_access BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMP DEFAULT NOW()
    )` },
    { name: 'onboarding', sql: `CREATE TABLE IF NOT EXISTS onboarding (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      step VARCHAR(100) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )`, indexes: ['CREATE INDEX IF NOT EXISTS idx_onboarding_organization_id ON onboarding(organization_id)'] },
    { name: 'subscriptions', sql: `CREATE TABLE IF NOT EXISTS subscriptions (
      id VARCHAR(255) PRIMARY KEY,
      organization_id VARCHAR(255),
      payment_method VARCHAR(50),
      status VARCHAR(50),
      current_period_end VARCHAR(20),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`, indexes: ['CREATE INDEX IF NOT EXISTS idx_subscriptions_organization_id ON subscriptions(organization_id)'] },
    { name: 'courts', sql: `CREATE TABLE IF NOT EXISTS courts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      jurisdiction VARCHAR(100),
      address TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`, indexes: ['CREATE INDEX IF NOT EXISTS idx_courts_name ON courts(name)'] },
  ];

  for (const table of statements) {
    log.info(`Creating table ${table.name}...`);
    try {
      await sql.query(table.sql);
      for (const indexSql of table.indexes || []) {
        await sql.query(indexSql);
      }
      log.success(`Table ${table.name} ready`);
    } catch (error) {
      log.error(`Table ${table.name} failed: ${error && error.message ? error.message : error}`);
      throw error;
    }
  }
}

async function seedTestUsers() {
  log.info('Seeding test users...');
  const users = [
    { id: 'u_advocate_001', email: 'advocate@wakiliworld.local', password: 'demo1234', role: 'advocate', username: 'Amina Wanjiru', email_verified: true },
    { id: 'u_client_001', email: 'client@wakiliworld.local', password: 'demo1234', role: 'individual', username: 'Brian Otieno', email_verified: true },
    { id: 'u_admin_001', email: 'admin@wakiliworld.local', password: 'demo1234', role: 'admin', username: 'Admin User', email_verified: true },
  ];
  for (const user of users) {
    await sql.query(
      `INSERT INTO users (id, email, username, password, role, status, email_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'Active', $6, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      [user.id, user.email, user.username, user.password, user.role, user.email_verified]
    );
    log.success(`Seeded ${user.email}`);
  }
}

async function main() {
  log.info('Starting Neon Postgres setup...');
  try {
    await ensureUsersTable();
    await ensureStandardTables();
    await seedTestUsers();
    log.success('Neon Postgres setup complete!');
    log.info('You can now set DATABASE_MODE=postgres in your environment.');
  } catch (error) {
    log.error(`Setup failed: ${error && error.message ? error.message : error}`);
    process.exit(1);
  }
}

main();
