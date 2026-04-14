# ✅ AppWrite Database Setup
# Optimized for AppWrite Free Plan
---

## 📋 AppWrite Collection Structure

| Collection | ID | Permissions |
|---|---|---|
| Organizations | `organizations` | `documentCreate=users` |
| Users | `users` | `documentRead=users` |
| Cases | `cases` | `documentRead=users` |
| Tasks | `tasks` | `documentRead=users` |
| Documents | `documents` | `documentRead=users` |
| Communications | `communications` | `documentRead=users` |
| Invoices | `invoices` | `documentRead=users` |
| Invoice Items | `invoice_items` | `documentRead=users` |
| Chat Rooms | `chat_rooms` | `documentRead=users` |
| Chat Messages | `chat_messages` | `documentRead=users` |
| Audit Logs | `audit_logs` | `documentCreate=users` |

---

## 🔐 Collection Configuration

---

### 📁 Collection: `organizations`
| Attribute | Type | Required | Array | Default |
|---|---|---|---|---|
| `name` | string | ✅ | ❌ | |
| `registration_number` | string | ❌ | ❌ | |
| `address` | string | ❌ | ❌ | |
| `phone` | string | ❌ | ❌ | |
| `email` | email | ✅ | ❌ | |
| `plan_type` | enum | ❌ | ❌ | `free` |
| `is_verified` | boolean | ❌ | ❌ | `false` |

**Indexes:**
- `email` unique

---

### 📁 Collection: `users`
| Attribute | Type | Required | Array | Default |
|---|---|---|---|---|
| `organization_id` | string | ✅ | ❌ | |
| `username` | string | ✅ | ❌ | |
| `email` | email | ✅ | ❌ | |
| `phone` | string | ❌ | ❌ | |
| `role` | enum | ✅ | ❌ | `individual` |
| `title` | string | ❌ | ❌ | |
| `bio` | string | ❌ | ❌ | |
| `practice_areas` | string | ❌ | ✅ | |
| `timezone` | string | ❌ | ❌ | `EAT` |
| `status` | enum | ✅ | ❌ | `Active` |
| `messaging_enabled` | boolean | ❌ | ❌ | `true` |
| `deadline_notifications` | boolean | ❌ | ❌ | `true` |

**Indexes:**
- `email` unique
- `organization_id`
- `role`

---

### 📁 Collection: `cases`
| Attribute | Type | Required | Array | Default |
|---|---|---|---|---|
| `organization_id` | string | ✅ | ❌ | |
| `case_number` | string | ✅ | ❌ | |
| `title` | string | ✅ | ❌ | |
| `description` | string | ❌ | ❌ | |
| `status` | enum | ✅ | ❌ | `open` |
| `start_date` | datetime | ❌ | ❌ | |
| `end_date` | datetime | ❌ | ❌ | |
| `client_id` | string | ❌ | ❌ | |
| `advocate_id` | string | ❌ | ❌ | |
| `court_id` | integer | ❌ | ❌ | |
| `created_by` | string | ✅ | ❌ | |

**Indexes:**
- `organization_id`
- `case_number` unique
- `advocate_id`
- `client_id`

---

### 📁 Collection: `tasks`
| Attribute | Type | Required | Array | Default |
|---|---|---|---|---|
| `organization_id` | string | ✅ | ❌ | |
| `title` | string | ✅ | ❌ | |
| `description` | string | ❌ | ❌ | |
| `assigned_to` | string | ❌ | ❌ | |
| `case_id` | string | ❌ | ❌ | |
| `priority` | enum | ✅ | ❌ | `low` |
| `deadline` | datetime | ❌ | ❌ | |
| `status` | boolean | ✅ | ❌ | `false` |
| `created_by` | string | ✅ | ❌ | |

**Indexes:**
- `organization_id`
- `assigned_to`
- `case_id`

---

### 📁 Collection: `documents`
| Attribute | Type | Required | Array | Default |
|---|---|---|---|---|
| `organization_id` | string | ✅ | ❌ | |
| `title` | string | ✅ | ❌ | |
| `description` | string | ❌ | ❌ | |
| `owner` | string | ✅ | ❌ | |
| `file_id` | string | ✅ | ❌ | |
| `file_size` | integer | ✅ | ❌ | |
| `mime_type` | string | ✅ | ❌ | |
| `shared_with` | string | ❌ | ✅ | |

**Indexes:**
- `organization_id`
- `owner`

---

### 📁 Collection: `invoices`
| Attribute | Type | Required | Array | Default |
|---|---|---|---|---|
| `organization_id` | string | ✅ | ❌ | |
| `invoice_number` | string | ✅ | ❌ | |
| `client_name` | string | ✅ | ❌ | |
| `client_address` | string | ❌ | ❌ | |
| `date` | datetime | ✅ | ❌ | |
| `total_amount` | double | ✅ | ❌ | |
| `tax` | double | ✅ | ❌ | `0` |
| `amount_due` | double | ✅ | ❌ | |
| `status` | enum | ✅ | ❌ | `pending` |
| `terms` | string | ❌ | ❌ | |
| `created_by` | string | ✅ | ❌ | |

**Indexes:**
- `organization_id`
- `invoice_number` unique

---

### 📁 Collection: `chat_rooms`
| Attribute | Type | Required | Array | Default |
|---|---|---|---|---|
| `organization_id` | string | ✅ | ❌ | |
| `room_name` | string | ✅ | ❌ | |
| `participants` | string | ✅ | ✅ | |

**Indexes:**
- `organization_id`
- `room_name` unique

---

### 📁 Collection: `chat_messages`
| Attribute | Type | Required | Array | Default |
|---|---|---|---|---|
| `room_id` | string | ✅ | ❌ | |
| `sender` | string | ✅ | ❌ | |
| `content` | string | ✅ | ❌ | |

**Indexes:**
- `room_id`

---

## 🔒 Security Permissions (AppWrite Free Plan Compatible)

### Document Level Security Rules:
```javascript
// Organization isolation for ALL collections
rules.read =  (resource.data.organization_id === user.prefs.organization_id);
rules.write = (resource.data.organization_id === user.prefs.organization_id);

// Users can only modify their own profile
users.rules.write = (resource.$id === user.$id);

// Documents can be shared
documents.rules.read = (
  resource.data.organization_id === user.prefs.organization_id
  || resource.data.owner === user.$id
  || resource.data.shared_with.includes(user.$id)
);

// Chat messages only visible to room participants
chat_messages.rules.read = (
  chat_rooms.participants.includes(user.$id)
);
```

---

## 🚀 Deployment Steps

1. **Create AppWrite Project** at cloud.appwrite.io
2. **Create all collections** exactly as above
3. **Enable permissions** for authenticated users
4. **Set user preferences** to include `organization_id` on signup
5. **Enable storage bucket** for document uploads (max 1GB free)
6. **Enable realtime** for chat functionality

---

## 📦 Free Plan Limits Optimized:
✅ **Documents**: 1GB storage  
✅ **Database**: 1GB storage  
✅ **Bandwidth**: 10GB/month  
✅ **Realtime**: 100 concurrent connections  
✅ **Users**: Unlimited
