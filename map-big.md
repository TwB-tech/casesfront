# WakiliWorld Incomplete Modules & Audit Map

## Overview
This document maps out the known incomplete, dormant, or audit-relevant areas of the repository.
Licensing modules are intentionally marked as dormant and reserved for last, so their presence is noted but not prioritized.

## 1. High-Level Incomplete Areas

### 1.1 License / Activation (Dormant)
- `src/utils/license.js`
  - Contains local fallback license validation only.
  - Comment explicitly says: `// TODO: Re-enable server validation when license server is stable`.
  - The module is present and functional for fallback, but not production-grade validation.
- `src/components/LicenseManager/LicenseActivationModal.jsx`
  - UI exists for license activation, but underlying validation is currently disabled.
- `src/components/LicenseManager/LicenseList.jsx`
  - License listing UI is present, but real state depends on dormant license validation logic.

> Note: Licensing files are dormant by design. They are intentionally not active as a primary fix priority in this map.

### 1.2 Password Recovery / Auth Recovery
- `src/lib/appwrite.js`
  - The function `updateRecovery()` is stubbed with a console warning:
    - `// Simplified: in production integrate with password reset flow`
  - This indicates the Appwrite password reset/recovery flow is not implemented in production mode.
- `src/components/authentication/ForgotPassword.jsx`
  - UI exists and likely initiates a reset request, but production back-end integration is uncertain.
- `src/components/authentication/ResetPassword.jsx`
  - The reset form exists, and auth context has `resetPassword`, but the actual server-side route and Appwrite integration must be verified.

### 1.3 Currency Persistence
- `src/contexts/CurrencyContext.jsx`
  - Current logic persists selected currency only in `localStorage`.
  - TODO comment: `// TODO: Also persist to server via API when logged in`
  - This means cross-device currency preference is not stored server-side.

### 1.4 Standalone Upload / Storage Support
- `src/lib/standaloneApi.js`
  - Contains a placeholder upload response for path `/api/upload/`:
    - `Upload endpoint - configure AppWrite Storage in production`
  - Standalone file upload is not fully implemented.
  - This file also contains invite handling and document generation logic in standalone mode.

### 1.5 Realtime, Pagination, and Rate Limiting Gaps
Audit and plan docs identify these gaps:
- Realtime Appwrite subscriptions are not fully implemented.
- Large dataset pagination is missing; code tends to return all documents instead of cursor-based paging.
- Rate limiting is currently browser/localStorage-based rather than server-enforced.
- File previews are missing; only downloads are supported in some cases.
- Email verification is described in docs as stubbed.
- Password reset may be partially implemented, but not fully integrated in Appwrite mode.
- Reya AI fallback is a placeholder when the API is down.

## 2. File-Level Incomplete and Dormant Markers

### 2.1 Core Backend / API Files
- `src/lib/appwrite.js`
  - `updateRecovery()` stubbed.
  - Password reset path not fully production-integrated.
  - `account.updatePassword` exists, but recovery flow is incomplete.
- `src/lib/standaloneApi.js`
  - `/api/upload/` placeholder response.
  - Invite creation and email sending exist, but standalone mode uses localStorage.
  - Some document generation and AI endpoints are real, but standalone upload/storage still partial.
- `src/lib/appwriteApi.jsx`
  - Contains many pending invite and status checks.
  - Review this file if Appwrite collection filtering or invite flow needs completion.

### 2.2 UI / Context Files
- `src/contexts/CurrencyContext.jsx`
  - Currency selection persistence only client-side.
- `src/components/LicenseManager/LicenseActivationModal.jsx`
  - Activation UI present, but underlying license server validation dormant.
- `src/components/authentication/ForgotPassword.jsx`
  - Password reset UI present.
- `src/components/authentication/ResetPassword.jsx`
  - Reset page present.
- `src/components/LicenseManager/LicenseList.jsx`
  - License listings are UI-ready but depend on dormant license logic.

### 2.3 Audit & Migration Documentation
- `docs/APPWRITE_MIGRATION_COMPLETE.md`
  - Checklist items remain unchecked.
  - This doc appears stale relative to actual code migration progress.
