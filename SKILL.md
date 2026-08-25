# DES Unified Platform — AI Skills Router

**CRITICAL INSTRUCTION FOR THE AI**: You MUST read and follow the skills defined in the `skills/` directory when performing tasks in this repository.
Do not rely on generic knowledge. Apply the specific architectural standards, anti-patterns, and code patterns defined in these files.

---

## 🌟 Universal Mandatory Skills
Regardless of the task domain, you MUST apply these core principles to all code you write, review, or debug:
- **[Clean Code](skills/cleancode.md)**: Uncle Bob's clean code principles — naming, functions, error handling, TDD.
- **[Code Debt & Cleanup](skills/code_debt.md)**: Identify and remediate tech debt.
- **[Refactoring](skills/refactor.md)**: Safe and systematic code refactoring.
- **[Bug Fixing](skills/bugs.md)**: Debugging, root-cause analysis, security checklist.

## 🛡️ Security (Mandatory for all new features)
Before completing any implementation, refer to these to ensure safety:
- **[Security Review](skills/security_review.md)**: Comprehensive OWASP-aligned codebase scanner — injection, auth, data flow analysis.
- **[Security Bounty Hunter](skills/security_bounty_hunter.md)**: Practical vulnerability discovery and attack surface mapping.

---

## 🧭 Domain-Specific Routing

When working on a specific part of the system, **YOU MUST READ AND APPLY** the relevant domain skills:

### ⚙️ Backend — Node.js / Express 5 / TypeScript
When writing services, controllers, middleware, or anything under `backend/src/`:
- **[PostgreSQL & Prisma](skills/postgresql.md)** ← Primary database skill — N+1 prevention, pagination, transactions
- **[Redis Caching](skills/redis.md)** ← Cache-aside, rate limiting, BullMQ, Socket.io adapter
- **[RBAC](skills/rbac.md)** ← Authentication middleware, role guards, domain email check
- **[Prisma Schema Design](skills/data_schema_design.md)** ← Models, indexes, unique constraints, enums

> ⚠️ **This is a Node.js + Express 5 + TypeScript backend.** There is NO Python, NO FastAPI, NO Kafka, NO Kubernetes in this project.

### 🧪 Testing
When writing or reviewing tests under `backend/tests/`:
- **[Vitest + Supertest Testing](skills/unit_testing_ts.md)** ← Unit tests, integration tests, test helpers, TDD pattern

### 📂 File Storage
When implementing upload/download features:
- **[Cloudflare R2 Storage](skills/s3_object_storage.md)** ← Upload, presigned URLs, Sharp thumbnails, BullMQ processing

### 🤖 AI Features
When integrating Claude AI (auto-tagging, summarization):
- **[Claude API Integration](skills/llm_api_integration.md)** ← Circuit breaker, BullMQ queue, graceful degradation

### 🔌 Real-Time
When implementing chat, notifications, or presence:
- **[Socket.io Patterns](skills/websocket_client.md)** ← Server setup, Redis adapter, rooms, client hook

### 🎨 Frontend — Next.js 16 / React
When working on pages, components, or UI under `frontend/`:
- **[Next.js Architecture](skills/nextjs.md)** ← App Router, route groups, React Query, protected routes

### 📊 Observability
When instrumenting code with logging:
- **[Structured Logging](skills/structured_logging.md)** ← JSON format, request IDs, Logtail integration

### 🔐 Admin & Moderation
When implementing admin features (Phase 6):
- **[Audit Logging](skills/audit_logging.md)** ← Who did what, when, from where — append-only logs

### 🐳 Infrastructure
When modifying Docker files:
- **[Docker Patterns](skills/docker.md)** ← Multi-stage builds, pnpm, health checks

---

## 📋 Tech Stack Quick Reference

| Layer | Technology | Skill File |
|-------|-----------|-----------|
| Runtime | Node.js + Express 5 | — |
| Language | TypeScript 6 | — |
| ORM | Prisma 7 | `postgresql.md` |
| Database | PostgreSQL (Neon) | `postgresql.md` |
| Cache | Redis (Upstash) via ioredis | `redis.md` |
| Job Queue | BullMQ | `redis.md` |
| Real-time | Socket.io + Redis adapter | `websocket_client.md` |
| File Storage | Cloudflare R2 (S3 SDK) | `s3_object_storage.md` |
| Auth | JWT + Argon2 + HTTP-only cookies | `rbac.md` |
| Validation | Zod | — |
| AI | Anthropic Claude SDK | `llm_api_integration.md` |
| Image | Sharp | `s3_object_storage.md` |
| Frontend | Next.js 16 (App Router) | `nextjs.md` |
| Styling | TailwindCSS 4 | — |
| State | Zustand + TanStack React Query | `nextjs.md` |
| Testing | Vitest + Supertest | `unit_testing_ts.md` |
| Containerization | Docker (multi-stage) | `docker.md` |

---

## 🚫 What This Project Does NOT Use

Do NOT reference or suggest any of the following technologies:
- ❌ Python / FastAPI / Django
- ❌ Kafka / Redis Streams
- ❌ TimescaleDB
- ❌ Kubernetes / Terraform / Vault
- ❌ Jest (we use Vitest)
- ❌ NestJS (we use Express 5)
- ❌ MongoDB (we use PostgreSQL)
- ❌ AWS S3 (we use Cloudflare R2, same SDK)
- ❌ OpenAI (we use Anthropic Claude)

---

## 🏗️ Project Constraints

These are non-negotiable architectural rules. Violating any of these is a bug:

1. **Only `@despu.edu.in` emails** can register
2. **Never block the event loop** — CPU work goes to BullMQ queues
3. **All handlers are stateless** — sessions in Redis, files in R2, never on disk
4. **No N+1 queries** — always use Prisma `include` or `select`
5. **Every external call has a timeout** (5s max)
6. **Global error handler** — nothing crashes the process
7. **Route handlers respond in under 100ms**
8. **Optimized for 600+ concurrent users**

---

**FINAL DIRECTIVE**: Do not start a task without first reading the corresponding skill file. If a user asks you to implement auth, read `rbac.md`, `postgresql.md`, and `unit_testing_ts.md` first.
