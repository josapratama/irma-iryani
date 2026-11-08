import { Context, Next } from "hono";
import type { AppVariables } from "../config/hono.types";
import { errorResponse } from "../utils/response";

interface RateLimitOptions {
  windowMs: number; // time window in ms
  max: number;      // max requests per window per IP
  message?: string;
}

// In-memory store — cukup untuk single-instance deployment
// Untuk multi-instance pakai Redis
const store = new Map<string, { count: number; resetAt: number }>();

// Cleanup entries yang sudah expired setiap 5 menit
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

export function createRateLimit(opts: RateLimitOptions) {
  return async function rateLimitMiddleware(
    c: Context<{ Variables: AppVariables }>,
    next: Next
  ) {
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0].trim() ??
      c.req.header("x-real-ip") ??
      "unknown";

    const key = `${c.req.path}:${ip}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      // First request in this window
      store.set(key, { count: 1, resetAt: now + opts.windowMs });
      await next();
      return;
    }

    if (entry.count >= opts.max) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      c.header("Retry-After", String(retryAfterSec));
      c.header("X-RateLimit-Limit", String(opts.max));
      c.header("X-RateLimit-Remaining", "0");
      c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
      return errorResponse(
        c,
        opts.message ?? `Too many requests. Try again in ${retryAfterSec}s.`,
        429
      );
    }

    entry.count += 1;
    c.header("X-RateLimit-Limit", String(opts.max));
    c.header("X-RateLimit-Remaining", String(opts.max - entry.count));
    c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
    await next();
  };
}

// Pre-configured limiter untuk contact form:
// max 5 pesan per IP per 15 menit
export const contactRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Terlalu banyak pesan. Silakan coba lagi setelah 15 menit.",
});
