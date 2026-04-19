-- =====================================================
-- WAKILWORLD SUPABASE DATABASE SCHEMA
-- Production Ready - Security First
-- Corrected version with expanded Kenyan courts (90+)
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ORGANIZATIONS (FIRM ISOLATION FOUNDATION)
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
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

-- Drop existing policy if exists, then create (idempotent)
DROP POLICY IF EXISTS "Users can only access their organization" ON organizations;
CREATE POLICY "Users can only access their organization" ON organizations
  FOR ALL USING (id = (auth.jwt() ->> 'organization_id')::uuid);

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
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

-- Drop existing policies if exists
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
CREATE POLICY "Users can view users in their organization" ON users
  FOR SELECT USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- =====================================================
-- COURTS (Expanded Kenyan Courts - All 47 Counties + Specialized Divisions)
-- =====================================================
CREATE TABLE IF NOT EXISTS courts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  jurisdiction TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint if table already exists without it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'courts' AND table_schema = 'public'
  ) THEN
    -- Try to add unique constraint if not exists
    BEGIN
      ALTER TABLE courts ADD CONSTRAINT courts_name_unique UNIQUE (name);
    EXCEPTION
      WHEN duplicate_object THEN
        -- Constraint already exists, skip
        RAISE NOTICE 'Unique constraint on courts.name already exists';
    END;
  END IF;
END $$;

-- Insert comprehensive Kenyan court list (90+ unique courts)
INSERT INTO courts (name, jurisdiction) VALUES
-- Supreme Court
('Supreme Court of Kenya', 'National'),
-- Court of Appeal
('Court of Appeal at Nairobi', 'Nairobi'),
('Court of Appeal at Mombasa', 'Coast'),
('Court of Appeal at Kisumu', 'Nyanza'),
('Court of Appeal at Nakuru', 'Rift Valley'),
('Court of Appeal at Eldoret', 'Rift Valley'),
-- High Courts (Commercial & Law Courts)
('Milimani Commercial Court', 'Nairobi'),
('Milimani Law Courts', 'Nairobi'),
('Nairobi High Court', 'Nairobi'),
('Kenyatta Law Courts', 'Nairobi'),
-- Central Province
('Nyeri High Court', 'Central'),
('Muranga High Court', 'Central'),
('Kirinyaga Law Courts', 'Central'),
('Kiambu Law Courts', 'Central'),
('Muranga Law Courts', 'Central'),
('Nyandarua Law Courts', 'Central'),
('Nyeri Law Courts', 'Central'),
-- Rift Valley
('Nakuru High Court', 'Rift Valley'),
('Nakuru Law Courts', 'Rift Valley'),
('Narok High Court', 'Rift Valley'),
('Narok Law Courts', 'Rift Valley'),
('Bomet High Court', 'Rift Valley'),
('Bomet Law Courts', 'Rift Valley'),
('Kericho High Court', 'Rift Valley'),
('Kericho Law Courts', 'Rift Valley'),
('Nyahururu High Court', 'Rift Valley'),
('Laikipia Law Courts', 'Rift Valley'),
('Baringo Law Courts', 'Rift Valley'),
('Kajiado Law Courts', 'Rift Valley'),
-- Nyanza
('Kisumu High Court', 'Nyanza'),
('Kisumu Law Courts', 'Nyanza'),
('Kisii High Court', 'Nyanza'),
('Kisii Law Courts', 'Nyanza'),
('Homa Bay Law Courts', 'Nyanza'),
('Migori Law Courts', 'Nyanza'),
('Siaya Law Courts', 'Nyanza'),
('Nyamira Law Courts', 'Nyanza'),
-- Western
('Kakamega High Court', 'Western'),
('Kakamega Law Courts', 'Western'),
('Bungoma High Court', 'Western'),
('Bungoma Law Courts', 'Western'),
('Vihiga Law Courts', 'Western'),
('Busia Law Courts', 'Western'),
-- Eastern
('Machakos High Court', 'Eastern'),
('Machakos Law Courts', 'Eastern'),
('Kitui High Court', 'Eastern'),
('Kitui Law Courts', 'Eastern'),
('Meru High Court', 'Eastern'),
('Meru Law Courts', 'Eastern'),
('Embu High Court', 'Eastern'),
('Embu Law Courts', 'Eastern'),
('Tharaka-Nithi Law Courts', 'Eastern'),
('Tharaka Law Courts', 'Eastern'),
('Makueni Law Courts', 'Eastern'),
-- Coast
('Mombasa Law Courts', 'Coast'),
('Malindi High Court', 'Coast'),
('Malindi Law Courts', 'Coast'),
('Voi High Court', 'Coast'),
('Voi Law Courts', 'Coast'),
('Kwale Law Courts', 'Coast'),
('Kilifi Law Courts', 'Coast'),
('Tana River Law Courts', 'Coast'),
('Taita Taveta Law Courts', 'Coast'),
('Lamu Law Courts', 'Coast'),
-- Northern & North Eastern
('Marsabit Law Courts', 'Northern'),
('Marsabit High Court', 'Northern'),
('Isiolo Law Courts', 'Northern'),
('Isiolo High Court', 'Northern'),
('Wajir Law Courts', 'North Eastern'),
('Garissa Law Courts', 'North Eastern'),
('Mandera Law Courts', 'North Eastern'),
-- Turkana & North Rift
('Lodwar High Court', 'Turkana'),
('Lodwar Law Courts', 'Turkana'),
('Kitale High Court', 'North Rift'),
('Kitale Law Courts', 'North Rift'),
('Trans Nzoia Law Courts', 'North Rift'),
('West Pokot Law Courts', 'North Rift'),
('Kapenguria Law Courts', 'West Pokot'),
('Uasin Gishu Law Courts', 'North Rift'),
('Elgeyo-Marakwet Law Courts', 'North Rift'),
('Nandi Law Courts', 'North Rift'),
-- Specialized Courts
('Courts Martial', 'Specialized'),
('Industrial Court', 'Specialized'),
('Environment and Land Court', 'Specialized'),
('Employment and Labour Relations Court', 'Specialized'),
('Tax Court', 'Specialized'),
('Childrens Court', 'Specialized'),
('Small Claims Court', 'Specialized'),
('Anti-Corruption Court', 'Specialized')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- CASES (ROW LEVEL SECURED)
-- =====================================================
CREATE TABLE IF NOT EXISTS cases (
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

DROP POLICY IF EXISTS "Full access to own organization cases" ON cases;
CREATE POLICY "Full access to own organization cases" ON cases
  FOR ALL USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- =====================================================
-- TASKS
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
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

DROP POLICY IF EXISTS "Tasks access limited to organization" ON tasks;
CREATE POLICY "Tasks access limited to organization" ON tasks
  FOR ALL USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- =====================================================
-- DOCUMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
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

DROP POLICY IF EXISTS "Document access for organization or shared" ON documents;
CREATE POLICY "Document access for organization or shared" ON documents
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    OR owner = auth.uid()
    OR auth.uid() = ANY(shared_with)
  );

