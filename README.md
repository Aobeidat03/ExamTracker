# ExamTracker

A full-stack web application for university students to manage their exam schedules.

## Features

- Secure signup / login with JWT authentication
- Private exam table per student (Course, Course ID, Day, Time, Room, Date)
- Add, edit, and delete exams via a modal form
- Dashboard with stats (total, upcoming, next exam date)
- Exams sorted by date; past exams visually dimmed
- Day auto-fills when you pick a Date
- Export exam schedule as a styled PDF
- Mobile-friendly responsive layout
- Rate limiting, input validation, bcrypt password hashing, helmet security headers

---

## Project Structure

```
ExamTracker/
├── backend/
│   ├── src/
│   │   ├── controllers/   authController.js, examController.js
│   │   ├── db/            index.js, schema.sql
│   │   ├── middleware/    auth.js, rateLimiter.js
│   │   ├── routes/        auth.js, exams.js
│   │   └── index.js       Express entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/    Header, ExamTable, ExamForm, Modal, Toast, LoadingSpinner
    │   ├── context/       AuthContext.jsx
    │   ├── hooks/         useToast.js
    │   ├── pages/         Login, Signup, Dashboard
    │   ├── utils/         api.js, pdfExport.js
    │   └── App.jsx
    ├── .env.example
    └── package.json
```

---

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ running locally (or a cloud database)

---

## Local Setup

### 1. Clone / enter the project

```bash
cd ExamTracker
```

### 2. Set up the database

```bash
# Create a database
psql -U postgres -c "CREATE DATABASE examtracker;"

# Run the schema
psql -U postgres -d examtracker -f backend/src/db/schema.sql
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/examtracker
JWT_SECRET=generate_a_strong_64_char_random_string_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

To generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Install backend dependencies and start

```bash
cd backend
npm install
npm run dev       # starts on http://localhost:5000
```

### 5. Configure the frontend

```bash
cd frontend
cp .env.example .env
```

For local development, leave `VITE_API_URL` **empty** — Vite's proxy automatically forwards `/api` requests to `localhost:5000`.

```env
VITE_API_URL=
```

### 6. Install frontend dependencies and start

```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Deployment

### Backend → Render (free tier)

1. Push your code to a GitHub repository.
2. Go to [render.com](https://render.com) → **New → Web Service**.
3. Connect your GitHub repo and select the **`backend`** folder as the root directory.
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Runtime:** Node
4. Add environment variables under **Environment**:
   - `DATABASE_URL` — your production Postgres URL (see below)
   - `JWT_SECRET` — your strong secret
   - `JWT_EXPIRES_IN` — `7d`
   - `FRONTEND_URL` — your Vercel frontend URL (add after deploying frontend)
   - `NODE_ENV` — `production`
5. For the database: **New → PostgreSQL** on Render (free tier). Copy the **Internal Database URL** into `DATABASE_URL`.
6. After the first deploy, run the schema once via the Render shell or a local `psql` connection:
   ```bash
   psql $DATABASE_URL -f backend/src/db/schema.sql
   ```
7. Your backend will be live at `https://your-service.onrender.com`.

---

### Frontend → Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) → **New Project → Import Git Repository**.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**.
4. Add environment variable:
   - `VITE_API_URL` = `https://your-service.onrender.com` (your Render backend URL, **no trailing slash**)
5. Click **Deploy**.
6. Your frontend will be live at `https://your-app.vercel.app`.

After deploying both:
- Go back to Render → Environment → update `FRONTEND_URL` to your Vercel URL.
- Trigger a redeploy on Render so CORS takes effect.

---

## Environment Variables Reference

### backend/.env

| Variable       | Description                                  | Example                          |
|----------------|----------------------------------------------|----------------------------------|
| `PORT`         | Port the Express server listens on           | `5000`                           |
| `DATABASE_URL` | Full PostgreSQL connection string            | `postgresql://user:pw@host/db`   |
| `JWT_SECRET`   | Secret key for signing JWTs (min 32 chars)   | `a7f3...` (64-char hex string)   |
| `JWT_EXPIRES_IN` | JWT expiry duration                        | `7d`                             |
| `FRONTEND_URL` | Allowed CORS origin                          | `https://your-app.vercel.app`    |
| `NODE_ENV`     | `development` or `production`                | `production`                     |

### frontend/.env

| Variable       | Description                                  | Example                                    |
|----------------|----------------------------------------------|--------------------------------------------|
| `VITE_API_URL` | Backend base URL (empty for local dev proxy) | `https://your-service.onrender.com`        |

---

## Security Notes

- Passwords hashed with **bcrypt** (12 salt rounds) — never stored plain text.
- All protected routes require a valid **JWT Bearer token**.
- SQL queries use **parameterized statements** — no SQL injection risk.
- React escapes output by default — no XSS risk from user content.
- **Helmet** sets secure HTTP headers on every response.
- **Rate limiting**: 10 requests per 15 min on auth routes; 200 per 15 min on API routes.
- Each student can only read and modify **their own** exams (enforced at the DB query level).
- Secrets are stored in environment variables, never in source code.
- CORS is restricted to the configured frontend origin.

---

## API Endpoints

| Method | Path                  | Auth | Description           |
|--------|-----------------------|------|-----------------------|
| POST   | `/api/auth/signup`    | No   | Create account        |
| POST   | `/api/auth/login`     | No   | Login, returns JWT    |
| GET    | `/api/auth/profile`   | Yes  | Get current user info |
| GET    | `/api/exams`          | Yes  | List all your exams   |
| POST   | `/api/exams`          | Yes  | Create an exam        |
| PUT    | `/api/exams/:id`      | Yes  | Update an exam        |
| DELETE | `/api/exams/:id`      | Yes  | Delete an exam        |
| GET    | `/api/health`         | No   | Health check          |
