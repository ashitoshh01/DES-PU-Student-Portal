# DES Unified Platform — Backend Phase-Wise Execution Plan

> **Scope:** `backend/` only  
> **Goal:** Production-ready backend optimized for 600+ concurrent users  
> **Current State:** Scaffolded with TODO stubs, Prisma schema complete (705 lines, 25 models), zero implementation  
> **Stack:** Node.js + Express + TypeScript + Prisma + PostgreSQL (Neon) + Redis (Upstash) + Cloudflare R2 + BullMQ + Socket.io + Anthropic Claude  
> **Email Domain:** `@despu.edu.in` only  
> **Registration:** Self-registration (students) + Admin-controlled (future admin panel)

---

> **Rules from PLAN.md (non-negotiable):**
> - Never block the event loop — CPU-heavy work → BullMQ queue
> - All handlers stateless — sessions in Redis, files in R2, never on disk
> - No N+1 queries — always use Prisma `include`
> - Indexes on every FK and every WHERE/ORDER BY field
> - Every external call has a timeout (5s max)
> - Global error handler — nothing crashes the process
> - Route handlers respond in under 100ms

---

## Phase Structure Summary

| Phase | Name | Sub-Modules | Objective |
|-------|------|-------------|-----------|
| **P1** | Foundation & Infrastructure | 5 | Server boots, DB connected, Redis wired, all infra operational |
| **P2** | Authentication & Identity | 4 | Auth works end-to-end, JWT, RBAC, profiles, domain lock |
| **P3** | Academic & Classroom | 5 | Academic structure, announcements, assignments, forums, resources |
| **P4** | Real-Time & Chat | 4 | Socket.io, messaging, presence, notifications |
| **P5** | Social & Gamification | 3 | XP, badges, leaderboards, project marketplace |
| **P6** | AI, Admin & Production Hardening | 5 | AI features, admin tools, CI/CD, load testing, deployment |

> **Rule:** Complete each phase fully (all sub-module tests + phase integration tests pass) before starting the next. Each phase builds on the previous.

---

## Cloudflare R2 Setup Instructions

Before Phase 3 (file uploads), set up R2:

