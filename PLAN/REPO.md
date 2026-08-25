# DES Unified Platform — Repository Map (REPO.md)

> **Purpose:** Complete reference for every folder, file, and code component in this repository.  
> **Audience:** Developers, AI assistants, and new contributors who need full context.  
> **Last Updated:** 2026-08-25  
> **Repo:** `des-pu-student-portal`  
> **Related:** [SETUP.md](./SETUP.md) — step-by-step local dev setup for new developers

---

## Document Completeness

This file is the **repository map** — it explains what every folder and file is for, and documents key source files in detail. It does **not** reproduce every line of code (that would be unmaintainable across ~136 files).

| Coverage | Status |
|----------|--------|
| Root + Docker + env | ✅ Documented |
| `backend/src/` structure | ✅ All 31 files listed; bootstrap code explained in detail |
| `backend/tests/` | ✅ All 22 test files listed |
| `backend/prisma/schema.prisma` | ✅ Enums + model hierarchy (Forms included) |
| `frontend/` pages & components | ✅ All routes + components listed; shared/dashboard explained |
| Stub/TODO files | ✅ Marked as stubs with intended purpose |
| Line-by-line for every file | ❌ Not included — read source + use this map for navigation |

**Known inaccuracies fixed in this revision:** Docker Postgres port (`5433`), empty migrations folder, Prisma 7 adapter setup, missing `SETUP.md`, nested frontend routes.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Root Directory](#3-root-directory)
4. [Backend (`backend/`)](#4-backend)
5. [Frontend (`frontend/`)](#5-frontend)
6. [Planning Docs (`PLAN/`)](#6-planning-docs)
7. [Database Schema (Prisma)](#7-database-schema)
8. [Test Suite](#8-test-suite)
9. [Implementation Status](#9-implementation-status)
10. [Environment Variables](#10-environment-variables)
11. [Complete File Index](#11-complete-file-index)

---

## 1. Project Overview

**DES Unified Platform** is an all-in-one college portal for **DES Pune University** — combining Google Classroom + WhatsApp + Discord + GitHub features into a single app locked to `@despu.edu.in` emails.

### What It Does

| Feature | Description |
|---------|-------------|
| **Auth** | DES email registration, JWT in HTTP-only cookies, Argon2 hashing, RBAC |
| **Academic** | School → Department → Division → Semester hierarchy, subject enrollment |
| **Classroom** | Announcements, assignments, submissions, grading |
| **Forums** | Subject-wise threaded discussions, upvotes, bookmarks, full-text search |
| **Resources** | File upload to Cloudflare R2, presigned downloads, topper notes |
| **Chat** | 1-to-1 and group messaging, typing indicators, read receipts |
| **Notifications** | Real-time via Socket.io, in-app notification history |
| **Gamification** | XP system, auto-awarded badges, department leaderboards |
| **Projects** | Project marketplace, team applications, auto-created group chats |
| **Marksheets** | SGPA/CGPA calculation, faculty uploads, student self-view |
| **AI** | Claude-powered auto-tagging, thread summarization, skill matching |
| **Admin** | Content moderation, user bans, role management, audit logs |

### Design Constraints (Non-Negotiable)

- Never block the event loop — CPU-heavy work → BullMQ queues
- All handlers stateless — sessions in Redis, files in R2, never on disk
- No N+1 queries — always use Prisma `include`
- Every external call has a timeout (5s max)
- Global error handler — nothing crashes the process
- Route handlers respond in under 100ms
- Optimized for 600+ concurrent users

---

## 2. Tech Stack

### Backend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js (ES2022) | Server runtime |
| Framework | Express 5 | HTTP routing + middleware |
| Language | TypeScript 6 | Type safety |
| ORM | Prisma 7 | Database access + migrations |
| Database | PostgreSQL (Neon) | Primary data store |
| Cache/PubSub | Redis (Upstash) via ioredis | Sessions, cache, rate limits, Socket.io adapter |
| Job Queue | BullMQ | Background processing (files, AI, notifications) |
| Real-time | Socket.io + Redis adapter | Chat, presence, live notifications |
| File Storage | Cloudflare R2 (S3 SDK) | Uploads, presigned downloads |
| Auth | JWT + Argon2 + HTTP-only cookies | Stateless auth |
| Validation | Zod | Request body/param validation |
| AI | Anthropic Claude SDK | Auto-tagging, summarization |
| Image | Sharp | Thumbnail generation |
| Containerization | Docker (multi-stage) | Production deployment |

### Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | SSR/SSG React framework |
| Language | TypeScript 5 | Type safety |
| Styling | TailwindCSS 4 | Utility-first CSS |
| State | Zustand | Client-side state management |
| Data Fetching | TanStack React Query | Server state + caching |
| Forms | React Hook Form + Zod | Form validation |
| Animation | Framer Motion | Micro-animations |
| Rich Text | TipTap | Forum/message editor |
| Code Editor | Monaco Editor | In-browser IDE feature |
| Icons | Lucide React | Icon set |
| Charts | Recharts | Dashboard visualizations |
| Real-time | socket.io-client | Chat, notifications |
| Collaboration | Yjs + y-websocket | Real-time document editing |
| HTTP Client | Axios | API requests |

---

## 3. Root Directory

```
des-pu-student-portal/
├── .git/                          # Git version control
├── .gitignore                     # Ignores node_modules, .env, dist, .next, etc.
├── .vscode/
│   └── settings.json              # VS Code workspace settings
├── CLAUDE/                        # Claude Code configuration (legacy)
│   └── pranavdadhe1806/           # User-specific Claude config
├── PLAN/                          # 📋 Project planning documents (see Section 6)
├── README.md                      # Top-level project README
├── DES PU Logo.png                # University logo image (41KB)
├── docker-compose.yml             # Local dev: PostgreSQL 16 + Redis 7 containers
├── backend/                       # 🖥️ Express + TypeScript API server (see Section 4)
└── frontend/                      # 🌐 Next.js 16 web app (see Section 5)
```

### Root Files Explained

| File | Purpose |
|------|---------|
| `.gitignore` | Standard ignores: `node_modules/`, `.env`, `dist/`, `.next/`, OS files |
| `README.md` | Project intro, quick-start instructions, contribution guidelines |
| `DES PU Logo.png` | Official DES Pune University logo, used in frontend branding |
| `docker-compose.yml` | Spins up local PostgreSQL 16 (host port **5433**) + Redis 7 (port 6379) with health checks. Persist data via named volume `des_pu_postgres_data`. See [SETUP.md](./SETUP.md). |

### `docker-compose.yml` — Line by Line

```yaml
services:
  postgres:                        # Local PostgreSQL (Neon used in prod)
    image: postgres:16-alpine      # Lightweight Alpine variant
    container_name: des-pu-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres      # Default superuser
      POSTGRES_PASSWORD: postgres  # Local dev only — never use in prod
      POSTGRES_DB: des_pu          # Database name matching backend .env
    ports:
      - "5433:5432"                # Host 5433 avoids conflict with local Postgres on 5432
    volumes:
      - des_pu_postgres_data:/var/lib/postgresql/data  # Persist data across restarts
    healthcheck:                   # Docker waits for DB readiness before dependent services
      test: ["CMD-SHELL", "pg_isready -U postgres -d des_pu"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:                           # Local Redis (Upstash used in prod)
    image: redis:7-alpine
    container_name: des-pu-redis
    restart: unless-stopped
    ports:
      - "6379:6379"                # Standard Redis port
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  des_pu_postgres_data:            # Named volume for PostgreSQL data persistence
```

---

## 4. Backend

**Location:** `backend/`  
**Stack:** Express 5 + TypeScript + Prisma + PostgreSQL + Redis + BullMQ + Socket.io  
**Current State:** Scaffolded with stubs — partial implementations of app.ts, index.ts, redis.ts, prisma.ts, errorHandler.ts. All services/controllers/routes are TODO placeholders.

### 4.1 Backend Root Files

```
backend/
├── .env                           # 🔒 Real environment variables (NEVER committed)
├── .env.example                   # Template showing all required env vars
├── Dockerfile                     # Multi-stage Docker build for production
├── package.json                   # Dependencies + npm scripts
├── pnpm-lock.yaml                 # Lockfile for deterministic installs
├── pnpm-workspace.yaml            # PNPM workspace config
├── prisma/                        # Database schema + migrations
├── prisma.config.ts               # Prisma config (custom output path)
├── src/                           # Application source code
├── tests/                         # Test suite (Vitest + Supertest)
├── tsconfig.json                  # TypeScript configuration
└── vitest.config.ts               # Test runner configuration
```

#### `package.json`

```
Name: des-pu-backend
Package Manager: pnpm@10.28.2

Scripts:
  dev          → nodemon --watch src --ext ts --exec ts-node src/index.ts
  build        → rimraf dist && tsc
  start        → node dist/index.js
  prisma:*     → Prisma CLI commands (generate, migrate, studio, reset)
  type-check   → tsc --noEmit

Production Dependencies (21):
  @anthropic-ai/sdk       — Claude AI API client
  @aws-sdk/client-s3      — R2 file operations (S3-compatible)
  @aws-sdk/s3-request-presigner — Generate presigned download URLs
  @prisma/adapter-pg      — Prisma 7 PostgreSQL driver adapter (required)
  @prisma/client          — Database ORM client
  @socket.io/redis-adapter — Multi-instance Socket.io via Redis pub/sub
  argon2                  — Password hashing (replaces bcrypt)
  bullmq                  — Redis-backed job queues
  cookie-parser           — Parse HTTP cookies (JWT storage)
  cors                    — Cross-origin resource sharing
  dotenv                  — Load .env files
  express                 — HTTP framework
  express-rate-limit      — Rate limiting middleware
  helmet                  — Security headers
  ioredis                 — Redis client
  jsonwebtoken            — JWT sign/verify
  morgan                  — HTTP request logging
  pg                      — node-postgres driver (used by Prisma adapter)
  sharp                   — Image processing (thumbnails)
  socket.io               — WebSocket server
  zod                     — Schema validation

Dev Dependencies (9):
  @types/*                — TypeScript type definitions (incl. @types/pg)
  nodemon                 — Auto-restart on file changes
  prisma                  — Prisma CLI
  rimraf                  — Cross-platform rm -rf
  ts-node                 — Run TypeScript directly
  typescript              — TypeScript compiler

Note: Vitest + Supertest are referenced in `tests/` and `vitest.config.ts` but not yet listed in `package.json` — add before running the test suite.
```

#### `tsconfig.json`

```
Target:     ES2022 (modern JS features)
Module:     CommonJS (Node.js compatible)
Root Dir:   ./src (source code)
Out Dir:    ./dist (compiled output)
Strict:     true (all strict checks)
Path Alias: @/* → src/* (import using @/services/auth instead of ../../services/auth)
Includes:   src/**/*
Excludes:   node_modules, dist, prisma
```

#### `vitest.config.ts`

```
Setup File:  tests/setup.ts (runs before all tests)
Test Timeout: 10s (for integration tests hitting DB)
Pool:        Sequential forks (avoids DB conflicts)
Coverage:    v8 provider, HTML + LCOV output
Path Alias:  @/ → src/ (matches tsconfig)
```

#### `Dockerfile` (Multi-Stage Build)

```
Stage 1 (base):    Node 20 Alpine + pnpm
Stage 2 (deps):    Install production-only dependencies
Stage 3 (builder): Install all deps → prisma generate → tsc build
Stage 4 (runner):  Copy dist + node_modules + prisma → Expose 5000 → CMD node dist/index.js
```

#### `.env.example` (All Required Environment Variables)

```
PORT=5000                  # Server port
NODE_ENV=development       # development | production | test
DATABASE_URL=              # PostgreSQL connection string (Neon)
JWT_SECRET=                # Random 64+ char secret for JWT signing
JWT_EXPIRES_IN=7d          # Token expiry
REDIS_URL=                 # Redis connection string (Upstash)
R2_ACCOUNT_ID=             # Cloudflare account ID
R2_ACCESS_KEY_ID=          # R2 API token access key
R2_SECRET_ACCESS_KEY=      # R2 API token secret
R2_BUCKET_NAME=            # R2 bucket name
R2_PUBLIC_URL=             # Optional CDN URL for public files
ANTHROPIC_API_KEY=         # Claude API key
CORS_ORIGIN=               # Frontend URL (http://localhost:3000 in dev)
LOGTAIL_SOURCE_TOKEN=      # Optional structured logging token
```

---

### 4.2 `src/` — Application Source Code

```
src/
├── index.ts              # Server entry point — boots everything
├── app.ts                # Express app definition — middleware + routes
├── socket.ts             # Socket.io server setup (TODO stub)
├── cache/
│   └── redis.ts          # Redis singleton client (ioredis)
├── lib/
│   └── prisma.ts         # Prisma client singleton
├── middleware/
│   ├── errorHandler.ts   # Global error handler + 404 handler
│   ├── auth.middleware.ts         # JWT verification (TODO stub)
│   ├── domainCheck.middleware.ts  # @despu.edu.in enforcement (TODO stub)
│   ├── rbac.middleware.ts         # Role-based access control (TODO stub)
│   └── rateLimit.middleware.ts    # Redis-backed rate limiting (TODO stub)
├── controllers/
│   └── index.ts          # TODO: Thin controllers (req → service → res)
├── services/
│   ├── auth.service.ts           # TODO: register, login, logout, me
│   ├── ai.service.ts             # TODO: Claude API + circuit breaker
│   ├── chat.service.ts           # TODO: conversations, messages
│   ├── forum.service.ts          # TODO: posts, replies, upvotes, search
│   ├── notification.service.ts   # TODO: create + deliver notifications
│   └── storage.service.ts        # TODO: R2 upload/download/delete
├── routes/
│   ├── auth.routes.ts            # POST /register, /login, /logout, GET /me
│   ├── user.routes.ts            # GET/PATCH /users/:id, GET /users/:id/badges
│   ├── forum.routes.ts           # Full forum CRUD + upvotes + bookmarks + search
│   ├── chat.routes.ts            # Conversations, groups, members
│   ├── resources.routes.ts       # Upload, download, topper notes
│   ├── projects.routes.ts        # Project CRUD + applications
│   ├── notifications.routes.ts   # List, unread count, mark read
│   └── admin.routes.ts           # Reports, bans, roles, stats
├── queues/
│   ├── fileProcessing.queue.ts   # TODO: Image thumbnails, PDF metadata
│   ├── notifications.queue.ts    # TODO: DB creation + Socket.io emit
│   ├── aiSummary.queue.ts        # TODO: Claude API calls
│   └── workers/
│       └── index.ts              # TODO: Start all BullMQ workers
└── utils/
    └── index.ts                  # TODO: paginate, ApiError, formatResponse, asyncHandler
```

#### `src/index.ts` — Server Entry Point

**What it does:** Boots the entire application in this order:
1. Loads environment variables via `dotenv/config`
2. Connects to PostgreSQL via `prisma.$connect()`
3. Connects to Redis via `redis.connect()`
4. Creates an HTTP server wrapping the Express app (needed for Socket.io later)
5. Listens on `PORT` (default 5000)
6. Registers graceful shutdown handlers for `SIGTERM` and `SIGINT`
   - Closes HTTP server → disconnects Prisma → quits Redis → exits cleanly

**Key design:** The HTTP server is created manually with `http.createServer(app)` instead of using `app.listen()`. This is because Socket.io needs to attach to the raw HTTP server instance.

#### `src/app.ts` — Express Application

**What it does:** Defines the Express app with middleware and route mounting:

1. **Security:** `helmet()` adds security headers, `app.disable('x-powered-by')` hides Express
2. **CORS:** Configured with `credentials: true` for HTTP-only cookie auth, origin from `CORS_ORIGIN` env
3. **Logging:** Morgan in `dev` format (colored HTTP method + status + response time)
4. **Body parsing:** `express.json({ limit: '10mb' })` for JSON bodies, `cookieParser()` for cookies
5. **Health check:** `GET /health` returns `{ status: 'ok', timestamp, uptime }`
6. **Route mounting:** All 8 route modules mounted under `/api/v1/` prefix
7. **Error handling:** `notFoundHandler` catches unmatched routes (404), `errorHandler` catches all thrown errors

**API Route Prefix Map:**
```
/api/v1/auth           → auth.routes.ts
/api/v1/users          → user.routes.ts
/api/v1/forums         → forum.routes.ts
/api/v1/chat           → chat.routes.ts
/api/v1/resources      → resources.routes.ts
/api/v1/projects       → projects.routes.ts
/api/v1/notifications  → notifications.routes.ts
/api/v1/admin          → admin.routes.ts
```

#### `src/cache/redis.ts` — Redis Client

**What it does:** Creates a singleton ioredis client connected to `REDIS_URL`:

- Uses `globalThis` caching to prevent multiple clients during hot-reload in development
- `connectTimeout: 5000` — fails fast if Redis is unreachable
- `maxRetriesPerRequest: null` — required by BullMQ (it manages its own retries)
- `lazyConnect: true` — doesn't connect until explicitly called
- Logs connection errors without crashing the process
- Exports `redis` (singleton) and `createRedisClient` (factory for Socket.io adapter pub/sub pair)

#### `src/lib/prisma.ts` — Prisma Client (Prisma 7 + Driver Adapter)

**What it does:** Creates a singleton `PrismaClient` using the **Prisma 7 driver adapter pattern** (required — plain `new PrismaClient()` without adapter throws):

1. Reads `DATABASE_URL` from env (throws if missing)
2. Creates a `pg` `Pool` with the connection string
3. Wraps the pool in `PrismaPg` adapter from `@prisma/adapter-pg`
4. Instantiates `PrismaClient({ adapter, log })`
5. Caches both `prisma` and `pgPool` on `globalThis` in dev to survive hot-reload

**Logging:** `['error', 'warn']` in development, `['error']` in production.

**Local dev URL:** `postgresql://postgres:postgres@localhost:5433/des_pu?schema=public` (Docker maps host 5433 → container 5432).

#### `src/middleware/errorHandler.ts` — Error Handler

**What it does:** Two middleware functions:

1. `notFoundHandler`: Catches any request that didn't match a route → `404 { error: 'Not found' }`
2. `errorHandler`: Global error handler (4 params for Express to recognize it):
   - `SyntaxError` with `body` property → `400 { error: 'Invalid JSON body' }` (malformed JSON)
   - 5xx errors → `500 { error: 'Internal server error' }` (never leak internal details) + `console.error`
   - 4xx errors → pass through the original error message

#### All Other `src/` Files

All remaining files in `services/`, `controllers/`, `routes/`, `queues/`, `utils/`, `middleware/` (except errorHandler), and `socket.ts` are **TODO stubs**. They export empty objects (`export {}`) and contain JSDoc-style comments describing what they will implement. The actual code will be written during Phase 1-6 execution.

---

### 4.3 `prisma/` — Database Layer

```
prisma/
├── schema.prisma          # Complete database schema (~842 lines, 30+ models)
└── migrations/            # Empty locally — use `pnpm exec prisma db push` until migrations are committed
```

**Schema sync (local):** After changing `schema.prisma`, run `pnpm prisma:generate` then `pnpm exec prisma db push`. Once migration SQL files exist in repo, use `pnpm prisma:migrate` instead.

---

## 5. Frontend

**Location:** `frontend/`  
**Stack:** Next.js 16 (App Router) + TypeScript + TailwindCSS 4 + Zustand  
**Current State:** Auth pages + dashboard UI implemented (sidebar, header, bento cards). Most feature pages are placeholders. Backend integration (api.ts, auth store, socket) still TODO.

### 5.1 Frontend Root Files

```
frontend/
├── .env.example           # Frontend env vars template
├── .env.local             # Local env vars (NEXT_PUBLIC_API_URL, etc.)
├── AGENTS.md              # AI agent instructions for frontend
├── CLAUDE.md              # Claude Code config
├── README.md              # Frontend-specific README
├── next.config.ts         # Next.js configuration
├── next-env.d.ts          # Next.js TypeScript declarations
├── postcss.config.mjs     # PostCSS config (TailwindCSS plugin)
├── tsconfig.json          # TypeScript config for Next.js
├── package.json           # Dependencies + scripts
├── pnpm-lock.yaml         # Lockfile
└── pnpm-workspace.yaml    # PNPM workspace config
```

### 5.2 `app/` — Next.js App Router Pages

```
app/
├── layout.tsx             # Root HTML layout (Inter font, light theme, SEO metadata)
├── page.tsx               # Root page (redirects or landing)
├── globals.css            # Global CSS + TailwindCSS imports
├── favicon.ico            # Browser tab icon
├── (auth)/                # Auth route group (no sidebar/header)
│   ├── layout.tsx         # Auth-specific layout (centered, no nav)
│   ├── login/
│   │   └── page.tsx       # Login page (email + password form)
│   └── register/
│       └── page.tsx       # Registration page (email + password + details form)
└── (main)/                # Main app route group (with sidebar + header)
    ├── layout.tsx         # Sidebar + Header + scrollable main area (uses ui.store)
    ├── dashboard/
    │   └── page.tsx       # Dashboard bento grid (all dashboard/* cards)
    ├── chat/
    │   └── page.tsx       # Chat page (placeholder)
    ├── feed/
    │   └── page.tsx       # Forum feed page (placeholder)
    ├── announcements/
    │   └── page.tsx       # Announcements page (placeholder)
    ├── calendar/
    │   └── page.tsx       # Calendar page (placeholder)
    ├── ide/
    │   └── my-projects/
    │       └── page.tsx   # Cloud IDE projects list (placeholder) → /ide/my-projects
    ├── projects/
    │   ├── explore/
    │   │   └── page.tsx   # Browse marketplace → /projects/explore
    │   └── my-projects/
    │       └── page.tsx   # User's projects → /projects/my-projects
    └── resources/
        ├── study-material/
        │   └── page.tsx   # Subject resource library → /resources/study-material
        └── my-space/
            └── page.tsx   # Personal cloud storage → /resources/my-space
```

**Full URL map (main routes):**

| URL | File |
|-----|------|
| `/` | `app/page.tsx` |
| `/login` | `app/(auth)/login/page.tsx` |
| `/register` | `app/(auth)/register/page.tsx` |
| `/dashboard` | `app/(main)/dashboard/page.tsx` |
| `/chat` | `app/(main)/chat/page.tsx` |
| `/feed` | `app/(main)/feed/page.tsx` |
| `/announcements` | `app/(main)/announcements/page.tsx` |
| `/calendar` | `app/(main)/calendar/page.tsx` |
| `/ide/my-projects` | `app/(main)/ide/my-projects/page.tsx` |
| `/projects/explore` | `app/(main)/projects/explore/page.tsx` |
| `/projects/my-projects` | `app/(main)/projects/my-projects/page.tsx` |
| `/resources/study-material` | `app/(main)/resources/study-material/page.tsx` |
| `/resources/my-space` | `app/(main)/resources/my-space/page.tsx` |

**Route Groups Explained:**
- `(auth)` — Parenthesized group means no URL segment. Login is at `/login`, not `/auth/login`. Uses its own layout (no sidebar).
- `(main)` — Same concept. Dashboard is at `/dashboard`, not `/main/dashboard`. Uses sidebar + header layout.

#### `app/layout.tsx` — Root Layout

- Sets HTML `lang="en"`, light theme
- Loads **Inter** font from Google Fonts
- SEO: title "DES Pune University — Unified Platform", meta description, keywords
- Sets background `#F8F9FB` and text `#111827`

### 5.3 `components/` — React Components

```
components/
├── ui/                    # Base UI components (TODO — only .gitkeep exists)
│   └── .gitkeep
├── shared/                # Shared layout components
│   ├── Header.tsx         # Top navigation bar (search, notifications bell, avatar)
│   ├── Sidebar.tsx        # Left sidebar navigation (collapsible, icon + text links)
│   └── index.ts           # Barrel export
├── dashboard/             # Dashboard page card components
│   ├── HeroCard.tsx       # Welcome card with user greeting + quick stats
│   ├── SubjectsCard.tsx   # Enrolled subjects list
│   ├── AnnouncementCard.tsx  # Recent announcements feed
│   ├── DeadlineCard.tsx   # Upcoming assignment deadlines
│   ├── CalendarCard.tsx   # Mini calendar with event dots
│   ├── ChatsCard.tsx      # Recent chat previews
│   ├── ActivityCard.tsx   # Recent activity feed (posts, uploads)
│   ├── ContributionCard.tsx  # XP/contribution graph
│   ├── ProjectsCard.tsx   # Active project summaries
│   ├── StorageCard.tsx    # Storage usage meter
│   └── index.ts           # Barrel export
├── chat/
│   └── index.ts           # TODO: Chat UI components (conversation list, message bubbles, etc.)
├── forums/
│   └── index.ts           # TODO: Forum UI components (post card, reply thread, etc.)
└── projects/
    └── index.ts           # TODO: Project UI components (project card, application form, etc.)
```

### 5.4 Other Frontend Directories

```
hooks/
├── useAuth.ts             # TODO: Custom hook for auth state + login/logout actions
└── useSocket.ts           # TODO: Custom hook for Socket.io connection management

store/
├── auth.store.ts          # TODO: Zustand — user, isAuthenticated, login/logout
└── ui.store.ts            # ✅ Implemented — sidebarOpen, sidebarCollapsed, theme, modals

lib/
├── api.ts                 # TODO: Axios wrapper (base URL, credentials, 401 redirect)
├── socket.ts              # TODO: Socket.io client singleton
└── utils.ts               # ✅ Partial — cn(), formatDate, formatFileSize, truncate, getGreeting()

types/
└── index.ts               # Shared TypeScript interfaces: User, Post, Resource, Project, Notification

public/
├── campus_bg.png          # Campus background image for auth pages (703KB)
├── logo.png               # DES PU logo (41KB)
├── logoFav.png            # Favicon-sized logo (116KB)
├── file.svg               # File icon
├── globe.svg              # Globe icon
├── next.svg               # Next.js logo
├── vercel.svg             # Vercel logo
└── window.svg             # Window icon
```

---

## 6. Planning Docs

**Location:** `PLAN/`

```
PLAN/
├── PLAN.md                        # Technical architecture bible (condensed, dev-focused)
├── des-pu-student-portal-plan.md  # Original product vision document (detailed, feature-focused)
├── PHASE_WISE_EXECUTION.md        # Complete 6-phase backend execution plan (~1280 lines)
├── SETUP.md                       # Developer setup guide (Docker, env, run servers)
└── REPO.md                        # THIS FILE — repository map
```

| File | Lines | Purpose |
|------|-------|---------|
| `PLAN.md` | ~442 | Technical constraints, architecture decisions, API routes, performance rules. The "law" of the project — nothing violates this. |
| `des-pu-student-portal-plan.md` | ~471 | Original product vision: feature descriptions, user stories, UX flows. Written before any code. |
| `PHASE_WISE_EXECUTION.md` | ~1282 | Detailed implementation plan: 6 phases, sub-modules, every backend file + test case specified. |
| `SETUP.md` | ~457 | **Onboarding guide** — prerequisites, Docker, backend/frontend env setup, run commands, troubleshooting. |
| `REPO.md` | ~800+ | This file. Maps every folder, file, and key code components. |

---

## 7. Database Schema

**Location:** `backend/prisma/schema.prisma`  
**Size:** 842 lines, 25+ models, 10 enums  
**Database:** PostgreSQL via Neon (serverless)

### Enums

| Enum | Values | Used By |
|------|--------|---------|
| `Role` | STUDENT, FACULTY, ADMIN, SUPER_ADMIN | User.role |
| `PostType` | DISCUSSION, QUESTION | Post.type |
| `SubmissionStatus` | PENDING, SUBMITTED, LATE, GRADED | Submission.status |
| `PresenceStatus` | ONLINE, OFFLINE, AWAY | User.presence_status |
| `ConversationType` | DIRECT, GROUP, SUBJECT_GROUP, PROJECT_GROUP | Conversation.type |
| `MessageType` | TEXT, IMAGE, FILE, FORM, SYSTEM | Message.type |
| `FormQuestionType` | SHORT_TEXT, LONG_TEXT, MULTIPLE_CHOICE, CHECKBOX, DROPDOWN, DATE, TIME, FILE_UPLOAD | FormQuestion.type |
| `NotificationType` | REPLY, UPVOTE, MENTION, CHAT_MESSAGE, ANNOUNCEMENT, ASSIGNMENT_POSTED, GRADE_RELEASED, RESOURCE_PROCESSED, BADGE_EARNED, PROJECT_UPDATE | Notification.type |
| `BadgeType` | FIRST_POST, CONTRIBUTOR, TOP_HELPER, STREAK_7, STREAK_30, PROJECT_LEADER, TOPPER_NOTES | Badge.type |
| `ProjectStatus` | OPEN, IN_PROGRESS, COMPLETED, CANCELLED | Project.status |
| `ApplicationStatus` | PENDING, ACCEPTED, REJECTED | ProjectApplication.status |
| `Grade` | O, A_PLUS, A, B_PLUS, B, C, D, F | MarksheetResult.awarded_grade |

### Model Hierarchy

```
School (1) ──→ (N) Department (1) ──→ (N) Division
                    │                       │
                    └──→ (N) Subject        └──→ references Semester
                              │
                    ┌─────────┴──────────┐
                    ↓                    ↓
              StudentSubject       FacultySubject
                    ↑                    ↑
                    │                    │
User (1) ──→ Student (1)          Faculty (1)
  │              │
  │              └──→ Submission, Marksheet
  │
  ├──→ Post, PostUpvote, PostBookmark
  ├──→ Resource
  ├──→ Announcement
  ├──→ Assignment
  ├──→ Message, MessageReadReceipt
  ├──→ ConversationMember
  ├──→ Notification
  ├──→ Badge, XpEvent
  ├──→ Badge, XpEvent
  ├──→ ProjectMember, ProjectApplication
  ├──→ Form, FormQuestion, FormResponse, FormAnswer  (Google Forms–style feature)
  └──→ Admin / SuperAdmin (role-specific profiles)
```

### Key Models (Summary)

| Model | Key Fields | Relationships |
|-------|-----------|---------------|
| **User** | email, name, password, role, xp_total, presence_status, is_banned | → Student/Faculty/Admin/SuperAdmin profile, → Posts, Resources, Messages |
| **Student** | user_id, stu_prn, dept_id, div_id, school_id | → User, → StudentSubject[], → Submission[], → Marksheet[] |
| **Faculty** | user_id, fac_prn, dept_id, school_id | → User, → FacultySubject[], → Announcement[], → Assignment[] |
| **School** | school_name | → Department[] |
| **Department** | dept_name, school_id | → Division[], → Subject[], → Student[], → Faculty[] |
| **Subject** | sub_code, sub_name, sub_credits, dept_id | → StudentSubject[], → FacultySubject[] |
| **Semester** | sem_number, academic_year, is_current | → Division[] |
| **Post** | title, content, type, author_id, sub_id, parent_id, upvotes, is_pinned, is_locked | → User, → Subject, → Post (self-ref for threading) |
| **Resource** | title, r2_key, file_type, file_size, download_count, is_topper_note | → User, → Subject |
| **Announcement** | title, content, sub_id, sem_id, author_id, is_pinned | → User, → Subject, → Semester |
| **Assignment** | title, description, due_date, max_marks, sub_id | → User, → Subject, → Submission[] |
| **Submission** | content, marks, feedback, status, assign_id, student_id | → Assignment, → Student. Unique: [assign_id, student_id] |
| **Conversation** | type, name | → ConversationMember[], → Message[] |
| **Message** | content, type, r2_key, sender_id, conv_id | → User, → Conversation |
| **Notification** | type, data (JSON), is_read, user_id | → User |
| **Badge** | type, user_id | → User. Unique: [user_id, type] |
| **XpEvent** | points, reason, user_id | → User |
| **Project** | title, description, status, open_roles, skills_req | → ProjectMember[], → ProjectApplication[] |
| **Marksheet** | student_id, sem_id, exam_month_year | → Student, → Semester, → MarksheetResult[]. Unique: [student_id, sem_id] |
| **Form** | title, description, sub_id, created_by, is_published | → FormQuestion[], → FormResponse[] |
| **FormQuestion** | type (FormQuestionType), label, options, required | → Form |
| **FormResponse** | form_id, respondent_id | → FormAnswer[] |
| **FormAnswer** | question_id, response_id, value | → FormQuestion, → FormResponse |

---

## 8. Test Suite

**Location:** `backend/tests/`  
**Runner:** Vitest + Supertest  
**Status:** All test files written (TDD). They will fail until corresponding source code is implemented.

```
tests/
├── setup.ts                                    # Global setup: env, teardown hooks
├── helpers/
│   ├── auth.helper.ts                          # JWT generation, supertest wrappers, test user fixtures
│   └── db.helper.ts                            # DB cleanup, seed data, user/student/faculty factories
├── unit/                                       # Fast, isolated tests (no DB/network)
│   ├── utils.test.ts                           # P1-M4: paginate, ApiError, asyncHandler, formatResponse
│   ├── queues.test.ts                          # P3-M5: BullMQ job creation, retry config
│   ├── middleware/
│   │   └── auth-middleware.test.ts             # P2-M2: domainCheck, authenticate, rbac
│   └── validators/
│       └── validators.test.ts                  # P2-M1: Zod schemas (register, login, UUID, pagination)
└── integration/                                # Full API tests with DB + HTTP
    ├── health.test.ts                          # P1-M5: /health, 404, CORS, security headers
    ├── auth.test.ts                            # P2-M3: register, login, logout, me
    ├── user.test.ts                            # P2-M4: profile CRUD, badges
    ├── academic.test.ts                        # P3-M1: schools, departments, subjects, my-subjects
    ├── announcement-assignment.test.ts         # P3-M2: announcements, assignments, submissions, grading
    ├── forum.test.ts                           # P3-M3: posts, replies, upvotes, pin/lock, bookmarks, search
    ├── resource.test.ts                        # P3-M4: file upload, presigned URLs, topper notes
    ├── chat.test.ts                            # P4-M2: conversations, groups, messages, membership
    ├── notification.test.ts                    # P4-M4: notification list, unread, mark read
    ├── gamification.test.ts                    # P5-M1: XP, leaderboard, badges
    ├── project.test.ts                         # P5-M2: project CRUD, applications, accept/reject
    ├── marksheet.test.ts                       # P5-M3: marksheet CRUD, SGPA calculation
    ├── admin.test.ts                           # P6-M2: reports, ban/unban, role change, stats
    └── search.test.ts                          # P6-M3: full-text search, type filtering
```

### Test Helpers

| Helper | Purpose |
|--------|---------|
| `auth.helper.ts` | `generateTestToken()`, `generateExpiredToken()`, `generateTamperedToken()` — create JWTs for testing. `authGet/Post/Patch/Delete()` — supertest wrappers that auto-inject auth cookies. `extractTokenFromResponse()` — pull JWT from Set-Cookie header. `TEST_STUDENT/FACULTY/ADMIN` — fixture objects. |
| `db.helper.ts` | `cleanDatabase()` — deletes all user-generated data (respects FK order, preserves academic structure). `cleanDatabaseFull()` — deletes everything. `seedTestAcademicData()` — creates 1 school, 1 dept, 1 sem, 1 div, 2 subjects. `createTestStudent/Faculty()` — full user + profile factories with argon2 hashed passwords. |

### Test Count

| Category | Files | Approximate Test Cases |
|----------|-------|----------------------|
| Config + Helpers | 4 | — |
| Unit Tests | 4 | ~35 |
| Integration Tests | 14 | ~115 |
| **Total** | **22 files** | **~150 test cases** |

---

## 9. Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Prisma Schema** | ✅ Complete | 842 lines, 25+ models, all enums defined |
| **Docker Compose** | ✅ Complete | Local PG + Redis |
| **Dockerfile** | ✅ Complete | Multi-stage production build |
| **package.json** | ✅ Complete | All dependencies listed |
| **tsconfig.json** | ✅ Complete | Path aliases configured |
| **src/index.ts** | ✅ Implemented | Server boot + graceful shutdown |
| **src/app.ts** | ✅ Implemented | Middleware stack + route mounting |
| **src/cache/redis.ts** | ✅ Implemented | ioredis singleton + factory |
| **src/lib/prisma.ts** | ✅ Implemented | Prisma singleton |
| **src/middleware/errorHandler.ts** | ✅ Implemented | 404 + global error handler |
| **vitest.config.ts** | ✅ Created | Test runner config |
| **tests/** | ✅ Created | All 22 test files written (TDD) |
| **Frontend layout** | ✅ Basic | Auth pages, dashboard, sidebar, header, 10 dashboard cards |
| **Frontend utils/store** | ⚠️ Partial | `utils.ts` + `ui.store.ts` implemented; `auth.store.ts` TODO |
| **Vitest/Supertest deps** | ❌ Missing from package.json | Test files exist; install deps before `pnpm test` |
| **All services** | ❌ TODO stubs | auth, chat, forum, notification, storage, ai |
| **All controllers** | ❌ TODO stubs | Not yet created |
| **All middleware** | ❌ TODO stubs | auth, domainCheck, rbac, rateLimit |
| **All routes** | ❌ TODO stubs | Routes exist but have no handlers |
| **All queues/workers** | ❌ TODO stubs | Queue definitions only, no workers |
| **Socket.io** | ❌ TODO stub | File exists, no implementation |
| **Frontend features** | ❌ Placeholder | Pages exist, no backend integration |

---

## 10. Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Express server port |
| `NODE_ENV` | No | `development` | Environment: development / production / test |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string. Local Docker: `...@localhost:5433/des_pu?schema=public` |
| `JWT_SECRET` | **Yes** | — | Random 64+ char string for JWT signing |
| `JWT_EXPIRES_IN` | No | `7d` | JWT token expiry duration |
| `REDIS_URL` | **Yes** | — | Redis connection string (Upstash) |
| `R2_ACCOUNT_ID` | Yes (Phase 3+) | — | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Yes (Phase 3+) | — | R2 API access key |
| `R2_SECRET_ACCESS_KEY` | Yes (Phase 3+) | — | R2 API secret key |
| `R2_BUCKET_NAME` | Yes (Phase 3+) | — | R2 bucket name |
| `R2_PUBLIC_URL` | No | — | Optional public CDN URL |
| `ANTHROPIC_API_KEY` | Yes (Phase 6+) | — | Claude API key |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed frontend origin |
| `LOGTAIL_SOURCE_TOKEN` | No | — | Optional structured logging |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (e.g., `http://localhost:5000`) |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | Socket.io server URL (e.g., `http://localhost:5000`) |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | No | Public CDN base URL for uploaded files |

---

## 11. Complete File Index

Alphabetical inventory of **every committed/trackable file** in the repo (excluding `node_modules/`, `.next/`, `dist/`, `.git/`). Use this to verify nothing is missing from documentation.

### Root (4 + docker)

| Path | Type |
|------|------|
| `.gitignore` | Config |
| `README.md` | Docs |
| `DES PU Logo.png` | Asset |
| `docker-compose.yml` | Infra |

### `PLAN/` (5)

| Path |
|------|
| `PLAN.md` |
| `des-pu-student-portal-plan.md` |
| `PHASE_WISE_EXECUTION.md` |
| `SETUP.md` |
| `REPO.md` |

### `backend/` root (9)

| Path |
|------|
| `.env.example` |
| `Dockerfile` |
| `package.json` |
| `pnpm-lock.yaml` |
| `pnpm-workspace.yaml` |
| `prisma.config.ts` |
| `tsconfig.json` |
| `vitest.config.ts` |

### `backend/prisma/` (1)

| Path |
|------|
| `schema.prisma` |

### `backend/src/` (31)

| Path | Status |
|------|--------|
| `app.ts` | ✅ Implemented |
| `index.ts` | ✅ Implemented |
| `socket.ts` | ❌ Stub |
| `cache/redis.ts` | ✅ Implemented |
| `lib/prisma.ts` | ✅ Implemented |
| `middleware/errorHandler.ts` | ✅ Implemented |
| `middleware/auth.middleware.ts` | ❌ Stub |
| `middleware/domainCheck.middleware.ts` | ❌ Stub |
| `middleware/rbac.middleware.ts` | ❌ Stub |
| `middleware/rateLimit.middleware.ts` | ❌ Stub |
| `controllers/index.ts` | ❌ Stub |
| `services/auth.service.ts` | ❌ Stub |
| `services/ai.service.ts` | ❌ Stub |
| `services/chat.service.ts` | ❌ Stub |
| `services/forum.service.ts` | ❌ Stub |
| `services/notification.service.ts` | ❌ Stub |
| `services/storage.service.ts` | ❌ Stub |
| `routes/auth.routes.ts` | ❌ Stub (router only) |
| `routes/user.routes.ts` | ❌ Stub |
| `routes/forum.routes.ts` | ❌ Stub |
| `routes/chat.routes.ts` | ❌ Stub |
| `routes/resources.routes.ts` | ❌ Stub |
| `routes/projects.routes.ts` | ❌ Stub |
| `routes/notifications.routes.ts` | ❌ Stub |
| `routes/admin.routes.ts` | ❌ Stub |
| `queues/fileProcessing.queue.ts` | ❌ Stub |
| `queues/notifications.queue.ts` | ❌ Stub |
| `queues/aiSummary.queue.ts` | ❌ Stub |
| `queues/workers/index.ts` | ❌ Stub |
| `utils/index.ts` | ❌ Stub |

### `backend/tests/` (22)

| Path |
|------|
| `setup.ts` |
| `helpers/auth.helper.ts` |
| `helpers/db.helper.ts` |
| `unit/utils.test.ts` |
| `unit/queues.test.ts` |
| `unit/middleware/auth-middleware.test.ts` |
| `unit/validators/validators.test.ts` |
| `integration/health.test.ts` |
| `integration/auth.test.ts` |
| `integration/user.test.ts` |
| `integration/academic.test.ts` |
| `integration/announcement-assignment.test.ts` |
| `integration/forum.test.ts` |
| `integration/resource.test.ts` |
| `integration/chat.test.ts` |
| `integration/notification.test.ts` |
| `integration/gamification.test.ts` |
| `integration/project.test.ts` |
| `integration/marksheet.test.ts` |
| `integration/admin.test.ts` |
| `integration/search.test.ts` |

### `frontend/` root (11)

| Path |
|------|
| `.env.example` |
| `AGENTS.md` |
| `CLAUDE.md` |
| `README.md` |
| `next.config.ts` |
| `next-env.d.ts` |
| `postcss.config.mjs` |
| `tsconfig.json` |
| `package.json` |
| `pnpm-lock.yaml` |
| `pnpm-workspace.yaml` |

### `frontend/app/` (17)

| Path |
|------|
| `layout.tsx` |
| `page.tsx` |
| `globals.css` |
| `favicon.ico` |
| `(auth)/layout.tsx` |
| `(auth)/login/page.tsx` |
| `(auth)/register/page.tsx` |
| `(main)/layout.tsx` |
| `(main)/dashboard/page.tsx` |
| `(main)/chat/page.tsx` |
| `(main)/feed/page.tsx` |
| `(main)/announcements/page.tsx` |
| `(main)/calendar/page.tsx` |
| `(main)/ide/my-projects/page.tsx` |
| `(main)/projects/explore/page.tsx` |
| `(main)/projects/my-projects/page.tsx` |
| `(main)/resources/study-material/page.tsx` |
| `(main)/resources/my-space/page.tsx` |

### `frontend/components/` (18)

| Path | Status |
|------|--------|
| `ui/.gitkeep` | Placeholder for shadcn/ui |
| `shared/Header.tsx` | ✅ Implemented |
| `shared/Sidebar.tsx` | ✅ Implemented |
| `shared/index.ts` | ✅ Barrel export |
| `dashboard/HeroCard.tsx` | ✅ Implemented |
| `dashboard/SubjectsCard.tsx` | ✅ Implemented |
| `dashboard/AnnouncementCard.tsx` | ✅ Implemented |
| `dashboard/DeadlineCard.tsx` | ✅ Implemented |
| `dashboard/CalendarCard.tsx` | ✅ Implemented |
| `dashboard/ChatsCard.tsx` | ✅ Implemented |
| `dashboard/ActivityCard.tsx` | ✅ Implemented |
| `dashboard/ContributionCard.tsx` | ✅ Implemented |
| `dashboard/ProjectsCard.tsx` | ✅ Implemented |
| `dashboard/StorageCard.tsx` | ✅ Implemented |
| `dashboard/index.ts` | ✅ Barrel export |
| `chat/index.ts` | ❌ Stub |
| `forums/index.ts` | ❌ Stub |
| `projects/index.ts` | ❌ Stub |

### `frontend/` — hooks, lib, store, types, public (16)

| Path | Status |
|------|--------|
| `hooks/useAuth.ts` | ❌ Stub |
| `hooks/useSocket.ts` | ❌ Stub |
| `lib/api.ts` | ❌ Stub |
| `lib/socket.ts` | ❌ Stub |
| `lib/utils.ts` | ✅ Implemented |
| `store/auth.store.ts` | ❌ Stub |
| `store/ui.store.ts` | ✅ Implemented |
| `types/index.ts` | ❌ Stub / minimal |
| `public/campus_bg.png` | Asset |
| `public/logo.png` | Asset |
| `public/logoFav.png` | Asset |
| `public/file.svg` | Asset |
| `public/globe.svg` | Asset |
| `public/next.svg` | Asset |
| `public/vercel.svg` | Asset |
| `public/window.svg` | Asset |

**Total tracked files:** ~136 (excluding gitignored `.env`, `.env.local`, `node_modules/`, build output)

---

*This document is the single source of truth for navigating the DES Unified Platform repository. Update it when files are added or implementation status changes. For setup steps, see [SETUP.md](./SETUP.md).*
