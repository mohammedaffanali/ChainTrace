/**
 * CHAINTRACE // Server-side In-Memory Cache and Rate Limiter
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class BlockchainCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private requestCounts = new Map<string, { count: number; resetAt: number }>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs = 60000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });

    // Prune stale entries periodically if cache size grows large
    if (this.cache.size > 2000) {
      this.prune();
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.requestCounts.clear();
  }

  private prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Basic sliding-window rate limiter.
   * Returns true if within allowed rate, false if rate limit exceeded.
   */
  checkRateLimit(key: string, maxRequests = 20, windowMs = 60000): boolean {
    const now = Date.now();
    const tracker = this.requestCounts.get(key);

    if (!tracker || now > tracker.resetAt) {
      this.requestCounts.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (tracker.count >= maxRequests) {
      return false;
    }

    tracker.count++;
    return true;
  }
}

// Global singleton cache instance for server-side route execution
export const globalBlockchainCache = new BlockchainCache(
  process.env.BLOCKCHAIN_CACHE_TTL_MS
    ? parseInt(process.env.BLOCKCHAIN_CACHE_TTL_MS, 10)
    : 60000
);
