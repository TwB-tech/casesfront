# APPRWRITE PERMISSIONS SETUP - MANUAL STEPS

**Issue:** Collections have `documentSecurity: false` but `read`/`write` permissions are not set (empty `$permissions` array). This causes 401 errors when trying to access data.

**Root Cause:** The API key used by the fix script may not have `collections.write` scope, or Appwrite Cloud restricts collection modification via API for security.

**Solution:** Manually set collection permissions in the Appwrite Console.

---

## Steps to Fix Permissions (Manual)

1. **Open Appwrite Console**
   - Go to https://cloud.appwrite.io
   - Select your project (69e8bc1500162d3defdb)
   - Navigate to **Database** → **Collections**

2. **For Each Collection** (repeat for all 19 collections):
   - Click on the collection name (e.g., `Users`)
   - Click **Settings** tab
   - Under **Permissions**, set:
     - **Read Access**: `All Users` (including guests)
     - **Write Access**: `Authenticated Users`
   - Ensure **Document Security** toggle is **OFF** (disabled)
   - Click **Save**

   **Note:** Special collections:
   - `Audit_logs` → Read: `Admin Only`, Write: `Admin Only`
   - `Admin_settings` → Read: `Admin Only`, Write: `Admin Only`
   - `Invites` → Read: `Authenticated Users`, Write: `Authenticated Users`
   - `Payroll_runs` → Read: `Authenticated Users`, Write: `Authenticated Users`

3. **Verify Settings**
   - After setting, the `$permissions` array should be populated:
     ```json
     "$permissions": [
       {"read": ["role:all"]},
       {"write": ["role:member"]}
     ]
     ```
   - `documentSecurity` should be `false`

4. **Clear Browser Data & Restart**
   - Clear localStorage: `localStorage.clear()` in browser console
   - Restart dev server: `npm run dev:all`
   - Login and test

---

## Collections to Update

| Collection | Read | Write | Document Security |
|------------|------|-------|-------------------|
| Users | All Users | Authenticated | OFF |
| Organizations | All Users | Authenticated | OFF |
| Courts | All Users | Authenticated | OFF |
| Cases | All Users | Authenticated | OFF |
| Tasks | All Users | Authenticated | OFF |
| Documents | All Users | Authenticated | OFF |
| Communications | All Users | Authenticated | OFF |
| Invites | Authenticated | Authenticated | OFF |
| Invoices | All Users | Authenticated | OFF |
| Invoice_items | All Users | Authenticated | OFF |
| Chat_rooms | All Users | Authenticated | OFF |
| Chat_messages | All Users | Authenticated | OFF |
| Audit_logs | Admin Only | Admin Only | OFF |
| Expenses | All Users | Authenticated | OFF |
| Payroll_runs | Authenticated | Authenticated | OFF |
| Admin_settings | Admin Only | Admin Only | OFF |
| Subscriptions | All Users | Authenticated | OFF |
| Onboarding | All Users | Authenticated | OFF |
| Notes | All Users | Authenticated | OFF |

After manual setup, run `node scripts/test-permissions.js` to verify that `GET /users/documents` returns 200.

---

## Why Automated Script Failed

The Appwrite Cloud API requires the API key to have the `collections.write` scope. The standard service account keys may not include this scope for security. Manual configuration through the console is the recommended approach for production deployments.

Once manual permissions are set, the application should work without 401 errors.
