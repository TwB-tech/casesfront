-- =====================================================
-- WAKILWORLD SUPABASE DATABASE SCHEMA
-- Production Ready - Security First
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SUPABASE COMPATIBLE SECURITY CONFIGURATION
-- =====================================================
-- NOTE: JWT secret is managed directly in Supabase dashboard under Auth Settings
-- You do not need to set this manually

-- =====================================================
-- ORGANIZATIONS (FIRM ISOLATION FOUNDATION)
-- =====================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  registration_number TEXT UNIQUE,
  address TEXT,
  phone TEXT,
  email CITEXT UNIQUE,
  plan_type TEXT DEFAULT 'free',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their organization" ON organizations
  FOR ALL USING (id = (auth.jwt() ->> 'organization_id')::uuid);

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'individual',
  title TEXT,
  bio TEXT,
  practice_areas TEXT[],
  timezone TEXT DEFAULT 'EAT',
  status TEXT DEFAULT 'Active',
  messaging_enabled BOOLEAN DEFAULT TRUE,
  deadline_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view users in their organization" ON users
  FOR SELECT USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- =====================================================
-- COURTS
-- =====================================================
CREATE TABLE courts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  jurisdiction TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CASES (ROW LEVEL SECURED)
-- =====================================================
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  case_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  start_date DATE,
  end_date DATE,
  client_id UUID REFERENCES users(id) ON DELETE SET NULL,
  advocate_id UUID REFERENCES users(id) ON DELETE SET NULL,
  court_id INTEGER REFERENCES courts(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access to own organization cases" ON cases
  FOR ALL USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- =====================================================
-- TASKS
-- =====================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  priority TEXT DEFAULT 'low',
  deadline TIMESTAMPTZ,
  status BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks access limited to organization" ON tasks
  FOR ALL USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- =====================================================
-- DOCUMENTS
-- =====================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  owner UUID NOT NULL REFERENCES users(id),
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  shared_with UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document access for organization or shared" ON documents
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid 
    OR owner = auth.uid() 
    OR auth.uid() = ANY(shared_with)
  );

-- =====================================================
-- CLIENT COMMUNICATIONS
-- =====================================================
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email CITEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  google_meet_link TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Communications restricted to organization" ON communications
  FOR ALL USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- =====================================================
-- INVOICES
-- =====================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_address TEXT,
  date DATE NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  tax NUMERIC(12,2) DEFAULT 0,
  amount_due NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  terms TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invoices limited to organization" ON invoices
  FOR ALL USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- =====================================================
-- INVOICE ITEMS
-- =====================================================
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  rate NUMERIC(12,2) NOT NULL,
  hours NUMERIC(8,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CHAT ROOMS
-- =====================================================
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  room_name TEXT UNIQUE NOT NULL,
  participants UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat rooms for organization members" ON chat_rooms
  FOR ALL USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND auth.uid() = ANY(participants)
  );

-- =====================================================
-- CHAT MESSAGES
-- =====================================================
CREATE TABLE chat_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages visible to room participants" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms cr
      WHERE cr.id = room_id 
      AND auth.uid() = ANY(cr.participants)
    )
  );

CREATE POLICY "Users can insert their own messages" ON chat_messages
  FOR INSERT WITH CHECK (sender = auth.uid());

-- =====================================================
-- PASSWORD RESET TOKENS
-- =====================================================
CREATE TABLE password_reset_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email CITEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT LOGS
-- =====================================================
CREATE TABLE audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_cases_organization ON cases(organization_id);
CREATE INDEX idx_cases_advocate ON cases(advocate_id);
CREATE INDEX idx_tasks_organization ON tasks(organization_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_invoices_organization ON invoices(organization_id);
CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_audit_organization ON audit_logs(organization_id);
CREATE INDEX idx_users_organization ON users(organization_id);

-- =====================================================
-- AUTOMATIC UPDATED_AT TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_organization_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_cases_updated_at
  BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_documents_updated_at
  BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_invoices_updated_at
  BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- AUDIT LOG TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION log_audit_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    table_name,
    record_id,
    changes
  ) VALUES (
    (auth.jwt() ->> 'organization_id')::uuid,
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    OLD.id::TEXT,
    jsonb_build_object('old', OLD, 'new', NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SUPABASE AUTH CONFIGURATION
-- =====================================================

-- Custom JWT claims are handled automatically in Supabase Auth triggers
-- Organization ID will be added to JWT tokens via Supabase Auth configuration
-- Configure this under Authentication > Hooks in Supabase dashboard

-- =====================================================
-- INITIAL DATA
-- =====================================================
INSERT INTO courts (name, jurisdiction) VALUES
('Milimani Commercial Court', 'Nairobi'),
('Nairobi High Court', 'Nairobi'),
('Kisumu Law Courts', 'Kisumu'),
('Mombasa Law Courts', 'Mombasa'),
('Eldoret Law Courts', 'Eldoret');

-- =====================================================
-- SUPABASE COMPATIBLE SECURITY GRANTS
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public 
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public 
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- Supabase requires explicit grant for audit logs
GRANT INSERT ON TABLE audit_logs TO authenticated;
GRANT SELECT ON TABLE audit_logs TO service_role;

-- =====================================================
-- POST DEPLOYMENT NOTES:
-- =====================================================
-- 1. Set your JWT secret in Supabase dashboard
-- 2. Enable custom access token hook
-- 3. Configure storage buckets for documents
-- 4. Set up realtime for chat
-- 5. Configure email provider for password reset
-- 6. Enable pg_cron for scheduled tasks
-- =====================================================
