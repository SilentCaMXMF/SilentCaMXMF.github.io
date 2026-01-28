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
        console.log('🔍 App state check:', {
            initialized: this.initialized,
            modules: Object.keys(this.modules),
            gitHubAPI: !!this.modules.gitHubAPI,
            loadingStates: !!this.modules.loadingStates
        });
            
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
            // Load GitHub repositories using modern API
            console.log('🔄 Fetching GitHub repositories...');
            const allRepos = await this.modules.gitHubAPI.fetchRepos();
            const featuredRepos = await this.modules.gitHubAPI.fetchFeaturedRepos();
            
            console.log('📊 Data loaded, checking for legacy functions...');
            console.log('renderFeaturedReposFromData available:', typeof renderFeaturedReposFromData);
            console.log('renderReposFromData available:', typeof renderReposFromData);
            
            // Wait a moment for DOM to be ready and script.js functions to be available
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Try legacy functions first
            if (typeof renderFeaturedReposFromData === 'function' && typeof renderReposFromData === 'function') {
                console.log('✅ Using legacy rendering functions');
                try {
                    // Pass data to legacy rendering functions
                    renderFeaturedReposFromData(allRepos);
                    renderReposFromData(allRepos);
                    console.log('✅ Data passed to legacy rendering functions successfully');
                } catch (legacyError) {
                    console.warn('⚠️ Legacy rendering failed, using fallback:', legacyError);
                    this.renderProjectsFallback(allRepos, featuredRepos);
                }
            } else {
                // Fallback: render directly if legacy functions aren't available
                console.warn('⚠️ Legacy rendering functions not available, using fallback');
                this.renderProjectsFallback(allRepos, featuredRepos);
            }
            
            // Setup scroll animations after content is loaded
            setTimeout(() => {
                if (this.modules.scrollAnimations) {
                    this.modules.scrollAnimations.animateSkillBars();
                    this.modules.scrollAnimations.animateTimeline();
                }
            }, 500);
            
            console.log('📊 Initial data loading completed');
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
     * Fallback rendering method
     */
    renderProjectsFallback(allRepos, featuredRepos) {
        try {
            console.log('🔄 Using fallback rendering method');
            
            // Hide loading spinners
            const featuredSpinner = document.getElementById("featured-loading-spinner");
            const allProjectsSpinner = document.getElementById("loading-spinner");
            
            if (featuredSpinner) featuredSpinner.style.display = 'none';
            if (allProjectsSpinner) allProjectsSpinner.style.display = 'none';
            
            // Show containers
            const featuredContainer = document.getElementById("featured-container");
            const allProjectsContainer = document.getElementById("github-repos");
            
            if (featuredContainer) {
                featuredContainer.style.display = 'block';
                
                // Render featured projects
                if (featuredRepos && featuredRepos.length > 0) {
                    this.renderFeaturedProjectsFallback(featuredRepos, featuredContainer);
                } else {
                    // Use all repos if no featured repos specified
                    const reposWithDescriptions = allRepos.filter(repo => repo.description && repo.description.trim() !== "");
                    const sortedRepos = [...reposWithDescriptions].sort((a, b) => {
                        const dateCompare = new Date(b.updated_at) - new Date(a.updated_at);
                        if (dateCompare !== 0) return dateCompare;
                        return (b.stargazers_count || 0) - (a.stargazers_count || 0);
                    });
                    const topRepos = sortedRepos.slice(0, 5);
                    this.renderFeaturedProjectsFallback(topRepos, featuredContainer);
                }
            }
            
            if (allProjectsContainer) {
                allProjectsContainer.style.display = 'block';
                
                // Render all projects
                if (allRepos && allRepos.length > 0) {
                    this.renderAllProjectsFallback(allRepos, allProjectsContainer);
                } else {
                    allProjectsContainer.innerHTML = `
                        <div class="col-12">
                            <div class="alert alert-info" role="alert">
                                <i class="fas fa-info-circle"></i> 
                                No repositories found.
                            </div>
                        </div>
                    `;
                }
            }
            
            console.log('✅ Fallback rendering completed');
            
        } catch (error) {
            console.error('❌ Fallback rendering failed:', error);
            this.showLoadError();
        }
    }
    
    /**
     * Render featured projects using fallback method
     */
    renderFeaturedProjectsFallback(repos, container) {
        if (repos.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info" role="alert">
                    <i class="fas fa-info-circle"></i> 
                    No featured projects found.
                </div>
            `;
            return;
        }
        
        const repo = repos[0]; // Show first repo as featured
        
        container.innerHTML = `
            <div class="repo-card featured h-100">
                <div class="star-badge">
                    <i class="fas fa-star"></i>
                </div>
                <div class="repo-header">
                    <div class="repo-name">${repo.name}</div>
                    <div class="repo-description">${repo.description || "No description available."}</div>
                </div>
                <div class="repo-meta">
                    <span>
                        <i class="fas fa-code-branch"></i> ${repo.language || 'N/A'}
                    </span>
                    <span>
                        <i class="fas fa-star"></i> ${repo.stargazers_count || 0}
                    </span>
                    <span>
                        <i class="fas fa-clock"></i> ${new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                </div>
                <div class="repo-footer">
                    <a href="${repo.html_url}" target="_blank" class="repo-link">
                        <i class="fab fa-github"></i> View Repository
                    </a>
                </div>
            </div>
        `;
    }
    
    /**
     * Render all projects using fallback method
     */
    renderAllProjectsFallback(repos, container) {
        const reposWithDesc = repos.filter(repo => repo.description && repo.description.trim() !== "");
        const displayRepos = reposWithDesc.slice(0, 6); // Show first 6 repos
        
        container.innerHTML = '';
        
        if (displayRepos.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info" role="alert">
                        <i class="fas fa-info-circle"></i> 
                        No repositories with descriptions found.
                    </div>
                </div>
            `;
            return;
        }
        
        displayRepos.forEach(repo => {
            const card = document.createElement("div");
            card.className = "col-md-6 col-lg-4 mb-4";

            card.innerHTML = `
                <div class="repo-card h-100">
                    <div class="repo-header">
                        <div class="repo-name">${repo.name}</div>
                        <div class="repo-description">${repo.description || "No description available."}</div>
                    </div>
                    <div class="repo-meta">
                        <span>
                            <i class="fas fa-star"></i> ${repo.stargazers_count || 0}
                        </span>
                        <span>
                            <i class="fas fa-clock"></i> ${new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div class="repo-footer">
                        <a href="${repo.html_url}" target="_blank" class="repo-link">
                            <i class="fab fa-github"></i> View Repository
                        </a>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
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
        
        // Show error messages
        if (featuredContainer) {
            featuredContainer.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Failed to load featured projects. Please refresh the page.
                </div>
            `;
            featuredContainer.style.display = 'block';
        }
        
        if (allProjectsContainer) {
            allProjectsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Failed to load repositories. Please refresh the page.
                    </div>
                </div>
            `;
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
        
        // Make app available globally for debugging (v2)
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