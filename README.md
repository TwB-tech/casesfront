# WakiliWorld — Neon Postgres Migration

This repo now supports running against Neon Postgres via `DATABASE_MODE=postgres`.

## Quick start

1. Copy `.env.example` to `.env` and set:
   - `DATABASE_MODE=postgres`
   - `NEON_DATABASE_URL=postgres://user:pass@host/db`
   - `SENDER_EMAIL=a1kkamau@gmail.com`
2. Install dependencies: `npm install`
3. Provision schema: `npm run db:setup-neon`
4. Run: `npm run dev`

## Environment

- `DATABASE_MODE=postgres` is required to use the Postgres/Neon proxy.
- Frontend never sees database credentials. Serverless routes in `/api/*` use `NEON_DATABASE_URL`.

## Neon schema

The app creates these tables via `scripts/setup-neon.js`:

- `users`
- `organizations`
- `cases`
- `tasks`
- `documents`
- `communications`
- `invites`
- `invoices`
- `invoice_items`
- `chat_rooms`
- `chat_messages`
- `service_requests`
- `reviews`
- `audit_logs`
- `expenses`
- `payroll_runs`
- `notes`
- `leave_requests`
- `admin_settings`
- `onboarding`
- `subscriptions`
- `courts`

Each table includes:
- String PK `id` except `courts` which uses `SERIAL`
- Timestamps: `created_at`, `updated_at`
- Org-level isolation via `organization_id`

Seed accounts:
- advocate@wakiliworld.local / demo1234
- client@wakiliworld.local / demo1234
- admin@wakiliworld.local / demo1234

## Deploy to Vercel

- Build command: `npm run build`
- Output: `dist`
- Env vars in Vercel:
  - `DATABASE_MODE=postgres`
  - `NEON_DATABASE_URL=...`
  - `SENDER_EMAIL=a1kkamau@gmail.com`

## Theme

The registration and login forms use a purple/black design:
- Futuristic palette: near-black backgrounds with deep purple accents and light surfaces
- Log in and sign up are visually aligned
- Buttons use accent purple; inputs use dark surface backgrounds

## Registration notes

- Registration always goes through `/auth/register` via the selected DB proxy.
- Validation, error handling, and rate limiting are in `src/contexts/authContext.jsx`.
- After success, users are redirected to `/login`.
