# DES Unified Platform — Project Bible

> **Version:** 1.0  
> **Status:** Pre-Development  
> **Team Size:** 2  
> **Target:** 1 Month Build Sprint

---

## 🧠 What Is This?

DES Unified Platform is an all-in-one college portal built exclusively for **DES Pune University** students and faculty. Think of it as:

> **Google Classroom + WhatsApp + Discord + GitHub Codespaces** — fused into one platform, locked to `@despu.edu.in` emails, and built from the ground up for the DES campus experience.

This is not an ERP replacement. It's not an attendance tracker. It's a **living digital campus** — where students collaborate, learn, communicate, build projects, and share knowledge, all in one place without switching between 5 different apps.

### The Core Problem It Solves

Right now DES students are scattered across:
- WhatsApp groups for communication (chaotic, no structure)
- Google Classroom for assignments (works but isolated)
- Random Google Drive links for notes (no curation, no discovery)
- No platform for project collaboration or finding teammates

DES Unified Platform kills all of that with one login.

---

## 🔐 Access & Identity

Only people with a valid `@despu.edu.in` email can create an account. No exceptions. Accounts are tied to ERP data — your department, semester, roll number, and enrolled subjects are pre-loaded. You don't set those up, you just log in and you're already placed in your correct academic spaces.

### Roles

| Role | Who They Are |
|---|---|
| **Student** | Default role for all enrolled students |
| **Faculty** | Verified teaching staff with a faculty badge |
| **Admin** | Platform administrators (moderators, IT staff) |
| **Contributor** | Students who actively contribute notes/resources (earned) |
| **Project Leader** | Students who create and manage projects on the marketplace |

### Profile

- **Editable:** Username, bio, interests, profile photo
- **Non-editable (from ERP):** Full name, roll number, DES email, department, semester
- Online / Offline / Away status
- Privacy controls

---

## 🏫 Academic Structure

The entire platform is organized around how your college actually works:

```
Department
  └── Semester
        └── Subject
              ├── Discussion Forum
              ├── Study Materials
              ├── Topper Notes
              └── Faculty Announcements
```

When you log in for the first time, you're automatically enrolled in your department's spaces, your semester's spaces, and all your current subjects — based on ERP data. No manual setup.

Faculty members are assigned to their respective subjects and can post announcements, upload resources, and moderate discussions within those spaces.

---

## 💬 Discussion Forums

The backbone of the platform. Every subject, department, and semester has a dedicated discussion space. Students can also create their own public or private communities around interests or projects.

### Types of Forums
- **Official Academic Forums** — Subject-specific, department-wide, semester-wide (auto-enrolled)
- **Student-Created Forums** — Public or invite-only, interest-based communities

### Post Features
- Rich text editor with Markdown support
- Threaded replies (Reddit-style, infinitely nested)
- Upvote system
- Post categories: Notes, Assignments, Questions, Resources, Announcements
- Attachments: Images, PDFs, Documents, ZIP files
- Tagging system
- Pin posts, lock threads
- Sorting: Most upvoted, Most recent, Unanswered, Trending
- Save / bookmark posts
- Draft saving
- Post reporting & moderation queue
- Faculty announcements (distinguished from student posts)

---

## 📚 Study Material Platform

A curated, searchable library of academic content — organized by subject.

- Public note-sharing by any student
- **Topper Notes section** — recognized high-quality notes from top performers
- Faculty resource uploads (slides, manuals, reference books)
- Previous year papers archive
- Lab manuals
- Assignment uploads
- Resource upvoting system
- Download tracking
- File previews (PDF inline view)
- Cloud-hosted resources (no broken Drive links)
- Senior tips & tricks section
- Exam preparation guides

---

## 💬 Real-Time Chat

### Personal (1-to-1)
- Real-time messaging with delivery status & read receipts
- Typing indicators, online indicators
- Media sharing: images, files, PDFs, voice notes
- Message search, pinned chats, emoji support

### Group Chat
- Subject groups (auto-created per subject)
- Project groups (created from Project Marketplace)
- Department groups
- Student-created groups
- Group admin permissions, group announcements, media sharing

---

## 📝 Form Builder (Google Forms Replacement)

Eliminates dependency on external platforms like Google Forms by integrating form creation directly into the platform, serving as a rapid MVP validation tool and data-gathering workflow.

### Form Creation & Sharing
- Create forms with short/long text, multiple choice, checkboxes, dropdowns, date/time, and file uploads.
- Required/optional questions and response validation.
- Share forms as an interactive card directly in chat via a new **Form Attachment** option (alongside Images, Documents, Files).
- Recipients can open and submit responses without leaving the chat conversation.

### Permissions & Management
- Group-level permissions: Admins can configure who can send forms (e.g., allow everyone, admin-only, disable sharing entirely).
- Form creators can view submissions, export responses, track counts, edit active forms, close forms manually, and analyze collected data through dashboards.

