/**
 * CacheManager Module
 * Implements caching with stale-while-revalidate pattern
 * 
 * @classdesc
 * Provides intelligent caching with support for stale data serving while revalidating
 * in the background. Supports automatic cleanup, memory optimization, and statistics.
 * 
 * @example
 * const cache = new CacheManager();
 * await cache.initialize();
 * 
 * // Set cache entry
 * cache.set('user-data', { name: 'John' }, 60000); // 1 minute expiry
 * 
 * // Get cache entry
 * const cached = cache.get('user-data');
 * if (cached) {
 *   console.log(cached.data); // { name: 'John' }
 *   console.log(cached.isExpired); // false/true
 * }
 * 
 * @author Portfolio Team
 * @since 1.0.0
 * @version 1.0.0
 */

export class CacheManager {
    constructor() {
        this.cache = new Map();
        this.initialized = false;
        
        // Cache configuration
        this.config = {
            defaultExpiry: 5 * 60 * 1000, // 5 minutes
            maxEntries: 100,
            enableStaleWhileRevalidate: true,
            staleDataExpiry: 24 * 60 * 60 * 1000 // 24 hours for stale data
        };
    }

    /**
     * Initialize cache manager
     * @async
     * @returns {Promise<void>}
     * @throws {Error} When initialization fails
     * 
     * @example
     * await cacheManager.initialize();
     * console.log('Cache ready');
     */
    async initialize() {
        try {
            this.loadFromStorage();
            this.cleanupExpired();
            this.initialized = true;
            console.log('💾 CacheManager initialized');
        } catch (error) {
            console.error('❌ CacheManager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load cache from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('portfolio-cache');
            if (stored) {
                const data = JSON.parse(stored);
                this.cache = new Map(Object.entries(data));
                console.log(`📦 Loaded ${this.cache.size} cached items from storage`);
            }
        } catch (error) {
            console.warn('⚠️ Failed to load cache from storage:', error);
            this.cache = new Map();
        }
    }

    /**
     * Save cache to localStorage
     */
    saveToStorage() {
        try {
            const data = Object.fromEntries(this.cache);
            localStorage.setItem('portfolio-cache', JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ Failed to save cache to storage:', error);
        }
    }

    /**
     * Get cached data with stale-while-revalidate
     */
    get(key, options = {}) {
        if (!this.initialized) {
            return null;
        }

        const cached = this.cache.get(key);
        
        if (!cached) {
            return null;
        }

        const now = Date.now();
        const isExpired = now > cached.expiry;
        const isStale = this.config.enableStaleWhileRevalidate && 
                        now > cached.expiry && 
                        now <= cached.staleExpiry;

        // Return data even if expired for stale-while-revalidate
        if (isExpired && !isStale) {
            this.cache.delete(key);
            this.saveToStorage();
            return null;
        }

        return {
            data: cached.data,
            isExpired,
            isStale,
            cachedAt: cached.timestamp
        };
    }

    /**
     * Set cached data
     */
set(key, data, expiry = null) {
        if (!this.initialized) {
            return false;
        }

const now = Date.now();
        let finalExpiry = expiry || (now + this.config.defaultExpiry);
        const staleExpiry = now + this.config.staleDataExpiry;

const cacheEntry = {
            data,
            timestamp: now,
            expiry: finalExpiry,
            staleExpiry,
            hits: 0
        };

        // Check cache size limit
        if (this.cache.size >= this.config.maxEntries) {
            this.evictLeastUsed();
        }

        this.cache.set(key, cacheEntry);
        this.saveToStorage();

        console.log(`💾 Cached data for key: ${key}`);
        return true;
    }

    /**
     * Check if cache entry is expired
     */
    isExpired(key) {
        const cached = this.cache.get(key);
        if (!cached) {
            return true;
        }

        return Date.now() > cached.expiry;
    }

    /**
     * Delete cache entry
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        
        if (deleted) {
            this.saveToStorage();
            console.log(`🗑️ Deleted cache entry: ${key}`);
        }
        
        return deleted;
    }

    /**
     * Clear all cache
     */
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.saveToStorage();
        
        console.log(`🧹 Cleared ${size} cache entries`);
        return size;
    }

    /**
     * Clean up expired entries
     */
    cleanupExpired() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.cache.entries()) {
            const isExpired = now > entry.expiry;
            const isTooOldForStale = now > entry.staleExpiry;
            
            if (isExpired && isTooOldForStale) {
                this.cache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            this.saveToStorage();
            console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
        }

        return cleaned;
    }

    /**
     * Evict least used entries when cache is full
     */
    evictLeastUsed() {
        let leastUsedKey = null;
        let leastHits = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.hits < leastHits) {
                leastHits = entry.hits;
                leastUsedKey = key;
            }
        }

        if (leastUsedKey) {
            this.cache.delete(leastUsedKey);
            console.log(`🚮 Evicted least used cache entry: ${leastUsedKey}`);
        }
    }

    /**
     * Increment hit count for cache entry
     */
    incrementHits(key) {
        const cached = this.cache.get(key);
        if (cached) {
            cached.hits++;
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const now = Date.now();
        let expired = 0;
        let stale = 0;
        let totalHits = 0;

        for (const [key, entry] of this.cache.entries()) {
            totalHits += entry.hits || 0;
            
            if (now > entry.expiry) {
                if (now <= entry.staleExpiry) {
                    stale++;
                } else {
                    expired++;
                }
            }
        }

        return {
            totalEntries: this.cache.size,
            expired,
            stale,
            valid: this.cache.size - expired - stale,
            totalHits,
            memoryUsage: this.getMemoryUsage()
        };
    }

    /**
     * Estimate memory usage
     */
    getMemoryUsage() {
        try {
            const serialized = JSON.stringify(Object.fromEntries(this.cache));
            return {
                bytes: new Blob([serialized]).size,
                kilobytes: new Blob([serialized]).size / 1024,
                humanReadable: this.formatBytes(new Blob([serialized]).size)
            };
        } catch (error) {
            return { bytes: 0, kilobytes: 0, humanReadable: '0 B' };
        }
    }

    /**
     * Format bytes to human readable format
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Compress cache data to save space
     */
    compress() {
        // Simple compression - remove old stale data
        const now = Date.now();
        let compressed = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.staleExpiry) {
                this.cache.delete(key);
                compressed++;
            }
        }

        if (compressed > 0) {
            this.saveToStorage();
            console.log(`🗜️ Compressed cache, removed ${compressed} stale entries`);
        }

        return compressed;
    }

    /**
     * Export cache data
     */
    export() {
        return {
            data: Object.fromEntries(this.cache),
            stats: this.getStats(),
            exportedAt: Date.now()
        };
    }

    /**
     * Import cache data
     */
    import(cacheData) {
        try {
            if (cacheData.data) {
                this.cache = new Map(Object.entries(cacheData.data));
                this.saveToStorage();
                
                console.log(`📥 Imported ${this.cache.size} cache entries`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Failed to import cache data:', error);
            return false;
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.saveToStorage();
        this.cache.clear();
        this.initialized = false;
        
        console.log('🧹 CacheManager destroyed');
    }
}