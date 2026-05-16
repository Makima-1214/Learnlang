/**
 * Unit tests for rate limiting
 */

import { RateLimiter, limiters, getClientIp } from "@/lib/ratelimit";

describe("RateLimiter", () => {
  let limiter;

  beforeEach(() => {
    limiter = new RateLimiter(1000, 5); // 1 sec window, 5 max requests
  });

  describe("isAllowed", () => {
    it("should allow requests under limit", () => {
      const key = "test-user";
      expect(limiter.isAllowed(key)).toBe(true);
      expect(limiter.isAllowed(key)).toBe(true);
    });

    it("should block requests over limit", () => {
      const key = "test-user";
      for (let i = 0; i < 5; i++) {
        limiter.increment(key);
      }
      expect(limiter.isAllowed(key)).toBe(false);
    });
  });

  describe("increment", () => {
    it("should increment count", () => {
      const key = "test-user";
      limiter.increment(key);
      const entry = limiter.getKey(key);
      expect(entry.count).toBeGreaterThanOrEqual(1);
    });

    it("should track reset time", () => {
      const key = "test-user";
      const before = Date.now();
      limiter.increment(key);
      const entry = limiter.getKey(key);
      const after = Date.now();

      expect(entry.resetTime).toBeGreaterThanOrEqual(before);
      expect(entry.resetTime).toBeLessThanOrEqual(after + 1100);
    });
  });

  describe("getKey", () => {
    it("should return 0 count for new key", () => {
      const entry = limiter.getKey("new-key");
      expect(entry.count).toBe(0);
    });

    it("should reset after window expires", (done) => {
      const key = "test-key";
      limiter.increment(key);
      let entry = limiter.getKey(key);
      expect(entry.count).toBe(1);

      setTimeout(() => {
        limiter.increment(key); // This should reset
        entry = limiter.getKey(key);
        expect(entry.count).toBe(1);
        done();
      }, 1100); // Wait for window to expire
    });
  });

  describe("middleware", () => {
    it("should create middleware function", () => {
      const middleware = limiter.middleware();
      expect(typeof middleware).toBe("function");
    });

    it("should allow requests and return allowed: true", () => {
      const middleware = limiter.middleware(() => "test-user");
      const req = { headers: { "x-forwarded-for": "127.0.0.1" } };

      const result = middleware(req);
      expect(result.allowed).toBe(true);
    });

    it("should block rate-limited requests", () => {
      const middleware = limiter.middleware(() => "test-user");
      const req = { headers: {} };

      for (let i = 0; i < 5; i++) {
        middleware(req);
      }

      const result = middleware(req);
      expect(result.allowed).toBe(false);
      expect(result.message).toContain("Rate limit exceeded");
    });
  });
});

describe("Preset Limiters", () => {
  it("should have evaluate limiter (strict)", () => {
    expect(limiters.evaluate.maxRequests).toBe(10);
  });

  it("should have create limiter (moderate)", () => {
    expect(limiters.create.maxRequests).toBe(30);
  });

  it("should have read limiter (moderate)", () => {
    expect(limiters.read.maxRequests).toBe(50);
  });

  it("should have general limiter (relaxed)", () => {
    expect(limiters.general.maxRequests).toBe(100);
  });
});

describe("getClientIp", () => {
  it("should extract IP from x-forwarded-for", () => {
    const req = {
      headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
      socket: {},
    };
    expect(getClientIp(req)).toBe("192.168.1.1");
  });

  it("should fallback to socket.remoteAddress", () => {
    const req = {
      headers: {},
      socket: { remoteAddress: "127.0.0.1" },
    };
    expect(getClientIp(req)).toBe("127.0.0.1");
  });

  it("should return unknown if no IP available", () => {
    const req = { headers: {}, socket: {} };
    expect(getClientIp(req)).toBe("unknown");
  });
});