- `docs/FINAL_AUDIT_AND_E2E_PLAN.md`
  - Known gaps are listed but not marked complete.
  - It describes email verification, password reset, realtime, pagination, and rate limiting as unfinished.
- `docs/APPWRITE_MIGRATION_CHECKLIST.md`
  - Contains extensive setup/migration steps; may not fully reflect current repo state.
- `audit-report.md`
  - Contains audit status and notes about Vercel rewrite issues and production readiness.
  - Useful for cross-checking which audit concerns are still relevant.

### 2.4 Deployment / Routing Files
- `vercel.json`
  - Contains broad catch-all rewrite `"/(.*)" -> "/index.html"`.
  - Audit report flagged this as potentially breaking static asset loading.
  - This should be reviewed and possibly tightened.

### 2.5 Miscellaneous Incomplete Markers
- TODOs found in repo:
  - `src/contexts/CurrencyContext.jsx`
  - `src/utils/license.js`
- Stubbed or placeholder messages in the codebase:
  - `src/lib/appwrite.js`
  - `src/lib/standaloneApi.js`
- Audit notes and docs reference "stubbed" or "not implemented" features.

## 3. Audit & Testing Status Map

### 3.1 Reported production audit status
- `audit-report.md` says core functionality is operational.
- It calls out minor issues in Vercel routing and test execution, not core app failure.
- It explicitly notes that license system is currently offline / fallback-only.

### 3.2 Test and migration checklists
- `docs/FINAL_AUDIT_AND_E2E_PLAN.md` checklist remains largely unmarked.
- The manual checklist explicitly lists:
  - password reset
  - email verification
  - realtime behavior
  - file previews
  - pagination
- These items form the highest-priority gaps outside licensing.

## 4. Recommended Fix Priority

### Priority 1: Production auth / recovery and upload support
- `src/lib/appwrite.js` — implement proper password recovery route.
- `src/lib/standaloneApi.js` — complete upload endpoint and storage support.
- `src/contexts/CurrencyContext.jsx` — add server-side currency preference sync.

### Priority 2: Audit documentation cleanup and deployment hardening
- `docs/APPWRITE_MIGRATION_COMPLETE.md` — update checklist status.
- `docs/FINAL_AUDIT_AND_E2E_PLAN.md` — resolve or reclassify open gaps.
- `vercel.json` — tighten rewrite rules, ensure static assets and API paths are safe.

### Priority 3: Licensing files remain dormant
- `src/utils/license.js` — keep dormant until core app behavior is stable.
- `src/components/LicenseManager/*` — do not prioritize until the above issues are addressed.

## 5. Detailed File Map Summary

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `src/utils/license.js` | License validation | Dormant | Local fallback only; server validation disabled |
| `src/components/LicenseManager/LicenseActivationModal.jsx` | License activation UI | UI ready | Depends on dormant license logic |
| `src/components/LicenseManager/LicenseList.jsx` | License listing | UI ready | Depends on dormant license logic |
| `src/lib/appwrite.js` | Appwrite backend adapter | Incomplete | Password recovery stub; verify reset integration |
| `src/lib/standaloneApi.js` | Standalone local DB and fallback API | Partial | Upload endpoint placeholder; standalone storage incomplete |
| `src/contexts/CurrencyContext.jsx` | Currency preference | Partial | Persists only client-side |
| `vercel.json` | Deployment routing | Risk | Broad catch-all rewrite needs review |
| `docs/APPWRITE_MIGRATION_COMPLETE.md` | Migration checklist | Outdated | Checklist items still unchecked |
| `docs/FINAL_AUDIT_AND_E2E_PLAN.md` | Test plan & gaps | Open | Lists realtime, pagination, reset, verification gaps |
| `audit-report.md` | Production audit report | Reference | Good source of current audit issues |

## 6. Actionable follow-up questions
- Should I create a separate repair plan for password recovery and standalone upload first?
- Do you want the audit docs updated after code fixes, or should the code be fixed first and docs later?
- Should the license files remain dormant until a final wide release stage only?
