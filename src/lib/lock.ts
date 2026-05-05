import { redis } from './redis';

export async function acquireLock(key: string, ttlMs: number = 5000): Promise<boolean> {
  const result = await redis.set(`lock:${key}`, 'locked', {
    nx: true,
    px: ttlMs,
  });
  return result === 'OK';
}

export async function releaseLock(key: string): Promise<void> {
  await redis.del(`lock:${key}`);
}

export async function withLock<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = 5000,
  retries: number = 5,
  delayMs: number = 100
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    if (await acquireLock(key, ttlMs)) {
      try {
        return await fn();
      } finally {
        await releaseLock(key);
      }
    }
    attempt++;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error('Could not acquire lock');
}
