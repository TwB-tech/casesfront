# Appwrite Quick Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher) - https://nodejs.org
2. **Appwrite CLI** (optional, for command-line setup)
3. **Appwrite account** - https://cloud.appwrite.io

---

## Method 1: One-Command Setup (Recommended)

### Step 1: Install Appwrite CLI

```bash
npm install -g appwrite-cli
```

### Step 2: Login to Appwrite

```bash
# Get your API key from: https://cloud.appwrite.io → Project → Settings → API Keys
# Create a key with "Full Access" or at least "Database Write" scope

appwrite login
# Enter your email and password for cloud.appwrite.io
```

### Step 3: Create Project & Database

```bash
# Create project
appwrite projects create --name wakiliworld --description "WakiliWorld Legal Practice Management"

# Note the PROJECT_ID from output
# Create database (Appwrite Cloud auto-creates 'default' DB)
# For self-hosted, you may need: appwrite databases create --name wakiliworld-db
```

### Step 4: Import Schema

```bash
# From project root, import collections from JSON schema:
appwrite import-collections --file ./schemas/appwrite-schema.json

# This creates all 18 collections with attributes and permissions in ~30 seconds
```

**That's it!** Your database is ready.

---

## Method 2: Node.js Script (Alternative)

If you prefer running a script or need more control:

```bash
# 1. Ensure .env has credentials:
cat >> .env << 'EOF'
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id-here
APPWRITE_API_KEY=key-xxxxxxxxxxxxxxxxxxxx
APPWRITE_DATABASE_ID=default
EOF

# 2. Run setup script
node scripts/setup-appwrite.js
```

The script creates:

- All 18 collections
- All attributes with correct types
- Basic read/write permissions

**Note:** Indexes (for performance) need to be created manually in Appwrite Console → Database → Collection → Indexes tab. See below.

---

## Method 3: Manual via Console (UI)

If you prefer click-through setup:

1. Go to https://cloud.appwrite.io → Your Project
2. Database → **+ Add Database** → Name: `wakiliworld-db` (or note the existing 'default')
3. For each collection name in [APPWRITE_COLLECTIONS_SETUP.md](./APPWRITE_COLLECTIONS_SETUP.md), do:
   - **+ Add Collection** → Enter collection name
   - **+ Add Attribute** → Add each field (see table in docs)
   - **Settings** → Permissions → Set Read/Write roles
4. Repeat for all 18 collections
5. Add indexes (Database → Collection → Indexes → + Add Index):
   - `invites.token` (unique, ascending)
   - `invites.email` (ascending)
   - `users.email` (unique, ascending)
   - `cases.organization_id` (ascending)
   - `cases.client_id` (ascending)
   - `cases.advocate_id` (ascending)

---

## Verifying Setup

After setup, verify collections exist:

```bash
# Using Appwrite CLI
appwrite databases list-collections --database-id default

# Expected output: list of 18 collections
# - organizations
# - users
# - courts
# - cases
# - tasks
# - documents
# - communications
# - invites
# - invoices
# - invoice_items
# - chat_rooms
# - chat_messages
# - audit_logs
# - expenses
# - payroll_runs
# - admin_settings
# - subscriptions
# - onboarding
```

Check a specific collection:

```bash
appwrite databases get-collection --database-id default --collection-id users
```

---

## Creating Indexes (Important for Performance)

Indexes speed up queries. Create these in the Appwrite Console:

### Via Console (UI):

1. Database → Select collection
2. **Indexes** tab → **+ Create Index**
3. Enter:
   - **Key**: field name (e.g., `organization_id`)
   - **Type**: `Ascending` or `Unique`
   - **Attributes**: (leave empty for single-field index)

### Via Appwrite CLI (better):

```bash
# Create index for invites.token (unique)
appwrite databases create-index \
  --database-id default \
  --collection-id invites \
  --key token \
  --type unique \
  --attributes token

# Create other indexes similarly
appwrite databases create-index --database-id default --collection-id invites --key email --type ascending
appwrite databases create-index --database-id default --collection-id users --key email --type unique
appwrite databases create-index --database-id default --collection-id cases --key organization_id --type ascending
appwrite databases create-index --database-id default --collection-id cases --key client_id --type ascending
appwrite databases create-index --database-id default --collection-id cases --key advocate_id --type ascending
```

**Tip**: Put these in a script `scripts/create-indexes.sh`.

---

## Common Issues & Fixes

### "Permission denied" errors

**Cause**: Role not in collection's read/write list.
**Fix**: In Appwrite Console → Database → Collection → Settings → Permissions → Add role to Read/Write.

### "Collection not found"

**Cause**: Database ID mismatch.
**Fix**: Ensure `APPWRITE_DATABASE_ID` matches your actual DB (usually `default` for cloud).

### "Attribute already exists"

**Cause**: Re-running setup creates duplicates.
**Fix**: Delete collection and re-create, or manually remove duplicate attributes.

### Client-side errors: "account is not initialized"

**Cause**: Appwrite SDK imported but `DATABASE_MODE` not set to `appwrite`.
**Fix**: Set `DATABASE_MODE=appwrite` in `.env` and restart dev server.

### Migration script won't run

**Cause**: Missing `SUPABASE_SERVICE_KEY`.
**Fix**: You need Supabase **Service Role Key** (not anon key). Get it from Supabase → Settings → API → Service Role Key.

---

## After Setup

1. **Test locally**:

   ```bash
   npm run dev
   # Login → Dashboard → Cases should load
   ```

2. **Run migration** (if you have Supabase data):

   ```bash
   node scripts/migrate-to-appwrite.js
   ```

3. **Run tests**:

   ```bash
   npm run test
   ```

4. **Deploy to Vercel**:

   ```bash
   # Set environment variables in Vercel dashboard or CLI:
   # DATABASE_MODE=appwrite
   # APPWRITE_PROJECT_ID=...
   # APPWRITE_API_KEY=...
   # APPWRITE_DATABASE_ID=default

   vercel --prod
   ```

---

## Next Steps

- [ ] Create Appwrite project and get keys
- [ ] Run one of the 3 setup methods above
- [ ] Verify collections exist (18 total)
- [ ] Create required indexes
- [ ] Set `DATABASE_MODE=appwrite` in `.env`
- [ ] Test app locally
- [ ] Migrate data (if applicable)
- [ ] Deploy to production

---

## Cheat Sheet

| Task              | Command                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| Install CLI       | `npm install -g appwrite-cli`                                                                             |
| Login             | `appwrite login`                                                                                          |
| List projects     | `appwrite projects list`                                                                                  |
| List collections  | `appwrite databases list-collections --database-id default`                                               |
| Get collection    | `appwrite databases get-collection --database-id default --collection-id users`                           |
| Import schema     | `appwrite import-collections --file ./schemas/appwrite-schema.json`                                       |
| Create index      | `appwrite databases create-index --database-id default --collection-id invites --key token --type unique` |
| Delete collection | `appwrite databases delete-collection --database-id default --collection-id invites`                      |

---

**Need help?** See `docs/MIGRATION_SUPABASE_TO_APPWRITE.md` for full migration guide.
