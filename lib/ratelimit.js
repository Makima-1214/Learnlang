/**
 * Rate limiting middleware - simple in-memory store for dev, Redis-ready for prod
 */

// In-memory store for development
const rateLimitStore = new Map();

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_REQUESTS = 100;

export class RateLimiter {
  constructor(
    windowMs = DEFAULT_WINDOW_MS,
    maxRequests = DEFAULT_MAX_REQUESTS,
  ) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.store = rateLimitStore;
  }

  /**
   * Get current request count for a key
   */
  getKey(identifier) {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry) {
      return { count: 0, resetTime: now + this.windowMs };
    }

    // Reset if window expired
    if (now > entry.resetTime) {
      this.store.delete(identifier);
      return { count: 0, resetTime: now + this.windowMs };
    }

    return entry;
  }

  /**
   * Increment request count
   */
  increment(identifier) {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      // New window
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return { count: 1, resetTime: now + this.windowMs };
    }

    // Existing window
    entry.count++;
    return entry;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier) {
    const current = this.getKey(identifier);
    return current.count < this.maxRequests;
  }

  /**
   * Middleware function for API routes
   */
  middleware(getIdentifier = (req) => getClientIp(req)) {
    return (req) => {
      const identifier = getIdentifier(req);

      if (!this.isAllowed(identifier)) {
        const entry = this.getKey(identifier);
        const resetTime = new Date(entry.resetTime).toISOString();
        return {
          allowed: false,
          resetTime,
          message: `Rate limit exceeded. Reset at ${resetTime}`,
        };
      }

      this.increment(identifier);
      return { allowed: true };
    };
  }
}

// Preset limiters for common scenarios
export const limiters = {
  // Strict: 10 requests per 15 min (e.g., AI evaluation)
  evaluate: new RateLimiter(15 * 60 * 1000, 10),
  // Moderate: 30 requests per 15 min (e.g., auth, create)
  create: new RateLimiter(15 * 60 * 1000, 30),
  // Moderate: 50 requests per 15 min (e.g., list, get)
  read: new RateLimiter(15 * 60 * 1000, 50),
  // Relaxed: 100 requests per 15 min (e.g., general API)
  general: new RateLimiter(15 * 60 * 1000, 100),
};

/**
 * Helper to extract IP from request
 */
export function getClientIp(req) {
  if (!req) {
    return "unknown";
  }

  const headers = req.headers;

  if (headers) {
    if (typeof headers.get === "function") {
      const forwarded = headers.get("x-forwarded-for");
      if (forwarded) {
        return forwarded.split(",")[0].trim();
      }

      const forwardedFor = headers.get("x-real-ip");
      if (forwardedFor) {
        return forwardedFor.trim();
      }
    } else {
      const forwarded = headers["x-forwarded-for"];
      if (forwarded) {
        return forwarded.split(",")[0].trim();
      }

      const forwardedFor = headers["x-real-ip"];
      if (forwardedFor) {
        return forwardedFor.trim();
      }
    }
  }

  return req.socket?.remoteAddress || req.ip || "unknown";
}

/**
 * Helper to get rate limit key (userId if authenticated, else IP)
 */
export async function getRateLimitKey(req, session) {
  if (typeof req === "string") {
    return `user:${req}`;
  }

  if (typeof session === "string") {
    return `user:${session}`;
  }

  if (session?.user?.id) {
    return `user:${session.user.id}`;
  }
  return `ip:${getClientIp(req)}`;
}
