import Redis from 'ioredis';

const globalForRedis = globalThis as typeof globalThis & {
  redis?: Redis;
};

function createClient(): Redis {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error('REDIS_URL is not set');
  }

  const client = new Redis(redisUrl, {
    connectTimeout: 5000,
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

  client.on('error', (error) => {
    console.error('[redis] connection error:', error.message);
  });

  return client;
}

export const redis = globalForRedis.redis ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export { createClient as createRedisClient };
