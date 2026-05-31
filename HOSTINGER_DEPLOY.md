# Hostinger deployment (Frontend + Backend)

This project can run as one Node app on Hostinger:

- Frontend: Vite build output in `dist/`
- Backend: Express server in `backend/server.js`

## 1) Required environment variables

Set these in Hostinger Node.js app environment:

- `PORT` = `3000` (or leave default from Hostinger)
- `SUPABASE_URL` = `https://tnydnozasrujirtfytpj.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key
- `RESEND_API_KEY` = your Resend API key
- `ORDER_NOTIFICATION_EMAIL` = `info@elixlumi.com`
- `ORDER_EMAIL_FROM` = `Elixlumi Orders <onboarding@resend.dev>`

Also set this for frontend build:

- `VITE_ORDER_API_URL` = `https://your-domain.com/api/submit-order`

## 2) Build locally and upload

Run locally:

```sh
npm install
npm run build
```

Upload to Hostinger (Node app root):

- `package.json`
- `package-lock.json` (if generated)
- `backend/`
- `dist/`
- any other runtime files needed by your app

## 3) Install dependencies on Hostinger

In Hostinger terminal:

```sh
npm install --omit=dev
```

## 4) Start command

Use this app start command:

```sh
npm start
```

This runs `backend/server.js`, serves API endpoints and static frontend from `dist`.

## 5) Endpoints

- Health check: `/api/health`
- Order submit (browser check): `/api/submit-order` (GET)
- Real submit: `/api/submit-order` (POST)

## 6) Important note

The admin pages still read orders directly from Supabase client-side. Keep your Supabase project active and correct keys in frontend env if admin dashboard is used.
