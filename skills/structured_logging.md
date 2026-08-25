---
name: structured_logging
description: "Structured JSON logging for DES PU backend — request IDs, error context, Logtail integration"
risk: safe
source: internal
date_added: "2026-08-25"
---

# Structured Logging

Use this skill when implementing logging, debugging production issues, or integrating with Logtail.

## 🎯 When to Use
- Replacing `console.log` with structured loggers
- Adding request ID correlation
- Debugging production errors
- Integrating with Logtail (Better Stack)

## 🧠 Architecture
- **Format:** JSON logs (not plain text)
- **Transport:** stdout → Logtail (in production)
- **Correlation:** Request ID header passed through all service calls
- **Levels:** error, warn, info, debug

## 🛠️ Best Practices

### 1. Logger Utility
```typescript
// src/utils/logger.ts
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    ...context,
  };

  if (level === 'error') console.error(JSON.stringify(entry));
  else if (level === 'warn') console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

export const logger = {
  error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log('warn', msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log('info', msg, ctx),
  debug: (msg: string, ctx?: Record<string, unknown>) => log('debug', msg, ctx),
};
```

### 2. Request ID Middleware
```typescript
// src/middleware/requestId.middleware.ts
import { randomUUID } from 'crypto';

export function requestId(req: Request, res: Response, next: NextFunction) {
  req.id = req.headers['x-request-id'] as string || randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
}
```

### 3. Usage in Services
```typescript
// In error handler
logger.error('Unhandled error', {
  requestId: req.id,
  method: req.method,
  path: req.path,
  userId: req.user?.user_id,
  error: err.message,
  stack: err.stack,
});

// In service layer
logger.info('User registered', {
  userId: user.user_id,
  email: user.email,
  role: user.role,
});
```

## ❌ Anti-Patterns
- Never use `console.log` for production code — use structured logger
- Never log passwords, tokens, or full request bodies
- Never log at `debug` level in production — performance overhead
- Never skip error context — always include requestId, userId, path

## 📊 Quality Gates
- All errors logged with requestId and stack trace
- No `console.log` in `src/` (use logger)
- Morgan for HTTP access logs, structured logger for application logs
