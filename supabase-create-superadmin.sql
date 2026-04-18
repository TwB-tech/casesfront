-- =====================================================
-- SUPERADMIN USER CREATION FOR SUPABASE
-- Creates tony@techwithbrands.com with administrator role
-- Run this script in Supabase SQL Editor (with service_role)
-- =====================================================

-- Note: This script requires the pgcrypto extension for gen_random_uuid() and crypt()
-- It is usually already enabled in Supabase.

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
    '{"role":"administrator","full_name":"Tony Brands"}'::jsonb,
    NOW(),
    NOW()
  );

  -- 2. Create profile in public.users
  INSERT INTO public.users (
    id,
    username,
    email,
    role,
    phone_number,
    alternative_phone_number,
    id_number,
    passport_number,
    date_of_birth,
    gender,
    address,
    nationality,
    occupation,
    marital_status,
    status,
    timezone,
    messaging_enabled,
    deadline_notifications,
    client_communication,
    task_management,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'Tony Brands',
    'tony@techwithbrands.com',
    'administrator',
    '+254700000006',
    '+254711000006',
    '62345678',
    'F1234567',
    '1985-04-15'::date,
    'Male',
    'Nairobi, Kenya',
    'Kenyan',
    'CEO',
    'Married',
    'Active',
    'EAT',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Superadmin user tony@techwithbrands.com created successfully with ID: %', new_user_id;
END $$;

-- =====================================================
-- Post-Creation Notes:
-- 1. The user can now log in with email tony@techwithbrands.com and password Full888*
-- 2. Role is set as 'administrator' in both auth metadata and public profile
-- 3. Email is already confirmed (email_confirmed_at set to NOW())
-- 4. If you need to reset the password, use Supabase dashboard or admin API
-- =====================================================
