# DES Unified Platform — PLAN.md

> **Version:** 1.0  
> **Status:** Pre-Development  
> **Team:** 2 Developers  
> **Target:** 1 Month Build Sprint  
> **Audience:** Antigravity (Development Partner)

---

## 🧠 What Is This?

DES Unified Platform is an all-in-one college portal built exclusively for **DES Pune University** students and faculty. Think of it as:

> **Google Classroom + WhatsApp + Discord + GitHub Codespaces** — fused into one platform, locked to `@despu.edu.in` emails, built from the ground up for the DES campus experience.

### The Problem It Solves

Right now DES students are scattered across:
- **WhatsApp** for communication — chaotic, no structure, no search
- **Google Classroom** for assignments — works but isolated
- **Random Google Drive links** for notes — no curation, no discovery
- **No platform** for project collaboration or finding teammates

DES Unified Platform kills all of that with one login.

---

## 🔐 Access & Identity

- Only `@despu.edu.in` emails can register — enforced at middleware level
- On first login, accounts are auto-linked to ERP data: department, semester, roll number, enrolled subjects — no manual setup
- JWT-based auth with HTTP-only cookies, Argon2 password hashing

### Roles

| Role | Description |
|---|---|
| Student | Default for all enrolled students |
| Faculty | Verified teaching staff |
| Admin | Platform moderators / IT staff |
| Contributor | Earned by actively sharing notes/resources |
| Project Leader | Students who create projects on the marketplace |

---

## 🏫 Core Features

### Academic Structure
```
Department → Semester → Subject
                          ├── Discussion Forum
                          ├── Study Materials
                          ├── Topper Notes
                          └── Faculty Announcements
```
Auto-enrollment on first login based on ERP data.

### Discussion Forums
- Threaded replies (Reddit-style, infinitely nested)
- Upvote system, post categories, tagging
- Rich text editor with Markdown (Tiptap)
- Pin, lock, report, bookmark posts
- Faculty announcements distinguished from student posts

### Study Material Platform
- Public note sharing, Topper Notes section
- Faculty resource uploads (slides, manuals, reference books)
- Previous year papers, lab manuals
- PDF inline preview, download tracking
- All files on Cloudflare R2 — no broken Drive links

### Real-Time Chat
- 1-to-1 and group messaging (Socket.io)
- Subject groups auto-created, project groups, department groups
- Typing indicators, read receipts, media sharing
- Online / Offline / Away presence

### Project Marketplace
- Post open roles: Frontend, Backend, Designer, ML Engineer, etc.
- Apply to join projects, team management dashboard
- Skill-based teammate recommendations
- Project showcase pages

### Dashboard
- Bento-grid layout with drag-and-drop widgets
- Widgets: activity feed, deadlines, recent chats, announcements, storage usage, contribution stats

### Gamification & Badges
- XP / points system, contribution streaks
- Badges: Contributor, Top Helper, Topper Notes, Project Leader
- Subject-wise and department-wise leaderboards

### AI Features (via Anthropic Claude API)
- Thread summarization (TL;DR on long discussions)
- Quick answer suggestions on questions
- Auto-tagging of posts
- Skill-match recommendations for Project Marketplace

### Phase 2 (Post-Launch)
- Voice & video calls (WebRTC / mediasoup)
- Collaborative Cloud IDE (Monaco Editor + Yjs CRDT)
- Mobile app (React Native)
- Calendar integration
- Advanced AI features

---

## ⚙️ Tech Stack

### Frontend — Vercel
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion |
| State | Zustand |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Rich Text | Tiptap |
| Code Editor | Monaco Editor |
| Realtime Collab | Yjs + y-websocket (Phase 2) |

### Backend — Render
| Layer | Technology |
|---|---|
| Runtime | Node.js + Express + TypeScript |
| Realtime | Socket.io + Redis Adapter |
| Job Queue | BullMQ + Redis (Upstash) |
| File Processing | Sharp (images), pdf-lib |
| AI | Anthropic Claude API |
| Auth | JWT + HTTP-only cookies, Argon2 |

### Database & Storage
| Layer | Technology |
|---|---|
| Primary DB | PostgreSQL (Neon) |
| ORM | Prisma |
| Cache / Pub-Sub | Redis (Upstash) |
| File Storage | Cloudflare R2 |
| Search | PostgreSQL Full-Text Search (Typesense later) |

### DevOps
| Layer | Technology |
|---|---|
| Frontend Hosting | Vercel |
| Backend Hosting | Render ($7/month, always-on) |
| Database | Neon (serverless Postgres) |
| CDN | Cloudflare |
| CI/CD | GitHub Actions |
| Monitoring | Better Stack / Logtail |
| Package Manager | pnpm |

---

## 📁 Repository & Folder Structure

Single GitHub repository, two deployment targets.

