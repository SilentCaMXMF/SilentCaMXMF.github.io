/**
 * @file Portfolio JavaScript Modules Documentation
 * @description Comprehensive documentation for the modular Portfolio application
 * @version 1.0.0
 * @author Portfolio Development Team
 * @since 2026-01-05
 */

/**
 * @namespace Portfolio
 * @description Main application namespace containing all modules and utilities
 */

/**
 * @typedef {Object} CacheEntry
 * @property {*} data - The cached data
 * @property {number} timestamp - When the entry was created
 * @property {number} expiry - When the entry expires
 * @property {number} staleExpiry - When the entry becomes stale
 * @property {number} [hits=0] - Number of times this entry was accessed
 * 
 * @description Structure of a cache entry
 */

/**
 * @typedef {Object} ErrorData
 * @property {string} id - Unique error identifier
 * @property {number} timestamp - Error occurrence time
 * @property {string} message - Error message
 * @property {string} [stack] - Error stack trace
 * @property {string} type - Error type (network, api, validation, etc.)
 * @property {string} severity - Error severity (low, medium, high, critical)
 * @property {string} context - Context where error occurred
 * @property {string} userAgent - Browser user agent
 * @property {string} url - Current page URL
 * @property {Object} [additional={}] - Additional error metadata
 * 
 * @description Structure of an error data object
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {Object} coreWebVitals - Core Web Vitals measurements
 * @property {Object} resources - Resource loading metrics
 * @property {Object} navigation - Page navigation metrics
 * @property {number} timestamp - When metrics were collected
 * 
 * @description Performance monitoring results
 */

/**
 * @typedef {Object} NavigationStats
 * @property {number} totalLinks - Total navigation links
 * @property {string|null} currentSection - Currently active section
 * @property {boolean} mobileMenuOpen - Whether mobile menu is open
 * 
 * @description Navigation system statistics
 */

/**
 * @typedef {Object} AnimationStats
 * @property {boolean} isPaused - Whether animations are paused
 * @property {boolean} prefersReducedMotion - User's motion preference
 * @property {number} animatedElementsCount - Count of animated elements
 * @property {number} totalAnimations - Total CSS animations on page
 * 
 * @description Animation system statistics
 */

/**
 * @typedef {Object} ShortcutConfig
 * @property {string} action - Action to perform
 * @property {string} description - Human-readable description
 * @property {boolean} [preventDefault=true] - Whether to prevent default behavior
 * 
 * @description Keyboard shortcut configuration
 */

/**
 * @typedef {Object} GitHubRepo
 * @property {string} id - Repository ID
 * @property {string} name - Repository name
 * @property {string} description - Repository description
 * @property {string} language - Primary programming language
 * @property {number} stargazers_count - Star count
 * @property {number} forks_count - Fork count
 * @property {string} html_url - Repository URL
 * @property {string} updated_at - Last update timestamp
 * @property {boolean} private - Whether repository is private
 * 
 * @description GitHub repository object structure
 */

/**
 * @typedef {Object} CacheStats
 * @property {number} totalEntries - Total cache entries
 * @property {number} expired - Number of expired entries
 * @property {number} stale - Number of stale entries
 * @property {number} valid - Number of valid entries
 * @property {number} totalHits - Total cache hits
 * @property {Object} memoryUsage - Memory usage statistics
 * 
 * @description Cache statistics
 */

/**
 * Main Portfolio Application
 * @class PortfolioApp
 * @classdesc
 * Main application class that coordinates all modules and handles initialization.
 * Implements error boundaries, performance monitoring, and module lifecycle management.
 * 
 * @example
 * // Create and initialize app
 * const app = new PortfolioApp();
 * await app.initialize();
 * 
 * // Access modules
 * const githubAPI = app.getModule('gitHubAPI');
 * const repos = await githubAPI.fetchRepos();
 * 
 * @see {@link IconManager}
 * @see {@link LazyLoader}
 * @see {@link ThemeManager}
 * @see {@link NavigationManager}
 * @see {@link GitHubAPI}
 * @see {@link AnimationController}
 * @see {@link KeyboardShortcuts}
 * @see {@link ErrorHandler}
 * @see {@link CacheManager}
 */

