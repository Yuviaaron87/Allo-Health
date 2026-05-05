import { redis } from './redis';

export async function getIdempotentResponse(key: string) {
  const data = await redis.get(`idempotency:${key}`);
  if (data) {
    return JSON.parse(data as string);
  }
  return null;
}

export async function saveIdempotentResponse(key: string, response: { body: unknown; status: number }, ttlSeconds: number = 86400) {
  await redis.set(`idempotency:${key}`, JSON.stringify(response), {
    ex: ttlSeconds,
  });
}
