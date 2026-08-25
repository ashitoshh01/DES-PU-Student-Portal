import 'dotenv/config';
import http from 'http';

import app from './app';
import { redis } from './cache/redis';
import { prisma } from './lib/prisma';

const PORT = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
  await prisma.$connect();
  await redis.connect();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
    console.log(`[server] health check: http://localhost:${PORT}/health`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[server] received ${signal}, shutting down...`);

    server.close(async () => {
      await prisma.$disconnect();
      await redis.quit();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

startServer().catch((error) => {
  console.error('[server] failed to start:', error);
  process.exit(1);
});
