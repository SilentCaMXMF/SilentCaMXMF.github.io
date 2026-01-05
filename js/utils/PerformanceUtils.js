/**
 * Performance Utilities
 * Debouncing, throttling, and other performance optimizations
 */

/**
 * Debounce function - delays execution until after specified time has elapsed
 */
export function debounce(func, wait, options = {}) {
    let timeout;
    let lastArgs;
    let lastThis;
    
    const { leading = false, trailing = true, maxWait = null } = options;
    
    return function debounced(...args) {
        lastArgs = args;
        lastThis = this;
        
        const later = () => {
            timeout = null;
            if (trailing && lastArgs) {
                func.apply(lastThis, lastArgs);
                lastArgs = null;
                lastThis = null;
            }
        };
        
        const shouldCallNow = leading && !timeout;
        
        clearTimeout(timeout);
        
        timeout = setTimeout(later, wait);
        
        if (maxWait && !timeout) {
            timeout = setTimeout(later, maxWait);
        }
        
        if (shouldCallNow) {
            func.apply(this, args);
        }
    };
}

/**
 * Throttle function - limits execution to once per specified period
 */
export function throttle(func, wait, options = {}) {
    let timeout;
    let previous = 0;
    
    const { leading = true, trailing = true } = options;
    
    return function throttled(...args) {
        const now = Date.now();
        
        if (!previous && leading) {
            previous = now;
            func.apply(this, args);
            return;
        }
        
        const remaining = wait - (now - previous);
        
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            
            previous = now;
            func.apply(this, args);
            
        } else if (!timeout && trailing) {
            timeout = setTimeout(() => {
                previous = leading ? Date.now() : previous;
                timeout = null;
                func.apply(this, args);
            }, remaining);
        }
    };
}

/**
 * Request animation frame throttle - optimized for animations
 */
export function rafThrottle(func) {
    let ticking = false;
    
    return function tick(...args) {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
                func.apply(this, args);
                ticking = false;
            });
        }
    };
}

/**
 * Memoize function - caches results based on arguments
 */
export function memoize(func, resolver = null) {
    const cache = new Map();
    
    return function memoized(...args) {
        const key = resolver ? resolver(...args) : JSON.stringify(args);
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const result = func.apply(this, args);
        cache.set(key, result);
        
        // Limit cache size
        if (cache.size > 100) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        
        return result;
    };
}

/**
 * Idle callback - runs function during browser idle time
 */
export function runWhenIdle(func, timeout = 5000) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(func, { timeout });
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(func, 1);
    }
}

/**
 * Performance monitor - measures and tracks performance
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = [];
        this.initialized = false;
    }

    /**
     * Initialize performance monitoring
     */
    initialize() {
        if (!('performance' in window)) {
            console.warn('Performance API not available');
            return;
        }

        this.setupNavigationTiming();
        this.setupResourceTiming();
        this.setupObserver();
        
        this.initialized = true;
        console.log('📊 PerformanceMonitor initialized');
    }

    /**
     * Setup navigation timing monitoring
     */
    setupNavigationTiming() {
        window.addEventListener('load', () => {
            runWhenIdle(() => {
                const navTiming = performance.getEntriesByType('navigation')[0];
                if (navTiming) {
                    this.recordMetric('pageLoad', {
                        loadTime: navTiming.loadEventEnd - navTiming.loadEventStart,
                        domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
                        firstPaint: this.getFirstPaint(),
                        firstContentfulPaint: this.getFirstContentfulPaint()
                    });
                }
            });
        });
    }

    /**
     * Setup resource timing monitoring
     */
    setupResourceTiming() {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                if (entry.duration > 1000) { // Log slow resources
                    this.recordMetric('slowResource', {
                        name: entry.name,
                        duration: entry.duration,
                        size: entry.transferSize
                    });
                }
            });
        });

        try {
            observer.observe({ entryTypes: ['resource'] });
            this.observers.push(observer);
        } catch (error) {
            console.warn('Resource timing observer not supported');
        }
    }

    /**
     * Setup performance observer
     */
    setupObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        this.recordMetric('lcp', { value: entry.startTime });
                    } else if (entry.entryType === 'first-input') {
                        this.recordMetric('fid', { value: entry.processingStart - entry.startTime });
                    } else if (entry.entryType === 'layout-shift') {
                        if (!entry.hadRecentInput) {
                            this.recordMetric('cls', { value: entry.value });
                        }
                    }
                });
            });

            try {
                observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
                this.observers.push(observer);
            } catch (error) {
                console.warn('Performance observer not fully supported');
            }
        }
    }

    /**
     * Get first paint time
     */
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }

    /**
     * Get first contentful paint time
     */
    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : null;
    }

    /**
     * Record performance metric
     */
    recordMetric(name, data) {
        this.metrics.set(name, {
            ...data,
            timestamp: Date.now()
        });
        
        // Log important metrics
        if (name === 'slowResource' || name === 'pageLoad') {
            console.warn(`Performance metric ${name}:`, data);
        }
    }

    /**
     * Get metrics report
     */
    getMetrics() {
        return {
            coreWebVitals: this.getCoreWebVitals(),
            resources: this.getResourceMetrics(),
            navigation: this.getNavigationMetrics(),
            timestamp: Date.now()
        };
    }

    /**
     * Get Core Web Vitals
     */
    getCoreWebVitals() {
        const lcp = this.metrics.get('lcp')?.value;
        const fid = this.metrics.get('fid')?.value;
        const cls = this.metrics.get('cls')?.value;

        return {
            lcp: lcp ? { value: lcp, rating: this.rateLCP(lcp) } : null,
            fid: fid ? { value: fid, rating: this.rateFID(fid) } : null,
            cls: cls ? { value: cls, rating: this.rateCLS(cls) } : null
        };
    }

    /**
     * Rate LCP (Largest Contentful Paint)
     */
    rateLCP(value) {
        if (value < 2500) return 'good';
        if (value < 4000) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Rate FID (First Input Delay)
     */
    rateFID(value) {
        if (value < 100) return 'good';
        if (value < 300) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Rate CLS (Cumulative Layout Shift)
     */
    rateCLS(value) {
        if (value < 0.1) return 'good';
        if (value < 0.25) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Get resource metrics
     */
    getResourceMetrics() {
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources.filter(r => r.duration > 1000);
        
        return {
            total: resources.length,
            slow: slowResources.length,
            averageSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0) / resources.length
        };
    }

    /**
     * Get navigation metrics
     */
    getNavigationMetrics() {
        return this.metrics.get('pageLoad') || {};
    }

    /**
     * Cleanup
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.metrics.clear();
        this.initialized = false;
        
        console.log('🧹 PerformanceMonitor destroyed');
    }
}

/**
 * Memory usage utilities
 */
export const MemoryUtils = {
    /**
     * Get current memory usage
     */
    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
            };
        }
        return null;
    },

    /**
     * Force garbage collection if available
     */
    forceGC() {
        if ('gc' in window) {
            window.gc();
            return true;
        }
        return false;
    }
};

/**
 * Network utilities
 */
export const NetworkUtils = {
    /**
     * Check if online
     */
    isOnline() {
        return navigator.onLine;
    },

    /**
     * Get connection info
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            return {
                effectiveType: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
                saveData: conn.saveData
            };
        }
        return null;
    },

    /**
     * Monitor network changes
     */
    onNetworkChange(callback) {
        window.addEventListener('online', () => callback(true));
        window.addEventListener('offline', () => callback(false));
        
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', callback);
        }
    }
};