/**
 * Cross-Platform Compatibility Module
 * @fileoverview Implements feature detection and progressive enhancement
 * @version 1.0.0
 * @author Cross-Platform Compatibility Team
 */

export class CompatibilityManager {
    constructor() {
        this.features = new Map();
        this.testResults = new Map();
        this.init();
    }

    /**
     * Initialize compatibility detection
     */
    async init() {
        console.log('🔍 Initializing compatibility detection...');
        
        // Test all features
        await this.testCSSFeatures();
        await this.testJavaScriptFeatures();
        await this.testAPIFeatures();
        
        // Apply enhancements based on capabilities
        this.applyProgressiveEnhancement();
        
        // Log compatibility report
        this.generateCompatibilityReport();
    }

    /**
     * Test CSS feature support
     */
    async testCSSFeatures() {
        const cssTests = [
            {
                name: 'color-mix',
                test: () => CSS.supports('color', 'color-mix(in srgb, red 50%, blue 50%)'),
                critical: true
            },
            {
                name: 'backdrop-filter',
                test: () => CSS.supports('backdrop-filter', 'blur(10px)'),
                critical: false
            },
            {
                name: 'css-grid',
                test: () => CSS.supports('display', 'grid'),
                critical: true
            },
            {
                name: 'css-custom-properties',
                test: () => CSS.supports('color', 'var(--test)'),
                critical: true
            },
            {
                name: 'flexbox-gap',
                test: () => CSS.supports('gap', '10px'),
                critical: false
            },
            {
                name: 'container-queries',
                test: () => CSS.supports('container-type', 'size'),
                critical: false
            }
        ];

        for (const feature of cssTests) {
            const result = feature.test();
            this.testResults.set(`css-${feature.name}`, {
                supported: result,
                critical: feature.critical,
                type: 'css'
            });
        }
    }

    /**
     * Test JavaScript feature support
     */
    async testJavaScriptFeatures() {
        const jsTests = [
            {
                name: 'es6-modules',
                test: () => typeof Symbol !== 'undefined' && Symbol.iterator,
                critical: true
            },
            {
                name: 'async-await',
                test: () => (async () => {})() instanceof Promise,
                critical: true
            },
            {
                name: 'fetch-api',
                test: () => typeof fetch !== 'undefined',
                critical: true
            },
            {
                name: 'localstorage',
                test: () => {
                    try {
                        localStorage.setItem('test', 'test');
                        localStorage.removeItem('test');
                        return true;
                    } catch (e) {
                        return false;
                    }
                },
                critical: false
            },
            {
                name: 'intersection-observer',
                test: () => 'IntersectionObserver' in window,
                critical: false
            },
            {
                name: 'resize-observer',
                test: () => 'ResizeObserver' in window,
                critical: false
            }
        ];

        for (const feature of jsTests) {
            const result = feature.test();
            this.testResults.set(`js-${feature.name}`, {
                supported: result,
                critical: feature.critical,
                type: 'javascript'
            });
        }
    }

    /**
     * Test API feature support
     */
    async testAPIFeatures() {
        const apiTests = [
            {
                name: 'service-worker',
                test: () => 'serviceWorker' in navigator,
                critical: false
            },
            {
                name: 'web-share',
                test: () => 'share' in navigator,
                critical: false
            },
            {
                name: 'clipboard-api',
                test: () => 'clipboard' in navigator,
                critical: false
            },
            {
                name: 'media-devices',
                test: () => 'mediaDevices' in navigator,
                critical: false
            },
            {
                name: 'geolocation',
                test: () => 'geolocation' in navigator,
                critical: false
            }
        ];

        for (const feature of apiTests) {
            const result = feature.test();
            this.testResults.set(`api-${feature.name}`, {
                supported: result,
                critical: feature.critical,
                type: 'api'
            });
        }
    }

    /**
     * Apply progressive enhancements based on feature support
     */
    applyProgressiveEnhancement() {
        console.log('🚀 Applying progressive enhancements...');

        // CSS Feature Enhancements
        if (!this.testResults.get('css-color-mix')?.supported) {
            this.addColorMixFallback();
        }

        if (!this.testResults.get('css-backdrop-filter')?.supported) {
            this.addBackdropFallback();
        }

        // JavaScript Feature Enhancements
        if (!this.testResults.get('js-intersection-observer')?.supported) {
            this.addScrollFallback();
        }

        if (!this.testResults.get('js-resize-observer')?.supported) {
            this.addResizeFallback();
        }

        // API Feature Enhancements
        if (!this.testResults.get('api-service-worker')?.supported) {
            this.addServiceWorkerFallback();
        }
    }

