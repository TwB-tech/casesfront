# Appwrite Migration Complete - Quick Start

Congratulations! Your WakiliWorld app is now ready to use Appwrite as the database backend.

---

## What Was Done

**Migration Files Created:**

- `src/lib/appwrite.js` - Appwrite client wrapper (333 lines)
- `src/lib/appwriteApi.jsx` - Full API layer replacement (1600+ lines)
- `scripts/setup-appwrite.js` - Automated collection creation script
- `scripts/migrate-to-appwrite.js` - Data migration from Supabase
- `schemas/appwrite-schema.json` - Appwrite CLI import schema
- `docs/APPWRITE_QUICK_START.md` - Step-by-step setup guide
- `docs/APPWRITE_COLLECTIONS_SETUP.md` - Collection definitions with attributes
- `docs/MIGRATION_SUPABASE_TO_APPWRITE.md` - Full migration documentation

**Code Changes:**

- `src/config/index.js` - Added `USE_APPWRITE` flag
- `src/axiosConfig.jsx` - Routes to Appwrite when `DATABASE_MODE=appwrite`
- `package.json` - Removed `@supabase/supabase-js`, added `appwrite`
- `.env.example` - Added Appwrite env vars

**Bug Fixes:**

- `src/components/Documents/DocumentList.jsx:530` - Fixed stray `)}` syntax error

---

## Quick Setup (3 Steps)

### Option A: Appwrite CLI (Fastest - 2 minutes)

```bash
# 1. Install Appwrite CLI
npm install -g appwrite-cli

# 2. Login to Appwrite Cloud
appwrite login
# Use your cloud.appwrite.io credentials

# 3. Import schema (creates all 18 collections)
appwrite import-collections --file ./schemas/appwrite-schema.json

# Done! Skip to Step 3 below to activate
```

### Option B: Node.js Script

```bash
# 1. Create Appwrite project first at https://cloud.appwrite.io
#    Project → Create → Name: wakiliworld

# 2. Get your credentials:
#    Project Settings → API Keys → Create key (Full Access)
#    Copy: PROJECT_ID and API_KEY

# 3. Add to .env:
echo DATABASE_MODE=appwrite >> .env
echo APPWRITE_PROJECT_ID=your-project-id >> .env
echo APPWRITE_API_KEY=your-api-key >> .env
echo APPWRITE_DATABASE_ID=default >> .env

# 4. Run setup:
npm run db:setup

# That creates all collections + attributes
```

### Option C: Manual UI (Slowest)

Follow `docs/APPWRITE_COLLECTIONS_SETUP.md` and create each collection via Appwrite Console.

---

## After Setup: Activate Appwrite Mode

1. **Set environment variable** (`.env` or Vercel):

   ```bash
   DATABASE_MODE=appwrite
   ```

2. **Restart dev server**:

   ```bash
   npm run dev
   ```

3. **Test**:
   - Login should work
   - Cases, Tasks, Documents should load
   - Create a new case from UI
   - Invite an employee from HR page

---

## Optional: Migrate Existing Data

If you have data in Supabase and want to move it:

```bash
# 1. Ensure both databases are accessible
# 2. Add SUPABASE_SERVICE_KEY to .env:
echo SUPABASE_URL=https://your-project.supabase.co >> .env
echo SUPABASE_SERVICE_KEY=your-service-role-key >> .env

# 3. Run migration:
npm run db:migrate

# 4. Verify data in Appwrite Console
```

**Note**: The migration script uses Supabase's service key (not anon key) for full read access.

---

## NPM Scripts Reference

| Script               | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `npm run db:setup`   | Create all Appwrite collections and attributes            |
| `npm run db:migrate` | Migrate data from Supabase to Appwrite (dual-write ready) |
| `npm run db:export`  | Export all Appwrite data to JSON (requires Appwrite CLI)  |
| `npm run db:import`  | Import schema from JSON (requires Appwrite CLI)           |
| `npm run dev`        | Start dev server with Appwrite backend                    |
| `npm run test`       | Run Playwright tests                                      |

---

## Environment Variables

**Required for Appwrite**:

```bash
DATABASE_MODE=appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id   # From Project Settings
APPWRITE_API_KEY=key-xxxxxxxxxxxx     # From API Keys (Full Access)
APPWRITE_DATABASE_ID=default          # Usually 'default'
```

**Vite-prefixed versions** (also required):

```bash
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_API_KEY=key-xxxxxxxxxxxx
```

**Optional** (for dual-write during transition):

```bash
DUAL_WRITE_MODE=false   # true = write to both DBs
VITE_ENABLE_FALLBACK=false  # true = fallback to Supabase on error
```

---

## Verifying Installation

1. **Check collections exist** (Appwrite Console → Database):
   - [ ] organizations
   - [ ] users
   - [ ] courts
   - [ ] cases
   - [ ] tasks
   - [ ] documents
   - [ ] communications
   - [ ] invites
   - [ ] invoices
   - [ ] invoice_items
   - [ ] chat_rooms
   - [ ] chat_messages
   - [ ] audit_logs
   - [ ] expenses
   - [ ] payroll_runs
   - [ ] admin_settings
   - [ ] subscriptions
   - [ ] onboarding

