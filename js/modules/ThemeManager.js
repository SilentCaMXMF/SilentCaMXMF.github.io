/**
 * ThemeManager Module
 * Handles dark/light theme switching and persistence
 * Now integrated with PreferenceManager for unified preference management
 */

export class ThemeManager {
    constructor(preferenceManager = null) {
        this.themeToggle = null;
        this.themeIcon = null;
        this.currentTheme = 'light';
        this.initialized = false;

        // Theme constants
        this.THEMES = {
            LIGHT: 'light',
            DARK: 'dark'
        };

        // PreferenceManager integration
        this.preferenceManager = preferenceManager;
    }

    /**
     * Initialize theme manager
     * IMPORTANT: Apply theme synchronously BEFORE first paint to prevent flash
     */
    initialize() {
        try {
            // CRITICAL: Apply theme synchronously BEFORE any async operations or DOM queries
            // This prevents the theme flash on page load
            this.applyThemeImmediately();

            // Now proceed with normal initialization
            this.cacheElements();
            this.bindEvents();
            this.setupPreferenceListener();
            
            // Sync the toggle icon after DOM is ready
            this.updateIcon(this.currentTheme);
            
            this.initialized = true;
        } catch (error) {
            console.error('ThemeManager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Apply theme synchronously from localStorage - MUST be called before first paint
     * Reads from localStorage directly without any DOM queries
     */
    applyThemeImmediately() {
        let theme;
        
        if (this.preferenceManager) {
            theme = this.preferenceManager.get('theme');
        } else {
            // Fallback to localStorage for backward compatibility
            theme = localStorage.getItem('portfolio-theme');
        }
        
        // Validate theme, fallback to system preference
        if (!theme || !Object.values(this.THEMES).includes(theme)) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? this.THEMES.DARK : this.THEMES.LIGHT;
        }
        
        // Apply theme to document IMMEDIATELY - before any rendering
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggle?.querySelector('i');
        
        if (!this.themeToggle) {
            console.warn('Theme toggle button not found');
        } else if (!this.themeIcon) {
            console.warn('Theme toggle icon not found');
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Listen for system theme changes (only if not using PreferenceManager)
        if (window.matchMedia && !this.preferenceManager) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                this.setTheme(e.matches ? this.THEMES.DARK : this.THEMES.LIGHT);
            });
        }
    }

    /**
     * Setup preference change listener
     */
    setupPreferenceListener() {
        if (this.preferenceManager) {
            this.preferenceManager.on('theme', (newTheme) => {
                this.applyTheme(newTheme);
            });
        }
    }

    /**
     * Load saved theme from preferenceManager or localStorage
     */
    loadSavedTheme() {
        let savedTheme;
        
        if (this.preferenceManager) {
            savedTheme = this.preferenceManager.get('theme');
        } else {
            // Fallback to localStorage for backward compatibility
            savedTheme = localStorage.getItem('portfolio-theme');
        }
        
        if (savedTheme && Object.values(this.THEMES).includes(savedTheme)) {
            this.setTheme(savedTheme, { persist: false });
        } else {
            // Use system preference as default
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? this.THEMES.DARK : this.THEMES.LIGHT, { persist: true });
        }
    }

    /**
     * Toggle between themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === this.THEMES.DARK 
            ? this.THEMES.LIGHT 
            : this.THEMES.DARK;
        
        this.setTheme(newTheme, { persist: true });
    }

    /**
     * Set specific theme
     */
    setTheme(theme, options = {}) {
        if (!Object.values(this.THEMES).includes(theme)) {
            console.warn(`Invalid theme: ${theme}`);
            return;
        }

        // Persist to preferenceManager if available
        if (options.persist !== false && this.preferenceManager) {
            this.preferenceManager.set('theme', theme);
        } else if (options.persist !== false) {
            // Fallback to localStorage
            localStorage.setItem('portfolio-theme', theme);
        }

        this.applyTheme(theme);
    }

    /**
     * Apply theme to DOM
     */
    applyTheme(theme) {
        if (!Object.values(this.THEMES).includes(theme)) {
            console.warn(`Invalid theme: ${theme}`);
            return;
        }

        // Update DOM
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update icon
        this.updateIcon(theme);
        
        // Update current state
        const previousTheme = this.currentTheme;
        this.currentTheme = theme;
        
        // Dispatch theme change event
        this.dispatchThemeChange(theme, previousTheme);
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Get theme from preferenceManager
     */
    getTheme() {
        if (this.preferenceManager) {
            return this.preferenceManager.get('theme');
        }
        return this.getCurrentTheme();
    }

    /**
     * Update theme toggle icon
     */
    updateIcon(theme) {
        if (this.themeIcon) {
            const iconClass = theme === this.THEMES.DARK
                ? 'fas fa-sun'
                : 'fas fa-moon';
            this.themeIcon.className = iconClass;
        }
    }

    /**
     * Dispatch custom theme change event
     */
    dispatchThemeChange(theme, previousTheme) {
        const event = new CustomEvent('themechange', {
            detail: { theme, previousTheme },
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Check if dark theme is active
     */
    isDarkTheme() {
        return this.currentTheme === this.THEMES.DARK;
    }

    /**
     * Get system theme preference
     */
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? this.THEMES.DARK 
            : this.THEMES.LIGHT;
    }

    /**
     * Reset to system theme
     */
    resetToSystemTheme() {
        if (this.preferenceManager) {
            const systemTheme = this.getSystemTheme();
            this.preferenceManager.set('theme', systemTheme);
        } else {
            localStorage.removeItem('portfolio-theme');
            const systemTheme = this.getSystemTheme();
            this.setTheme(systemTheme, { persist: false });
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.themeToggle) {
            this.themeToggle.removeEventListener('click', this.toggleTheme);
        }
        
        this.themeToggle = null;
        this.themeIcon = null;
        this.initialized = false;
    }
}