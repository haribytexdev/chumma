# KaamKart — Vercel Ready

This package is prepared for deploying the **React + Vite frontend on Vercel**.
The Node.js + Fastify + Prisma backend is kept in `backend/` and should be deployed separately to a backend host such as Railway or Render.

## Deploy frontend to Vercel

1. Import this project/repository into Vercel.
2. Keep the project root as this folder.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add this Vercel Environment Variable:

   `VITE_API_URL=https://YOUR-BACKEND-DOMAIN`

6. Deploy.

The included `vercel.json` handles React Router routes so refreshing `/login`, `/customer`, `/worker`, etc. does not return a 404.

## Backend

The backend is **not a Vercel static frontend**. It is Fastify + Prisma + PostgreSQL and needs a Node-compatible backend host plus a hosted PostgreSQL database.

Backend start flow:

```bash
npm install
npx prisma generate
npm run build
npm start
```

Required backend environment variables are documented in `backend/.env.example`.

After the backend is live, put its public URL into Vercel as `VITE_API_URL` and redeploy the frontend.

## Important

Do not put real API keys, JWT secrets, Twilio credentials, Cloudinary secrets, or database passwords into this ZIP or the frontend. Configure secrets in the hosting provider's environment-variable settings.
