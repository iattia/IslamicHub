import { Redis } from '@upstash/redis';

const memory = new Map<string, { value: unknown; expiresAt: number }>();
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null;

export async function cached<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
  if (redis) {
    const hit = await redis.get<T>(key);
    if (hit) return hit;
    const value = await factory(); await redis.set(key, value, { ex: ttlSeconds }); return value;
  }
  const hit = memory.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as T;
  const value = await factory(); memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 }); return value;
}
