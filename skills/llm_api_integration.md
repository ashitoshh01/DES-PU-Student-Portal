---
name: llm_api_integration
description: "Anthropic Claude API integration for DES PU — auto-tagging, thread summarization, skill matching with circuit breaker"
risk: safe
source: internal
date_added: "2026-08-25"
---

# Claude AI Integration

Use this skill when implementing AI features: auto-tagging forum posts, summarizing threads, or matching project skills.

## 🎯 When to Use
- Working on `src/services/ai.service.ts`
- Working on `src/queues/aiSummary.queue.ts` and its worker
- Implementing circuit breaker for external API calls
- Adding new AI-powered features

## 🧠 Architecture
- **Provider:** Anthropic Claude (via `@anthropic-ai/sdk`)
- **Execution:** Always via BullMQ queue (never in request handler)
- **Safety:** Circuit breaker pattern — after 5 failures, stop calling API for 60s
- **Cost:** Hard budget caps, token monitoring

## 🛠️ Best Practices

### 1. AI Service with Circuit Breaker
```typescript
// src/services/ai.service.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let failureCount = 0;
let circuitOpenUntil = 0;

async function callClaude(prompt: string, maxTokens = 256): Promise<string | null> {
  // Circuit breaker check
  if (Date.now() < circuitOpenUntil) return null;

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });
    failureCount = 0;
    return msg.content[0].type === 'text' ? msg.content[0].text : null;
  } catch (error) {
    failureCount++;
    if (failureCount >= 5) {
      circuitOpenUntil = Date.now() + 60_000; // Open circuit for 60s
      console.error('[ai] circuit breaker opened — 5 consecutive failures');
    }
    return null; // Graceful degradation — feature still works without AI
  }
}
```

### 2. Queue-Based Execution (Never Block Request)
```typescript
// src/queues/aiSummary.queue.ts
import { Queue } from 'bullmq';

export const aiQueue = new Queue('ai-summary', {
  connection: { url: process.env.REDIS_URL },
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    timeout: 30000, // 30s max per job
  },
});

// Worker processes jobs asynchronously
// src/queues/workers/ai.worker.ts
import { Worker } from 'bullmq';
import { autoTagPost, summarizeThread } from '../services/ai.service';

const worker = new Worker('ai-summary', async (job) => {
  switch (job.name) {
    case 'auto-tag': return autoTagPost(job.data.postId);
    case 'summarize': return summarizeThread(job.data.threadId);
  }
}, { connection: { url: process.env.REDIS_URL } });
```

### 3. Auto-Tag Example
```typescript
export async function autoTagPost(postId: string) {
  const post = await prisma.post.findUnique({ where: { post_id: postId } });
  if (!post) return;

  const tags = await callClaude(
    `Extract 3-5 topic tags from this academic forum post. Return ONLY a JSON array of strings.\n\nTitle: ${post.title}\nContent: ${post.content}`
  );

  if (tags) {
    const parsed = JSON.parse(tags);
    await prisma.post.update({ where: { post_id: postId }, data: { tags: parsed } });
  }
}
```

## ❌ Anti-Patterns
- **Never call Claude in a request handler** — always queue it via BullMQ
- **Never crash on API failure** — return null, feature degrades gracefully
- **Never trust LLM output** — always validate/parse before using
- **Never send PII** — don't include student emails, PRNs, or passwords in prompts
- **Never skip timeout** — set 30s max per job

## 📊 Quality Gates
- All AI calls go through BullMQ queue
- Circuit breaker opens after 5 failures
- Max token budget per call: 256 for tagging, 1024 for summarization
- AI features work without AI (graceful degradation)
