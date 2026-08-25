---
name: audit_logging
description: "Audit logging patterns for DES PU admin module — who did what, when, from where, for Phase 6 admin panel"
risk: safe
source: internal
date_added: "2026-08-25"
---

# Audit Logging

Use this skill when implementing admin audit trails and moderation action logging.

## 🎯 When to Use
- Implementing Phase 6 admin audit logs
- Logging moderation actions (ban, unban, role change, content removal)
- Tracking who performed privileged operations

## 🧠 Architecture
- **Storage:** `AuditLog` table in PostgreSQL (via Prisma)
- **Trigger:** Service-layer function called after every admin action
- **Access:** SUPER_ADMIN only via `GET /api/v1/admin/audit-logs`

## 🛠️ Best Practices

### 1. Audit Log Model
```prisma
model AuditLog {
  log_id     String   @id @default(cuid())
  actor_id   String
  action     String   // BAN_USER, UNBAN_USER, CHANGE_ROLE, DELETE_POST, etc.
  target_id  String?  // The user/post/resource affected
  metadata   Json?    // Extra context (old role, new role, reason, etc.)
  ip_address String?
  created_at DateTime @default(now())

  actor      User     @relation(fields: [actor_id], references: [user_id])
  @@index([actor_id])
  @@index([created_at])
}
```

### 2. Audit Service
```typescript
// src/services/audit.service.ts
import { prisma } from '../lib/prisma';

interface AuditEntry {
  actorId: string;
  action: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

export async function logAudit(entry: AuditEntry) {
  await prisma.auditLog.create({
    data: {
      actor_id: entry.actorId,
      action: entry.action,
      target_id: entry.targetId,
      metadata: entry.metadata ?? {},
      ip_address: entry.ip,
    },
  });
}
```

### 3. Usage in Admin Controller
```typescript
// After banning a user
await prisma.user.update({ where: { user_id }, data: { is_banned: true } });
await logAudit({
  actorId: req.user.user_id,
  action: 'BAN_USER',
  targetId: user_id,
  metadata: { reason: req.body.reason },
  ip: req.ip,
});
```

## ❌ Anti-Patterns
- Never skip audit logging for admin actions — every privileged operation must be logged
- Never let users delete audit logs — they are append-only
- Never log sensitive data (passwords, tokens) in metadata
- Never log in the middleware — log in the service layer after successful action

## 📊 Quality Gates
- Every admin endpoint calls `logAudit()` after successful mutation
- Audit logs are queryable by actor, action, and date range
- Only SUPER_ADMIN can view audit logs
