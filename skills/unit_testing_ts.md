---
name: unit_testing_ts
description: "Vitest + Supertest testing patterns for DES PU backend — unit tests, integration tests, test helpers, TDD workflow"
risk: safe
source: internal
date_added: "2026-08-25"
---

# TypeScript Testing (Vitest + Supertest)

Use this skill when writing, reviewing, or debugging tests for the DES PU backend.

## 🎯 When to Use
- Writing unit tests in `tests/unit/`
- Writing integration tests in `tests/integration/`
- Updating test helpers in `tests/helpers/`
- Debugging failing tests

## 🧠 Architecture
- **Runner:** Vitest (fast, ESM-native, TypeScript-first)
- **HTTP Testing:** Supertest (in-memory Express requests, no real server)
- **Config:** `backend/vitest.config.ts` with path aliases matching `tsconfig.json`
- **Setup:** `tests/setup.ts` — loads `.env.test`, registers global teardown
- **Pattern:** TDD — tests written first, then implementation

## 🛠️ Best Practices

### 1. Unit Test Structure
```typescript
// tests/unit/utils.test.ts
import { describe, it, expect } from 'vitest';

describe('paginate()', () => {
  it('should return correct skip and take', async () => {
    const { paginate } = await import('../../src/utils');
    const result = paginate(2, 20);
    expect(result).toEqual({ skip: 20, take: 20 });
  });

  it('should cap limit at 50', async () => {
    const { paginate } = await import('../../src/utils');
    const result = paginate(1, 999);
    expect(result.take).toBe(50);
  });
});
```

### 2. Integration Test Structure
```typescript
// tests/integration/auth.test.ts
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { cleanDatabase } from '../helpers/db.helper';

describe('POST /api/v1/auth/register', () => {
  let app: any;

  beforeAll(async () => {
    const mod = await import('../../src/app');
    app = mod.default;
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should register with valid @despu.edu.in email → 201', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@despu.edu.in',
        password: 'SecurePass123!',
        name: 'Test User',
        role: 'STUDENT',
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('user_id');
  });

  it('should reject non-DES email → 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@gmail.com', password: 'SecurePass123!', name: 'Test', role: 'STUDENT' });

    expect(res.status).toBe(400);
  });
});
```

### 3. Auth Helper Pattern
```typescript
// tests/helpers/auth.helper.ts
import request from 'supertest';
import jwt from 'jsonwebtoken';

export function generateTestToken(payload: { user_id: string; email: string; role: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
}

export function authGet(app: any, url: string, token: string) {
  return request(app).get(url).set('Cookie', [`token=${token}`]);
}

export function authPost(app: any, url: string, token: string, body?: any) {
  return request(app).post(url).set('Cookie', [`token=${token}`]).send(body);
}
```

### 4. DB Helper Pattern
```typescript
// tests/helpers/db.helper.ts
export async function cleanDatabase() {
  const { prisma } = await import('../../src/lib/prisma');
  await prisma.$transaction([
    // Delete in FK-safe order (children first)
    prisma.notification.deleteMany(),
    prisma.message.deleteMany(),
    prisma.post.deleteMany(),
    prisma.user.deleteMany(),
    // ...etc
  ]);
}

export async function seedTestAcademicData() {
  const { prisma } = await import('../../src/lib/prisma');
  const school = await prisma.school.create({ data: { school_name: 'Test School' } });
  // ...seed department, semester, division, subjects
  return { school, department, semester, division, subject1, subject2 };
}
```

## ❌ Anti-Patterns
- **Don't use `jest`** — this project uses Vitest
- **Don't create real HTTP servers** — use `supertest(app)` for in-memory testing
- **Don't share state between tests** — use `beforeEach` + `cleanDatabase()`
- **Don't mock the database** — use real Prisma queries against test DB
- **Don't hardcode UUIDs** — use factory functions that return generated IDs

## 📊 Quality Gates
- Every endpoint must have: happy path, auth (401), role (403), validation (400) tests
- Unit tests: < 50ms each
- Integration tests: < 2s each
- Test timeout: 10s (configured in vitest.config.ts)
- Code coverage target: > 80%
