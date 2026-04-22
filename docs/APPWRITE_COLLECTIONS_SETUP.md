# Supabase → Appwrite Migration: Collections Setup

## Overview

Appwrite uses **collections** (similar to MongoDB collections) instead of SQL tables. Each collection is a document store (noSQL) with optional attributes.

You must create these collections manually in your Appwrite project before deployment.

---

## Step 1: Create Database (if not exists)

1. Login to [Appwrite Cloud Console](https://cloud.appwrite.io)
2. Select your project (or create new project "wakiliworld")
3. Navigate to **Database** → **+ Add Database**
4. Name: `wakiliworld-db` (or any name)
5. Note the Database ID (usually "default" for first DB, else copy the ID)

---

## Step 2: Create Collections (18 total)

For each collection below:

- Click **+ Add Collection**
- Enter Collection ID (matching the COLLECTIONS constant in `src/lib/appwrite.js`)
- Add attributes (fields) listed
- Set **Permissions** as specified

### 1. `organizations`

**Purpose:** Firm/organization isolation foundation (matches Supabase)

**Attributes:**
| Attribute | Type | Required | Default |
|-----------|------|----------|---------|
| id | string | Yes | - |
| name | string | Yes | - |
| registration_number | string | No | null |
| address | string | No | null |
| phone | string | No | null |
| email | string | No | null |
| plan_type | string | No | free |
| is_verified | boolean | No | false |
| created_at | string (ISO) | No | auto |
| updated_at | string (ISO) | No | auto |

**Permissions:**

- Read: Any authenticated user (role: `any`)
- Write: Admin only (role: `admin`, `administrator`)

---

### 2. `users`

**Purpose:** User accounts (mirrors Supabase `users` table)

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| organization_id | string | No |
| username | string | Yes |
| email | string | Yes |
| phone | string | No |
| role | string | No (default: individual) |
| title | string | No |
| bio | string | No |
| practice_areas | array | No |
| timezone | string | No (default: EAT) |
| status | string | No (default: Active) |
| messaging_enabled | boolean | No (default: true) |
| deadline_notifications | boolean | No (default: true) |
| created_at | string | No |
| updated_at | string | No |

**Permissions:**

- Read: User's own organization only (`organization_id = auth.organization_id`) OR own user (`id = auth.userId`)
- Write: User can update own profile only (`id = auth.userId`)

---

### 3. `courts`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | integer | Yes |
| name | string | Yes |
| jurisdiction | string | No |
| address | string | No |
| created_at | string | No |

**Permissions:**

- Read: Any authenticated
- Write: Admin only

---

### 4. `cases`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| organization_id | string | Yes |
| case_number | string | Yes |
| title | string | Yes |
| description | string | No |
| status | string | No (default: open) |
| start_date | date | No |
| end_date | date | No |
| client_id | string | No |
| advocate_id | string | No |
| court_id | integer | No |
| created_by | string | Yes |
| created_at | string | No |
| updated_at | string | No |

**Permissions:**

- Read: Org members only (`organization_id = auth.organization_id`)
- Write: Org admins, assigned advocate, or creator

---

### 5. `tasks`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| organization_id | string | Yes |
| title | string | Yes |
| description | string | No |
| assigned_to | string | No |
| case_id | string | No |
| priority | string | No (default: low) |
| deadline | string (ISO) | No |
| status | boolean | No (default: false) |
| created_by | string | No |
| created_at | string | No |
| updated_at | string | No |

**Permissions:**

- Read: Org members only
- Write: Assigned user or org admin

---

### 6. `documents`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| organization_id | string | Yes |
| title | string | Yes |
| description | string | No |
| owner | string | Yes |
| file_path | string | No |
| file_size | integer | No |
| mime_type | string | No |
| shared_with | array | No |
| created_at | string | No |
| updated_at | string | No |

**Permissions:**

- Read: Owner OR shared_with includes user OR org admin
- Write: Owner only

---

### 7. `communications`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| organization_id | string | Yes |
| email | string | Yes |
| subject | string | Yes |
| message | string | Yes |
| google_meet_link | string | No |
| created_by | string | Yes |
| created_at | string | No |

**Permissions:**

- Read: Org members only
- Write: Any authenticated user

---

### 8. `invites`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| email | string | Yes |
| role | string | No (default: employee) |
| department | string | No |
| organization_id | string | Yes |
| status | string | No (default: pending) |
| invited_by | string | No |
| token | string | Yes |
| expires_at | string (ISO) | Yes |
| created_at | string (ISO) | No |

**Indexes:** Create two indexes after collection creation via Console → Indexes tab:

- `token` (unique, ascending)
- `email` (ascending)

**Permissions:**

- Read: Org admins or user who sent invite
- Write: Admin only

---

### 9. `invoices`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| organization_id | string | Yes |
| invoice_number | string | Yes |
| client_name | string | Yes |
| client_address | string | No |
| crn | string | No |
| total_amount | number | No |
| amount_due | number | No |
| tax | number | No |
| items | JSON (array) | No |
| account_number | string | No |
| account_name | string | No |
| bank_detail | string | No |
| terms | string | No |
| signature | string | No |
| status | string | No |
| date | date | No |
| created_at | string | No |
| updated_at | string | No |

**Permissions:**

- Read: Org members only
- Write: Admin/accountant only

---

### 10. `invoice_items`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| invoice_id | string | Yes |
| description | string | Yes |
| quantity | number | No |
| unit_price | number | No |
| total | number | No |

**Permissions:**

- Read/Write: Invoice owner

---

### 11. `chat_rooms`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| organization_id | string | No |
| room_name | string | Yes |
| participants | array | Yes |
| created_at | string | No |

**Permissions:**

- Read: Participants only
- Write: Any authenticated user

---

### 12. `chat_messages`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| room | string | Yes |
| sender | string/number | Yes |
| content | string | Yes |
| timestamp | string (ISO) | Yes |
| attachments | array | No |
| created_at | string | No |

**Permissions:**

- Read: Room participants only
- Write: Room participants only

---

### 13. `audit_logs`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| organization_id | string | No |
| user_id | string | No |
| action | string | Yes |
| table_name | string | Yes |
| record_id | string | Yes |
| changes | JSON | No |
| user_agent | string | No |
| created_at | string | No |

**Permissions:**

- Read: Admin only
- Write: System only (backend should write directly)

---

### 14. `expenses`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| organization_id | string | Yes |
| title | string | Yes |
| description | string | No |
| amount | number | Yes |
| date | date | Yes |
| category | string | No |
| status | string | No (default: pending) |
| submitted_by | string | No |
| created_at | string | No |

**Permissions:**

- Read: Org members only
- Write: Submitter or approver

---

### 15. `payroll_runs`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| organization_id | string | Yes |
| total_amount | number | Yes |
| period_start | date | Yes |
| period_end | date | Yes |
| status | string | No |
| created_at | string | No |

**Permissions:**

- Read: Admin/HR only
- Write: Admin only

---

### 16. `admin_settings`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes (use 'default') |
| case_status | boolean | No |
| case_assignment | boolean | No |
| progress_tracking | boolean | No |
| milestones | boolean | No |
| client_fields | boolean | No |
| client_portal_access | boolean | No |
| updated_at | string | No |

**Permissions:**

- Read/Write: Admin only

---

### 17. `subscriptions`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| organization_id | string | Yes |
| payment_method | string | No |
| status | string | No |
| current_period_end | date | No |
| created_at | string | No |

**Permissions:**

- Read: Owner only
- Write: System only

---

### 18. `onboarding`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| id | string | Yes |
| organization_id | string | Yes |
| step | string | Yes |
| completed | boolean | No |
| created_at | string | No |

**Permissions:**

- Read/Write: Owner only

---

## Step 3: Create Database ID

Run in Appwrite Console → Database → Settings → **Create Database**:

```bash
# Optional: use Appwrite CLI
npx appwrite import-database --name wakiliworld-db
```

Or manually create in UI and note the Database ID (usually `default` for first DB). Set `APPWRITE_DATABASE_ID` env var accordingly.

---

## Step 4: Create Indexes (Important for Performance)

After creating all collections, add these indexes:

### invites collection:

- **Index 1:** Key: `token`, Type: Unique, Order: Ascending
- **Index 2:** Key: `email`, Type: Ascending

### users collection:

- **Index 3:** Key: `email`, Type: Unique, Ascending
- **Index 4:** Key: `organization_id`, Type: Ascending

### cases collection:

- **Index 5:** Key: `organization_id`, Type: Ascending
- **Index 6:** Key: `client_id`, Type: Ascending
- **Index 7:** Key: `advocate_id`, Type: Ascending

---

## Step 5: Initialize Collections with Seed Data (Optional)

You can seed initial data via Appwrite Console or script:

```javascript
// scripts/seed-appwrite.js
import { Client, Databases, ID } from '@appwrite/sdk/client';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);

// Seed courts (Kenya + East Africa)
const courts = [
  { id: 1, name: 'Supreme Court of Kenya' },
  { id: 2, name: 'Court of Appeal Kenya' },
  // ... add rest from supabase_schema.sql
];
for (const court of courts) {
  await db.createDocument('default', 'courts', ID.unique(), court);
}

// Seed admin user
await db.createDocument('default', 'users', ID.unique(), {
  id: 'admin-seed',
  username: 'Tony Brands',
  email: 'admin@wakiliworld.local',
  role: 'administrator',
  status: 'Active',
});
```

---

## Verification Checklist

- [ ] Database created with ID noted
- [ ] All 18 collections created with correct attribute names/types
- [ ] Indexes added to invites (token, email), users (email), cases (org_id, client_id, advocate_id)
- [ ] Permissions/roles assigned correctly (see column above)
- [ ] Collection IDs match exactly the `COLLECTIONS` object in `src/lib/appwrite.js`
- [ ] `APPWRITE_DATABASE_ID` set in `.env`

---

## Migration Order Checklist

1. **Before creating collections**: Export Supabase schema (`supabase_schema.sql`)
2. **Create Appwrite DB + Collections** as above
3. **Run data migration** (`scripts/migrate-to-appwrite.js`)
4. **Set `DATABASE_MODE=appwrite`** in production `.env`
5. **Test read operations** (cases, tasks, documents load)
6. **Test write operations** (create case, task, document)
7. **Test auth flow** (login, register, profile update)
8. **Test HR flow** (invite employee, accept invite)
9. **Test document generation** (AI)

---

## Common Issues & Solutions

| Issue                                | Cause                           | Fix                                                          |
| ------------------------------------ | ------------------------------- | ------------------------------------------------------------ |
| "Collection not found"               | Wrong collection ID             | Ensure COLLECTIONS constant matches exactly                  |
| "Permission denied"                  | Role not in read/write list     | Update collection permissions in console                     |
| "Document not found" after migration | Wrong database ID               | Verify `APPWRITE_DATABASE_ID` matches your actual DB ID      |
| "Attribute not allowed"              | Missing attribute in collection | Add attribute in collection settings                         |
| Slow queries                         | No indexes                      | Add indexes on foreign keys (organization_id, user_id, etc.) |

---

## Rollback Plan

If migration fails:

1. Revert `DATABASE_MODE=supabase` (or `standalone`)
2. Supabase data untouched (dual-write phase not yet active)
3. No data loss; app continues on original DB

---

**Next step:** After collections are created, run the data migration script:
`node scripts/migrate-to-appwrite.js`
