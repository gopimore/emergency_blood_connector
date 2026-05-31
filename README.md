# Emergency Blood Connector

Real-time emergency blood donation platform connecting donors, hospitals, and admins.

## Project structure

```
ebc/
├── backend/     # Node.js + Express + MongoDB + Socket.io API
└── frontend/    # React + Vite + Tailwind CSS
```

## Prerequisites

- Node.js 18+
- MongoDB running locally or Atlas URI

## Quick start (development)

```bash
# From project root
npm install
npm run install:all
npm run setup          # creates backend/.env if missing

# Start MongoDB (pick one):
npm run db:up          # Docker — recommended
# OR install MongoDB locally and ensure it runs on port 27017

# Run API + React together
npm run dev
```

If the backend exits with **Missing required environment variables**, run `npm run setup` or copy `backend/.env.example` → `backend/.env`.

| Service  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:3000  |
| API      | http://localhost:5000  |

Or run separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Production (single server)

Serves the built React app from Express on one port:

```bash
npm run build
cd backend
# Set NODE_ENV=production and CLIENT_URL=https://your-domain.com in .env
npm run start
```

Open http://localhost:5000 (or your configured `PORT`).

## Environment variables

See `backend/.env.example`. Required:

- `MONGO_URI`
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- `CLIENT_URL` — must match the browser origin (dev: `http://localhost:3000`)

Optional admin seed on startup:

- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`

## Roles & flows

| Role     | Register with                    | Main actions                                      |
|----------|----------------------------------|---------------------------------------------------|
| Donor    | `bloodGroup`                     | Profile + location, nearby requests, respond      |
| Hospital | `hospitalName`, `registrationNo`   | Create requests, manage status, find donors       |
| Admin    | Seeded via env                   | Stats, ban/unban/delete users                     |

## API

All routes under `/api/v1` — auth uses httpOnly JWT cookies.

Health check: `GET /health`

## Tech stack

**Backend:** Node.js (ESM), Express, Mongoose, Socket.io, JWT, Nodemailer, Helmet, rate limiting

**Frontend:** React 19, Vite, Tailwind CSS v4, React Router, Socket.io client
"# emergency_blood_connector" 
