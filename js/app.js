/**
 * @file Portfolio Main Application
 * @description Modern ES6+ modular portfolio application with comprehensive error handling and performance optimization
 * @version 1.0.0
 * @author Portfolio Development Team
 * @since 2026-01-05
 */

import { IconManager } from './modules/IconManager.js';
import { LazyLoader } from './modules/LazyLoader.js';
import { ThemeManager } from './modules/ThemeManager.js';
import { PreferenceManager } from './modules/PreferenceManager.js';
import { NavigationManager } from './modules/NavigationManager.js';
import { GitHubAPI } from './modules/GitHubAPI.js';
import { AnimationController } from './modules/AnimationController.js';
import { ScrollAnimations } from './modules/ScrollAnimations.js';
import { LoadingStates } from './modules/LoadingStates.js';
import { MobileNavigation } from './modules/MobileNavigation.js';
import { KeyboardShortcuts } from './modules/KeyboardShortcuts.js';
import { ErrorHandler } from './modules/ErrorHandler.js';
import { CacheManager } from './modules/CacheManager.js';

/**
 * Main Application Class
 * Coordinates all modules and handles initialization
 */
class PortfolioApp {
    constructor() {
        this.modules = {};
        this.initialized = false;
        this.errorHandler = new ErrorHandler();
        this.cacheManager = new CacheManager();
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Portfolio App...');
            
            // Initialize modules in order of dependency
            await this.initializeModules();
            
            // Setup global error handling
            this.setupGlobalErrorHandling();
            
            // Start the application
            this.start();
            
            this.initialized = true;
            console.log('✅ Portfolio App initialized successfully');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'App initialization failed');
        }
    }

    /**
     * Initialize all modules
     */
    async initializeModules() {
        const moduleConfigs = [
            { name: 'iconManager', Module: IconManager, deps: [] },
            { name: 'lazyLoader', Module: LazyLoader, deps: [] },
            { name: 'preferenceManager', Module: PreferenceManager, deps: [] },
            { name: 'themeManager', Module: ThemeManager, deps: ['preferenceManager'] },
            { name: 'cacheManager', Module: CacheManager, deps: [] },
            { name: 'gitHubAPI', Module: GitHubAPI, deps: ['cacheManager'] },
            { name: 'animationController', Module: AnimationController, deps: ['preferenceManager'] },
            { name: 'scrollAnimations', Module: ScrollAnimations, deps: ['preferenceManager'] },
            { name: 'loadingStates', Module: LoadingStates, deps: [] },
            { name: 'mobileNavigation', Module: MobileNavigation, deps: ['navigationManager'] },
            { name: 'navigationManager', Module: NavigationManager, deps: ['scrollAnimations', 'loadingStates', 'mobileNavigation'] },
            { name: 'keyboardShortcuts', Module: KeyboardShortcuts, deps: ['navigationManager', 'preferenceManager'] }
        ];

        for (const config of moduleConfigs) {
            try {
                const deps = config.deps.map(dep => this.modules[dep]);
                this.modules[config.name] = new config.Module(...deps);
                
                if (typeof this.modules[config.name].initialize === 'function') {
                    await this.modules[config.name].initialize();
                }
                
                console.log(`📦 ${config.name} module initialized`);
            } catch (error) {
                this.errorHandler.handleError(error, `Failed to initialize ${config.name} module`);
            }
        }
    }

    /**
     * Setup global error handling
     */
    setupGlobalErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.errorHandler.handleError(event.reason, 'Unhandled promise rejection');
            event.preventDefault();
        });

        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.errorHandler.handleError(event.error, 'Uncaught error');
            event.preventDefault();
        });
    }

    /**
     * Start the application
     */
    async start() {
        try {
            // Register service worker
            this.registerServiceWorker();
            
            // Load initial data
            await this.loadInitialData();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
        } catch (error) {
            this.errorHandler.handleError(error, 'Failed to start application');
        }
    }

    /**
     * Register service worker for PWA functionality
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then((registration) => {
                        console.log('✅ Service Worker registered:', registration.scope);
                        
                        // Listen for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('🔄 New service worker available');
                                    // Notify user about update
                                    this.notifyUpdateAvailable();
                                }
                            });
                        });
                    })
                    .catch((error) => {
                        console.error('❌ Service Worker registration failed:', error);
                        this.errorHandler.logWarning('Service Worker registration failed', { error });
                    });
            });
        } else {
            console.log('⚠️ Service Workers not supported in this browser');
        }
    }

    /**
     * Notify user about service worker update
     */
    notifyUpdateAvailable() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #9ab891;
            color: #2c2c2c;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: system-ui, sans-serif;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <span>A new version is available!</span>
            <button id="update-btn" style="
                background: #2c2c2c;
                color: #9ab891;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
            ">Update</button>
        `;
        
        document.body.appendChild(notification);
        
        document.getElementById('update-btn').addEventListener('click', () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
        });
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            // Load GitHub repositories
            await this.modules.gitHubAPI.fetchRepos();
            await this.modules.gitHubAPI.fetchFeaturedRepos();
            
            // Setup scroll animations after content is loaded
            setTimeout(() => {
                if (this.modules.scrollAnimations) {
                    this.modules.scrollAnimations.animateSkillBars();
                    this.modules.scrollAnimations.animateTimeline();
                }
            }, 500);
            
            console.log('📊 Initial data loaded successfully');
        } catch (error) {
            this.errorHandler.handleError(error, 'Failed to load initial data');
        }
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor page load performance
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                        console.log(`⏱️ Page load time: ${loadTime}ms`);
                        
                        // Log performance metrics
                        if (loadTime > 3000) {
                            this.errorHandler.logWarning('Slow page load detected', { loadTime });
                        }
                    }
                }, 0);
            });
        }
    }

    /**
     * Get module instance
     */
    getModule(name) {
        return this.modules[name];
    }

    /**
     * Destroy the application and cleanup
     */
    destroy() {
        Object.values(this.modules).forEach(module => {
            if (typeof module.destroy === 'function') {
                module.destroy();
            }
        });
        
        this.initialized = false;
        console.log('🧹 Portfolio app destroyed');
    }
}

/**
 * Application entry point
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔍 DOM Content Loaded, starting initialization...');
    
    try {
        // Test basic functionality first
        console.log('📋 Testing basic functionality...');
        
        // Test module imports
        console.log('📦 Testing module imports...');
        if (typeof PortfolioApp === 'undefined') {
            throw new Error('PortfolioApp class is not defined');
        }
        
        // Create and initialize app
        console.log('🏗️ Creating PortfolioApp instance...');
        window.portfolioApp = new PortfolioApp();
        
        if (!window.portfolioApp) {
            throw new Error('Failed to create PortfolioApp instance');
        }
        
        console.log('⚙️ Initializing app...');
        await window.portfolioApp.initialize();
        
        // Make app available globally for debugging
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.debugApp = window.portfolioApp;
        }
        
        console.log('✅ Application initialization completed successfully');
        
    } catch (error) {
        console.error('🚨 Failed to start portfolio application:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            timestamp: new Date().toISOString()
        });
        
        // Fallback: Show error message to user with actual error details
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: var(--dark-bg, #2c2c2c);
                color: var(--light-text, #fff);
                font-family: system-ui, sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div style="max-width: 600px;">
                    <h1>⚠️ Application Error</h1>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p><strong>Type:</strong> ${error.name || 'Unknown'}</p>
                    <details style="margin: 20px 0; text-align: left;">
                        <summary>Technical Details</summary>
                        <pre style="background: rgba(0,0,0,0.1); padding: 10px; border-radius: 4px; overflow: auto; font-size: 12px; text-align: left;">${error.stack || 'No stack trace available'}</pre>
                    </details>
                    <button onclick="window.location.reload()" style="
                        background: var(--primary-color, #9ab891);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 16px;
                        margin-top: 20px;
                    ">
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }
});

// Export for module usage
export { PortfolioApp };