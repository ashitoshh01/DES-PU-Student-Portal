---
name: docker
description: "Docker and Docker Compose patterns for DES PU — multi-stage builds, local dev containers, production Dockerfile"
risk: safe
source: internal
date_added: "2026-08-25"
---

# Docker & Docker Compose

Use this skill when modifying the Dockerfile, docker-compose.yml, or container-related configuration.

## 🎯 When to Use
- Modifying `backend/Dockerfile`
- Updating `docker-compose.yml` (local dev services)
- Debugging container build failures
- Optimizing Docker image size

## 🧠 Architecture
- **Local Dev:** `docker-compose.yml` runs PostgreSQL 16 + Redis 7 (Alpine)
- **Production:** `backend/Dockerfile` multi-stage build → Node 20 Alpine
- **Deployment:** Vercel (frontend), Docker container or Railway (backend)

## 🛠️ Best Practices

### 1. Multi-Stage Build (Already Implemented)
```dockerfile
# Stage 1: Base with pnpm
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Stage 2: Production dependencies only
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

# Stage 3: Build (needs devDependencies)
FROM base AS builder
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec prisma generate
RUN pnpm build

# Stage 4: Runner (minimal image)
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

### 2. Docker Compose (Local Dev)
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: des_pu
    ports: ["5432:5432"]
    volumes: [des_pu_postgres_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d des_pu"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
```

## ❌ Anti-Patterns
- Never run as root in production — add `USER node`
- Never copy `node_modules` into the build — always install inside container
- Never use `latest` tag for base images — pin to specific version
- Never put secrets in Dockerfile — use env vars at runtime
- Never skip `.dockerignore` — exclude `node_modules`, `.env`, `.git`

## 📊 Quality Gates
- Final image size < 200MB
- Health checks on all services
- `--frozen-lockfile` for reproducible builds