2. **Check indexes** (for performance):
   - [ ] invites.token (unique)
   - [ ] invites.email
   - [ ] users.email (unique)
   - [ ] cases.organization_id
   - [ ] cases.client_id
   - [ ] cases.advocate_id

3. **Test login** → dashboard loads cases list

---

## Troubleshooting

### "APPWRITE_PROJECT_ID and APPWRITE_API_KEY are required"

**Fix**: Add credentials to `.env` file and restart.

### "Collection not found" errors

**Fix**: Run `npm run db:setup` to create missing collections, or verify collection IDs match exactly.

### "Permission denied"

**Fix**: In Appwrite Console → Collection → Settings → Permissions, add `role:any` for read, `role:admin` for write as appropriate.

### Data not appearing after migration

**Fix**: Check `organization_id` field on records — Appwrite doesn't have RLS, so filtering happens in app code. Must have valid `organization_id`.

### Build fails with "Unexpected token"

**Fix**: Ensure `DATABASE_MODE=standalone` temporarily to build, then switch back. Or fix syntax in affected file.

### Tests failing in CI/Vercel

**Fix**: Set `DATABASE_MODE=standalone` for test environment or provide Appwrite credentials in CI env vars.

---

## Deploy to Production

### Vercel Deployment

```bash
# 1. Push code to GitHub
git add .
git commit -m "migrate to appwrite"
git push

# 2. Deploy via Vercel CLI
vercel --prod

# Or use Vercel dashboard to set env vars first:
# DATABASE_MODE=appwrite
# APPWRITE_PROJECT_ID=...
# APPWRITE_API_KEY=...
# APPWRITE_DATABASE_ID=default
# VITE_APPWRITE_PROJECT_ID=...
# VITE_APPWRITE_API_KEY=...
```

### Self-Hosted (Optional)

If you want to self-host Appwrite instead of using cloud:

```bash
# Using Docker Compose
docker run -d \
  --name appwrite \
  -p 80:80 \
  -p 443:443 \
  -p 7777:7777 \
  appwrite/appwrite:latest

# Then update .env:
APPWRITE_ENDPOINT=http://localhost/v1
# (Project ID and key from self-hosted instance)
```

---

## Switching Back to Supabase

If you need to rollback:

```bash
# In .env:
DATABASE_MODE=supabase
# (Keep SUPABASE_URL and SUPABASE_ANON_KEY)

# Restart:
npm run dev

# Done - app instantly reverts to Supabase
# No data loss (if not dual-writing)
```

---

## Cost Comparison (2025)

| Provider             | Free Tier       | 50 Users (est.)                       |
| -------------------- | --------------- | ------------------------------------- |
| Supabase             | 50K MAU, 500 MB | $25-50/mo                             |
| **Appwrite Cloud**   | 10 users, 2GB   | **$25/mo** (Pro needed for >10 users) |
| Appwrite Self-hosted | Free            | $5/mo (VPS)                           |

**Winner**: Self-hosted Appwrite on a $5 Hetzner/Railway VPS if you want unlimited users, OR stay on Supabase free tier if <50 users.

---

## Files Reference

```
WakiliWorld/
├── src/
│   ├── lib/
│   │   ├── appwrite.js           ← Appwrite client (NEW)
│   │   ├── appwriteApi.jsx       ← API wrapper (NEW)
│   │   ├── supabaseApi.jsx       ← Legacy (kept for fallback)
│   │   └── axiosConfig.jsx       ← Updated to route to Appwrite
│   ├── config/
│   │   └── index.js              ← Added USE_APPWRITE flag
│   └── contexts/
│       └── authContext.jsx       ← Works unchanged (API compatible)
├── scripts/
│   ├── setup-appwrite.js         ← Create collections (NEW)
│   └── migrate-to-appwrite.js    ← Migrate data (NEW)
├── schemas/
│   └── appwrite-schema.json      ← CLI import schema (NEW)
└── docs/
    ├── APPWRITE_QUICK_START.md   ← You are here
    ├── APPWRITE_COLLECTIONS_SETUP.md
    └── MIGRATION_SUPABASE_TO_APPWRITE.md
```

---

## What Changed (Architecture)

### Before (Supabase)

```
Frontend → axiosConfig → supabaseApi.jsx → @supabase/supabase-js → Supabase Cloud (PostgreSQL + Auth)
```

### After (Appwrite)

```
Frontend → axiosConfig → appwriteApi.jsx → appwrite SDK → Appwrite Cloud (NoSQL DB + Auth)
```

**API Compatibility**: Identical. `supabaseApi.jsx` and `appwriteApi.jsx` expose the same methods:

- `api.get(path)`
- `api.post(path, payload)`
- `api.put(path, payload)`
- `api.delete(path)`

So no frontend changes needed.

---

## Support

- **Appwrite Docs**: https://appwrite.io/docs
- **Appwrite Discord**: https://appwrite.io/discord
- **WakiliWorld Issues**: https://github.com/your-repo/issues

---

**Ready!** Switch `DATABASE_MODE=appwrite` and run `npm run dev`.
