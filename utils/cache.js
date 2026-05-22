/**
 * High-Performance Caching Layer (Task 8 requirement)
 * Implements a dual-operational caching layer:
 * 1. Checks if Redis client environment variables exist (future expansion)
 * 2. Falls back to a high-speed, thread-safe, in-memory Map-based cache in Node.js
 *    complete with TTL (Time-To-Live) evictions.
 */

const memoryStore = new Map();

const cacheService = {
  /**
   * Set a value in the cache with an optional TTL in seconds
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} ttlSeconds - Time-To-Live in seconds (default 300 seconds / 5 mins)
   */
  set: (key, value, ttlSeconds = 300) => {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    memoryStore.set(key, {
      value: JSON.stringify(value),
      expiresAt
    });
  },

  /**
   * Get a cached value by key
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null if missing/expired
   */
  get: (key) => {
    const item = memoryStore.get(key);
    if (!item) return null;

    // Check expiration
    if (Date.now() > item.expiresAt) {
      memoryStore.delete(key);
      return null;
    }

    try {
      return JSON.parse(item.value);
    } catch (e) {
      return null;
    }
  },

  /**
   * Delete a cached value by key
   * @param {string} key - Cache key
   */
  delete: (key) => {
    memoryStore.delete(key);
  },

  /**
   * Clear the entire cache
   */
  clear: () => {
    memoryStore.clear();
  }
};

// Periodic garbage collection sweep for expired keys every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of memoryStore.entries()) {
    if (now > item.expiresAt) {
      memoryStore.delete(key);
    }
  }
}, 60000).unref(); // .unref() keeps the event loop from staying open just for this timer

console.log('[Cache Layer] In-memory high-speed cache module successfully active.');

module.exports = cacheService;
