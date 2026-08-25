---
name: postgresql
description: "PostgreSQL patterns for DES PU — Prisma ORM, Neon serverless, connection pooling, indexing, query optimization"
risk: safe
source: internal
date_added: "2026-08-25"
---

# PostgreSQL & Prisma Patterns

Use this skill when writing database queries, schema migrations, or optimizing data access in the DES PU backend.

## 🎯 When to Use
- Writing Prisma queries in services
- Adding/modifying `prisma/schema.prisma`
- Running migrations (`prisma migrate dev`)
- Debugging slow queries or N+1 problems
- Optimizing for 600+ concurrent users

## 🧠 Architecture
- **Provider:** Neon (serverless PostgreSQL)
- **ORM:** Prisma 7 with `@prisma/client`
- **Connection:** Pooled via Neon's built-in pooler (append `?pgbouncer=true` to URL)
- **Singleton:** `src/lib/prisma.ts` — one PrismaClient instance per process

## 🛠️ Instructions & Best Practices

### 1. Prisma Singleton (Already Implemented)
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 2. Avoid N+1 Queries — Always Use `include` or `select`
```typescript
// ❌ BAD: N+1 — fetches posts, then loops to get authors
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { user_id: post.author_id } });
}

// ✅ GOOD: Single query with join
const posts = await prisma.post.findMany({
  include: { author: { select: { user_id: true, name: true, avatar_url: true } } },
});
```

### 3. Pagination Helper
```typescript
// src/utils/index.ts
export function paginate(page: number, limit: number = 20) {
  const take = Math.min(limit, 50); // Cap at 50
  const skip = (page - 1) * take;
  return { skip, take };
}

// Usage in service
const { skip, take } = paginate(page, limit);
const posts = await prisma.post.findMany({ skip, take, orderBy: { created_at: 'desc' } });
```

### 4. Transactions for Multi-Table Writes
```typescript
// Example: Accept project application → add member + update app status
await prisma.$transaction([
  prisma.projectApplication.update({
    where: { app_id },
    data: { status: 'ACCEPTED' },
  }),
  prisma.projectMember.create({
    data: { proj_id, user_id: applicant_id, role: application.role },
  }),
]);
```

### 5. Unique Constraints for Business Rules
```typescript
// In schema.prisma — prevent duplicate submissions
model Submission {
  // ...
  @@unique([assign_id, student_id])
}

// In schema.prisma — prevent duplicate badges
model Badge {
  // ...
  @@unique([user_id, type])
}
```

### 6. Indexing Strategy
```prisma
// Index columns used in WHERE, ORDER BY, and foreign keys
model Post {
  // ...
  @@index([sub_id, sem_id])
  @@index([author_id])
  @@index([created_at])
}
```

## ❌ Anti-Patterns
- **Raw SQL without parameterization**: Always use `prisma.$queryRaw` with tagged templates
- **Unbounded queries**: Always use `take` (limit) — never `findMany()` without limits
- **Long transactions**: Keep `$transaction` under 5 seconds
- **Missing `select`**: Don't fetch all columns when you only need 3 fields
- **Forgetting `@@index`**: Every FK column and every column in WHERE clauses needs an index

## 📊 Quality Gates
- Every `findMany` must have `take` (max 50) and pagination
- Every multi-table write must use `$transaction`
- Every new model must have appropriate `@@index` declarations
- Query response time < 100ms for standard reads
