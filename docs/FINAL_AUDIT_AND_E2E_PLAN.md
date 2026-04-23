# WakiliWorld Appwrite Migration — Complete Audit & E2E Test Plan

## ✅ Completed (this session)

### Core Integration

- Fixed `$id` → `id` normalization in all responses
- Rewrote `appwrite.js` with proper service initialization and `Query` export
- Implemented `withOrganization` auto-filter in `db.list` for org-scoped tables
- Excluded `courts` from org filter (global table)
- Added missing imports: `storage`, `ID`, `account` to `appwriteApi.jsx`

### Authentication & Authorization

- **Login**: `POST /api/auth/login/` → `auth.createEmailSession()` ✓
- **Register**: Rate limiting, user + profile creation with org handling ✓
- **Verify Token**: `POST /api/auth/verify-token/` → returns user profile ✓
- **Logout**: `POST /api/auth/logout/` → `auth.deleteSession()` ✓
- **Role checks**: Admin-only endpoints enforce `role === 'admin'` ✓
- **Access control**: Document GET/PUT/DELETE check ownership/org/shared ✓

### Document Management

- **Create**: Upload to Appwrite Storage, store `file_path` as file ID ✓
- **List**: Enriched with owner; org filter auto-applied ✓
- **Get single**: Access control check (owner/org/shared) ✓
- **Update**: Permission check before update ✓
- **Delete**: Permission check before delete ✓
- **Download**: Returns `{ data: url, name, mime_type }` from `storage.getFileView()` ✓
- **AI Generation**: `POST /api/documents/generate/` calls `/api/reya` ✓

### Data Types & IDs

- All foreign keys kept as strings (except numeric fields like `court_id` remain integer)
- Date fields: `created_at`, `updated_at` ISO strings ✓
- Float fields converted to `Number()` ✓
- Text fields for long content (`bio`, `description`, `client_address`, `terms`, etc.) ✓

### Admin Settings

- `GET /api/admin/` auto-creates default `admin_settings` record if missing ✓
- `PUT /api/admin/` updates settings ✓

### Setup Automation

- `scripts/setup-appwrite.js` uses REST API; creates 18 collections + attributes + indexes ✓
- `scripts/test-appwrite-connection.js` validates connection ✓
- Storage bucket script exists (must be created manually or via script) ✓

---

## ⚠️ Manual Steps Required

1. **Create Storage Bucket**
   - Console → Storage → Create Bucket
   - ID: `documents`
   - Max file size: 10 MB
   - Allowed extensions: `pdf,doc,docx,txt,jpg,jpeg,png,gif`
   - Encryption/antivirus: optional

2. **Set Environment**

   ```bash
   DATABASE_MODE=appwrite
   APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_DATABASE_ID=69e90e4d00075469122c
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   # APPWRITE_API_KEY only needed for setup scripts
   ```

3. **Run Setup**
   ```bash
   npm run db:setup
   npm run db:test
   ```

---

## 🧪 E2E Test Suite

**Automated test file**: `tests/e2e-test.js`

Tests cover:

- Collections existence
- Auth: register (admin, advocate, client), login, verify-token, logout
- Document: AI generate, create, get, update, delete
- Case, Task, Invoice creation
- Admin settings GET/PUT (with auto-create default)
- Access control (org isolation)
- Chat room creation
- User stats & accounting dashboard

**Run**:

```bash
node tests/e2e-test.js
```

---

## 📋 Manual Test Checklist

After setting environment and running automated tests, perform:

### User Flows

- [ ] Register as individual → profile created
- [ ] Register as advocate → role set correctly
- [ ] Register as organization → org auto-created
- [ ] Login/Logout → tokens managed

### Documents

- [ ] Navigate to Documents page → list loads (empty state if none)
- [ ] Upload a PDF → appears in list, file downloads correctly
- [ ] Use AI generator → content produced, save → appears in list
- [ ] Edit document title → updates
- [ ] Delete document → removed

### Cases & Tasks

- [ ] Create new case → appears in case list
- [ ] Create task assigned to self → appears in task list
- [ ] Filter tasks by case

### Invoices

- [ ] Create invoice with line items → total calculated
- [ ] Invoice list shows all invoices with proper formatting

### Admin (login as admin)

- [ ] Admin dashboard loads settings
- [ ] Toggle feature flags (case_status, milestones, etc.)
- [ ] Settings persist after reload

### Chat

- [ ] Open chat with another user → room created
- [ ] Send message → appears instantly (check realtime if implemented)

---

## 🔍 Known Gaps & Considerations

1. **Realtime** — Appwrite Realtime subscriptions not yet implemented; polling or manual refresh may be needed.
2. **File Previews** — Only downloads; preview for images/PDFs could be added via `storage.getFilePreview()`.
3. **Pagination** — `db.list` returns all documents; large datasets need cursor-based pagination via `Query.limit()`/`offset()`.
4. **Rate Limiting** — Uses localStorage (browser); for server-side actions, consider server-enforced limits.
5. **Email Verification** — Stubbed; integrate Appwrite's email verification flow if needed.
6. **Password Reset** — Not implemented; use Appwrite's built-in password reset.
7. **Reya AI Fallback** — If `/api/reya` is down, generated document shows placeholder; could enhance with better fallback.

---

## 🛠️ Next Steps

1. Create storage bucket `documents`.
2. Run `npm run db:setup` and `npm run db:test`.
3. Set `DATABASE_MODE=appwrite` and start dev server: `npm run dev`.
4. Run automated E2E tests: `node tests/e2e-test.js`.
5. Perform manual checklist above.

All endpoints should now be fully compatible with Supabase API shape. Report any failures for immediate fix.