```
des-pu-student-portal/
│
├── frontend/                          → Deploys to Vercel
│   ├── app/                           → Next.js App Router pages
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/
│   │   │   ├── dashboard/
│   │   │   ├── feed/
│   │   │   ├── chat/
│   │   │   ├── announcements/
│   │   │   ├── calendar/
│   │   │   ├── resources/
│   │   │   │   ├── study-material/
│   │   │   │   └── my-space/
│   │   │   ├── ide/
│   │   │   │   └── my-projects/
│   │   │   └── projects/
│   │   │       ├── my-projects/
│   │   │       └── explore/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                        → shadcn/ui base components
│   │   ├── forums/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   └── shared/
│   ├── lib/
│   │   ├── api.ts                     → Axios/fetch wrapper pointing to backend
│   │   ├── socket.ts                  → Socket.io client setup
│   │   └── utils.ts
│   ├── store/                         → Zustand stores
│   ├── hooks/                         → Custom React hooks
│   ├── types/                         → Shared TypeScript types
│   ├── public/
│   ├── .env.local
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
└── backend/                           → Deploys to Render
    ├── src/
    │   ├── index.ts                   → Express app entry point
    │   ├── socket.ts                  → Socket.io server setup
    │   ├── routes/
    │   │   ├── auth.routes.ts
    │   │   ├── user.routes.ts
    │   │   ├── forum.routes.ts
    │   │   ├── chat.routes.ts
    │   │   ├── resources.routes.ts
    │   │   ├── projects.routes.ts
    │   │   ├── notifications.routes.ts
    │   │   └── admin.routes.ts
    │   ├── controllers/               → Route handler logic
    │   ├── middleware/
    │   │   ├── auth.middleware.ts     → JWT verification
    │   │   ├── rbac.middleware.ts     → Role-based access control
    │   │   ├── rateLimit.middleware.ts
    │   │   └── domainCheck.middleware.ts  → DES email only
    │   ├── services/                  → Business logic layer
    │   │   ├── auth.service.ts
    │   │   ├── forum.service.ts
    │   │   ├── chat.service.ts
    │   │   ├── storage.service.ts     → Cloudflare R2 interactions
    │   │   ├── ai.service.ts          → Claude API calls
    │   │   └── notification.service.ts
    │   ├── queues/                    → BullMQ job definitions
    │   │   ├── fileProcessing.queue.ts
    │   │   ├── notifications.queue.ts
    │   │   ├── aiSummary.queue.ts
    │   │   └── workers/               → BullMQ worker processes
    │   ├── cache/                     → Redis cache helpers
    │   │   └── redis.ts
    │   └── utils/
    ├── prisma/
    │   ├── schema.prisma              → Full DB schema
    │   └── migrations/
    ├── .env
    ├── Dockerfile
    └── package.json
```

---

## 🏗️ Backend Architecture & Scaling Principles

This is not optional — these principles are baked into the codebase from day one.

### 1. Node.js is Single-Threaded — Never Block the Event Loop

Node handles I/O (DB queries, network calls) fine because it's async. But CPU-heavy work — image processing, ZIP compression, generating AI summaries — blocks the entire event loop and freezes every other request.

**Rules:**
- CPU-heavy work goes into **Worker Threads** or **BullMQ queues** — never inline in a route handler
- File processing (thumbnails, PDF indexing) → BullMQ queue, respond immediately with `{ status: 'processing' }`
- AI summaries → BullMQ queue, deliver result via Socket.io when done
- Leaderboard XP updates → BullMQ queue

```ts
// ❌ NEVER — blocks event loop
app.post('/upload', async (req, res) => {
  const thumbnail = await generateThumbnail(req.file) // blocks everything
  res.json({ thumbnail })
})

// ✅ ALWAYS — queue it, respond immediately
app.post('/upload', async (req, res) => {
  await uploadQueue.add('process', { fileId: req.file.id })
  res.json({ status: 'processing' })
})
```

### 2. Stateless Handlers — Built for Horizontal Scaling

Every route handler must be completely stateless. No instance should hold data another instance doesn't have. This is what allows us to run multiple server instances without issues.

**The three killers of statelessness — all solved:**

| Problem | Solution |
|---|---|
| In-memory sessions | Sessions stored in **Redis**, not server RAM |
| Socket.io per-instance rooms | **Socket.io Redis Adapter** — all instances share pub/sub |
| Local file storage | All uploads go to **Cloudflare R2**, never local disk |

```ts
// ❌ NEVER — dies when you add a second instance
const activeSessions = new Map()

// ✅ ALWAYS — shared across all instances
await redis.set(`session:${userId}`, JSON.stringify(session), 'EX', 86400)
```

### 3. Database — Connection Pooling, Indexes, No N+1

The DB will bottleneck before the server does.

