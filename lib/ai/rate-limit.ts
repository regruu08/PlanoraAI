import "server-only";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired records every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * In-memory sliding window rate limiter
 * @param key unique identifier (e.g. client IP)
 * @param maxRequests maximum allowed requests per window (default: 20)
 * @param windowMs window duration in milliseconds (default: 60,000 = 1 min)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 20,
  windowMs: number = 60 * 1000,
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetInSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}
