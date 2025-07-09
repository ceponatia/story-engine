import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

interface RateLimiterOptions {
  windowMs: number; // e.g., 60000 = 1 minute
  max: number;      // e.g., 10 requests
  keyPrefix?: string;
}

export function rateLimitByIP(options: RateLimiterOptions) {
  const { windowMs, max, keyPrefix = 'ratelimit' } = options;

  return async function middleware(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const expire = windowMs / 1000;

    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, expire);

    if (current > max) {
      return new NextResponse('Too many requests', { status: 429 });
    }

    return NextResponse.next();
  };
}
