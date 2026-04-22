# Supabase → Appwrite Migration Guide

## Quick Summary

| Aspect        | Supabase                     | Appwrite                                        |
| ------------- | ---------------------------- | ----------------------------------------------- |
| **Type**      | PostgreSQL (SQL)             | Document store (NoSQL)                          |
| **Auth**      | Built-in JWT                 | Built-in Account API                            |
| **RLS**       | Row-level security policies  | DB-level roles + app filtering                  |
| **Realtime**  | Postgres changes → WebSocket | Built-in WebSocket                              |
| **Storage**   | S3-compatible buckets        | S3-compatible storage                           |
| **Pricing**   | Free tier: 50K MAU           | Free tier: 10 projects, 2GB DB, 750K executions |
| **Self-host** | Yes (Docker)                 | Yes (single binary)                             |

---

## Migration Checklist

### Phase 0: Preparation (1 hour)

1. **Backup Supabase data** (SQL dump)

   ```bash
   # In Supabase SQL Editor:
   SELECT pg_dump > backup.sql
   ```

2. **Create Appwrite account** at https://cloud.appwrite.io
   - Free forever for <10 team members
   - Create project: "wakiliworld"
   - Note `PROJECT_ID` from project settings

3. **Generate API key**
   - Settings → API Keys → Create key with **Full Access** (or Database scope only)
   - Copy the key (starts with `aa...` or `bb...`)

4. **Set environment variables** in `.env`:

   ```bash
   DATABASE_MODE=appwrite
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=your-api-key
   APPWRITE_DATABASE_ID=default
   ```

5. **Install Appwrite SDK**:
   ```bash
   npm install @appwrite/sdk-client
   ```

---

### Phase 1: Database Schema (30 min)

Using **Appwrite Console**:

1. Go to Database tab
2. Click **+ Add Database**
   - Name: `wakiliworld-db`
   - Database ID: `default` (or leave auto-generated, note the ID)
3. Click into database → **+ Add Collection** 18 times (see `docs/APPWRITE_COLLECTIONS_SETUP.md`)
4. For each collection, create attributes exactly as specified in the setup doc

**Alternatively**: Use Appwrite CLI to import schema:

```bash
npx appwrite import-collections --file ./schemas/appwrite-collections.json
```

---

### Phase 2: Code Migration (Already Done)

The following files have been created/modified:

| File                      | Change                                                                      |
| ------------------------- | --------------------------------------------------------------------------- |
| `src/lib/appwrite.js`     | **NEW** - Appwrite client wrapper                                           |
| `src/lib/appwriteApi.jsx` | **NEW** - Full API layer (mirrors Supabase)                                 |
| `src/config/index.js`     | **UPDATED** - Added `USE_APPWRITE` flag and `APPWRITE_CONFIG`               |
| `src/axiosConfig.jsx`     | **UPDATED** - Routes to appwriteApi when `DATABASE_MODE=appwrite`           |
| `package.json`            | **UPDATED** - Removed `@supabase/supabase-js`, added `@appwrite/sdk-client` |

No frontend component changes needed — API shape is identical.

---

### Phase 3: Dual-Write (Optional, 1 week)

For zero-downtime migration, enable dual-write:

1. Set env vars:

   ```bash
   DATABASE_MODE=appwrite
   DUAL_WRITE_MODE=true
   VITE_ENABLE_FALLBACK=true
   ```

2. This writes to **both** Appwrite (primary) and Supabase (backup)
3. Run for 7 days, monitor logs for errors
4. If all good, disable dual-write:
   ```bash
   DUAL_WRITE_MODE=false
   ```

---

### Phase 4: Cutover (5 minutes)

1. Stop server (`Ctrl+C`)
2. Ensure no pending writes to Supabase
3. Update env:
   ```bash
   DATABASE_MODE=appwrite
   DUAL_WRITE_MODE=false
   ```
4. Restart server: `npm run dev`
5. Test all core flows:
   - Login → Dashboard loads
   - Create case → visible in Cases tab
   - Create task → visible in Tasks tab
   - Upload document → visible in Documents
   - HR → Invite employee → email sent

---

### Phase 5: Cleanup (optional)

After 2 weeks of stable operation:

1. **Remove Supabase entirely**:

   ```bash
   npm uninstall @supabase/supabase-js
   ```

   Already done.

2. **Remove fallback code** in `axiosConfig.jsx` (optional)

3. **Delete legacy files**:
   - `src/lib/supabase.jsx`
   - `src/lib/supabaseApi.jsx`
   - Any `SUPABASE_*` env vars (comment out)

---

## Data Migration Script

Run the provided migration script to transfer existing data from Supabase to Appwrite:

```bash
# Create .env.migration (copy from .env with service key)
cp .env .env.migration
# Edit .env.migration: add SUPABASE_SERVICE_KEY and APPWRITE_API_KEY

# Run migration
node scripts/migrate-to-appwrite.js
```