/**
 * Icon Management Module
 * @class IconManager
 * @classdesc
 * Handles replacement of Font Awesome classes with custom emoji/Unicode icons.
 * Provides automatic replacement, theme-aware icon updates, and extensibility.
 * 
 * @example
 * const iconManager = new IconManager();
 * await iconManager.initialize();
 * 
 * // Update theme icon
 * iconManager.updateThemeIcon(true); // Dark theme
 * 
 * // Get icon class
 * const iconClass = iconManager.getIconClass('fas fa-star');
 * console.log(iconClass); // 'icon icon-star'
 */

/**
 * Lazy Loading Module
 * @class LazyLoader
 * @classdesc
 * Implements image and picture element lazy loading using Intersection Observer.
 * Supports blur-to-sharp transitions, error handling, and performance optimization.
 * 
 * @example
 * const lazyLoader = new LazyLoader();
 * await lazyLoader.initialize();
 * 
 * // Observe new image
 * lazyLoader.observe(imageElement);
 */

/**
 * Theme Management Module
 * @class ThemeManager
 * @classdesc
 * Manages light/dark theme switching with localStorage persistence.
 * Respects system preferences and provides smooth transitions.
 * 
 * @example
 * const themeManager = new ThemeManager();
 * await themeManager.initialize();
 * 
 * // Toggle theme
 * themeManager.toggleTheme();
 * 
 * // Check current theme
 * const isDark = themeManager.isDarkTheme();
 */

/**
 * Navigation Management Module
 * @class NavigationManager
 * @classdesc
 * Handles smooth scrolling, mobile navigation, and single-page app navigation.
 * Includes scroll spy, accessibility features, and keyboard navigation support.
 * 
 * @example
 * const navManager = new NavigationManager();
 * await navManager.initialize();
 * 
 * // Navigate to section
 * navManager.navigateToSection('about');
 * 
 * // Get current section
 * const current = navManager.getCurrentSection();
 */

/**
 * GitHub API Module
 * @class GitHubAPI
 * @classdesc
 * Provides typed interface to GitHub API with caching, error handling, and retry logic.
 * Supports repository fetching, user data, and search functionality.
 * 
 * @example
 * const gitHubAPI = new GitHubAPI(cacheManager);
 * await gitHubAPI.initialize();
 * 
 * // Fetch repositories
 * const repos = await gitHubAPI.fetchRepos();
 * 
 * // Fetch featured repos
 * const featured = await gitHubAPI.fetchFeaturedRepos();
 * 
 * @param {CacheManager} cacheManager - Cache manager instance
 */

/**
 * Cache Management Module
 * @class CacheManager
 * @classdesc
 * Implements intelligent caching with stale-while-revalidate pattern.
 * Features automatic cleanup, memory optimization, and comprehensive statistics.
 * 
 * @example
 * const cacheManager = new CacheManager();
 * await cacheManager.initialize();
 * 
 * // Cache data
 * cacheManager.set('api-data', response, 300000); // 5 minutes
 * 
 * // Get data (stale-while-revalidate)
 * const cached = cacheManager.get('api-data');
 * if (cached.isExpired && !cached.isStale) {
 *   // Data is truly expired
 * } else {
 *   // Use data (even if expired but stale)
 *   console.log(cached.data);
 * }
 */

/**
 * Animation Control Module
 * @class AnimationController
 * @classdesc
 * Controls animations, micro-interactions, and user preferences.
 * Respects reduced motion preferences and provides accessibility features.
 * 
 * @example
 * const animationController = new AnimationController();
 * await animationController.initialize();
 * 
 * // Pause animations
 * animationController.pauseAnimations();
 * 
 * // Check if paused
 * const isPaused = animationController.areAnimationsPaused();
 */

/**
 * Keyboard Shortcuts Module
 * @class KeyboardShortcuts
 * @classdesc
 * Provides comprehensive keyboard navigation and accessibility shortcuts.
 * Includes help modal, customizable shortcuts, and screen reader support.
 * 
 * @example
 * const keyboardShortcuts = new KeyboardShortcuts(navigationManager);
 * await keyboardShortcuts.initialize();
 * 
 * // Add custom shortcut
 * keyboardShortcuts.addShortcut('Ctrl+K', 'search', 'Focus search');
 */

