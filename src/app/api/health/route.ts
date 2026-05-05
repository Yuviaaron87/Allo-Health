import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

interface DiagnosticResult {
  status: string;
  timestamp: string;
  env: {
    has_db_url: boolean;
    has_redis_url: boolean;
    has_redis_token: boolean;
    has_auth_secret: boolean;
    next_auth_url: string;
    node_env: string | undefined;
  };
  database: string;
  redis: string;
}

export async function GET() {
  const diagnostics: DiagnosticResult = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    env: {
      has_db_url: !!process.env.DATABASE_URL,
      has_redis_url: !!process.env.UPSTASH_REDIS_REST_URL,
      has_redis_token: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      has_auth_secret: !!process.env.AUTH_SECRET,
      next_auth_url: process.env.NEXTAUTH_URL || 'not set',
      node_env: process.env.NODE_ENV
    },
    database: 'unknown',
    redis: 'unknown'
  };

  try {
    // Try a simple query
    await db.$queryRaw`SELECT 1`;
    diagnostics.database = 'connected';
  } catch (e: unknown) {
    const error = e as Error;
    diagnostics.database = `error: ${error.message || 'Unknown error'}`;
  }

  try {
    await redis.ping();
    diagnostics.redis = 'connected';
  } catch (e: unknown) {
    const error = e as Error;
    diagnostics.redis = `error: ${error.message || 'Unknown error'}`;
  }

  diagnostics.status = (diagnostics.database === 'connected' && diagnostics.redis === 'connected') ? 'healthy' : 'degraded';

  return NextResponse.json(diagnostics);
}
