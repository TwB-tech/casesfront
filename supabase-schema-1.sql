-- Supabase Schema for WakiliWorld
-- This schema matches the data model expected by the frontend (case_id, owner, etc.)
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT,
  plan_type TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (profile data separate from auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  username TEXT,
  email TEXT,
  role TEXT DEFAULT 'individual',
  phone_number TEXT DEFAULT '',
  alternative_phone_number TEXT DEFAULT '',
  id_number TEXT DEFAULT '',
  passport_number TEXT DEFAULT '',
  date_of_birth DATE,
  gender TEXT DEFAULT 'Not set',
  address TEXT DEFAULT '',
  nationality TEXT DEFAULT 'Kenyan',
  occupation TEXT DEFAULT '',
  marital_status TEXT DEFAULT '',
  status TEXT DEFAULT 'Active',
  timezone TEXT DEFAULT 'EAT',
  messaging BOOLEAN DEFAULT true,
  client_communication BOOLEAN DEFAULT true,
  task_management BOOLEAN DEFAULT true,
  deadline_notifications BOOLEAN DEFAULT true,
  department TEXT DEFAULT '',
  position TEXT DEFAULT '',
  salary NUMERIC DEFAULT 0,
  hire_date DATE,
  organization_id UUID REFERENCES organizations(id),
  user_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courts table
CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT UNIQUE,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'open',
  start_date DATE,
  end_date DATE,
  client_id UUID REFERENCES users(id),
  advocate_id UUID REFERENCES users(id),
  court_id UUID REFERENCES courts(id),
  organization JSONB DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  assigned_to UUID REFERENCES users(id),
  case_id UUID REFERENCES cases(id),
  priority TEXT DEFAULT 'low',
  deadline TIMESTAMPTZ,
  status BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  owner UUID REFERENCES users(id),
  shared_with UUID[] DEFAULT '{}',
  file TEXT,
  uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES organizations(id)
);

-- Communications table
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  subject TEXT,
  message TEXT,
  google_meet_link TEXT DEFAULT '',
  created_by UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invites table (employee invitations)
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'employee',
  department TEXT DEFAULT '',
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE,
  client_name TEXT,
  client_address TEXT,
  crn TEXT,
  total_amount NUMERIC DEFAULT 0,
  total TEXT,
  tax TEXT,
  amount_due TEXT,
  items JSONB DEFAULT '[]',
  account_number TEXT,
  account_name TEXT,
  bank_detail TEXT,
  terms TEXT,
  signature TEXT,
  status TEXT,
  date DATE,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_name TEXT UNIQUE,
  participants UUID[],
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room TEXT,
  sender UUID REFERENCES users(id),
  content TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  attachments JSONB,
  organization_id UUID REFERENCES organizations(id)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action TEXT,
  table_name TEXT,
  record_id TEXT,
  changes JSONB,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  date DATE,
  category TEXT DEFAULT 'Uncategorized',
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payroll runs table
CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_start DATE,
  period_end DATE,
  total_amount NUMERIC DEFAULT 0,
  status TEXT,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  settings JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  plan_type TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding table
CREATE TABLE IF NOT EXISTS onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  step TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cases_organization ON cases(organization_id);
CREATE INDEX IF NOT EXISTS idx_cases_client ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_advocate ON cases(advocate_id);
CREATE INDEX IF NOT EXISTS idx_tasks_organization ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_case ON tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_organization ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner);
CREATE INDEX IF NOT EXISTS idx_invoices_organization ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_communications_organization ON communications(organization_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON chat_messages(room);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON chat_messages(sender);
CREATE INDEX IF NOT EXISTS idx_expenses_organization ON expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_payroll_organization ON payroll_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);

-- Row Level Security (optional, enable if needed)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- etc.

-- Sample data for testing (optional)
-- INSERT INTO courts (name) VALUES ('Milimani Commercial Court'), ('Nairobi High Court'), ('Kisumu Law Courts');
