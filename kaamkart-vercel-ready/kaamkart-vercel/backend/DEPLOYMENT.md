# Backend deployment note

This service is Node.js + Fastify + Prisma + PostgreSQL.

Use a Node backend host (for example Railway or Render) rather than treating it as a Vercel static frontend.

Build:
`npm run build`

Start:
`npm start`

Before starting, configure `DATABASE_URL` and `JWT_SECRET`. Optional integrations are Twilio and Cloudinary; see `.env.example`.

After deployment, copy the backend's public URL into the Vercel frontend environment variable:
`VITE_API_URL=https://YOUR-BACKEND-DOMAIN`
