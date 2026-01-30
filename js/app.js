/**
 * @file Portfolio Main Application
 * @description Modern ES6+ modular portfolio application with comprehensive error handling and performance optimization
 * @version 1.0.0
 * @author Portfolio Development Team
 * @since 2026-01-05
 */

import { LazyLoader } from './modules/LazyLoader.js';
import { ThemeManager } from './modules/ThemeManager.js';
import { PreferenceManager } from './modules/PreferenceManager.js';
import { NavigationManager } from './modules/NavigationManager.js';
import { GitHubAPI } from './modules/GitHubAPI.js';
import { GitHubRenderer } from './modules/GitHubRenderer.js';
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
            { name: 'lazyLoader', Module: LazyLoader, deps: [] },
            { name: 'preferenceManager', Module: PreferenceManager, deps: [] },
            { name: 'themeManager', Module: ThemeManager, deps: ['preferenceManager'] },
            { name: 'cacheManager', Module: CacheManager, deps: [] },
            { name: 'gitHubAPI', Module: GitHubAPI, deps: ['cacheManager'] },
            { name: 'gitHubRenderer', Module: GitHubRenderer, deps: [] },
            { name: 'animationController', Module: AnimationController, deps: ['preferenceManager'] },
            { name: 'scrollAnimations', Module: ScrollAnimations, deps: ['preferenceManager'] },
            { name: 'loadingStates', Module: LoadingStates, deps: [] },
            { name: 'mobileNavigation', Module: MobileNavigation, deps: [] },
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
            
            // Show first-time user onboarding
            this.showFirstTimeOnboarding();
            
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
                        console.log('Service Worker registered:', registration.scope);

                        // Listen for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('New service worker available');
                                    // Notify user about update
                                    this.notifyUpdateAvailable();
                                }
                            });
                        });
                    })
                    .catch((error) => {
                        console.error('Service Worker registration failed:', error);
                        this.errorHandler.logWarning('Service Worker registration failed', { error });
                    });
            });
        } else {
            console.log('Service Workers not supported in this browser');
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

        // SECURITY: Using DOM methods instead of innerHTML
        const messageSpan = document.createElement('span');
        messageSpan.textContent = 'A new version is available!';

        const updateBtn = document.createElement('button');
        updateBtn.id = 'update-btn';
        updateBtn.style.cssText = `
            background: #2c2c2c;
            color: #9ab891;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
        `;
        updateBtn.textContent = 'Update';
        updateBtn.addEventListener('click', () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
        });

        notification.appendChild(messageSpan);
        notification.appendChild(updateBtn);
        document.body.appendChild(notification);
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            // Load GitHub repositories using modern API
            const allRepos = await this.modules.gitHubAPI.fetchRepos();

            // Initialize GitHub renderer
            if (this.modules.gitHubRenderer) {
                await this.modules.gitHubRenderer.initialize();
                this.modules.gitHubRenderer.renderFeaturedReposFromData(allRepos);
                this.modules.gitHubRenderer.renderReposFromData(allRepos);
            }

            // Setup scroll animations after content is loaded
            setTimeout(() => {
                if (this.modules.scrollAnimations) {
                    this.modules.scrollAnimations.animateSkillBars();
                    this.modules.scrollAnimations.animateTimeline();
                }
            }, 500);

            console.log('Initial data loading completed');
        } catch (error) {
            this.errorHandler.handleError(error, 'Failed to load initial data');
            // Show error state in UI
            this.showLoadError();
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
                        console.log(`Page load time: ${loadTime}ms`);

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
     * Show loading error state
     */
    showLoadError() {
        const featuredContainer = document.getElementById("featured-container");
        const allProjectsContainer = document.getElementById("github-repos");

        // Hide spinners
        const featuredSpinner = document.getElementById("featured-loading-spinner");
        const allProjectsSpinner = document.getElementById("loading-spinner");

        if (featuredSpinner) featuredSpinner.style.display = 'none';
        if (allProjectsSpinner) allProjectsSpinner.style.display = 'none';

        // Show error messages - SECURITY: Using DOM methods instead of innerHTML
        if (featuredContainer) {
            featuredContainer.innerHTML = '';

            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-warning';
            alertDiv.setAttribute('role', 'alert');

            const icon = document.createElement('i');
            icon.className = 'fas fa-exclamation-triangle';

            alertDiv.appendChild(icon);
            alertDiv.appendChild(document.createTextNode(' Failed to load featured projects. Please refresh the page.'));

            featuredContainer.appendChild(alertDiv);
            featuredContainer.style.display = 'block';
        }

        if (allProjectsContainer) {
            allProjectsContainer.innerHTML = '';

            const colDiv = document.createElement('div');
            colDiv.className = 'col-12';

            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger';
            alertDiv.setAttribute('role', 'alert');

            const icon = document.createElement('i');
            icon.className = 'fas fa-exclamation-triangle';

            alertDiv.appendChild(icon);
            alertDiv.appendChild(document.createTextNode(' Failed to load repositories. Please refresh the page.'));

            colDiv.appendChild(alertDiv);
            allProjectsContainer.appendChild(colDiv);
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
        console.log('Portfolio app destroyed');
    }

    /**
     * Show first-time user onboarding
     * Displays helpful tips for new visitors
     */
    showFirstTimeOnboarding() {
        // Check if user has visited before
        if (localStorage.getItem('portfolio-visited')) {
            return;
        }
        
        // Mark as visited
        localStorage.setItem('portfolio-visited', 'true');
        
        // Show welcome toast after a short delay
        setTimeout(() => {
            if (this.modules.loadingStates) {
                this.modules.loadingStates.showToast(
                    '💡 Tip: Press "P" to pause animations, "T" to toggle theme, "/" to search',
                    'info',
                    8000
                );
            }
        }, 2000);
    }
}

/**
 * Application entry point
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded, starting initialization...');

    try {
        // Test basic functionality first
        console.log('Testing basic functionality...');

        // Test module imports
        console.log('Testing module imports...');
        if (typeof PortfolioApp === 'undefined') {
            throw new Error('PortfolioApp class is not defined');
        }

        // Create and initialize app
        console.log('Creating PortfolioApp instance...');
        window.portfolioApp = new PortfolioApp();

        if (!window.portfolioApp) {
            throw new Error('Failed to create PortfolioApp instance');
        }

        console.log('Initializing app...');
        await window.portfolioApp.initialize();

        // Make app available globally for debugging (v2)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.debugApp = window.portfolioApp;
        }

        console.log('Application initialization completed successfully');

    } catch (error) {
        console.error('Failed to start portfolio application:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            timestamp: new Date().toISOString()
        });

        // Fallback: Show error message to user with actual error details
        // SECURITY: Using DOM methods instead of innerHTML to prevent XSS
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: var(--dark-bg, #2c2c2c);
            color: var(--light-text, #fff);
            font-family: system-ui, sans-serif;
            text-align: center;
            padding: 20px;
        `;

        const contentDiv = document.createElement('div');
        contentDiv.style.maxWidth = '600px';

        const heading = document.createElement('h1');
        heading.textContent = 'Application Error';

        const errorP = document.createElement('p');
        const strongError = document.createElement('strong');
        strongError.textContent = 'Error: ';
        errorP.appendChild(strongError);
        errorP.appendChild(document.createTextNode(error.message || 'Unknown error'));

        const typeP = document.createElement('p');
        const strongType = document.createElement('strong');
        strongType.textContent = 'Type: ';
        typeP.appendChild(strongType);
        typeP.appendChild(document.createTextNode(error.name || 'Unknown'));

        const details = document.createElement('details');
        details.style.cssText = 'margin: 20px 0; text-align: left;';

        const summary = document.createElement('summary');
        summary.textContent = 'Technical Details';

        const pre = document.createElement('pre');
        pre.style.cssText = 'background: rgba(0,0,0,0.1); padding: 10px; border-radius: 4px; overflow: auto; font-size: 12px; text-align: left;';
        pre.textContent = error.stack || 'No stack trace available';

        details.appendChild(summary);
        details.appendChild(pre);

        const button = document.createElement('button');
        button.style.cssText = `
            background: var(--primary-color, #9ab891);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
        `;
        button.textContent = 'Try Again';
        button.addEventListener('click', () => window.location.reload());

        contentDiv.appendChild(heading);
        contentDiv.appendChild(errorP);
        contentDiv.appendChild(typeP);
        contentDiv.appendChild(details);
        contentDiv.appendChild(button);
        errorContainer.appendChild(contentDiv);

        document.body.innerHTML = '';
        document.body.appendChild(errorContainer);
    }
});

// Export for module usage
export { PortfolioApp };