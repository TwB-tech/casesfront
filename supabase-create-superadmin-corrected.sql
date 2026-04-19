-- =====================================================
-- SUPERADMIN USER CREATION FOR SUPABASE
-- Creates tony@techwithbrands.com with administrator role
-- Run this script in Supabase SQL Editor (with service_role key)
-- Compatible with supabase_schema.sql users table structure
-- =====================================================

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- 1. Create auth user (Supabase Auth)
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'tony@techwithbrands.com',
    crypt('Full888*', gen_salt('bf')),
    NOW(),
    '{"role":"administrator","full_name":"Tony Kamau"}'::jsonb,
    NOW(),
    NOW()
  );

  -- 2. Create profile in public.users (matching original schema columns)
  INSERT INTO public.users (
    id,
    username,
    email,
    phone,
    role,
    timezone,
    status,
    messaging_enabled,
    deadline_notifications,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'Tony Kamau',
    'tony@techwithbrands.com',
    '+254791472688',
    'administrator',
    'EAT',
    'Active',
    TRUE,
    TRUE,
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Superadmin user tony@techwithbrands.com created successfully with ID: %', new_user_id;
END $$;

-- =====================================================
-- POST-CREATION NOTES:
-- =====================================================
-- 1. Login: email tony@techwithbrands.com, password: Full888*
-- 2. Role: administrator in both auth metadata and public profile
-- 3. Email is confirmed (email_confirmed_at = NOW())
-- 4. Phone number set to +254791472688 (Tony Kamau's correct number)
-- 5. To reset password, use Supabase dashboard or admin API
-- =====================================================
