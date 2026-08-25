# DES Unified Platform — Developer Setup Guide

> Step-by-step instructions for new developers to set up and run the **frontend** and **backend** locally.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone the Repository](#2-clone-the-repository)
3. [Start Local Services (PostgreSQL + Redis)](#3-start-local-services-postgresql--redis)
4. [Backend Setup](#4-backend-setup)
5. [Frontend Setup](#5-frontend-setup)
6. [Run the Servers](#6-run-the-servers)
7. [Verify Everything Works](#7-verify-everything-works)
8. [Useful Commands](#8-useful-commands)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

Install these before you begin:

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20+ | Runtime for frontend and backend |
| **pnpm** | 10+ | Package manager (used across the repo) |
| **Docker Desktop** | Latest | Local PostgreSQL and Redis via `docker-compose` |
| **Git** | Latest | Clone and pull the repo |

### Install pnpm (if missing)

```bash
npm install -g pnpm
```

### Verify installations

```bash
node -v    # should be v20+
pnpm -v    # should be v10+
docker -v  # Docker CLI available
docker compose version
```

---

## 2. Clone the Repository

```bash
git clone https://github.com/pranavdadhe1806/DES-PU-Student-Portal.git
cd DES-PU-Student-Portal
```

**Repo structure:**

```
des-pu-student-portal/
├── frontend/          → Next.js app (port 3000)
├── backend/           → Express API (port 5000)
├── docker-compose.yml → Local PostgreSQL + Redis
└── PLAN/              → Project docs (this file lives here)
```

---

## 3. Start Local Services (PostgreSQL + Redis)

From the **repo root**, start the database and cache containers:

```bash
docker compose up -d
```

This starts:

| Service | Container | Host Port | Credentials |
|---------|-----------|-----------|-------------|
| PostgreSQL 16 | `des-pu-postgres` | **5433** | user: `postgres`, password: `postgres`, db: `des_pu` |
| Redis 7 | `des-pu-redis` | **6379** | no password (local dev only) |

> **Why port 5433?** Many machines already run PostgreSQL on `5432`. Docker maps Postgres to **5433** on your host to avoid conflicts.

Check that containers are healthy:

```bash
docker compose ps
```

Both services should show `healthy` status.

---

## 4. Backend Setup

### 4.1 Navigate to backend

```bash
cd backend
```

### 4.2 Create environment file

Copy the example env file and fill in local values:

**Linux / macOS / Git Bash:**

```bash
cp .env.example .env
```

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env` with these **local development** values:

```env
PORT=5000
NODE_ENV=development

# Local Docker Postgres (note port 5433, not 5432)
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/des_pu?schema=public

# Min 64 chars — change this for anything beyond local dev
JWT_SECRET=des-pu-local-dev-jwt-secret-replace-before-production-min-64-chars
JWT_EXPIRES_IN=7d

# Local Docker Redis
REDIS_URL=redis://localhost:6379

# Optional — not needed to start the server
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
ANTHROPIC_API_KEY=

CORS_ORIGIN=http://localhost:3000
LOGTAIL_SOURCE_TOKEN=
```

> **Never commit `.env`** — it is gitignored.

### 4.3 Install dependencies

```bash
pnpm install
```

### 4.4 Generate Prisma client

Prisma 7 uses a PostgreSQL driver adapter (`@prisma/adapter-pg` + `pg`), which is already listed in `package.json`.

```bash
pnpm prisma:generate
```

### 4.5 Sync database schema

For first-time setup (no migration history yet), push the schema to your local database:

```bash
pnpm exec prisma db push
```

Once migration files exist in the repo, prefer:

```bash
pnpm prisma:migrate
```

### 4.6 (Optional) Open Prisma Studio

Browse/edit database records in a GUI:

```bash
pnpm prisma:studio
```

Opens at http://localhost:5555

---

## 5. Frontend Setup

### 5.1 Navigate to frontend

From repo root:

```bash
cd frontend
```

### 5.2 Create environment file

**Linux / macOS / Git Bash:**

```bash
cp .env.example .env.local
```

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_R2_PUBLIC_URL=
```

> **Never commit `.env.local`** — it is gitignored.

### 5.3 Install dependencies

```bash
pnpm install
```

---

## 6. Run the Servers

You need **three terminals** (or run Docker once and reuse it across sessions).

### Terminal 1 — Database & Redis (once per machine session)

From **repo root**:

```bash
docker compose up -d
```

### Terminal 2 — Backend

```bash
cd backend
pnpm dev
```

Backend starts at:

- **API base:** http://localhost:5000
- **Health check:** http://localhost:5000/health

### Terminal 3 — Frontend

```bash
cd frontend
pnpm dev
```

Frontend starts at:

- **App:** http://localhost:3000

---

## 7. Verify Everything Works

### Backend health check

**Linux / macOS / Git Bash:**

```bash
curl http://localhost:5000/health
```

**Windows PowerShell:**

```powershell
curl.exe http://localhost:5000/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-08-25T17:00:50.905Z",
  "uptime": 46.11
}
```

### Frontend

Open http://localhost:3000 in your browser. You should see the app shell (login page or dashboard depending on route).

### Docker services

```bash
docker compose ps
```

Both `des-pu-postgres` and `des-pu-redis` should be `Up` and `healthy`.

---

## 8. Useful Commands

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot reload (nodemon + ts-node) |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run production build (`node dist/index.js`) |
| `pnpm type-check` | TypeScript check without emitting files |
| `pnpm prisma:generate` | Regenerate Prisma client after schema changes |
| `pnpm prisma:migrate` | Create/apply migrations (when migration files exist) |
| `pnpm prisma:studio` | Open Prisma Studio GUI |
| `pnpm prisma:reset` | Reset database (destructive — dev only) |

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run production build locally |

### Docker (repo root)

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start Postgres + Redis in background |
| `docker compose down` | Stop containers (keeps data volume) |
| `docker compose down -v` | Stop containers and **delete all DB data** |
| `docker compose ps` | Show container status |
| `docker compose logs postgres` | View Postgres logs |
| `docker compose logs redis` | View Redis logs |

---

## 9. Troubleshooting

### `Authentication failed` when running Prisma

**Cause:** `DATABASE_URL` is pointing at the wrong Postgres instance (often a local install on port 5432 instead of Docker on 5433).

**Fix:** Ensure your `.env` uses port **5433**:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/des_pu?schema=public
```

Confirm Docker Postgres is running:

```bash
docker compose ps
```

### `PrismaClient requires adapter` error

**Cause:** Prisma 7 requires `@prisma/adapter-pg` and `pg`.

**Fix:**

```bash
cd backend
pnpm install
pnpm prisma:generate
```

These packages are already in `package.json`; re-run install if you pulled fresh code.

### Port 5000 or 3000 already in use

**Backend (5000):** Stop the other process or change `PORT` in `backend/.env`.

**Frontend (3000):** Next.js will offer the next free port (e.g. 3001) automatically.

Find what's using a port on Windows:

```powershell
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

### Backend starts but API routes return 404

The server bootstrap (`/health`, middleware, route mounts) is implemented. Individual route **handlers** (auth, forums, chat, etc.) are still being built per `PLAN/PHASE_WISE_EXECUTION.md`. A 404 on `/api/v1/auth/login` before Phase 2 is expected.

### Docker Desktop not running

You'll see errors like `Cannot connect to the Docker daemon`. Start **Docker Desktop** and retry:

```bash
docker compose up -d
```

### `pnpm: command not found`

Install pnpm globally:

```bash
npm install -g pnpm
```

Or enable Corepack (Node 20+):

```bash
corepack enable
corepack prepare pnpm@10.28.2 --activate
```

### Fresh clone — full setup checklist

```bash
# 1. Clone
git clone https://github.com/pranavdadhe1806/DES-PU-Student-Portal.git
cd DES-PU-Student-Portal

# 2. Start Docker services
docker compose up -d

# 3. Backend
cd backend
cp .env.example .env          # then edit with local values above
pnpm install
pnpm prisma:generate
pnpm exec prisma db push

# 4. Frontend
cd ../frontend
cp .env.example .env.local      # then edit with local values above
pnpm install

# 5. Run (two separate terminals)
cd ../backend && pnpm dev
cd ../frontend && pnpm dev
```

---

## Related Docs

| File | Purpose |
|------|---------|
| [PLAN.md](./PLAN.md) | Architecture rules and tech stack |
| [PHASE_WISE_EXECUTION.md](./PHASE_WISE_EXECUTION.md) | Backend implementation roadmap |
| [REPO.md](./REPO.md) | Full repository file map |
| [../README.md](../README.md) | Project overview |

---

*Built by DES students, for DES students.*
