# WakiliWorld Appwrite Migration — Complete Context

**Last Updated:** 2026-04-23  
**Project:** WakiliWorld (casesfront) — AI-Powered Legal Practice Management Platform  
**Migration:** Supabase → Appwrite (drop-in replacement, zero frontend changes)  
**Branch:** `main`  
**Latest Deployments:**

- `d9hlu0fbm` — Ready (fix: removed catch-all rewrite breaking assets)
- `b523b6f` — commit: fix vercel rewrites
- `7075f03` — commit: feat: Migrate to Appwrite (full API + tests)

---

## 1. Project Overview

WakiliWorld is a full-featured legal CRM with:

- Case management, client management, document handling, billing, HR, chat, reporting
- AI assistant "Reya" for document generation
- Multi-role auth (advocate, client, firm, admin)
- Storage integration for document files

Originally backed by Supabase. Goal: replace Supabase with Appwrite while keeping the frontend unchanged via an API compatibility layer.

---

## 2. Architecture Strategy

### Feature Flag

- Environment variable: `DATABASE_MODE` = `appwrite` | `supabase` | `standalone`
- Checked in `src/config/index.js` and `src/lib/appwrite.js`

### Request Routing

- All API calls go through `src/axiosConfig.jsx` (axios instance)
- `axiosConfig.jsx` imports `appwriteApi` (Appwrite mode) or `supabaseApi` based on flags
- Also supports hybrid fallback: primary DB with automatic fallback to secondary on network errors

### Appwrite Client (`src/lib/appwrite.js`)

- Thin wrapper around Appwrite SDK
- Initializes `Client`, `Account`, `Databases`, `Storage`, `Functions` only when `DATABASE_MODE=appwrite`
- Exposes `db` object with `list`, `get`, `create`, `update`, `delete` methods
- Auto-applies **row-level security** via `withOrganization` filter (org isolation + user access)
- Normalizes Appwrite's `$id` → `id` for frontend compatibility

---

## 3. Key Files & Changes

### New / Modified

| File                                  | Purpose                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| `src/lib/appwrite.js`                 | Appwrite client + org-aware db wrapper + auth helpers                                    |
| `src/lib/appwriteApi.jsx`             | 1500+ line API compatibility layer mirroring all Supabase endpoints                      |
| `src/axiosConfig.jsx`                 | Dynamically selects Appwrite or Supabase API based on env flag                           |
| `src/config/index.js`                 | Central config; removed APPWRITE_API_KEY exposure; added validation                      |
| `scripts/setup-appwrite.js`           | Automated DB provisioning: creates 18 collections, attributes, indexes, data seeding     |
| `scripts/setup-appwrite-storage.js`   | Creates storage bucket for document uploads                                              |
| `scripts/test-appwrite-connection.js` | Validates connectivity                                                                   |
| `tests/rest-integration-test.js`      | Comprehensive E2E tests (26 tests covering auth, CRUD, chat, invites, reports)           |
| `vercel.json`                         | Vercel config — rewrites for API routes, **removed catch-all rewrite that broke assets** |

### Removed / Deprecated

- `src/lib/appwriteApi.jsx` had a **duplicate code block** around lines 1270–1286 (cleanup committed)
- `src/config/index.js` previously exposed `APPWRITE_API_KEY` to client — removed

---

## 4. Important Discoveries & Gotchas

### Appwrite SDK & API

- **SDK ambiguity:** Some setup scripts avoided SDK for reliability; used plain REST in setup scripts.
- **Permissions format:** Appwrite expects top-level `read`/`write` arrays, not nested `permissions` object in some contexts.
- **Attribute types:** Chat messages `sender` must be `string` (user ID), not `integer`. Updated schema and setup script auto-deletes/recreates collection to apply change.
- **ID normalization:** Appwrite returns `$id`; must map to `id` for frontend.
- **Endpoint path:** Don't double-append `/v1` if `APPWRITE_ENDPOINT` already includes it.
- **Storage service:** May be disabled on some Appwrite instances; bucket creation returns 404.
- **No service-account JWT on client:** Removed `client.setJWT(apiKey)` from client init; user sessions only via `Account`.

### Build & Deployment

- **Duplicate code block** in `appwriteApi.jsx` (lines 1270–1286) caused Vercel build failure — removed.
- **Catch-all rewrite** in `vercel.json` (`"source": "/(.*)"`, `"destination": "/index.html"`) broke static asset delivery — **removed**.
- Vite framework mode automatically provides SPA fallback; custom rewrites should exclude static assets.
- Production build: `npm run build` succeeds; `dist/` output verified.
- Vercel environment variables must include `DATABASE_MODE`, `APPWRITE_PROJECT_ID`, `APPWRITE_ENDPOINT`, `APPWRITE_DATABASE_ID`.

