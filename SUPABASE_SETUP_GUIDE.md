# Supabase Database Setup — UPDATED GUIDE

**Status:** Superadmin user (`tony@techwithbrands.com`) already created successfully.

**Next step:** Fix schema mismatches so the app works without errors.

---

## What Happened

You ran `supabase-create-superadmin-corrected.sql` first — ✅ success.

Then tried to run `supabase-schema-corrected.sql` — got error:

```
ERROR: 42710: policy "Users can only access their organization" for table "organizations" already exists
```

**Why:** The original `supabase_schema.sql` was already run earlier, which created tables and policies. The corrected schema tries to create policies again without dropping old ones → conflict.

**Fix:** The `supabase-schema-corrected.sql` has been updated to use `DROP POLICY IF EXISTS` before each `CREATE POLICY`. Now it's safe to run multiple times.

---

## Recommended Path (Starting from Current State)

**Your database currently has:**

- ✅ `auth.users` entry for tony@techwithbrands.com
- ✅ `public.users` entry (but possibly missing extended columns like `phone_number`, `alternative_phone_number`, etc.)
- ✅ Some tables exist (organizations, users, cases, tasks, etc.) from earlier schema run
- ❌ Missing columns that code expects (see below)
- ❌ Courts table may only have 3 entries (from old seed)

### Step 1: Run Migration to Add Missing Columns

Run **`supabase-migration-fixes.sql`** in Supabase SQL Editor.

This will:

- Add all missing `users` columns: `phone_number`, `alternative_phone_number`, `id_number`, `passport_number`, `date_of_birth`, `gender`, `address`, `nationality`, `occupation`, `marital_status`, `messaging_enabled`, `deadline_notifications`, `client_communication`, `task_management`
- Copy existing `phone` → `phone_number` data
- Add `status` column to `expenses`
- Fix `chat_messages` to support both `room` (text) and `room_id` (UUID) with a sync trigger
- Count and report courts quantity

**How:**

1. Supabase Dashboard → **SQL Editor**
2. Paste `supabase-migration-fixes.sql`
3. Click **Run**

### Step 2: Run Corrected Schema (Idempotent)

Run **`supabase-schema-corrected.sql`** in Supabase SQL Editor.

This will:

- Create any missing tables (`IF NOT EXISTS`)
- **Drop and recreate** all policies safely (no more "already exists" errors)
- (Re)create indexes and triggers (existing ones will be replaced)
- Insert the full 90+ Kenyan courts list (if not already present — uses `ON CONFLICT DO NOTHING`)

**How:**

1. In SQL Editor, paste `supabase-schema-corrected.sql`
2. Click **Run**

### Step 3: Verify

Run these checks in SQL Editor:

```sql
-- Users should have extended columns
SELECT column_name FROM information_schema.columns
WHERE table_name='users' AND column_name IN ('phone_number','alternative_phone_number','id_number','passport_number');
-- Should return 4 rows

-- Courts count should be 90+
SELECT COUNT(*) FROM courts;
-- Should be > 90

-- Expenses should have status column
SELECT column_name FROM information_schema.columns WHERE table_name='expenses' AND column_name='status';
-- Should return 1 row

-- Chat messages should have both room and room_id
SELECT column_name FROM information_schema.columns WHERE table_name='chat_messages' AND column_name IN ('room','room_id');
-- Should return 2 rows
```

---

## What Each File Does

| File                                       | Purpose                                                    | When to Run                        |
| ------------------------------------------ | ---------------------------------------------------------- | ---------------------------------- |
| `supabase-migration-fixes.sql`             | Adds missing columns to existing tables; fixes chat sync   | **Run NOW** (before anything else) |
| `supabase-schema-corrected.sql`            | Creates tables (if missing), sets policies, inserts courts | After migration                    |
| `supabase-create-superadmin-corrected.sql` | Creates Tony Kamau admin user                              | Already ran ✅                     |
| `supabase_schema.sql`                      | Original schema (has column mismatches)                    | **Do NOT use**                     |
| `supabase-schema-1.sql`                    | Alternate schema (different chat structure)                | **Do NOT use**                     |

---

## If You Want a Fresh Start (Wipe All Data)

```sql
-- In SQL Editor:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO service_role;
```

Then run in order:

1. `supabase-schema-corrected.sql`
2. `supabase-create-superadmin-corrected.sql`

**Warning:** This deletes all data. Only do this for brand new projects.

---

## Expected App Behavior After Fixes

- ✅ Courts dropdown shows 90+ Kenyan courts (not just 3)
- ✅ Expense Management: amounts formatted with user's selected currency
- ✅ PayrollManagement: amounts use dynamic currency symbol
- ✅ AccountingDashboard: charts format Y-axis ticks properly
- ✅ Reya AI: billing response shows `KSh 123,456` instead of hardcoded `$`
- ✅ Firms Marketplace: hourly rates show `$` or `KSh` etc. based on currency setting
- ✅ No console errors about missing columns
- ✅ Admin panel accessible to administrator role

---

## Environment Variables Reminder

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Do not commit `.env` to git.

---

## Troubleshooting

**Still getting "column X does not exist" after migration?**

- Re-run `supabase-migration-fixes.sql` (it's idempotent)
- Check column name spelling in error message vs. the added columns list

**"relation X already exists" on tables?**

- That's fine — `CREATE TABLE IF NOT EXISTS` prevents duplicates. The error is from something else (likely policies). Use corrected schema which drops policies first.

**"permission denied for auth.users" when creating superadmin?**

- Must run with service_role. SQL Editor in Supabase Dashboard uses service_role by default. Do NOT run this from frontend code.

**Courts still show only 3?**

- Check: `SELECT COUNT(*) FROM courts;` — if < 90, re-run the court INSERT from `supabase-schema-corrected.sql` (the block starting at line ~242)

---

Updated: 2026-04-19  
Last action: Fixed schema to be idempotent (DROP POLICY IF EXISTS), created migration for missing columns
