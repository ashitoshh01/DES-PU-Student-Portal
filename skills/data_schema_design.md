---
name: data_schema_design
description: "Prisma schema design patterns for DES PU — model relationships, unique constraints, indexes, enums, provenance fields"
risk: safe
source: internal
date_added: "2026-08-25"
---

# Prisma Schema Design Patterns

Use this skill when adding or modifying models in `prisma/schema.prisma`.

## 🎯 When to Use
- Adding new models to the Prisma schema
- Modifying existing model relationships
- Adding indexes for query performance
- Implementing unique constraints for business rules
- Running migrations (`prisma migrate dev`)

## 🧠 Architecture
- **ORM:** Prisma 7 with PostgreSQL
- **Schema:** `backend/prisma/schema.prisma` (842 lines, 25+ models)
- **ID Strategy:** `@id @default(cuid())` for all primary keys
- **Timestamps:** Every model has `created_at` and `updated_at`

## 🛠️ Best Practices

### 1. Standard Model Template
```prisma
model NewModel {
  id         String   @id @default(cuid())
  // ... fields
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  // Relations
  user       User     @relation(fields: [user_id], references: [user_id])
  user_id    String

  // Indexes
  @@index([user_id])
  @@index([created_at])
}
```

### 2. Unique Constraints for Business Rules
```prisma
// One submission per student per assignment
model Submission {
  @@unique([assign_id, student_id])
}

// One badge type per user (can't earn same badge twice)
model Badge {
  @@unique([user_id, type])
}

// One marksheet per student per semester
model Marksheet {
  @@unique([student_id, sem_id])
}
```

### 3. Self-Referencing Relations (Threaded Posts)
```prisma
model Post {
  post_id   String  @id @default(cuid())
  parent_id String?
  parent    Post?   @relation("PostThread", fields: [parent_id], references: [post_id])
  replies   Post[]  @relation("PostThread")
}
```

### 4. Enum Usage
```prisma
enum Role {
  STUDENT
  FACULTY
  ADMIN
  SUPER_ADMIN
}

model User {
  role Role @default(STUDENT)
}
```

### 5. JSON Fields for Flexible Data
```prisma
model Notification {
  data Json // { actor_id, message, ref_id, ... }
}

model Project {
  open_roles Json // ["Frontend Dev", "Backend Dev"]
  skills_req Json // ["React", "Node.js"]
}
```

### 6. Indexing Rules
```prisma
// Index every foreign key
@@index([user_id])
@@index([sub_id])

// Index columns used in WHERE clauses
@@index([created_at])
@@index([type])

// Compound indexes for common query patterns
@@index([sub_id, sem_id])
@@index([author_id, created_at])
```

## ❌ Anti-Patterns
- **Don't use `Int` IDs** — use `String @default(cuid())` for security (non-guessable)
- **Don't skip `@@index`** — every FK and every WHERE column needs one
- **Don't use `Json` for structured relational data** — use proper relations
- **Don't forget `@updatedAt`** — every mutable model needs it
- **Don't use `onDelete: Cascade` carelessly** — could delete entire user data trees
- **Don't skip unique constraints** — they enforce business rules at DB level

## 📊 Quality Gates
- Every model has `created_at` + `updated_at`
- Every FK has `@@index`
- Business uniqueness rules have `@@unique`
- Run `prisma validate` before committing schema changes
- Run `prisma migrate dev` to generate migration SQL