**Notes**:

- Migrates tables in dependency order (organizations → users → cases → ...)
- Progress shown per collection
- Errors logged, continues on failure
- Report saved to `migration-report.json`
- **Idempotent**: Re-running won't duplicate (Appwrite returns error on duplicate IDs → script continues)

---

## Environment Variables Reference

```bash
# =============== DATABASE ===============
DATABASE_MODE=appwrite           # 'supabase' | 'appwrite' | 'standalone'

# Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=p-xxxxx      # From project settings
APPWRITE_API_KEY=key-xxxxx       # API key with database write access
APPWRITE_DATABASE_ID=default     # or your custom DB ID

# Vite-prefixed (also required)
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=p-xxxxx
VITE_APPWRITE_API_KEY=key-xxxxx

# =============== FEATURE FLAGS ===========
DUAL_WRITE_MODE=false           # true = write to both DBs
VITE_ENABLE_FALLBACK=false       # true = fallback to secondary on error

# =============== AI =======================
GROQ_API_KEY=your-groq-key
ZAI_API_KEY=your-zai-key          # optional

# =============== EMAIL ====================
RESEND_API_KEY=your-resend-key    # optional (for invites)

# =============== OTHER ====================
# ... keep existing vars (SENTRY_DSN, GA_ID, etc.)
```

---

## Rollback Procedure

If Appwrite migration fails or causes issues:

```bash
# 1. Revert DATABASE_MODE
DATABASE_MODE=supabase

# 2. Restart app
npm run dev

# 3. App reverts to Supabase instantly
# No data loss — Supabase never modified during read-only test
```

**Note**: During dual-write phase, both databases are updated. If you need to sync back to Supabase, manually copy Appwrite data → Supabase (not automated).

---

## Testing Validation

After migration, run these checks:

1. **Auth**: Login → redirect → user data loaded
2. **Cases**: List cases → show all cases for org
3. **Tasks**: Create task → appears in list
4. **Documents**: Upload doc → visible in Documents tab
5. **HR**: Invite employee → receives email (check Resend logs)
6. **Reya**: Open widget → interacts with AI
7. **Payroll**: View payroll runs table

All existing Playwright tests should pass:

```bash
npm run test
```

---

## Troubleshooting

### Error: "Collection not found"

**Cause**: Collection ID mismatch.
**Fix**: Ensure COLLECTIONS constant in `src/lib/appwrite.js` matches exactly the collection IDs in Appwrite Console.

### Error: "Permission denied"

**Cause**: Role not assigned for collection.
**Fix**: In Appwrite Console → Collection → Settings → Permissions → Add role (`any`, `users`, `admins`) for Read/Write.

### Error: "Document not found" after migration

**Cause**: Wrong Database ID.
**Fix**: Ensure `APPWRITE_DATABASE_ID` env var matches the actual DB ID shown in Console.

### Slow queries

**Cause**: No indexes on foreign key fields.
**Fix**: Add indexes on `organization_id`, `user_id`, `client_id`, `advocate_id`, `owner` in collection settings.

### Migrated data not showing

**Cause**: RLS-style filtering not applied.
**Fix**: Appwrite doesn't have RLS — `appwriteApi.jsx` filters by `organization_id` automatically. Verify `organization_id` field is populated on migrated documents.

### Email not sent on invite

**Cause**: `sendEmployeeInvite` function uses Resend; `RESEND_API_KEY` not set.
**Fix**: Set `RESEND_API_KEY` in env, or check console for error logs.

---

## Cost & Limits

**Appwrite Cloud Free Tier**:

- 2 Projects
- 10 Members
- 2 GB Database storage
- 750K DB operations/month
- 2 GB File storage
- 750K Functions executions/month
- 5 GB Bandwidth/month

**At scale (50 employees)**:

- 50 users → exceed 10-member limit → **Pro plan required ($25/month)**
- Storage: ~500 MB → fits in 2 GB
- DB ops: ~50K/mo → fits in 750K
- Bandwidth: ~10 GB → exceeds 5 GB → overages $15/100GB

**Annual cost estimate**:

- Free tier (0-10 users): $0
- 10-100 users (Pro): $25/mo × 12 = $300/year
- Storage/egress overages: ~$5-10/mo

---

## Support & Resources

- Appwrite Docs: https://appwrite.io/docs
- Migration Guide: https://appwrite.io/docs/migration
- Discord Community: https://appwrite.io/discord
- GitHub Issues: https://github.com/appwrite/appwrite/issues

---

## Next Steps

After successful migration:

1. Monitor logs for 1 week
2. Archive old Supabase project (read-only backup)
3. Update README with Appwrite setup instructions
4. Add Appwrite status check to health endpoint
5. Notify team of new system

---

**Questions?** Contact: [your-email] or open GitHub issue.
