---
name: rbac
description: "Role-based access control for DES PU Student Portal — Express middleware guards, JWT claims, STUDENT/FACULTY/ADMIN/SUPER_ADMIN roles"
risk: safe
source: internal
date_added: "2026-08-25"
---

# Role-Based Access Control (RBAC)

Use this skill when implementing, reviewing, or debugging authentication guards, role checks, or permission logic in the DES PU backend.

## 🎯 When to Use
- Writing or reviewing `src/middleware/auth.middleware.ts` or `src/middleware/rbac.middleware.ts`
- Adding role-restricted routes to any route file
- Debugging 401/403 responses
- Implementing admin-only or faculty-only endpoints

## 🧠 Architecture

### Role Hierarchy
```
SUPER_ADMIN  →  Can do everything, including role changes and audit logs
ADMIN        →  Can moderate content, ban users, view reports
FACULTY      →  Can create announcements, assignments, grade submissions
STUDENT      →  Can submit, post, upload, chat
```

### Auth Flow
```
Request → cookieParser → authenticate (JWT verify) → rbac (role check) → controller
```

## 🛠️ Instructions & Best Practices

### 1. JWT Middleware (authenticate)
```typescript
// src/middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = payload; // { user_id, email, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

### 2. RBAC Middleware
```typescript
// src/middleware/rbac.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role as Role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

### 3. Route Usage
```typescript
// Faculty + Admin only
router.post('/announcements', authenticate, authorize('FACULTY', 'ADMIN'), createAnnouncement);

// Any authenticated user
router.get('/profile', authenticate, getProfile);

// Super Admin only
router.patch('/users/:id/role', authenticate, authorize('SUPER_ADMIN'), changeRole);
```

### 4. Domain Email Check
```typescript
// src/middleware/domainCheck.middleware.ts
export function domainCheck(req: Request, res: Response, next: NextFunction) {
  const email = req.body?.email;
  if (email && !email.endsWith('@despu.edu.in')) {
    return res.status(400).json({ error: 'Only @despu.edu.in emails allowed' });
  }
  next();
}
```

## ❌ Anti-Patterns
- Never check roles inside service/controller logic — always use middleware
- Never hardcode role strings — use Prisma's `Role` enum
- Never skip auth on routes that modify data
- Never trust client-side role claims — always verify JWT server-side

## 📊 Quality Gates
- Every protected route must have `authenticate` middleware
- Every role-restricted route must have `authorize(...)` middleware
- Integration tests must verify 401 (no token) and 403 (wrong role) for every protected endpoint