---

## 📞 Voice & Video

- 1-to-1 and group voice calls
- 1-to-1 and group video calls
- WebRTC-based (no third-party service needed)
- Screen sharing
- Call history & notifications
- Voice notes (send from chat)
- Low-bandwidth optimization (important for campus networks)

---

## 💻 Collaborative Cloud IDE

The showpiece feature. A full VS Code-like coding environment in the browser — with real-time collaborative editing.

### Core IDE
- **Monaco Editor** (the actual VS Code engine)
- Multi-language support: C++, Python, JavaScript, Java (more added later)
- Syntax highlighting & IntelliSense/autocomplete
- File explorer, multi-file projects
- Built-in terminal
- Live preview for web projects
- Auto-save

### Collaboration
- Real-time multi-user coding (multiple cursors, like Google Docs for code)
- Shared project workspaces
- Team roles: Leader, Collaborator, Viewer
- Live code syncing with conflict prevention
- Change history & version tracking
- In-IDE project chat
- Project backups

---

## ☁️ My Space (Cloud Storage)

Every user gets **15GB** of personal cloud storage integrated with the platform.

- File upload/download
- Folder management
- File previews
- Shared folders
- Stores: IDE projects, study materials, chat attachments
- Storage analytics & usage progress bar
- Drag-and-drop uploads
- Cloud sync

---

## 🚀 Project Marketplace

A campus-wide hub for finding collaborators and building things together.

- Browse and discover ongoing student projects
- Post open roles: Frontend Dev, Backend Dev, Designer, ML Engineer, Analyst, etc.
- Apply to join projects
- Team management dashboard
- Project showcase pages
- Skill-based recommendations (find teammates by skill)
- Project discovery feed

---

## 🏆 Gamification & Badges

Contribution is recognized and rewarded.

### Badges
- Contributor, Top Helper, Top Contributor
- Topper Notes Contributor
- Faculty Verified
- Project Leader
- Event Participation badges

### Gamification
- XP / points system
- Contribution streaks
- Subject-wise & department-wise leaderboards
- Achievement system

---

## 🔔 Notifications

- Real-time toast notifications
- Notification center (history)
- Reply, upvote, mention/tag alerts
- Chat, call, and collaboration invite notifications
- Faculty announcement alerts
- File upload notifications

---

## 📊 Dashboard

Personalized home screen using a **bento-grid layout** with drag-and-drop widgets.

### Widgets Include
- Welcome message
- Recent activity feed
- Upcoming deadlines (assignments, projects)
- Study material shortcuts
- Recent chats
- Recommended projects
- Faculty announcements
- Calendar preview
- Storage usage
- Contribution stats & activity graphs

---

## 📅 Calendar & Productivity

- Academic calendar integration
- Assignment & project deadlines
- Event reminders
- Personal productivity view

---

## 🧭 Navigation Structure

```
Sidebar
├── Dashboard
├── Home Feed
├── Chat
├── Announcements
├── Calendar
├── Resources
│     ├── Study Material
│     └── My Space
├── IDE
│     └── My Projects
├── Projects
│     ├── My Projects
│     └── Explore
└── Settings / Support
```

---

## 🛡️ Moderation & Admin

### Faculty / Admin Tools
- Delete posts, lock threads, pin announcements
- Remove inappropriate content
- User suspension / ban
- Content moderation queue
- Report management
- Audit logs

### Security
- Domain-restricted auth (`@despu.edu.in` only)
- JWT-based secure sessions
- Rate limiting & anti-spam
- File scanning on upload
- RBAC permission middleware
- Data encryption
- Activity logging

---

## 🤖 AI Features

- AI-powered discussion summarization (TL;DR on long threads)
- Quick answer suggestions on questions
- Smart search recommendations
- Auto-tagging of posts
- AI study assistant
- Skill-match recommendations for Project Marketplace
- Suggested collaborators based on skills & activity

---

## ⚙️ Tech Stack

### Frontend
| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) | Best-in-class React framework, SSR, file-based routing |
| Language | **TypeScript** | Type safety across the entire codebase |
| Styling | **Tailwind CSS v4** | Latest, fastest, utility-first |
| UI Components | **shadcn/ui** | Headless, accessible, fully customizable |
| Animations | **Framer Motion** | Smooth Apple-level animations |
| State Management | **Zustand** | Lightweight, no boilerplate |
| Data Fetching | **TanStack Query v5** | Server state, caching, background sync |
| Forms | **React Hook Form + Zod** | Best combo for validation |
| Rich Text Editor | **Tiptap** | ProseMirror-based, extensible, markdown support |
| Code Editor | **Monaco Editor** | Literal VS Code engine |
| Real-time Collab | **Yjs + y-websocket** | Industry-standard CRDT for collaborative editing |

