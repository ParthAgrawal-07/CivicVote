# CivicVote — Student Body Government Voting System

A secure, full-stack online voting platform for college Student Body Government elections.
Anonymous ballots, duplicate prevention, audit logging, and a live admin dashboard.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18 + Vite + TailwindCSS           |
| Backend   | Node.js + Express.js                    |
| Database  | PostgreSQL via Prisma ORM               |
| Auth      | JWT (access + refresh) + bcrypt + OTP   |
| Email     | Nodemailer (college SMTP)               |
| Security  | Helmet, express-rate-limit, Zod, HMAC   |

---

## Project Structure

```
civicvote/
├── frontend/               React + Vite app
│   └── src/
│       ├── pages/          LoginPage, VoterPage, AdminPage
│       ├── hooks/          useAuth, useElections, useAdmin
│       ├── components/     Toast
│       ├── utils/          api.js (axios), constants.js
│       └── styles/         index.css (Tailwind)
├── backend/                Express API
│   ├── src/
│   │   ├── routes/         auth, elections, admin
│   │   ├── controllers/    authController, electionController,
│   │   │                   voteController, adminController
│   │   ├── middleware/     authenticate, authorize, validate, errorHandler
│   │   ├── models/         prisma.js (singleton)
│   │   └── utils/          jwt, hash, email, audit
│   └── prisma/
│       ├── schema.prisma   Full DB schema
│       └── seed.js         Demo data
├── student_voting_system_v2.html   Visual prototype (reference)
└── CURSOR_PROMPT.md                Paste into Cursor AI to get full context
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally (or a hosted DB)
- A college SMTP server (or use Mailtrap for dev)

---

### 1. Clone and install

```bash
# Backend
cd backend
npm install
cp .env.example .env        # Fill in your values

# Frontend
cd ../frontend
npm install
```

---

### 2. Configure environment

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/civicvote"
JWT_SECRET="run: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
JWT_REFRESH_SECRET="same as above, different value"
APP_SECRET="same as above, different value — NEVER change after launch"
SMTP_HOST="smtp.college.edu"
SMTP_PORT=587
SMTP_USER="noreply@college.edu"
SMTP_PASS="your-smtp-password"
CORS_ORIGIN="http://localhost:5173"
PORT=4000
```

> **For development email**: Use [Mailtrap](https://mailtrap.io) — free SMTP sandbox.
> Set `SMTP_HOST=sandbox.smtp.mailtrap.io` and paste Mailtrap credentials.

---

### 3. Set up the database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed with demo data
node prisma/seed.js
```

You should see:
```
✅ Seed complete!

📋 Login credentials:
   Admin   → admin@college.edu / Admin@123
   Student → alex.patel@college.edu / Student@123
```

---

### 4. Run the servers

```bash
# Terminal 1 — Backend API (port 4000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Demo Credentials

| Role    | Email                     | Password      | Student ID   |
|---------|---------------------------|---------------|--------------|
| Admin   | admin@college.edu         | Admin@123     | ADM-001      |
| Student | alex.patel@college.edu    | Student@123   | STU-2024-001 |
| Student | priya.nair@college.edu    | Student@123   | STU-2024-002 |

---

## Security Architecture

### Anonymous Voting
```
voterToken = HMAC-SHA256(userId + ":" + electionId, APP_SECRET)
```
- The `Ballot` table **never stores `userId`** — only the hashed token
- This allows duplicate detection **without linking identity to vote**
- The hash is one-way — even the database admin cannot determine who voted for whom
- **Critical**: Never change `APP_SECRET` after launch — it would invalidate all existing tokens

### One Vote Enforcement
```sql
UNIQUE(voterToken, electionId)  -- in the Ballot table
```
- Enforced at the **database level** — cannot be bypassed by the application layer
- Duplicate attempts return HTTP 409 and are logged to the audit table

### JWT Strategy
- **Access token**: 15-minute expiry, stored in React memory (`window.__accessToken`)
- **Refresh token**: 7-day expiry, stored in `httpOnly` cookie (not accessible to JS)
- On 401, the axios interceptor silently refreshes and retries the request
- On refresh failure, user is redirected to `/login`

### Rate Limiting
| Endpoint       | Limit          |
|----------------|----------------|
| Auth routes    | 10 req / min   |
| Vote routes    | 30 req / min   |
| All others     | 200 req / 15min|

### Input Validation
All API inputs are validated with **Zod schemas** before hitting the database.

---

## API Reference

### Auth
```
POST /api/auth/login          { studentId, email, password }
POST /api/auth/verify-otp     { userId, code }
POST /api/auth/refresh        (uses httpOnly cookie)
POST /api/auth/logout
GET  /api/auth/me
```

### Elections (Student)
```
GET  /api/elections           List all LIVE elections + voted status
GET  /api/elections/:id       Single election detail
POST /api/elections/:id/vote  { candidateId }  → cast anonymous ballot
```

### Elections (Admin)
```
POST   /api/elections                           Create election
PUT    /api/elections/:id                       Update election
DELETE /api/elections/:id                       Delete election
POST   /api/elections/:id/candidates            Add candidate
DELETE /api/elections/:id/candidates/:cid       Remove candidate
```

### Admin
```
GET /api/admin/dashboard    Metrics + full results per election
GET /api/admin/audit        Paginated audit log (?page=1&limit=50)
```

---

## Deployment

### Production checklist
- [ ] Set `NODE_ENV=production` in backend
- [ ] Use strong random values for all three secrets in `.env`
- [ ] Enable HTTPS (use Nginx + Let's Encrypt or a platform like Railway/Render)
- [ ] Set `secure: true` on cookies (already conditional on `NODE_ENV`)
- [ ] Point `CORS_ORIGIN` to your production frontend domain
- [ ] Run `npx prisma migrate deploy` (not `dev`) in production
- [ ] Set up DB backups
- [ ] Consider adding `pg_cron` or a cron job to auto-close elections past `endsAt`

### Recommended platforms
- **Backend**: [Railway](https://railway.app) or [Render](https://render.com) — both have free PostgreSQL
- **Frontend**: [Vercel](https://vercel.com) — deploys from GitHub, zero config for Vite
- **Email**: Your college's SMTP, or [Resend](https://resend.com) for transactional email

---

## Extending the System

| Feature                  | Where to add                                      |
|--------------------------|---------------------------------------------------|
| Department-based eligibility | Filter `listLive` by `user.department` vs `election.eligibleGroup` |
| Write-in candidates      | Add a text input when `election.allowWriteIn` is true |
| Email results to voters  | Cron job after `endsAt` using `utils/email.js`    |
| PDF ballot export        | Admin panel → use `pdfkit` to generate results PDF |
| Two-factor auth          | Extend OTP flow to use TOTP (Google Authenticator) |
| Candidate photos         | Upload to S3/Cloudinary, store URL in `Candidate.photoUrl` |
| Multiple choice ballots  | Add a `maxChoices` field to Election and relax the unique constraint |

---

## License

MIT — free to use and modify for your college's Student Body Government.
