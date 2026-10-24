# Luma Studio — Modern Appointment Scheduling Platform

A production-style appointment booking MVP for service-based businesses.

## Stack

- React + Vite
- Tailwind CSS
- React Router
- Axios
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcryptjs
- Helmet
- express-rate-limit

## Local setup

### Backend

```bash
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```

Windows PowerShell can use:

```powershell
Copy-Item .env.example .env
```

Set `MONGODB_URI`, `JWT_SECRET` and `CLIENT_URL` in `.env`.

### Frontend

```bash
cd client
npm install
```

Create `.env` from `.env.example`:

```text
VITE_API_URL=http://localhost:5000/api
```

Then:

```bash
npm run dev
```

## Demo admin

```text
Email: admin@lumastudio.com
Password: Admin@123
```

Change the demo credentials before production use.

## Important availability behavior

The source of truth for business hours is the MongoDB `Availability` document. The customer slot engine accounts for:

- Service duration
- Business opening/closing time
- Break periods
- Existing pending/confirmed bookings
- Past dates
- Past times on the current day
- Cancelled bookings no longer blocking availability

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

See `DEVELOPMENT_ROADMAP.md` for the full product plan and acceptance checklist.