### Backend
| Layer | Technology | Why |
|---|---|---|
| Runtime | **Node.js** | Familiar, massive ecosystem |
| Framework | **Hono** | Faster than Express, edge-ready, modern API design |
| Language | **TypeScript** | Full-stack type sharing with frontend |
| Real-time | **Socket.io** | Chat, notifications, presence (with Redis adapter) |
| WebRTC Signaling | **mediasoup** | SFU-based, handles group video/voice properly |
| File Processing | **Sharp** (images), **pdf-lib** | Fast, server-side |
| Job Queue | **BullMQ** | Background jobs (notifications, file processing) |
| AI | **Anthropic Claude API** | For AI summarization, search, suggestions |

### Database & Storage
| Layer | Technology | Why |
|---|---|---|
| Primary DB | **PostgreSQL** | Relational data fits the academic structure perfectly |
| ORM | **Prisma** | Type-safe, great DX, auto-migrations |
| Cache / Pub-Sub | **Redis (Upstash)** | Socket.io adapter, session cache, rate limiting |
| File Storage | **Cloudflare R2** | S3-compatible, generous free tier, no egress fees |
| Search | **PostgreSQL Full-Text Search** (+ **Typesense** later) | Start simple, upgrade when needed |

### Auth
| Layer | Technology | Why |
|---|---|---|
| Auth Framework | **Lucia Auth** | Modern, lightweight, full control — no magic |
| Session | **JWT + HTTP-only cookies** | Secure, stateless |
| Domain Restriction | Custom middleware | Blocks non-DES emails at registration |
| Password | **Argon2** hashing | More secure than bcrypt |

### DevOps & Deployment
| Layer | Technology | Why |
|---|---|---|
| Containerization | **Docker + Docker Compose** | Dev/prod parity |
| Deployment | **Railway** | Stupidly easy, supports Docker, Postgres, Redis |
| CDN | **Cloudflare** | Free, fast, global |
| CI/CD | **GitHub Actions** | Auto-deploy on push to main |
| Monitoring | **Better Stack** (Logtail) | Logs + uptime monitoring, free tier |
| Package Manager | **pnpm** | Fastest, disk-efficient |
| Monorepo | **Turborepo** | Shared types, shared utils between frontend/backend |

---

## 📁 Monorepo Structure

```
des-platform/
├── apps/
│   ├── web/          → Next.js frontend
│   └── server/       → Hono backend + Socket.io
├── packages/
│   ├── db/           → Prisma schema + client (shared)
│   ├── types/        → Shared TypeScript types
│   └── utils/        → Shared utility functions
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 🗓️ 1 Month Build Plan

### Week 1 — Foundation
- [ ] Monorepo setup (Turborepo + pnpm)
- [ ] PostgreSQL schema design (full, locked)
- [ ] Hono backend setup + Prisma
- [ ] Auth system (DES email restriction, JWT, sessions)
- [ ] Role-based middleware
- [ ] Next.js app shell + sidebar navigation
- [ ] Basic UI design system (Tailwind + shadcn/ui)

### Week 2 — Classroom Layer
- [ ] Department → Semester → Subject structure
- [ ] Discussion forums (create posts, threaded replies, upvotes)
- [ ] Study material uploads (Cloudflare R2)
- [ ] File previews
- [ ] Faculty announcements
- [ ] Subject-wise resource library
- [ ] Search & filtering

### Week 3 — WhatsApp + Discord Layer
- [ ] Real-time 1-to-1 chat (Socket.io)
- [ ] Group chats (subject groups, custom groups)
- [ ] Form Builder (Google Forms Replacement) integration in chat
- [ ] Online/offline/away presence
- [ ] Real-time notifications system
- [ ] Profile system
- [ ] Badge system
- [ ] Dashboard (bento grid layout)

### Week 4 — Projects + Polish + Deploy
- [ ] Project Marketplace (post, apply, manage)
- [ ] Dark / light mode
- [ ] Mobile responsive polish
- [ ] AI summarization on threads
- [ ] Gamification (XP, leaderboards)
- [ ] Docker setup
- [ ] Deploy to Railway
- [ ] Bug fixes + performance audit

### Post-Launch (Phase 2)
- [ ] Voice & video calls (WebRTC / mediasoup)
- [ ] Collaborative Cloud IDE (Monaco + Yjs)
- [ ] Calendar integration
- [ ] Mobile app (React Native)
- [ ] Advanced AI features

---

## ✅ Non-Negotiables

These features ship no matter what:

1. DES email-only authentication
2. Department → Semester → Subject auto-enrollment
3. Discussion forums with threaded replies & upvotes
4. Study material uploads & resource library
5. Real-time 1-to-1 and group chat
6. Form Builder integrated directly into the chat system
7. Notification system
8. Profile system with roles and badges
9. Project Marketplace
10. Personalized dashboard
11. Dark / Light mode

---

*Built by DES students, for DES students. 🔥*