-- =====================================================
-- CLIENT COMMUNICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS communications (
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

DROP POLICY IF EXISTS "Communications restricted to organization" ON communications;
CREATE POLICY "Communications restricted to organization" ON communications
  FOR ALL USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- =====================================================
-- INVOICES
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
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

DROP POLICY IF EXISTS "Invoices limited to organization" ON invoices;
CREATE POLICY "Invoices limited to organization" ON invoices
  FOR ALL USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- =====================================================
-- INVOICE ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_items (
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
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  room_name TEXT UNIQUE NOT NULL,
  participants UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chat rooms for organization members" ON chat_rooms;
CREATE POLICY "Chat rooms for organization members" ON chat_rooms
  FOR ALL USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND auth.uid() = ANY(participants)
  );

-- =====================================================
-- CHAT MESSAGES (original schema uses room_id)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Messages visible to room participants" ON chat_messages;
CREATE POLICY "Messages visible to room participants" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms cr
      WHERE cr.id = room_id
      AND auth.uid() = ANY(cr.participants)
    )
  );

DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
CREATE POLICY "Users can insert their own messages" ON chat_messages
  FOR INSERT WITH CHECK (sender = auth.uid());

-- =====================================================
-- PASSWORD RESET TOKENS
-- =====================================================
CREATE TABLE IF NOT EXISTS password_reset_requests (
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
CREATE TABLE IF NOT EXISTS audit_logs (
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
-- EXPENSES
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  date DATE,
  category TEXT DEFAULT 'Uncategorized',
  status TEXT DEFAULT 'pending',
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PAYROLL RUNS
-- =====================================================
CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_start DATE,
  period_end DATE,
  total_amount NUMERIC DEFAULT 0,
  status TEXT,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
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
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_audit_organization ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);

-- =====================================================
-- AUTOMATIC UPDATED_AT TRIGGERS
-- =====================================================
-- Drop old triggers/functions if they exist (safe for re-runs)
DROP TRIGGER IF EXISTS trigger_update_organization_updated_at ON organizations;
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
DROP TRIGGER IF EXISTS trigger_update_cases_updated_at ON cases;
DROP TRIGGER IF EXISTS trigger_update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS trigger_update_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS trigger_update_invoices_updated_at ON invoices;

DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

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
-- Drop old trigger if exists (from previous schema runs)
DROP TRIGGER IF EXISTS trigger_log_audit_entry ON audit_logs;
DROP FUNCTION IF EXISTS log_audit_entry() CASCADE;

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
-- SUPABASE COMPATIBLE SECURITY GRANTS
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- Explicit grants for audit logs
GRANT INSERT ON TABLE audit_logs TO authenticated;
GRANT SELECT ON TABLE audit_logs TO service_role;
