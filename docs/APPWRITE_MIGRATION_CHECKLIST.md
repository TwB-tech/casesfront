# Appwrite Migration Checklist

Use this checklist to track your migration progress from Supabase to Appwrite.

---

## Pre-Migration

- [ ] Backed up Supabase database (SQL dump)
- [ ] Created Appwrite account at https://cloud.appwrite.io
- [ ] Created Appwrite project named "wakiliworld"
- [ ] Generated API key with Full Access (or Database scope)
- [ ] Copied PROJECT_ID and API_KEY to `.env`
- [ ] Installed dependencies: `npm install`
- [ ] Build passes: `npm run build` ✓

---

## Database Setup

- [ ] Ran `npm run db:setup` **OR**
- [ ] Ran `appwrite import-collections --file ./schemas/appwrite-schema.json`
- [ ] Verified 18 collections exist in Appwrite Console
- [ ] Created indexes:
  - [ ] `invites.token` (unique)
  - [ ] `invites.email`
  - [ ] `users.email` (unique)
  - [ ] `cases.organization_id`
  - [ ] `cases.client_id`
  - [ ] `cases.advocate_id`
  - [ ] `documents.owner`
  - [ ] `tasks.organization_id`

---

## Configuration

- [ ] Set `DATABASE_MODE=appwrite` in `.env`
- [ ] Set `APPWRITE_PROJECT_ID` in `.env`
- [ ] Set `APPWRITE_API_KEY` in `.env`
- [ ] Set `APPWRITE_DATABASE_ID=default` in `.env`
- [ ] Set Vite-prefixed env vars: `VITE_APPWRITE_PROJECT_ID` and `VITE_APPWRITE_API_KEY`
- [ ] Restarted dev server after env changes

---

## Testing (Local)

- [ ] App starts without errors: `npm run dev`
- [ ] Login page loads
- [ ] Can login with existing credentials
- [ ] Dashboard loads with user info
- [ ] Cases list loads (with data if migrated)
- [ ] Can create a new case
- [ ] Tasks list loads
- [ ] Can create a new task
- [ ] Documents list loads
- [ ] Can upload a document
- [ ] AI document generator works (Reya responds)
- [ ] HR page loads employees list
- [ ] Can invite new employee (email sent)
- [ ] Invitations list loads in HR
- [ ] Invoice creation works
- [ ] No console errors during normal usage

---

## Data Migration (Optional)

Only if migrating existing Supabase data:

- [ ] Added `SUPABASE_URL` to `.env`
- [ ] Added `SUPABASE_SERVICE_KEY` to `.env` (not anon key)
- [ ] Ran `npm run db:migrate`
- [ ] Verified data in Appwrite Console (some records migrated)
- [ ] Compared record counts between Supabase and Appwrite
- [ ] Tested app functionality with migrated data
- [ ] No errors when loading user-specific records

---

## Testing (Automated)

- [ ] Playwright tests pass (most should)
- [ ] Auth tests pass
- [ ] Document generation tests pass
- [ ] HR tests pass
- [ ] Fixed any failing tests due to schema differences

---

## Deployment

- [ ] Pushed code to GitHub
- [ ] Set Vercel environment variables:
  - [ ] `DATABASE_MODE=appwrite`
  - [ ] `APPWRITE_PROJECT_ID`
  - [ ] `APPWRITE_API_KEY`
  - [ ] `APPWRITE_DATABASE_ID=default`
  - [ ] `VITE_APPWRITE_PROJECT_ID`
  - [ ] `VITE_APPWRITE_API_KEY`
  - [ ] `ZAI_API_KEY` (if using)
  - [ ] `GROQ_API_KEY` (if using)
  - [ ] `RESEND_API_KEY` (for emails)
- [ ] Deployed to Vercel: `vercel --prod`
- [ ] Tested production URL
- [ ] Verified login works on production
- [ ] Verified data loads on production
- [ ] Verified employee invites send emails on production

---

## Post-Migration

- [ ] Monitored error tracking (Sentry) for 48 hours
- [ ] Verified no data loss
- [ ] Archived Supabase project (set to read-only)
- [ ] Updated documentation/README to reflect Appwrite usage
- [ ] Notified team of new system
- [ ] Scheduled regular Appwrite backups (if needed)

---

## Rollback Plan (If Needed)

Keep this ready in case of issues:

1. Change `.env`: `DATABASE_MODE=supabase`
2. Restart: `npm run dev`
3. App reverts to Supabase instantly
4. Investigate issues on Appwrite side

---

## Known Issues & Gotchas

| Issue                          | Solution                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| "Permission denied" errors     | Check collection permissions in Appwrite Console - need `role:any` for read, `role:admin` for write |
| Data not appearing             | Ensure records have `organization_id` set (Appwrite doesn't auto-filter like RLS)                   |
| Migrated data shows wrong user | Verify `id` field mapping — Appwrite uses `$id` internally, our wrapper converts to `id`            |
| Invite emails not sent         | `RESEND_API_KEY` not set or email service down                                                      |
| Indexes missing                | Create them manually in Console → Collection → Indexes                                              |
| App slow on first query        | Appwrite scale-to-zero cold start (~1-2s). Mitigate with keep-alive or warmup.                      |

---

## Success Criteria

✅ All 18 collections created
✅ Indexes in place
✅ App runs in `appwrite` mode without errors
✅ All CRUD operations work (create/read/update/delete)
✅ Auth flow works (login/logout)
✅ HR invite flow works end-to-end
✅ Document generation returns AI content
✅ Tests pass or are documented failures
✅ Production deployed and verified

---

## Support

- **Appwrite Docs**: https://appwrite.io/docs
- **Appwrite Discord**: https://appwrite.io/discord
- **Migration Guide**: `docs/MIGRATION_SUPABASE_TO_APPWRITE.md`
- **Quick Start**: `docs/APPWRITE_QUICK_START.md`

---

**Migration Status**: [ ] Not Started | [ ] In Progress | [X] Completed

**Date Completed**: ******\_\_\_******

**Verified By**: ******\_\_\_******

**Notes**:

---

---