- **Connection pooling** — Prisma handles this, pool size configured for Neon's limits
- **Indexes on everything** — every foreign key, every field used in `WHERE`, `ORDER BY`, or `GROUP BY` (`userId`, `subjectId`, `createdAt`, `role`, etc.)
- **N+1 queries are banned** — always use Prisma `include` to join in a single query

```ts
// ❌ NEVER — 51 queries for 50 posts
const posts = await prisma.post.findMany()
for (const post of posts) {
  post.author = await prisma.user.findUnique({ where: { id: post.authorId } })
}

// ✅ ALWAYS — 1 query
const posts = await prisma.post.findMany({ include: { author: true } })
```

### 4. Redis Caching — Don't Hit the DB Twice

Data that barely changes but gets read constantly — subject lists, department info, leaderboards — gets cached in Redis.

**Pattern: Cache-aside with TTL**
```ts
async function getSubjects(departmentId: string) {
  const cached = await redis.get(`subjects:${departmentId}`)
  if (cached) return JSON.parse(cached)

  const subjects = await prisma.subject.findMany({ where: { departmentId } })
  await redis.set(`subjects:${departmentId}`, JSON.stringify(subjects), 'EX', 3600)
  return subjects
}
```

Always set a TTL. When data changes, explicitly invalidate the cache key.

### 5. Rate Limiting — Redis-Based for Distributed Setups

- **Auth endpoints** — 5 requests/minute (strict)
- **Read endpoints** — 200 requests/minute (loose)
- Redis-based rate limiting so limits are shared across all instances, not per-instance

### 6. Route Handlers Must Respond in Under 100ms

Anything slow gets queued. Things that must never block a response:
- Sending emails / push notifications
- Generating AI summaries
- File thumbnail generation / PDF indexing
- XP / leaderboard updates
- Sending webhooks

All of the above → **BullMQ queues with dedicated worker processes**.

### 7. Graceful Error Handling — Nothing Brings Down the Server

- **Global error handler** in Express — catches everything, no unhandled rejections ever crash the process
- **Timeouts on every external call** — DB, Redis, Claude API — if it takes more than 5 seconds, abort it
- **Circuit breaker** — if Claude API fails 5 times in a row, stop calling it for 30 seconds, don't pile up failures

### 8. Scaling Summary

| Problem | Solution |
|---|---|
| CPU blocking | BullMQ queues + Worker Threads |
| Multiple instances, shared state | Redis sessions, Socket.io adapter, R2 for files |
| DB bottleneck | Connection pooling, indexes, N+1 fixes, Redis cache |
| Traffic spikes | Redis rate limiting, horizontal scaling on Render |
| Slow responses | Queue heavy work, handlers under 100ms |
| Cascading failures | Timeouts on all external calls, global error handler |

---

## 🗓️ 1 Month Build Plan

### Week 1 — Foundation
- Repo setup (single repo, frontend + backend folders)
- PostgreSQL schema design on Neon (full, locked)
- Express backend setup + Prisma
- Auth system (DES email restriction, JWT, sessions in Redis)
- Role-based middleware (RBAC)
- Next.js app shell + sidebar navigation
- Basic UI design system (Tailwind + shadcn/ui)

### Week 2 — Classroom Layer
- Department → Semester → Subject structure + auto-enrollment
- Discussion forums (create posts, threaded replies, upvotes)
- Study material uploads (Cloudflare R2)
- File previews, PDF inline view
- Faculty announcements
- Subject-wise resource library
- Search & filtering

### Week 3 — Chat & Social Layer
- Real-time 1-to-1 chat (Socket.io)
- Group chats (subject groups, custom groups)
- Online / offline / away presence
- Real-time notifications system
- Profile system
- Badge system
- Dashboard (bento grid layout)

### Week 4 — Projects + Polish + Deploy
- Project Marketplace (post, apply, manage)
- Dark / light mode
- Mobile responsive polish
- AI summarization on threads (via BullMQ + Claude API)
- Gamification (XP, leaderboards)
- Dockerfile + deploy to Render
- GitHub Actions CI/CD pipeline
- Bug fixes + performance audit

### Phase 2 (Post-Launch)
- Voice & video calls (WebRTC / mediasoup)
- Collaborative Cloud IDE (Monaco + Yjs)
- Calendar integration
- Mobile app (React Native)
- Advanced AI features
- Typesense for full-text search

---

## ✅ Non-Negotiables — Ships No Matter What

1. DES email-only authentication
2. Department → Semester → Subject auto-enrollment
3. Discussion forums with threaded replies & upvotes
4. Study material uploads & resource library
5. Real-time 1-to-1 and group chat
6. Notification system
7. Profile system with roles and badges
8. Project Marketplace
9. Personalized dashboard
10. Dark / Light mode

---

*Built by DES students, for DES students. 🔥*
