/**
 * Global test setup — runs before all test files.
 *
 * - Loads .env.test (or .env with overrides)
 * - Provides global beforeAll/afterAll hooks for DB + Redis cleanup
 * - Sets NODE_ENV=test
 */
import { beforeAll, afterAll, afterEach } from 'vitest';

// Force test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Random port for tests

// Load env from .env.test if available, otherwise .env
import 'dotenv/config';

/**
 * Global teardown:
 * - Disconnect Prisma
 * - Disconnect Redis
 */
afterAll(async () => {
  // These imports will work once P1-M2 and P1-M3 are implemented
  try {
    const { prisma } = await import('../src/lib/prisma');
    await prisma.$disconnect();
  } catch {
    // Prisma not yet implemented — skip
  }

  try {
    const { redis } = await import('../src/cache/redis');
    await redis.quit();
  } catch {
    // Redis not yet implemented — skip
  }
});