1. **Create Cloudflare account** at [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage** → **Create bucket**
3. Bucket name: `des-pu-resources` (or your preferred name)
4. Location: **Auto** (Cloudflare picks nearest)
5. Go to **R2** → **Manage R2 API Tokens** → **Create API Token**
   - Permission: **Object Read & Write**
   - Scope: Apply to bucket `des-pu-resources`
6. Copy the following to `.env`:
   ```
   R2_ACCOUNT_ID=<your-account-id>         # From Cloudflare dashboard URL
   R2_ACCESS_KEY_ID=<token-access-key>      # From API token creation
   R2_SECRET_ACCESS_KEY=<token-secret-key>  # From API token creation
   R2_BUCKET_NAME=des-pu-resources
   R2_PUBLIC_URL=                            # Leave empty until public access configured
   ```
7. **Endpoint:** `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
8. Optional: Enable **Public Access** on the bucket for CDN-served files (set `R2_PUBLIC_URL`)

---

## Phase 1 — Foundation & Infrastructure

**Objective:** Server boots cleanly, Prisma connects to Neon, Redis connects to Upstash, middleware stack applied, utility layer ready, health check responds. Zero business logic — just infra.

---

### P1-M1: Package Installation & Project Config

**Objective:** Install all production + dev dependencies. Configure TypeScript path aliases, nodemon, and test runner.

**Logical Approach:**
- Install Express ecosystem (express, helmet, cors, morgan, cookie-parser)
- Install auth stack (jsonwebtoken, argon2)
- Install Prisma client, ioredis, BullMQ, Socket.io
- Install AWS SDK for R2 (S3-compatible)
- Install validation (zod), file upload (multer), image processing (sharp)
- Install dev tools (typescript, ts-node, nodemon, vitest, supertest, @types/*)
- Configure path aliases `@/*` → `src/*` via `tsconfig-paths`

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `package.json` | MODIFY | Add all dependencies + devDependencies + scripts (test, test:watch, seed) |
| `tsconfig.json` | MODIFY | Add `tsconfig-paths` baseUrl config |
| `vitest.config.ts` | NEW | Vitest config with path aliases, test timeout (10s), setup file |
| `src/types/express.d.ts` | NEW | Extend Express `Request` type with `user` payload |

**Test Cases (P1-M1):**
- [ ] `pnpm install` completes without errors
- [ ] `pnpm type-check` passes (no TypeScript errors)
- [ ] `pnpm test` runner initializes (even with 0 tests)

---

### P1-M2: Prisma Client & Database Connection

**Objective:** Prisma client singleton, connection pool configured for Neon (serverless PG), graceful disconnect.

**Logical Approach:**
- Create a singleton Prisma client with `log: ['query', 'warn', 'error']` in dev, `['error']` in prod
- Configure connection pool: `connection_limit=10` for Neon's serverless limits
- Expose `prisma` instance + `connectDB()` and `disconnectDB()` helpers
- Schema is already complete — no modifications needed

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/lib/prisma.ts` | NEW | Prisma singleton with pool config, connect/disconnect helpers |

**Test Cases (P1-M2):**
- [ ] `prisma.$connect()` succeeds against Neon
- [ ] `prisma.$disconnect()` completes without error
- [ ] Multiple imports return the same singleton instance
- [ ] Raw query `SELECT 1` succeeds

---

### P1-M3: Redis Client

**Objective:** ioredis singleton connected to Upstash, resilient to temporary disconnects, exported for use across cache/queues/rate-limiting/Socket.io adapter.

**Logical Approach:**
- Single ioredis client from `REDIS_URL` env
- `connectTimeout: 5000`, `maxRetriesPerRequest: 3`, `retryStrategy` with exponential backoff
- Separate `createRedisClient()` factory for Socket.io adapter (needs pub + sub pair)
- Log errors but never crash on Redis unavailability — graceful degradation
- Export `redis` (singleton) + `createRedisClient` (factory)

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/cache/redis.ts` | MODIFY | Full ioredis implementation replacing TODO stub |

**Test Cases (P1-M3):**
- [ ] `redis.ping()` returns `"PONG"`
- [ ] `redis.set()` → `redis.get()` roundtrip works
- [ ] `redis.setex()` respects TTL (key expires)
- [ ] `createRedisClient()` returns a new, independent connection
- [ ] Redis error handler logs but doesn't crash the process

---

### P1-M4: Utility Layer

**Objective:** Shared helpers used across all routes — error handling, pagination, response formatting, async handler wrapper.

**Logical Approach:**
- `asyncHandler(fn)`: wraps async route handlers to catch errors → forwards to Express error handler
- `ApiError` class: extends `Error` with `statusCode`, `code`, `isOperational`
- `paginate(page, limit)`: returns `{ skip, take }` for Prisma, with max limit of 50
- `formatResponse(data, meta?)`: standardized `{ data, meta }` shape
- `formatError(err)`: standardized `{ error, code }` shape
- `env(key)`: typed env getter that throws on missing required keys

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/utils/index.ts` | MODIFY | Full implementation replacing TODO stub |
| `src/utils/ApiError.ts` | NEW | Custom error class with status codes |
| `src/utils/asyncHandler.ts` | NEW | Async middleware wrapper |
| `src/utils/constants.ts` | NEW | Magic numbers, durations, limits (MAX_PAGE_SIZE, JWT_EXPIRY, etc.) |

**Test Cases (P1-M4):**
- [ ] `paginate(1, 20)` returns `{ skip: 0, take: 20 }`
- [ ] `paginate(3, 10)` returns `{ skip: 20, take: 10 }`
- [ ] `paginate(1, 100)` clamps to `{ skip: 0, take: 50 }`
- [ ] `ApiError(404, 'Not found')` has correct statusCode and message
- [ ] `asyncHandler` catches thrown errors and calls `next(err)`
- [ ] `env('MISSING_KEY')` throws descriptive error
- [ ] `formatResponse({ id: 1 })` returns `{ data: { id: 1 } }`

---

### P1-M5: Express App Bootstrap & Health Check

**Objective:** Express app fully wired with middleware stack, route mounting, error handler, graceful shutdown. `/health` endpoint responds.

**Logical Approach:**
- Load `dotenv/config` first
- Create Express app → apply middleware in order: `helmet()` → `cors({ origin, credentials: true })` → `morgan('dev')` → `express.json({ limit: '10mb' })` → `cookieParser()`
- Mount routes: `/api/v1/auth`, `/api/v1/users`, etc. (imported from route files)
- Global error handler middleware (last — catches all `next(err)` calls)
- `/health` endpoint: returns `{ status: 'ok', timestamp, uptime }`
- Create HTTP server (not `app.listen` — needed for Socket.io attachment later)
- Graceful shutdown: on SIGTERM/SIGINT → close HTTP server → disconnect Prisma → disconnect Redis

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/index.ts` | MODIFY | Full Express bootstrap replacing TODO stub |
| `src/middleware/errorHandler.ts` | NEW | Global error handler middleware |
| `src/middleware/requestLogger.ts` | NEW | Morgan + custom request ID generation |

**Test Cases (P1-M5):**
- [ ] `GET /health` returns `200 { status: 'ok' }`
- [ ] Unknown route returns `404 { error: 'Not found' }`
- [ ] Malformed JSON body returns `400`
- [ ] Server starts on configured PORT
- [ ] `SIGTERM` triggers graceful shutdown (Prisma + Redis disconnect logged)
- [ ] CORS headers present on responses
- [ ] Helmet security headers present (X-Content-Type-Options, etc.)

---

### Phase 1 Integration Tests

- [ ] **Boot test:** `pnpm dev` starts server, `/health` responds within 3 seconds
- [ ] **DB connection test:** Server connects to Neon on startup (logs confirm)
- [ ] **Redis connection test:** Redis PING succeeds on startup (logs confirm)
- [ ] **Error propagation test:** Throwing `ApiError` in any handler → correct HTTP status + JSON response
- [ ] **Graceful shutdown test:** SIGTERM → all connections closed cleanly

---

## Phase 2 — Authentication & Identity

**Objective:** Users can register (DES email only — `@despu.edu.in`), login (JWT in HTTP-only cookie), access protected routes, RBAC enforced. Profile CRUD works.

**Depends on:** Phase 1 (server boots, Prisma + Redis connected, utilities available)

---

### P2-M1: Validation Layer (Zod Schemas)

**Objective:** Centralized request validation schemas. All user-facing input is validated before reaching services.

**Logical Approach:**
- Define Zod schemas for every API input: registration, login, profile update, etc.
- Create `validate(schema)` middleware factory that validates `req.body` / `req.params` / `req.query`
- Validation errors return `400` with field-level error messages
- Schemas are reusable — exported from `src/validators/`

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/validators/auth.validator.ts` | NEW | Registration, login, password change schemas |
| `src/validators/user.validator.ts` | NEW | Profile update, avatar upload schemas |
| `src/validators/common.validator.ts` | NEW | Shared schemas (pagination, uuid params) |
| `src/middleware/validate.ts` | NEW | Zod validation middleware factory |

**Test Cases (P2-M1):**
- [ ] Valid registration body passes validation
- [ ] Registration with non-DES email fails at Zod level (`email must end with @despu.edu.in`)
- [ ] Registration with weak password fails (min 8 chars, 1 uppercase, 1 number)
- [ ] Missing required fields return field-specific errors
- [ ] Extra/unknown fields are stripped (Zod `.strip()`)
- [ ] Invalid UUID in params returns 400

---

### P2-M2: Auth Middleware Stack

**Objective:** Domain check blocks non-DES emails, JWT auth attaches user to request, RBAC restricts by role, rate limiter protects auth endpoints.

**Logical Approach:**
- `domainCheck`: extract email from `req.body.email`, check `.endsWith('@despu.edu.in')`, return 403 if not
- `authenticate`: read `token` from `req.cookies.token`, verify with `jwt.verify(token, JWT_SECRET)`, attach decoded payload to `req.user`, 401 if invalid/expired
- `rbac(roles[])`: check `req.user.role` against allowed roles, 403 if not permitted. Support `SUPER_ADMIN` as implicit access to everything
- `rateLimiter`: use `express-rate-limit` with `rate-limit-redis` store. `authLimiter` = 5 req/min, `apiLimiter` = 200 req/min

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/middleware/domainCheck.middleware.ts` | MODIFY | Full implementation |
| `src/middleware/auth.middleware.ts` | MODIFY | Full JWT verification |
| `src/middleware/rbac.middleware.ts` | MODIFY | Full role check with SUPER_ADMIN passthrough |
| `src/middleware/rateLimit.middleware.ts` | MODIFY | Redis-backed rate limiting |

**Test Cases (P2-M2):**
- [ ] `domainCheck` passes `test@despu.edu.in`
- [ ] `domainCheck` blocks `test@gmail.com` with 403
- [ ] `authenticate` with valid JWT sets `req.user` with `user_id`, `role`, `email`
- [ ] `authenticate` without cookie returns 401
- [ ] `authenticate` with expired JWT returns 401
- [ ] `authenticate` with tampered JWT returns 401
- [ ] `rbac(['ADMIN'])` passes for ADMIN user
- [ ] `rbac(['ADMIN'])` passes for SUPER_ADMIN user (implicit)
- [ ] `rbac(['FACULTY'])` blocks STUDENT with 403
- [ ] `authLimiter` blocks 6th request within 1 minute (429)
- [ ] Rate limit headers present (`X-RateLimit-Remaining`, etc.)

---

### P2-M3: Auth Service & Routes

**Objective:** Full auth flow — register (create User + role profile + auto-enroll), login (Argon2 verify + JWT cookie), logout, `GET /me`.

**Logical Approach:**
- **Register (Self-registration):**
  1. Validate email domain (already done by middleware)
  2. Check if email already exists → 409 Conflict
  3. Hash password with Argon2 (`argon2.hash(password)`)
  4. Create `User` with `role` from request (default STUDENT)
  5. If STUDENT: create `Student` profile record (PRN required in request)
  6. If FACULTY: create `Faculty` profile record
  7. Auto-enroll in subjects: find all subjects for the student's department + current semester → create `StudentSubject` entries
  8. Sign JWT with `{ user_id, email, role }`, set as HTTP-only cookie (`Secure`, `SameSite=Lax`, `maxAge=7d`)
  9. Cache user session in Redis: `session:{user_id}` → user data, TTL 7d
  10. Return user (without password)

- **Register (Admin-controlled — future):**
  - Same flow but triggered by admin API → no self-registration needed
  - Admin panel will call `/api/v1/admin/users` (built in Phase 6)

- **Login:**
  1. Find user by email → 401 if not found
  2. Check `is_banned` → 403 if banned
  3. `argon2.verify(password, user.password)` → 401 if wrong
  4. Sign JWT, set cookie, cache session (same as register)
  5. Update `presence_status` → ONLINE
  6. Return user

- **Logout:**
  1. Clear cookie
  2. Delete Redis session
  3. Update `presence_status` → OFFLINE

- **Me:**
  1. Read `req.user.user_id` from JWT
  2. Fetch from Redis cache first, fallback to Prisma
  3. Include role profile (Student/Faculty/Admin) + badges

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/services/auth.service.ts` | MODIFY | Full implementation of register, login, logout, me |
| `src/controllers/auth.controller.ts` | NEW | Thin controller calling auth.service |
| `src/routes/auth.routes.ts` | MODIFY | Wire up routes with middleware + controllers |

**API Endpoints:**
```
POST /api/v1/auth/register   → domainCheck → validate → register
POST /api/v1/auth/login      → validate → login
POST /api/v1/auth/logout     → authenticate → logout
GET  /api/v1/auth/me         → authenticate → me
```

**Test Cases (P2-M3):**
- [ ] `POST /api/v1/auth/register` with valid DES email + password → 201 + user data + HTTP-only cookie set
- [ ] `POST /api/v1/auth/register` with existing email → 409 Conflict
- [ ] `POST /api/v1/auth/register` with non-DES email → 403
- [ ] `POST /api/v1/auth/register` creates Student profile and auto-enrolls in subjects
- [ ] `POST /api/v1/auth/login` with correct credentials → 200 + cookie
- [ ] `POST /api/v1/auth/login` with wrong password → 401
- [ ] `POST /api/v1/auth/login` with banned user → 403
- [ ] `POST /api/v1/auth/login` updates presence to ONLINE
- [ ] `POST /api/v1/auth/logout` clears cookie + Redis session
- [ ] `GET /api/v1/auth/me` with valid cookie → 200 + user data with badges
- [ ] `GET /api/v1/auth/me` without cookie → 401
- [ ] Session cached in Redis after login (key `session:{user_id}` exists)
- [ ] Password never returned in any response

---

### P2-M4: User Profile Service & Routes

**Objective:** View profiles, update editable fields, get badges.

**Logical Approach:**
- `getProfile(userId)`: fetch User + role profile (Student with department/division info, or Faculty) + badges. Cache in Redis `user:{userId}` TTL 30m
- `updateProfile(userId, data)`: update only editable fields (`bio`, `avatar`, `mobile_no`). Invalidate Redis cache
- `getBadges(userId)`: fetch from Badge model, ordered by `awarded_at DESC`

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/services/user.service.ts` | NEW | Profile CRUD logic |
| `src/controllers/user.controller.ts` | NEW | Thin controller |
| `src/routes/user.routes.ts` | MODIFY | Wire up routes |

**API Endpoints:**
```
GET   /api/v1/users/:id          → authenticate → getProfile
PATCH /api/v1/users/:id          → authenticate → updateProfile (bio, avatar, mobile_no only)
GET   /api/v1/users/:id/badges   → authenticate → getBadges
```

**Test Cases (P2-M4):**
- [ ] `GET /api/v1/users/:id` returns user profile with role-specific data
- [ ] `GET /api/v1/users/:id` with non-existent ID → 404
- [ ] `PATCH /api/v1/users/:id` updates bio successfully
- [ ] `PATCH /api/v1/users/:id` by different user → 403 (can't edit others)
- [ ] `PATCH /api/v1/users/:id` cannot modify `role`, `email`, `name` (protected fields)
- [ ] `GET /api/v1/users/:id/badges` returns badges array
- [ ] Profile cached in Redis after first fetch (subsequent fetch hits cache)

---

### Phase 2 Integration Tests

- [ ] **Full auth flow:** Register → Login → Me → Logout → Me (should fail) → Login again
- [ ] **Domain enforcement:** Non-DES email blocked at every entry point
- [ ] **RBAC chain:** Student can't access FACULTY/ADMIN routes → correct 403 response
- [ ] **Session persistence:** Login on one instance, `GET /me` on another (Redis session shared)
- [ ] **Rate limiting:** 6 rapid login attempts → 5 pass, 6th returns 429
- [ ] **Password security:** Argon2 hash stored (not plaintext), password never leaked in any response

---

## Phase 3 — Academic & Classroom Layer

**Objective:** Academic hierarchy browsable, auto-enrollment functional, announcements and assignments working, discussion forums with threaded replies, file uploads to R2 with background processing.

**Depends on:** Phase 2 (auth works, users can log in, RBAC enforced)

---

### P3-M1: Academic Structure & Seed Data

**Objective:** Seed schools, departments, semesters, divisions, subjects. API to browse academic hierarchy. Auto-enrollment on registration.

**Logical Approach:**
- Create `prisma/seed.ts` with placeholder DES data (to be replaced with real data later)
- Endpoints to browse: `GET /academic/schools` → `GET /academic/departments?schoolId=` → etc.
- `GET /academic/my-subjects` → returns current student's enrolled subjects (from `StudentSubject` junction)
- Cache subject lists in Redis: `subjects:{dept_id}:{sem_id}` TTL 1h
- Auto-enrollment hook in auth.service `register()` already wired in P2-M3

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `prisma/seed.ts` | NEW | Seed script with placeholder academic data |
| `prisma/fixtures/academic-data.json` | NEW | JSON fixture (placeholder, replaceable later) |
| `src/services/academic.service.ts` | NEW | Academic hierarchy queries with caching |
| `src/controllers/academic.controller.ts` | NEW | Controller for academic routes |
| `src/routes/academic.routes.ts` | NEW | Academic hierarchy routes |
| `src/validators/academic.validator.ts` | NEW | Query param validation |
| `src/index.ts` | MODIFY | Mount academic routes |

**API Endpoints:**
```
GET  /api/v1/academic/schools
GET  /api/v1/academic/schools/:id/departments
GET  /api/v1/academic/departments/:id/subjects
GET  /api/v1/academic/semesters?current=true
GET  /api/v1/academic/my-subjects              → authenticate
GET  /api/v1/academic/my-subjects/:subId       → authenticate (subject detail)
```

**Test Cases (P3-M1):**
- [ ] `pnpm prisma db seed` populates all academic tables
- [ ] `GET /api/v1/academic/schools` returns all schools
- [ ] `GET /api/v1/academic/schools/:id/departments` returns departments for school
- [ ] `GET /api/v1/academic/departments/:id/subjects` returns subjects
- [ ] `GET /api/v1/academic/my-subjects` returns enrolled subjects for logged-in student
- [ ] Subject list cached in Redis (second request faster, `KEYS subjects:*` exists)
- [ ] Invalid school ID returns 404
- [ ] Non-authenticated request to `/my-subjects` returns 401

---

### P3-M2: Announcements & Assignments

**Objective:** Faculty can create announcements and assignments for their subjects. Students see them scoped to their enrolled subjects. Assignments support file attachments and submissions.

**Logical Approach:**
- **Announcements:** Faculty creates for a subject+semester. Students get paginated list filtered by enrolled subjects. Pin/unpin by faculty. Cache latest announcements per subject in Redis (TTL 15m)
- **Assignments:** Faculty creates with title, description, due_date, max_marks, optional attachment (R2 key). Students submit (text + file uploads). Faculty grades submissions with marks + feedback
- **Submissions:** One per student per assignment (enforced by `@@unique([assign_id, student_id])`). Status transitions: PENDING → SUBMITTED → GRADED (or LATE if past due_date)
- File attachments uploaded via R2 storage service (built in P3-M4)

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/services/announcement.service.ts` | NEW | Announcement CRUD + caching |
| `src/controllers/announcement.controller.ts` | NEW | Controller |
| `src/routes/announcement.routes.ts` | NEW | Routes |
| `src/services/assignment.service.ts` | NEW | Assignment CRUD + submission management |
| `src/controllers/assignment.controller.ts` | NEW | Controller |
| `src/routes/assignment.routes.ts` | NEW | Routes |
| `src/validators/classroom.validator.ts` | NEW | Zod schemas for announcements/assignments |
| `src/index.ts` | MODIFY | Mount new routes |

**API Endpoints:**
```
# Announcements
GET    /api/v1/announcements?subId=&semId=       → authenticate
POST   /api/v1/announcements                     → authenticate, rbac([FACULTY])
GET    /api/v1/announcements/:id                 → authenticate
PATCH  /api/v1/announcements/:id                 → authenticate, rbac([FACULTY])
PATCH  /api/v1/announcements/:id/pin             → authenticate, rbac([FACULTY, ADMIN])
DELETE /api/v1/announcements/:id                 → authenticate, rbac([FACULTY, ADMIN])

# Assignments
GET    /api/v1/assignments?subId=&semId=          → authenticate
POST   /api/v1/assignments                        → authenticate, rbac([FACULTY])
GET    /api/v1/assignments/:id                    → authenticate
PATCH  /api/v1/assignments/:id                    → authenticate, rbac([FACULTY])
DELETE /api/v1/assignments/:id                    → authenticate, rbac([FACULTY])

# Submissions
POST   /api/v1/assignments/:id/submit             → authenticate, rbac([STUDENT])
GET    /api/v1/assignments/:id/submissions         → authenticate, rbac([FACULTY])
GET    /api/v1/assignments/:id/my-submission       → authenticate
PATCH  /api/v1/submissions/:id/grade               → authenticate, rbac([FACULTY])
```

**Test Cases (P3-M2):**
- [ ] Faculty can create announcement for their subject
- [ ] Non-faculty creating announcement → 403
- [ ] Students see announcements only for enrolled subjects
- [ ] Pinned announcements appear first
- [ ] Faculty can create assignment with due date
- [ ] Student can submit assignment (text + files)
- [ ] Student cannot submit twice for same assignment (409)
- [ ] Late submission correctly marked as `LATE`
- [ ] Faculty can view all submissions for their assignment
- [ ] Faculty can grade submission (marks + feedback)
- [ ] Student can view only their own submission
- [ ] Announcement cache invalidated on new announcement

---

### P3-M3: Discussion Forums

**Objective:** Subject-wise threaded discussion forums. Create posts, nested replies (Reddit-style), upvote/downvote, pin/lock, bookmark, search.

**Logical Approach:**
- **Posts:** Scoped to `sub_id` + `sem_id`. Root posts have `parent_id = null` and a `title`. Replies have `parent_id` pointing to parent post
- **Threaded replies:** Fetch replies recursively using Prisma `include` with depth limit (max 5 levels deep for performance). Beyond that, paginate "View more replies"
- **Upvotes:** Toggle via `PostUpvote` junction. Increment/decrement `Post.upvotes` counter. Award XP via queue job (not inline)
- **Sorting:** `createdAt DESC` (newest), `upvotes DESC` (top), filter by `type` (DISCUSSION/QUESTION)
- **Pin/Lock:** Faculty/Admin only. Pinned posts always appear first
- **Bookmarks:** Personal, via `PostBookmark` junction
- **Search:** PostgreSQL full-text search on `title` + `content` using `to_tsvector` + `to_tsquery`

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/services/forum.service.ts` | MODIFY | Full implementation |
| `src/controllers/forum.controller.ts` | NEW | Controller |
| `src/routes/forum.routes.ts` | MODIFY | Wire up all forum routes |
| `src/validators/forum.validator.ts` | NEW | Post creation, reply, search schemas |

**API Endpoints:**
```
GET    /api/v1/forums/:subId/posts?sem=&page=&sort=&type=    → authenticate
POST   /api/v1/forums/:subId/posts                          → authenticate
GET    /api/v1/forums/posts/:postId                          → authenticate
POST   /api/v1/forums/posts/:postId/reply                    → authenticate
PATCH  /api/v1/forums/posts/:postId/upvote                   → authenticate
PATCH  /api/v1/forums/posts/:postId/pin                      → authenticate, rbac([FACULTY, ADMIN])
PATCH  /api/v1/forums/posts/:postId/lock                     → authenticate, rbac([FACULTY, ADMIN])
DELETE /api/v1/forums/posts/:postId                          → authenticate
POST   /api/v1/forums/posts/:postId/bookmark                 → authenticate
GET    /api/v1/forums/bookmarks                              → authenticate
GET    /api/v1/forums/search?q=&subId=                       → authenticate
```

**Test Cases (P3-M3):**
- [ ] Create root post with title + content → 201
- [ ] Create reply to post (nested) → parentId set correctly
- [ ] Fetch posts paginated (page=1, limit=20) → correct count + pagination meta
- [ ] Upvote toggles: first call → upvote (count+1), second call → remove (count-1)
- [ ] Pin post by faculty → appears first in list
- [ ] Lock post → replies return 403 ("Thread is locked")
- [ ] Delete own post → 200
- [ ] Delete others' post without ADMIN role → 403
- [ ] Bookmark post → appears in `/forums/bookmarks`
- [ ] Search by keyword → returns matching posts (full-text)
- [ ] Threaded replies returned nested up to 5 levels
- [ ] Student can only post in subjects they're enrolled in
- [ ] N+1 query check: fetching 50 posts generates ≤ 5 SQL queries

---

### P3-M4: File Storage (Cloudflare R2)

**Objective:** Upload files to R2, generate presigned download URLs, process files asynchronously via BullMQ.

**Logical Approach:**
- R2 is S3-compatible — use `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
- `uploadFile(key, buffer, contentType)`: `PutObjectCommand` to R2 bucket
- `getPresignedUrl(key, expiresIn=3600)`: signed URL valid for 1 hour
- `deleteFile(key)`: `DeleteObjectCommand`
- Multer with `memoryStorage()`, max 50MB, allowed types: pdf, doc(x), ppt(x), zip, jpg, png, gif
- After upload → add job to `fileProcessing.queue` → worker generates thumbnail (images) / extracts metadata
- Respond immediately with `{ status: 'processing', resourceId }` — client polls or receives Socket.io event

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/services/storage.service.ts` | MODIFY | Full R2 implementation |
| `src/services/resource.service.ts` | NEW | Resource CRUD + upload orchestration |
| `src/controllers/resource.controller.ts` | NEW | Controller with multer integration |
| `src/routes/resources.routes.ts` | MODIFY | Wire up resource routes |
| `src/validators/resource.validator.ts` | NEW | Upload validation schemas |
| `src/middleware/upload.ts` | NEW | Multer config (memoryStorage, size limits, type whitelist) |

**API Endpoints:**
```
GET    /api/v1/resources?subId=&semId=&topper=    → authenticate
POST   /api/v1/resources/upload                    → authenticate, multer
GET    /api/v1/resources/:id                       → authenticate
GET    /api/v1/resources/:id/download              → authenticate (returns presigned URL)
DELETE /api/v1/resources/:id                       → authenticate (owner or ADMIN)
PATCH  /api/v1/resources/:id/topper                → authenticate, rbac([FACULTY, ADMIN])
GET    /api/v1/resources/my-uploads                → authenticate
```

**Test Cases (P3-M4):**
- [ ] Upload a PDF → 201, resource created in DB, R2 key stored
- [ ] Upload exceeding 50MB → 413 (payload too large)
- [ ] Upload disallowed type (e.g., .exe) → 400
- [ ] `GET /resources/:id/download` returns presigned URL (valid, 1h expiry)
- [ ] Delete resource removes from both DB and R2
- [ ] Only owner or ADMIN can delete resource
- [ ] Mark as topper note (faculty only) → `is_topper_note = true`
- [ ] `GET /resources?topper=true` filters topper notes only
- [ ] `GET /resources/my-uploads` returns only current user's resources
- [ ] `download_count` increments on each download URL request
- [ ] File processing job enqueued after upload (queue contains job)

---

### P3-M5: BullMQ Queues & Workers

**Objective:** Background job processing for file thumbnails, notifications, and AI tasks. Workers run CPU-heavy work off the event loop.

**Logical Approach:**
- Create queue definitions with `Queue` from BullMQ, connected to Redis
- Create workers with `Worker` from BullMQ
- **File Processing Worker:** Image → Sharp thumbnail (400px wide) → upload to R2 → update `thumbnail_key`. PDF → extract page count metadata. Emit `resource:processed` via Socket.io
- **Notification Worker:** Create `Notification` record in DB → emit `notification:new` via Socket.io to user's room
- **AI Worker:** (Stub in this phase, full implementation in Phase 6) Call Claude API for auto-tagging and summarization
- Workers have retry logic (3 retries, exponential backoff), dead letter queue for failed jobs

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/queues/fileProcessing.queue.ts` | MODIFY | Full BullMQ queue definition |
| `src/queues/notifications.queue.ts` | MODIFY | Full notification queue |
| `src/queues/aiSummary.queue.ts` | MODIFY | AI queue (stub worker) |
| `src/queues/workers/fileProcessing.worker.ts` | NEW | Image thumbnail + PDF metadata worker |
| `src/queues/workers/notification.worker.ts` | NEW | Notification creation + Socket.io emit |
| `src/queues/workers/aiSummary.worker.ts` | NEW | Stub worker (full in P6) |
| `src/queues/workers/index.ts` | MODIFY | Export and start all workers |
| `src/queues/index.ts` | NEW | Export all queue instances |

**Test Cases (P3-M5):**
- [ ] File processing queue accepts a job and worker picks it up
- [ ] Image upload → thumbnail generated (400px wide) → `thumbnail_key` updated in DB
- [ ] PDF upload → page count extracted (or gracefully handled)
- [ ] Notification job creates DB record + emits Socket.io event
- [ ] Failed job retries 3 times with backoff
- [ ] After max retries, job moves to dead letter queue
- [ ] Queue health check: `queue.getJobCounts()` returns active/waiting/completed/failed counts
- [ ] Workers don't block the event loop (server remains responsive during processing)

---

### Phase 3 Integration Tests

- [ ] **Full classroom flow:** Seed academic data → Register student → Auto-enrolled in subjects → View subjects → Create post → Reply → Upvote → View thread
- [ ] **Faculty flow:** Register faculty → Assigned to subject → Create announcement → Create assignment → View submissions → Grade
- [ ] **File upload flow:** Upload PDF → Job queued → Worker processes → Presigned URL works → Download count increments
- [ ] **Cross-user forum:** Student A posts → Student B replies → Student A upvotes → XP job queued
- [ ] **Performance:** Fetch 100 posts with includes → response time < 200ms
- [ ] **Cache validation:** Subject list cached → new subject added → cache invalidated → fresh data returned

---

## Phase 4 — Real-Time & Chat Layer

**Objective:** Socket.io server operational with Redis adapter, 1-to-1 and group messaging, typing indicators, read receipts, presence system, real-time notifications.

**Depends on:** Phase 3 (queues working, notifications queue ready)

---

### P4-M1: Socket.io Server Setup

**Objective:** Socket.io server attached to Express HTTP server, Redis adapter for multi-instance pub/sub, JWT authentication on socket connections.

**Logical Approach:**
- Attach Socket.io to HTTP server created in P1-M5
- Apply `@socket.io/redis-adapter` using pub/sub Redis client pair from `createRedisClient()`
- **Socket auth middleware:** read JWT from `socket.handshake.auth.token` or cookie, verify, attach `socket.data.user`
- On connect: user joins personal room `user:{userId}`, joins rooms for all enrolled subjects `subject:{subId}`
- On disconnect: clean up presence
- CORS configured to match Express CORS settings

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/socket.ts` | MODIFY | Full Socket.io setup with Redis adapter |
| `src/socket/handlers/connection.handler.ts` | NEW | Connect/disconnect logic, room joining |
| `src/socket/middleware/socketAuth.ts` | NEW | JWT auth for socket connections |
| `src/index.ts` | MODIFY | Attach Socket.io to HTTP server |

**Test Cases (P4-M1):**
- [ ] Socket.io client connects with valid JWT
- [ ] Socket.io client rejected without JWT (auth error)
- [ ] Connected user automatically joins personal room `user:{userId}`
- [ ] Connected student joins subject rooms for enrolled subjects
- [ ] Disconnect event fires and cleans up
- [ ] Redis adapter pub/sub connected (multi-instance ready)
- [ ] CORS blocks connections from unauthorized origins

---

### P4-M2: Real-Time Chat

**Objective:** 1-to-1 and group messaging with full message history, typing indicators, read receipts, media messages.

**Logical Approach:**
- **REST endpoints** for conversation/history management (creating conversations, loading history)
- **Socket.io events** for real-time messaging:
  - `chat:send` → persist message → emit `chat:message` to conversation members
  - `chat:typing` → emit `chat:typing` to others in conversation
  - `chat:read` → create `MessageReadReceipt` → emit `chat:read` to sender
- **Conversation types:** DIRECT (1-to-1), GROUP (user-created), SUBJECT_GROUP (auto-created per subject), PROJECT_GROUP (auto-created per project)
- Messages paginated (cursor-based: `before` messageId) for infinite scroll
- Media messages: upload file via REST → get R2 key → send message with `type: IMAGE/FILE` + `r2_key`

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/services/chat.service.ts` | MODIFY | Full chat business logic |
| `src/controllers/chat.controller.ts` | NEW | REST controller for conversations |
| `src/routes/chat.routes.ts` | MODIFY | Wire up chat routes |
| `src/socket/handlers/chat.handler.ts` | NEW | Socket.io chat event handlers |
| `src/validators/chat.validator.ts` | NEW | Message/conversation validation |

**API Endpoints (REST):**
```
GET    /api/v1/chat/conversations                    → authenticate
GET    /api/v1/chat/conversations/:id                → authenticate (with messages, paginated)
POST   /api/v1/chat/conversations                    → authenticate (create 1-to-1)
POST   /api/v1/chat/groups                           → authenticate (create group)
POST   /api/v1/chat/groups/:id/members               → authenticate (add member)
DELETE /api/v1/chat/groups/:id/members/:userId        → authenticate (remove member)
```

**Socket.io Events:**
```
Client → chat:send       { convId, content, type?, r2Key? }
Server → chat:message    { msg } to all conversation members
Client → chat:typing     { convId }
Server → chat:typing     { convId, userId, username } to others
Client → chat:read       { convId, msgId }
Server → chat:read       { convId, msgId, userId } to sender
```

**Test Cases (P4-M2):**
- [ ] Create 1-to-1 conversation → both users are members
- [ ] Creating duplicate 1-to-1 with same users returns existing conversation
- [ ] Send message via socket → persisted in DB → delivered to other user in real-time
- [ ] Message history paginated (cursor-based) — returns 20 messages before cursor
- [ ] Create group → add members → send message → all members receive
- [ ] Typing indicator emitted to other members (not sender)
- [ ] Read receipt created → sender notified of read
- [ ] Media message with R2 key persisted correctly
- [ ] User can only access conversations they're a member of (403)
- [ ] Group admin can add/remove members
- [ ] Subject groups auto-created with correct members

---

### P4-M3: Presence System

**Objective:** Track user online/offline/away status using Redis, broadcast presence changes in real-time.

**Logical Approach:**
- On Socket.io connect: `redis.setex('presence:{userId}', 300, 'ONLINE')` + update `User.presence_status` in DB
- Heartbeat: client sends `presence:heartbeat` every 60s → renew Redis TTL
- If Redis key expires (no heartbeat for 5min) → user is OFFLINE
- Client sends `presence:away` → set Redis to `AWAY`
- On disconnect: delete Redis key → set DB OFFLINE → emit `presence:update` to relevant users

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/socket/handlers/presence.handler.ts` | NEW | Presence event handlers |
| `src/services/presence.service.ts` | NEW | Presence logic (Redis + DB sync) |
| `src/routes/user.routes.ts` | MODIFY | Add presence endpoints |

**API Endpoints:**
```
GET  /api/v1/users/:id/presence                     → authenticate
POST /api/v1/users/presence                          → authenticate (bulk query)
```

**Test Cases (P4-M3):**
- [ ] User connects → presence set to ONLINE in Redis + DB
- [ ] User disconnects → presence set to OFFLINE in Redis + DB
- [ ] User sends `presence:away` → status updates to AWAY
- [ ] Heartbeat renews Redis TTL
- [ ] `GET /api/v1/users/:id/presence` returns current status
- [ ] Bulk presence query returns status for multiple users
- [ ] Presence change emits `presence:update` to connected friends/classmates
- [ ] Redis key expires after 5min without heartbeat

---

### P4-M4: Notification System

**Objective:** Store notifications in DB, deliver in real-time via Socket.io, paginated history, mark read.

**Logical Approach:**
- Notifications created via the notification queue worker (never inline)
- Types: REPLY, UPVOTE, MENTION, CHAT_MESSAGE, ANNOUNCEMENT, ASSIGNMENT_POSTED, GRADE_RELEASED, RESOURCE_PROCESSED, BADGE_EARNED
- `data` field (JSON): flexible payload with `actor_id`, `ref_id`, `message`, etc.
- On creation: persist in DB → emit `notification:new` to user's Socket.io room
- Unread count: cached in Redis `unread:{userId}`, invalidated on new notification / mark read

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/services/notification.service.ts` | MODIFY | Full notification logic |
| `src/controllers/notification.controller.ts` | NEW | Controller |
| `src/routes/notifications.routes.ts` | MODIFY | Wire up routes |
| `src/socket/handlers/notification.handler.ts` | NEW | Socket.io notification delivery |

**API Endpoints:**
```
GET    /api/v1/notifications?page=&unread=         → authenticate
GET    /api/v1/notifications/unread-count           → authenticate
PATCH  /api/v1/notifications/:id/read               → authenticate
PATCH  /api/v1/notifications/read-all               → authenticate
DELETE /api/v1/notifications/:id                    → authenticate
```

**Test Cases (P4-M4):**
- [ ] Notification created via queue → appears in DB + delivered via Socket.io
- [ ] `GET /api/v1/notifications` returns paginated notifications (newest first)
- [ ] `GET /api/v1/notifications?unread=true` filters unread only
- [ ] `GET /api/v1/notifications/unread-count` returns correct count
- [ ] `PATCH /notifications/:id/read` marks single notification as read
- [ ] `PATCH /notifications/read-all` marks all as read + resets unread count
- [ ] Unread count cached in Redis, invalidated correctly
- [ ] User A replies to User B's post → User B gets REPLY notification
- [ ] User A upvotes User B's post → User B gets UPVOTE notification
- [ ] Faculty posts announcement → all enrolled students get ANNOUNCEMENT notification

---

### Phase 4 Integration Tests

- [ ] **Full chat flow:** Create conversation → Send 5 messages → Load history → Mark read → Verify read receipts
- [ ] **Group chat flow:** Create group → Add 3 members → All receive messages → Remove member → Removed member no longer receives
- [ ] **Presence flow:** Connect → ONLINE → Away → Heartbeat → Disconnect → OFFLINE
- [ ] **Notification chain:** Create post → Reply triggers REPLY notification → Upvote triggers UPVOTE notification → All delivered in real-time
- [ ] **Multi-instance simulation:** Socket.io events delivered across Redis adapter
- [ ] **Concurrent connections:** 100 concurrent Socket.io connections → no crashes, all receive messages

---

## Phase 5 — Social & Gamification Layer

**Objective:** XP system, badges, leaderboards, project marketplace with team management.

**Depends on:** Phase 4 (notifications + Socket.io working for real-time XP/badge awards)

---

### P5-M1: XP & Badge System

**Objective:** Award XP for platform activity, auto-award badges at thresholds, department-wise leaderboards.

**Logical Approach:**
- **XP Events:** Created via queue worker (never inline). Each event: `{ userId, points, reason, ref_id }`
- **XP Triggers:**

  | Action | XP | Queue Job Source |
  |--------|-----|-----------------|
  | Post created | +10 | Forum service → XP queue |
  | Reply upvoted | +5 | Forum service → XP queue |
  | Resource uploaded | +15 | Resource service → XP queue |
  | Resource marked Topper Note | +50 | Resource service → XP queue |
  | Assignment submitted | +10 | Assignment service → XP queue |
  | Project created | +20 | Project service → XP queue |

- After XP awarded → update `User.xp_total` (atomic increment) → check badge thresholds
- **Badge auto-award rules:**
  - `CONTRIBUTOR`: 5+ resources uploaded
  - `TOP_HELPER`: 50+ total upvotes received across posts
  - `TOPPER_NOTES`: has at least 1 topper-note resource
  - `PROJECT_LEADER`: created at least 1 project
  - `FIRST_POST`: created first post ever
  - `STREAK_7`: 7 consecutive days with activity
  - `STREAK_30`: 30 consecutive days with activity
- **Leaderboards:** Top 50 users by XP, cached in Redis `leaderboard:global` and `leaderboard:{dept_id}` with TTL 1h

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/services/gamification.service.ts` | NEW | XP award, badge check, leaderboard |
| `src/queues/xp.queue.ts` | NEW | XP event queue |
| `src/queues/workers/xp.worker.ts` | NEW | XP + badge worker |
| `src/controllers/gamification.controller.ts` | NEW | Controller |
| `src/routes/gamification.routes.ts` | NEW | Leaderboard + badge routes |
| `src/validators/gamification.validator.ts` | NEW | Query validation |

**API Endpoints:**
```
GET /api/v1/leaderboard?dept=&limit=              → authenticate
GET /api/v1/leaderboard/my-rank                   → authenticate
GET /api/v1/users/:id/xp-history                  → authenticate
```

**Test Cases (P5-M1):**
- [ ] Creating a post triggers XP award (+10 for author)
- [ ] Upvoting a post triggers XP award (+5 for post author, not voter)
- [ ] Uploading resource triggers XP (+15)
- [ ] `User.xp_total` correctly incremented (atomic, no race conditions)
- [ ] User reaching 5 resources → auto-awarded `CONTRIBUTOR` badge + notification
- [ ] Badge not awarded twice (unique constraint `[user_id, type]`)
- [ ] Leaderboard returns top 50 sorted by `xp_total DESC`
- [ ] Department leaderboard filters correctly
- [ ] Leaderboard cached in Redis (second fetch hits cache)
- [ ] `GET /users/:id/xp-history` returns XP events paginated

---

### P5-M2: Project Marketplace

**Objective:** Create projects, post open roles, apply, accept/reject applications, team management, auto-create project group chat.

**Logical Approach:**
- **Create project:** Leader creates with title, description, open_roles, skills_req. Leader auto-added as `ProjectMember` with role `LEADER`
- **Browse:** Paginated + filterable by status, skills. Full-text search on title + description
- **Apply:** Student submits application for specific role. One application per project per user (unique constraint)
- **Accept/Reject:** Leader reviews applications. On accept: create `ProjectMember` + auto-create/add to `PROJECT_GROUP` conversation + notify applicant
- **Team dashboard:** View all members, their roles, remove members (leader only)

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/services/project.service.ts` | NEW | Project CRUD + application management |
| `src/controllers/project.controller.ts` | NEW | Controller |
| `src/routes/projects.routes.ts` | MODIFY | Wire up all project routes |
| `src/validators/project.validator.ts` | NEW | Project + application validation |

**API Endpoints:**
```
GET    /api/v1/projects?status=&skills=&q=&page=    → authenticate
POST   /api/v1/projects                              → authenticate
GET    /api/v1/projects/:id                          → authenticate
PATCH  /api/v1/projects/:id                          → authenticate (leader only)
DELETE /api/v1/projects/:id                          → authenticate (leader only)
GET    /api/v1/projects/:id/members                  → authenticate
POST   /api/v1/projects/:id/apply                    → authenticate
GET    /api/v1/projects/:id/applications              → authenticate (leader only)
PATCH  /api/v1/projects/:id/applications/:appId       → authenticate (leader only) — accept/reject
GET    /api/v1/projects/my-projects                   → authenticate
```

**Test Cases (P5-M2):**
- [ ] Create project → leader auto-added as member + XP awarded
- [ ] Browse projects paginated + filtered by status/skills
- [ ] Search projects by keyword
- [ ] Apply to project → application created with PENDING status
- [ ] Cannot apply twice to same project (409)
- [ ] Leader accepts application → member created + group chat updated + applicant notified
- [ ] Leader rejects application → status updated + applicant notified
- [ ] Only leader can accept/reject applications (403)
- [ ] Delete project → all members, applications cleaned up
- [ ] `GET /projects/my-projects` returns both led and member projects

---

### P5-M3: Marksheet Module

**Objective:** Faculty/Admin uploads marksheet data for students. Students view their own marksheets with SGPA/CGPA calculation.

**Logical Approach:**
- Marksheet created per student per semester. Contains multiple `MarksheetResult` entries (one per subject)
- SGPA calculated: `sum(credit_point) / sum(course_credit)` for the semester
- CGPA: average SGPA across all semesters
- Only FACULTY/ADMIN can create/update marksheets
- Students can only view their own marksheets

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/services/marksheet.service.ts` | NEW | Marksheet CRUD + GPA calculation |
| `src/controllers/marksheet.controller.ts` | NEW | Controller |
| `src/routes/marksheet.routes.ts` | NEW | Routes |
| `src/validators/marksheet.validator.ts` | NEW | Validation schemas |

**API Endpoints:**
```
GET    /api/v1/marksheets/my                         → authenticate
GET    /api/v1/marksheets/my/:semId                  → authenticate (specific semester)
POST   /api/v1/marksheets                            → authenticate, rbac([FACULTY, ADMIN])
POST   /api/v1/marksheets/bulk                       → authenticate, rbac([ADMIN])
GET    /api/v1/marksheets/student/:studentId          → authenticate, rbac([FACULTY, ADMIN])
```

**Test Cases (P5-M3):**
- [ ] Admin creates marksheet with results → all stored correctly
- [ ] SGPA calculated correctly for a semester
- [ ] CGPA calculated correctly across semesters
- [ ] Student can view only their own marksheets
- [ ] Faculty can view marksheets for students in their subjects
- [ ] Bulk upload creates multiple marksheets in a transaction
- [ ] Duplicate marksheet for same student+semester → 409

---

### Phase 5 Integration Tests

- [ ] **Gamification flow:** Post → Upvote → Upload resource → Check XP → Badge auto-awarded → Leaderboard updated
- [ ] **Project flow:** Create project → Apply → Accept → Group chat created → Team dashboard shows member → XP awarded
- [ ] **Marksheet flow:** Admin creates marksheets → Student views SGPA/CGPA → Faculty views class results
- [ ] **Cross-feature:** Project leader badge awarded when creating project. Contributor badge after 5 uploads
- [ ] **Concurrent XP:** 10 simultaneous upvotes on same user's posts → `xp_total` correctly reflects all

---

## Phase 6 — AI, Admin & Production Hardening

**Objective:** AI features active (with circuit breaker), admin moderation tools, production deployment config, load testing, CI/CD.

**Depends on:** Phase 5 (all features implemented)

---

### P6-M1: AI Features (Claude Integration)

**Objective:** AI auto-tagging, thread summarization, project skill-matching. All via BullMQ workers, never inline.

**Logical Approach:**
- **Circuit breaker (Redis-based):** Track failures in `ai:failures` counter. If ≥ 5 failures → set `ai:circuit_open` TTL 30s → skip Claude calls during cooldown. On success → reset counter
- **Auto-tag:** When new post created → queue `ai:auto-tag` job → worker calls Claude API with post content → returns tag suggestions → update `Post.tags`
- **Thread summary:** On-demand → queue `ai:summarize` job → worker fetches thread posts → calls Claude → cache result in Redis `thread-summary:{postId}` TTL 24h → emit via Socket.io
- **Skill match:** For project marketplace → match user skills to project requirements → ranked recommendations
- All Claude calls: `AbortSignal.timeout(5000)`, structured prompts, max 1000 tokens

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/services/ai.service.ts` | MODIFY | Full Claude API integration with circuit breaker |
| `src/queues/workers/aiSummary.worker.ts` | MODIFY | Full implementation (was stub) |
| `src/routes/ai.routes.ts` | NEW | AI-related endpoints |
| `src/controllers/ai.controller.ts` | NEW | Controller |

**API Endpoints:**
```
POST /api/v1/ai/summarize/:postId                   → authenticate
GET  /api/v1/ai/summary/:postId                     → authenticate (get cached summary)
GET  /api/v1/ai/recommendations/projects             → authenticate (skill-matched projects)
```

**Test Cases (P6-M1):**
- [ ] New post → auto-tag job queued → tags updated on post
- [ ] Summarize request → job queued → summary cached in Redis → returned on next GET
- [ ] Circuit breaker opens after 5 consecutive failures → Claude calls skipped for 30s
- [ ] Circuit breaker closes after 30s → normal operation resumes
- [ ] Claude API timeout (>5s) → gracefully handled, returns null
- [ ] Skill match returns ranked project recommendations
- [ ] AI features degrade gracefully when circuit open

---

### P6-M2: Admin & Moderation Tools

**Objective:** Content reporting, moderation queue, user management, audit logs.

**Logical Approach:**
- **Reports:** Users can report posts/messages with reason
- **Moderation queue:** Admins view pending reports, take action (dismiss, delete content, warn user, ban user)
- **User management:** Ban/unban users, change roles. Admin can create users (admin-controlled registration)
- **Audit logs:** Log all admin actions in structured logs
- All admin routes guarded by `rbac(['ADMIN', 'SUPER_ADMIN'])`

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/services/admin.service.ts` | NEW | Admin business logic |
| `src/controllers/admin.controller.ts` | NEW | Controller |
| `src/routes/admin.routes.ts` | MODIFY | Wire up admin routes |
| `src/validators/admin.validator.ts` | NEW | Admin action validation |
| `prisma/schema.prisma` | MODIFY | Add `Report` and `AuditLog` models |

**API Endpoints:**
```
GET    /api/v1/admin/reports?status=                 → rbac([ADMIN, SUPER_ADMIN])
PATCH  /api/v1/admin/reports/:id                     → rbac([ADMIN, SUPER_ADMIN])
POST   /api/v1/admin/reports                         → authenticate (any user reports)
PATCH  /api/v1/admin/users/:id/ban                   → rbac([ADMIN, SUPER_ADMIN])
PATCH  /api/v1/admin/users/:id/unban                 → rbac([ADMIN, SUPER_ADMIN])
PATCH  /api/v1/admin/users/:id/role                  → rbac([SUPER_ADMIN])
POST   /api/v1/admin/users                           → rbac([ADMIN, SUPER_ADMIN]) — admin-controlled registration
GET    /api/v1/admin/audit-logs?page=                → rbac([SUPER_ADMIN])
GET    /api/v1/admin/stats                           → rbac([ADMIN, SUPER_ADMIN])
```

**Test Cases (P6-M2):**
- [ ] User reports a post → report created with PENDING status
- [ ] Admin views moderation queue → pending reports listed
- [ ] Admin resolves report → status updated
- [ ] Admin bans user → `is_banned = true` → user can't login
- [ ] Admin unbans user → `is_banned = false` → user can login again
- [ ] Admin creates user account (admin-controlled registration)
- [ ] Only SUPER_ADMIN can change user roles
- [ ] All admin actions create audit log entries
- [ ] Platform stats returned (total users, posts, messages, resources)
- [ ] Non-admin accessing admin routes → 403

---

### P6-M3: Search Infrastructure

**Objective:** Full-text search across posts, resources, users, and projects using PostgreSQL full-text search.

**Logical Approach:**
- Add GIN indexes on `to_tsvector('english', title || ' ' || content)` for posts and resources
- Unified search endpoint that searches across multiple entity types
- Rank results by relevance using `ts_rank()`

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/services/search.service.ts` | NEW | Full-text search logic |
| `src/controllers/search.controller.ts` | NEW | Controller |
| `src/routes/search.routes.ts` | NEW | Search routes |
| `prisma/migrations/xxx_add_search_indexes.sql` | NEW | Raw SQL migration for GIN indexes |

**API Endpoints:**
```
GET /api/v1/search?q=&type=posts|resources|projects|users&page=   → authenticate
GET /api/v1/search/suggest?q=                                      → authenticate
```

**Test Cases (P6-M3):**
- [ ] Search "machine learning" returns relevant posts and resources
- [ ] Search filtered by type (posts only, resources only)
- [ ] Results ranked by relevance
- [ ] Empty query returns 400
- [ ] Search with no results returns empty array
- [ ] Search performance: < 100ms for 10k records

---

### P6-M4: Production Hardening

**Objective:** All external calls have timeouts, rate limiting Redis-backed, graceful error handling, security headers, performance optimizations.

**Logical Approach:**
- **Timeouts:** Prisma `connection_timeout`, Redis `connectTimeout`, Claude `AbortSignal.timeout(5000)`, R2 SDK `requestTimeout`
- **Process safety:** `unhandledRejection` + `uncaughtException` handlers → log + graceful shutdown
- **Security:** helmet CSP headers, CORS whitelist, no stack traces in production errors, request size limits
- **Performance:** Response compression, Redis connection pooling
- **Structured logging:** Replace console.log with pino — log level, timestamp, request ID
- **Health check enhancement:** `/health` returns DB + Redis + Queue status

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `src/index.ts` | MODIFY | Add compression, enhanced health, process handlers |
| `src/lib/logger.ts` | NEW | Structured logging with pino |
| `src/middleware/errorHandler.ts` | MODIFY | Production vs dev error responses |
| `src/middleware/rateLimit.middleware.ts` | MODIFY | Ensure Redis-backed store |
| `src/utils/constants.ts` | MODIFY | All timeout values centralized |

**Test Cases (P6-M4):**
- [ ] Production error responses don't leak stack traces
- [ ] Dev error responses include stack traces
- [ ] `/health` returns status for DB, Redis, and queue worker
- [ ] Compression middleware reduces response size for large payloads
- [ ] All external calls respect timeout
- [ ] `unhandledRejection` logged and doesn't crash process
- [ ] Structured logs include request ID, timestamp, level
- [ ] Rate limiter uses Redis store (not in-memory)

---

### P6-M5: CI/CD & Deployment Config

**Objective:** GitHub Actions pipeline, Docker build, environment config for Render deployment.

**Logical Approach:**
- GitHub Actions workflow: on push to `backend/**` → install → type-check → test → build → deploy to Render
- Verify Dockerfile builds correctly
- Database migration strategy: `prisma migrate deploy` in CI

**Files Modified:**

| File | Action | Description |
|------|--------|-------------|
| `.github/workflows/backend-ci.yml` | NEW | Full CI/CD pipeline |
| `.github/workflows/backend-test.yml` | NEW | Test-only pipeline for PRs |
| `backend/Dockerfile` | MODIFY | Add prisma migrate deploy step |
| `backend/.env.example` | MODIFY | Document all required env vars |
| `backend/scripts/healthcheck.sh` | NEW | Docker healthcheck script |

**Test Cases (P6-M5):**
- [ ] `pnpm type-check` passes (zero TypeScript errors)
- [ ] `pnpm test` all tests pass
- [ ] `pnpm build` compiles to `dist/`
- [ ] Docker build succeeds: `docker build -t des-backend .`
- [ ] Docker container starts and `/health` responds
- [ ] `prisma migrate deploy` applies all migrations
- [ ] CI workflow runs successfully on push

---

### Phase 6 Integration Tests

- [ ] **AI flow:** Create post → auto-tagged → request summary → summary cached → returned
- [ ] **Admin flow:** User reports post → Admin reviews → Bans user → User can't login → Unban → Can login
- [ ] **Search flow:** Create 20 posts with varied content → search returns relevant results ranked
- [ ] **Production readiness:** All health checks pass → Docker builds → CI pipeline green
- [ ] **Load test (600 concurrent users):**
  - Auth endpoints handle 600 registrations in < 30s
  - Forum posts created and retrieved under 200ms p95
  - Chat messages delivered in < 100ms
  - No memory leaks over 10-minute sustained load
  - Redis handles rate limiting at scale
  - Connection pool doesn't exhaust under load

---

## Redis Key Conventions

| Key Pattern | Value | TTL | Purpose |
|-------------|-------|-----|---------|
| `session:{userId}` | JSON (user data) | 7d | Auth session cache |
| `user:{userId}` | JSON (profile) | 30m | User profile cache |
| `presence:{userId}` | `ONLINE`/`AWAY` | 5min | Presence heartbeat |
| `subjects:{deptId}:{semId}` | JSON array | 1h | Subject list cache |
| `announcements:{subId}:{semId}` | JSON array | 15m | Latest announcements |
| `leaderboard:global` | JSON array (top 50) | 1h | Global XP leaderboard |
| `leaderboard:{deptId}` | JSON array (top 50) | 1h | Department leaderboard |
| `unread:{userId}` | Integer | — | Unread notification count |
| `thread-summary:{postId}` | TL;DR string | 24h | AI thread summary |
| `ai:failures` | Integer | — | Circuit breaker counter |
| `ai:circuit_open` | `"1"` | 30s | Circuit breaker flag |
| `rl:{ip}:auth` | Integer | 1m | Rate limit counter (auth) |
| `rl:{ip}:api` | Integer | 1m | Rate limit counter (API) |

---

## Consistent API Response Shape

```ts
// Success (single item)
{ data: T }

// Success (paginated)
{ data: T[], meta: { page: number, limit: number, total: number, totalPages: number } }

// Error
{ error: string, code?: string, details?: Record<string, string> }
```

All timestamps in ISO 8601. All IDs are UUIDs.

---

> **Rule:** Complete Phase N fully (server boots, tests pass, integration tests green) before starting Phase N+1. Each phase builds on the previous.

*Built by DES students, for DES students. 🔥*
