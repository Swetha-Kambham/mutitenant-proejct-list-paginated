import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis client connection
 * Connects to Redis for storing auth_ref → JWT mappings
 */
export async function initRedis(): Promise<RedisClientType> {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = createClient({
    url: redisUrl,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Connected to Redis');
  });

  await redisClient.connect();

  return redisClient;
}

/**
 * Get Redis client instance
 * Must call initRedis() first
 */
export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initRedis() first.');
  }
  return redisClient;
}

/**
 * Store auth_ref → JWT mapping in Redis
 * TTL: 1 hour (3600 seconds)
 */
export async function storeAuthRef(authRef: string, jwt: string): Promise<void> {
  const client = getRedisClient();
  await client.setEx(authRef, 3600, jwt); // 1 hour expiration
}

/**
 * Retrieve JWT from Redis using auth_ref
 * Returns null if not found or expired
 */
export async function getAuthRef(authRef: string): Promise<string | null> {
  const client = getRedisClient();
  return await client.get(authRef);
}

/**
 * Delete auth_ref from Redis (logout)
 */
export async function deleteAuthRef(authRef: string): Promise<void> {
  const client = getRedisClient();
  await client.del(authRef);
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis connection closed');
  }
}
