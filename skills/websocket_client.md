---
name: websocket_client
description: "Socket.io real-time patterns for DES PU — chat messages, typing indicators, notifications, presence"
risk: safe
source: internal
date_added: "2026-08-25"
---

# WebSocket / Socket.io Patterns

Use this skill when implementing real-time features: chat, typing indicators, online presence, and live notifications.

## 🎯 When to Use
- Working on `src/socket.ts` (backend Socket.io server)
- Working on `frontend/lib/socket.ts` or `frontend/hooks/useSocket.ts`
- Implementing chat message delivery, typing indicators, or read receipts
- Implementing real-time notification delivery

## 🧠 Architecture
- **Server:** Socket.io with Redis adapter (multi-instance support)
- **Client:** `socket.io-client` in Next.js
- **Auth:** JWT token passed in `auth` handshake option
- **Rooms:** User joins rooms for: their user_id (notifications), conversation_ids (chat)

## 🛠️ Best Practices

### 1. Server Setup with Redis Adapter
```typescript
// src/socket.ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createRedisClient } from './cache/redis';
import jwt from 'jsonwebtoken';

export function setupSocket(httpServer: http.Server) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN, credentials: true },
  });

  // Redis adapter for horizontal scaling
  const pub = createRedisClient();
  const sub = createRedisClient();
  io.adapter(createAdapter(pub, sub));

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    try {
      socket.data.user = jwt.verify(token, process.env.JWT_SECRET!);
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.user_id;
    socket.join(`user:${userId}`); // For personal notifications

    socket.on('join:conversation', (convId) => socket.join(`conv:${convId}`));
    socket.on('leave:conversation', (convId) => socket.leave(`conv:${convId}`));

    socket.on('chat:message', (data) => {
      io.to(`conv:${data.conv_id}`).emit('chat:message', data);
    });

    socket.on('chat:typing', (data) => {
      socket.to(`conv:${data.conv_id}`).emit('chat:typing', data);
    });
  });

  return io;
}
```

### 2. Client Hook
```typescript
// frontend/hooks/useSocket.ts
'use client';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [token]);

  return socketRef.current;
}
```

## ❌ Anti-Patterns
- Never store socket instance in Zustand — use a ref
- Never skip `socket.disconnect()` on unmount — causes memory leaks
- Never send large payloads via socket — keep messages < 1KB
- Never trust socket events without server-side validation
- Always use Redis adapter — without it, multi-instance won't work

## 📊 Quality Gates
- Socket connection requires valid JWT
- All chat rooms use `conv:{id}` namespace
- Reconnection with backoff configured on client
- Typing indicator debounced (300ms)
