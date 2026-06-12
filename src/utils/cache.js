// Simple in-memory cache with TTL (Time To Live)
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, value, ttlSeconds = 300) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttlSeconds * 1000);

    this.timers.set(key, timer);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    return item.value;
  }

  has(key) {
    return this.cache.has(key);
  }

  clear(key) {
    if (key) {
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
      this.cache.delete(key);
    } else {
      this.cache.clear();
      this.timers.forEach(timer => clearTimeout(timer));
      this.timers.clear();
    }
  }

  // Clear all keys matching a pattern
  clearPattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.clear(key);
      }
    }
  }
}

export const cacheManager = new CacheManager();

// Cache key generators
export const cacheKeys = {
  donors: (page = 1, limit = 50) => `donors_page_${page}_limit_${limit}`,
  donorById: (id) => `donor_${id}`,
  donorByEmail: (email) => `donor_email_${email}`,
  requests: (page = 1, limit = 50) => `requests_page_${page}_limit_${limit}`,
  requestById: (id) => `request_${id}`,
  notifications: (userId, page = 1) => `notifications_${userId}_page_${page}`,
  users: () => 'users_all',
  stats: () => 'stats_global',
};