/**
 * Error Handling Module
 * @class ErrorHandler
 * @classdesc
 * Provides comprehensive error handling, logging, and reporting.
 * Features categorization, severity levels, and user notifications.
 * 
 * @example
 * const errorHandler = new ErrorHandler();
 * await errorHandler.initialize();
 * 
 * // Handle error
 * errorHandler.handleError(new Error('Something failed'), 'API call failed', {
 *   type: 'api',
 *   severity: 'high'
 * });
 */

/**
 * Performance Utilities
 * @namespace PerformanceUtils
 * @description
 * Collection of performance optimization utilities including debouncing,
 * throttling, memory management, and Core Web Vitals monitoring.
 * 
 * @example
 * // Debounce function
 * const debouncedSearch = debounce(searchFunction, 300);
 * input.addEventListener('input', debouncedSearch);
 * 
 * // Throttle scroll
 * const throttledScroll = throttle(scrollHandler, 16);
 * window.addEventListener('scroll', throttledScroll, { passive: true });
 * 
 * // Performance monitoring
 * const monitor = new PerformanceMonitor();
 * await monitor.initialize();
 * const metrics = monitor.getMetrics();
 */

/**
 * Error Types
 * @enum {string}
 * @readonly
 * @description Available error types for categorization
 */
const ERROR_TYPES = {
    /** Network-related errors (fetch failures, timeouts, CORS) */
    NETWORK: 'network',
    /** API-related errors (HTTP errors, validation failures) */
    API: 'api',
    /** Validation errors (invalid input, missing required fields) */
    VALIDATION: 'validation',
    /** Permission errors (access denied, blocked features) */
    PERMISSION: 'permission',
    /** Timeout errors (requests taking too long) */
    TIMEOUT: 'timeout',
    /** Unknown or uncategorized errors */
    UNKNOWN: 'unknown'
};

/**
 * Error Severity Levels
 * @enum {string}
 * @readonly
 * @description Error severity levels for prioritization
 */
const SEVERITY = {
    /** Low severity - informational messages */
    LOW: 'low',
    /** Medium severity - warnings and recoverable errors */
    MEDIUM: 'medium',
    /** High severity - serious errors affecting functionality */
    HIGH: 'high',
    /** Critical severity - system-breaking errors */
    CRITICAL: 'critical'
};

/**
 * Storage Keys
 * @enum {string}
 * @readonly
 * @description Standardized localStorage keys used throughout the application
 */
const STORAGE_KEYS = {
    /** User's theme preference */
    THEME: 'portfolio-theme',
    /** Animation enabled preference */
    ANIMATIONS: 'portfolio-animations-enabled',
    /** Main application cache */
    CACHE: 'portfolio-cache',
    /** Error reports for debugging */
    ERROR_REPORTS: 'error-reports'
};

/**
 * CSS Custom Properties
 * @enum {string}
 * @readonly
 * @description CSS custom properties used throughout the application
 */
const CSS_VARS = {
    /** Primary brand color */
    PRIMARY_COLOR: '--primary-color',
    /** Secondary brand color */
    SECONDARY_COLOR: '--secondary-color',
    /** Dark background color */
    DARK_BG: '--dark-bg',
    /** Light text color */
    LIGHT_TEXT: '--light-text',
    /** Dark text color */
    DARK_TEXT: '--dark-text',
    /** Focus indicator color */
    FOCUS_COLOR: '--focus-color'
};

/**
 * Event Types
 * @enum {string}
 * @readonly
 * @description Custom event types dispatched by the application
 */
const CUSTOM_EVENTS = {
    /** Theme change event */
    THEME_CHANGE: 'themechange',
    /** Section navigation event */
    SECTION_CHANGE: 'sectionchange',
    /** Animation state change event */
    ANIMATION_STATE_CHANGE: 'animationstatechange',
    /** Cache updated event */
    CACHE_UPDATED: 'cacheupdated',
    /** Error occurred event */
    ERROR_OCCURRED: 'erroroccurred'
};

export {
    ERROR_TYPES,
    SEVERITY,
    STORAGE_KEYS,
    CSS_VARS,
    CUSTOM_EVENTS
};