---
name: nextjs
description: "Next.js 16 App Router patterns for DES PU frontend — server components, route groups, layouts, data fetching"
risk: safe
source: internal
date_added: "2026-08-25"
---

# Next.js Frontend Architecture

Use this skill when implementing, reviewing, or debugging frontend pages, layouts, and data fetching in the DES PU frontend.

## 🎯 When to Use
- Creating or modifying pages in `frontend/app/`
- Working with route groups `(auth)` and `(main)`
- Implementing data fetching with TanStack React Query
- Configuring layouts, loading states, or error boundaries

## 🧠 Architecture
- **Framework:** Next.js 16 with App Router
- **Route Groups:** `(auth)` = login/register (no sidebar), `(main)` = authenticated pages (with sidebar)
- **State:** Zustand for client state, TanStack React Query for server state
- **Styling:** TailwindCSS 4
- **API calls:** Axios client hitting `NEXT_PUBLIC_API_URL` (backend)

## 🛠️ Best Practices

### 1. Route Group Layout Pattern
```
app/
├── layout.tsx           # Root: HTML, font, global CSS
├── (auth)/
│   ├── layout.tsx       # Centered, no sidebar
│   ├── login/page.tsx
│   └── register/page.tsx
└── (main)/
    ├── layout.tsx       # Sidebar + Header wrapper
    ├── dashboard/page.tsx
    └── chat/page.tsx
```

### 2. Client Components (use 'use client' only when needed)
```tsx
'use client'; // Only for interactivity, hooks, browser APIs

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### 3. Data Fetching with React Query
```tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function SubjectsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-subjects'],
    queryFn: () => api.get('/users/me/subjects').then(r => r.data),
  });

  if (isLoading) return <Skeleton />;
  return <ul>{data.map(s => <li key={s.sub_id}>{s.sub_name}</li>)}</ul>;
}
```

### 4. Protected Routes
```tsx
// frontend/app/(main)/layout.tsx
'use client';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

export default function MainLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (!isLoading && !isAuthenticated) redirect('/login');
  return <>{children}</>;
}
```

## ❌ Anti-Patterns
- Don't use `'use client'` on pages that can be server components
- Don't fetch data in `useEffect` — use React Query
- Don't store server data in Zustand — Zustand is for UI state only
- Don't use `next/image` for user-uploaded content — use R2 CDN URLs directly

## 📊 Quality Gates
- Every page must have a loading state
- All API calls go through the Axios wrapper (`lib/api.ts`)
- Authentication check in `(main)/layout.tsx`
