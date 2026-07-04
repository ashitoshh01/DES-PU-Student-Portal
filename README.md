# DES Unified Platform

> An all-in-one college portal exclusively for DES Pune University students and faculty — combining Google Classroom, WhatsApp, Discord, and GitHub Codespaces into a single platform locked to `@despuniversity.edu.in` emails.

## 🧠 What Is This?

DES Unified Platform is an all-in-one college portal built exclusively for **DES Pune University** students and faculty. It's a living digital campus where students collaborate, learn, communicate, build projects, and share knowledge, all in one place without switching between multiple apps.

It solves the problem of students being scattered across WhatsApp groups, Google Classroom, and random Google Drive links by providing a single, unified platform with one login.

## ✨ Features

- **🔐 Access & Identity**: Locked to `@despuniversity.edu.in` emails. Roles include Student, Faculty, Admin, Contributor, and Project Leader.
- **🏫 Academic Structure**: Auto-enrollment into department, semester, and subject spaces based on ERP data.
- **💬 Discussion Forums**: Subject-specific and student-created forums with rich text editing, threaded replies, and upvoting.
- **📚 Study Material Platform**: A curated, searchable library for public notes, Topper Notes, and faculty resources.
- **💬 Real-Time Chat**: 1-to-1 and group messaging (subject, project, department groups).
- **📝 Form Builder**: Integrated forms (like Google Forms) directly in chat for rapid data collection.
- **🚀 Project Marketplace**: A campus-wide hub for finding collaborators, posting open roles, and showcasing projects.
- **📊 Dashboard**: Personalized bento-grid layout with widgets for announcements, deadlines, shortcuts, and stats.
- **🏆 Gamification**: Badges, XP points, and leaderboards to reward student contributions.
- **💻 Collaborative Cloud IDE (Coming Soon)**: Real-time, browser-based collaborative coding environment.
- **📞 Voice & Video (Coming Soon)**: Integrated WebRTC-based calling and screen sharing.

---

## Project Structure

```
des-pu-student-portal/
├── frontend/    → Next.js 15 (App Router) — deploys to Vercel
└── backend/     → Node.js + Express + TypeScript — deploys to Render
```

---

## Running Locally

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL (Neon or local)
- Redis (Upstash or local)

---

### Frontend

```bash
cd frontend

# Copy environment variables
cp .env.example .env.local
# Fill in .env.local with your values

# Install dependencies
pnpm install

# Run dev server (http://localhost:3000)
pnpm dev
```

---

### Backend

```bash
cd backend

# Copy environment variables
cp .env.example .env
# Fill in .env with your values (DATABASE_URL, JWT_SECRET, REDIS_URL, etc.)

# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# Run dev server (http://localhost:5000)
pnpm dev
```

---

## Tech Stack

| Layer | Frontend | Backend |
|---|---|---|
| Framework | Next.js 15 (App Router) | Express + TypeScript |
| Language | TypeScript | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui | — |
| State | Zustand | — |
| Data Fetching | TanStack Query v5 | — |
| Realtime | Socket.io client | Socket.io + Redis Adapter |
| Database | — | PostgreSQL (Prisma ORM) |
| Cache | — | Redis (Upstash) |
| File Storage | — | Cloudflare R2 |
| Job Queue | — | BullMQ |
| AI | — | Anthropic Claude API |

---

*Built by DES students, for DES students. 🔥*
