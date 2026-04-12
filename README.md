# WakiliWorld Standalone Frontend

This is a rebuilt, Vercel-ready React frontend for `TwB-Cases / WakiliWorld`.

The app now works in standalone mode:

- Authentication is handled locally.
- Cases, clients, tasks, documents, invoices, chats, settings, and onboarding requests persist in `localStorage`.
- The existing UI is preserved, but it no longer depends on the old backend to be useful.

## Demo Accounts

- Advocate: `advocate@wakiliworld.local` / `demo1234`
- Client: `client@wakiliworld.local` / `demo1234`
- Admin: `admin@wakiliworld.local` / `demo1234`

## Scripts

```bash
npm install
npm start
npm run build
```

## Deploying To Vercel

This project is configured for static deployment:

- Build command: `npm run build`
- Output directory: `build`
- SPA rewrites are defined in `vercel.json`

## Notes

- Google Analytics is now opt-in through `REACT_APP_GA_ID`.
- App data is stored locally in the browser under `wakiliworld.frontend.db.v1`.
- To reset the app state, clear local storage in the browser.
