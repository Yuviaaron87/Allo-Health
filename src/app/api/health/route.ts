import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    env: {
      has_db_url: !!process.env.DATABASE_URL,
      has_redis_url: !!process.env.UPSTASH_REDIS_REST_URL,
      has_redis_token: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      has_auth_secret: !!process.env.AUTH_SECRET,
      next_auth_url: process.env.NEXTAUTH_URL || 'not set',
      node_env: process.env.NODE_ENV
    }
  });
}