    /**
     * Add fallback for color-mix() function
     */
    addColorMixFallback() {
        console.log('🎨 Adding color-mix fallbacks...');
        
        // Add fallback class to body for CSS targeting
        document.body.classList.add('no-color-mix');
        
        // Inject fallback styles
        const fallbackStyles = `
            .no-color-mix .repo-card {
                background: rgba(var(--card-bg-rgb), 0.95) !important;
            }
            .no-color-mix .highlight-box {
                background: rgba(255, 255, 255, 0.95) !important;
            }
            [data-theme="dark"] .no-color-mix .highlight-box {
                background: rgba(26, 26, 26, 0.95) !important;
            }
            .no-color-mix [style*="color-mix"] {
                opacity: 0.9 !important;
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.textContent = fallbackStyles;
        styleElement.id = 'color-mix-fallback';
        document.head.appendChild(styleElement);
    }

    /**
     * Add fallback for backdrop-filter
     */
    addBackdropFallback() {
        console.log('🌊 Adding backdrop-filter fallbacks...');
        
        document.body.classList.add('no-backdrop-filter');
        
        // Add solid background fallbacks
        const fallbackStyles = `
            .no-backdrop-filter .highlight-box {
                background: rgba(255, 255, 255, 0.98) !important;
            }
            [data-theme="dark"] .no-backdrop-filter .highlight-box {
                background: rgba(26, 26, 26, 0.98) !important;
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.textContent = fallbackStyles;
        styleElement.id = 'backdrop-filter-fallback';
        document.head.appendChild(styleElement);
    }

    /**
     * Add fallback for Intersection Observer
     */
    addScrollFallback() {
        console.log('📜 Adding scroll fallbacks...');
        
        // Enable scroll-based animations immediately
        document.body.classList.add('scroll-fallback');
    }

    /**
     * Add fallback for Resize Observer
     */
    addResizeFallback() {
        console.log('📏 Adding resize fallbacks...');
        
        // Use window resize event instead
        document.body.classList.add('resize-fallback');
    }

    /**
     * Add fallback for Service Worker
     */
    addServiceWorkerFallback() {
        console.log('📦 Adding Service Worker fallbacks...');
        
        // Implement local caching fallback
        this.setupLocalCache();
    }

    /**
     * Setup local caching fallback
     */
    setupLocalCache() {
        // Simple localStorage-based caching for critical data
        const cache = {
            set: (key, data, ttl = 300000) => { // 5 minutes default TTL
                try {
                    const item = {
                        data,
                        expiry: Date.now() + ttl
                    };
                    localStorage.setItem(key, JSON.stringify(item));
                } catch (e) {
                    console.warn('Local cache storage failed:', e);
                }
            },
            
            get: (key) => {
                try {
                    const item = localStorage.getItem(key);
                    if (!item) return null;
                    
                    const parsed = JSON.parse(item);
                    if (Date.now() > parsed.expiry) {
                        localStorage.removeItem(key);
                        return null;
                    }
                    return parsed.data;
                } catch (e) {
                    console.warn('Local cache retrieval failed:', e);
                    return null;
                }
            }
        };

        // Make cache available globally
        window.localCache = cache;
    }

    /**
     * Generate compatibility report
     */
    generateCompatibilityReport() {
        console.log('📊 Generating compatibility report...');
        
        const report = {
            browser: this.detectBrowser(),
            supported: Array.from(this.testResults.entries()).filter(([_, result]) => result.supported),
            unsupported: Array.from(this.testResults.entries()).filter(([_, result]) => !result.supported),
            criticalIssues: Array.from(this.testResults.entries()).filter(([_, result]) => !result.supported && result.critical),
            performanceGrade: this.calculatePerformanceGrade()
        };

        // Log detailed report
        console.group('🔍 Compatibility Report');
        console.log('🌐 Browser:', report.browser);
        console.log('✅ Supported Features:', report.supported.length);
        console.log('❌ Unsupported Features:', report.unsupported.length);
        console.log('🚨 Critical Issues:', report.criticalIssues.length);
        console.log('📈 Performance Grade:', report.performanceGrade);
        
        if (report.criticalIssues.length > 0) {
            console.warn('Critical compatibility issues detected:', report.criticalIssues);
        }
        
        console.groupEnd();

        // Store report for analytics
        window.compatibilityReport = report;
    }

    /**
     * Detect browser and version
     */
    detectBrowser() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        let version = 'Unknown';

        if (ua.indexOf('Chrome') > -1) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.indexOf('Firefox') > -1) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.indexOf('Safari') > -1) {
            browser = 'Safari';
            version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.indexOf('Edge') > -1) {
            browser = 'Edge';
            version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
        }

        return { browser, version };
    }

    /**
     * Calculate performance grade based on feature support
     */
    calculatePerformanceGrade() {
        const totalFeatures = this.testResults.size;
        const supportedFeatures = Array.from(this.testResults.values()).filter(result => result.supported).length;
        const percentage = (supportedFeatures / totalFeatures) * 100;

        if (percentage >= 95) return 'A+';
        if (percentage >= 90) return 'A';
        if (percentage >= 85) return 'B+';
        if (percentage >= 80) return 'B';
        if (percentage >= 75) return 'C+';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    }

    /**
     * Get feature support status
     */
    isSupported(featureName) {
        const result = this.testResults.get(featureName);
        return result ? result.supported : false;
    }

    /**
     * Check if browser meets minimum requirements
     */
    meetsMinimumRequirements() {
        const criticalFeatures = Array.from(this.testResults.values())
            .filter(result => result.critical);
        
        return criticalFeatures.every(result => result.supported);
    }
}

// Initialize compatibility manager
export default new CompatibilityManager();