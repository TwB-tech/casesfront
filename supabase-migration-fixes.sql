-- Minimal migration: only add missing columns that the code complains about
-- Run this after supabase-schema-corrected.sql

-- Users table: extended profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS alternative_phone_number TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_number TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS passport_number TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Not set';
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Kenyan';
ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS marital_status TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS messaging_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deadline_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS client_communication BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS task_management BOOLEAN DEFAULT TRUE;

UPDATE users SET phone_number = COALESCE(phone, '') WHERE phone_number IS NULL OR phone_number = '';

-- Expenses: status column
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Chat messages: need both room (TEXT for queries) and room_id (UUID for FK)
-- First add room column (if missing)
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS room TEXT;
-- Add room_id column (if missing)
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES chat_rooms(id);

-- Note: If you need the room/room_id sync, you can add it later via a simple trigger
-- For now, the app should work with both columns present