### Testing

- All 26 integration tests pass locally.
- Tests use REST only, not Appwrite SDK, to mimic real usage.

---

## 5. Environment Variables

**Required on Vercel (Production):**

```
DATABASE_MODE=appwrite
APPWRITE_ENDPOINT=https://tor.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=69e8bc1500162d3defdb
APPWRITE_DATABASE_ID=69e90e4d00075469122c
APPWRITE_API_KEY=standard_xxxxx (server-side only, used in setup scripts)
```

Local `.env` contains the above but is gitignored.

---

## 6. The Blank Page Bug — Root Cause & Fix

### Symptoms

- Deployed app on Vercel showed a completely blank (white) page.
- Network tab would have shown JS files returning HTML instead of JavaScript.

### Root Cause

`vercel.json` had a catch-all rewrite:

```json
{ "source": "/(.*)", "destination": "/index.html" }
```

This intercepted **all** requests, including static assets under `/assets/*.js`, `/assets/*.css`, causing them to be served with `index.html` (HTML) instead of their actual content. Browsers failed to parse HTML as JS, React never bootstrapped → blank page.

### Fix

Removed the catch-all rewrite entirely. Vite framework mode automatically handles SPA fallback for non-file routes. Asset requests are now served directly by Vercel's static file serving.

Commit: `b523b6f` — "fix: Remove catch-all rewrite that broke static asset serving on Vercel"

### Verification

- Latest deployment `d9hlu0fbm` shows **Ready**.
- HTML includes correct `<script src="/assets/index-*.js">` tags.
- Static assets are no longer rewritten.

---

## 7. Deployment Status

| Deployment ID                         | Status   | Commit   | Notes                                                                  |
| ------------------------------------- | -------- | -------- | ---------------------------------------------------------------------- |
| `d9hlu0fbm`                           | ✅ Ready | b523b6f  | Rewrites fixed — should work                                           |
| `glkp9cwh1`                           | ✅ Ready | 7075f03  | Duplicate code fixed, but catch-all rewrite still present → blank page |
| `cbbgs9los`, `g25iifc1j`, `hs3k5oubo` | ❌ Error | previous | Build failures                                                         |

---

## 8. What Still Needs Verification

1. **End-to-end functionality** after the rewrite fix:
   - Landing page loads (should be visible now)
   - Navigation to `/home`, `/signup`, etc. works (SPA fallback must work)
   - API calls succeed (Appwrite reachable from Vercel)
   - File uploads work (storage bucket `documents` exists in Appwrite)
2. **Environment variables** properly set on Vercel for Production.
3. **Email verification/links** if applicable.
4. **Real-time subscriptions** (not critical — not implemented).

### Manual Test Checklist

- [ ] Open deployed URL: expect Landing page (not blank)
- [ ] Click "Get Started Free" → `/signup` loads
- [ ] Register a new user → success
- [ ] Login → redirects to `/home`
- [ ] Create a case, task, document, upload file
- [ ] Send a chat message
- [ ] Generate an AI document
- [ ] View reports
- [ ] Admin settings page

---

## 9. Lessons Learned & Best Practices

### Vercel Deployments

- Do NOT add a blanket `/(.*) -> /index.html` rewrite when using a framework (Vite). It breaks static assets.
- Rely on framework defaults for SPA fallback; if custom rewrites are needed, ensure they exclude `/assets/` and other static paths.
- Use `vercel.json` only for:
  - API route rewrites (e.g., `/api/*.js`)
  - Security headers
  - Redirects (if needed)

### Appwrite Integration

- Use `string` IDs everywhere; never assume integers.
- `Query` methods: `equal`, `arrayContains`, `or`.
- Use `withOrganization` to implement row-level security manually.
- Storage bucket must be created separately; handle potential 404s.
- Never expose `APPWRITE_API_KEY` to client; use user sessions only.

### Debugging Deployments

- If a page is blank, check the Network tab: assets returning HTML indicate rewrite misconfiguration.
- Use Vercel's build logs and deploy preview links.
- `vercel inspect <deployment-id> --logs` shows build output.
- Test asset accessibility: `vercel curl /assets/<file>.js` should return JavaScript, not HTML.

---

## 10. Vite Configuration — Exposing Appwrite Env Vars

**Issue:** In production, `import.meta.env.APPWRITE_PROJECT_ID` was undefined because `vite.config.js` did not include these variables in its `define` section. This caused `appwrite.js` to throw `APPWRITE_PROJECT_ID is required` during module initialization, crashing the app with a blank page.

**Fix:** Added the following to `vite.config.js` `define`:

