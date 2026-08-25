---
name: redis
description: "Redis caching, sessions, rate limiting, BullMQ queues, and Socket.io adapter for DES PU backend using ioredis + Upstash"
risk: safe
source: internal
date_added: "2026-08-25"
---

# Redis Caching & State Management

Use this skill when implementing, reviewing, or debugging any Redis usage in the DES PU backend: session cache, rate limiting, BullMQ queues, and Socket.io pub/sub.

## 🎯 When to Use
- Writing or reviewing `src/cache/redis.ts`
- Implementing Redis-backed rate limiting
- Configuring BullMQ queues/workers
- Setting up Socket.io Redis adapter
- Adding cache-aside patterns for hot data

## 🧠 Redis Roles in DES PU

| Role | Key Pattern | TTL |
|------|-------------|-----|
| User session cache | `session:{userId}` | 7d (matches JWT expiry) |
| Rate limit counters | `rl:{ip}:{route}` | 15min sliding window |
| Leaderboard cache | `leaderboard:{dept}` | 5min |
| Unread notification count | `unread:{userId}` | 1h |
| BullMQ broker | Built-in via `REDIS_URL` | Managed by BullMQ |
| Socket.io adapter | Built-in pub/sub channels | N/A |

## 🛠️ Instructions & Best Practices

### 1. Connection (Singleton via ioredis)
```typescript
// src/cache/redis.ts — ALREADY IMPLEMENTED
import Redis from 'ioredis';

const globalForRedis = globalThis as typeof globalThis & { redis?: Redis };

function createClient(): Redis {
  return new Redis(process.env.REDIS_URL!, {
    connectTimeout: 5000,
    maxRetriesPerRequest: null, // Required by BullMQ
    lazyConnect: true,
  });
}

export const redis = globalForRedis.redis ?? createClient();
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
```

### 2. Cache-Aside Pattern
```typescript
// Example: cache leaderboard for 5 minutes
async function getLeaderboard(deptId: string) {
  const cacheKey = `leaderboard:${deptId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const data = await prisma.user.findMany({
    where: { student: { dept_id: deptId } },
    orderBy: { xp_total: 'desc' },
    take: 50,
    select: { user_id: true, name: true, xp_total: true },
  });

  await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5min TTL
  return data;
}
```

### 3. Rate Limiting (Redis-backed)
```typescript
// src/middleware/rateLimit.middleware.ts
import rateLimit from 'express-rate-limit';
import { redis } from '../cache/redis';

// Custom Redis store for express-rate-limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try again later' },
});

// Stricter limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 login attempts per 15 min
});
```

### 4. BullMQ Queue Setup
```typescript
// src/queues/fileProcessing.queue.ts
import { Queue } from 'bullmq';

export const fileProcessingQueue = new Queue('file-processing', {
  connection: { url: process.env.REDIS_URL },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});
```

### 5. Socket.io Redis Adapter
```typescript
// In src/socket.ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createRedisClient } from './cache/redis';

const pubClient = createRedisClient();
const subClient = createRedisClient();
await pubClient.connect();
await subClient.connect();
io.adapter(createAdapter(pubClient, subClient));
```

## ❌ Anti-Patterns
- **No TTL on keys**: Every key MUST have a TTL. Upstash has memory limits.
- **Redis as primary store**: Redis is volatile cache. PostgreSQL is the durable record.
- **Large blobs**: Don't store files or full responses in Redis. Keep values < 1KB.
- **Sync operations**: Never use blocking Redis commands in request handlers.
- **Connection per request**: Always reuse the singleton client, never create new connections.

## 📊 Quality Gates
- All cached keys must have TTL ≤ 24h
- Rate limiters on: auth routes (strict), API routes (standard)
- BullMQ jobs must have `attempts` + `backoff` configured
- Monitor Upstash dashboard for memory usage