```js
'import.meta.env.APPWRITE_ENDPOINT': JSON.stringify(env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'),
'import.meta.env.APPWRITE_PROJECT_ID': JSON.stringify(env.APPWRITE_PROJECT_ID || ''),
'import.meta.env.APPWRITE_DATABASE_ID': JSON.stringify(env.APPWRITE_DATABASE_ID || 'default'),
```

Commit: `cd6967c` — "fix: Expose APPWRITE\_\* env vars to client bundle for Appwrite initialization"

**Verification:** Local build succeeds with env vars present; Vercel build will embed them from its environment.

## 11. Future Training & Context Reduction

1. **Create a Project-Knowledge File**  
   Keep a `CONTEXT.md` or `PROJECT_README.md` in the repo with:
   - Architecture diagram
   - Key environment variables
   - Common pitfalls (like the Vercel rewrite bug)
   - Setup steps for local dev and deployment

2. **Use `.kilo/` Commands & Agents** (already implemented)
   - Store reusable command templates in `.kilo/command/`
   - Record task-specific knowledge in `.kilo/agent/` or `.kilo/skill/`  
     This lets the agent recall previous decisions without re-reading the entire thread.

3. **Write Self-Documenting Code**
   - Keep functions small and well-named.
   - Include brief comments only for non-obvious decisions (like why we removed the catch-all rewrite).
   - Avoid dead code.

4. **Commit Early, Commit Often**  
   Each logical step should be a separate commit with a clear message. That way, `git log` becomes a timeline of decisions that the agent can skim.

5. **Use `suggest` for Code Reviews**  
   After major changes, run `/local-review-uncommitted`. This summarizes changes and can be stored for later training.

6. **Exported Artifacts**
   - Keep a `docs/` folder with design decisions, migration plans, and test strategies.
   - Store the integration test file (`tests/rest-integration-test.js`) as executable documentation.

7. **Reducing Session Context**
   - The agent can load just the relevant `.kilo` instructions for the task at hand.
   - Split large files into modules; the agent can load only the module it's editing.
   - Store frequent Q&A in `.kilo/agent/` as markdown files for quick recall.

---

## 12. Quick Reference — Common Commands

```bash
# Local dev
npm run dev

# Build
npm run build

# E2E tests
npm run test:e2e

# Appwrite DB setup (run once)
npm run db:setup

# Check Appwrite connection
npm run db:test

# Setup storage bucket
npm run db:storage

# Vercel deployment
npx vercel --prod
npx vercel ls
npx vercel inspect <deployment-id> --logs
```

---

## 12. Outstanding Manual Steps

### Register Production Domain as Web Platform in Appwrite

**Issue:** Browser console shows:

```
Access to fetch at 'https://tor.cloud.appwrite.io/v1/databases/.../collections/organizations/documents'
from origin 'https://www.kwakorti.live' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Appwrite requires that any web origin making API calls be registered as a **Web Platform** in the project.

**Action Required:**

1. Go to https://cloud.appwrite.io → Your Project → **Settings** → **Web Platforms**
2. Click "Add Web Platform"
3. Enter:
   - **Name:** WakiliWorld Production
   - **Hostname:** `www.kwakorti.live`
4. Save

After this, CORS will include `Access-Control-Allow-Origin: https://www.kwakorti.live` and the app will function correctly.

**Note:** The automated scripts (`scripts/setup-appwrite.js`) have configured all collections, attributes, indexes, and permissions correctly. The `organizations` collection has `write: ['role:users']` and registration flow creates an authenticated session before writing, so no public write is needed.

---

## 13. Quick Reference — Common Commands

```bash
# Local dev
npm run dev

# Build
npm run build

# E2E tests
npm run test:e2e

# Appwrite DB setup (run once)
npm run db:setup

# Check Appwrite connection
npm run db:test

# Setup storage bucket
npm run db:storage

# Vercel deployment
npx vercel --prod
npx vercel ls
npx vercel inspect <deployment-id> --logs
```

---

## 14. File Reference Summary (for Training)

- `src/lib/appwrite.js` — client init, db wrapper, org filter, auth helpers
- `src/lib/appwriteApi.jsx` — all REST endpoints (GET/POST/PUT/DELETE) mapped to Appwrite
- `src/axiosConfig.jsx` — axios instance that routes by `DATABASE_MODE`
- `src/config/index.js` — feature flags, env vars, validation
- `scripts/setup-appwrite.js` — creates collections, attributes, indexes, seed data
- `tests/rest-integration-test.js` — full integration suite
- `vercel.json` — Vercel configuration (rewrites for API, security headers, **no catch-all**)
- `context.md` — this file; complete project knowledge base

---

**End of context dump.** This document should provide future agents (or developers) with a complete understanding of the migration, the bug, the solution, and remaining manual steps.
