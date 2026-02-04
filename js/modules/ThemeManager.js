/**
 * ThemeManager Module
 * Handles dark/light theme switching and persistence
 */

export class ThemeManager {
    constructor() {
        this.themeToggle = null;
        this.themeIcon = null;
        this.currentTheme = 'light';
        this.initialized = false;
        this.STORAGE_KEY = 'portfolio-theme';

        // Theme constants
        this.THEMES = {
            LIGHT: 'light',
            DARK: 'dark'
        };
    }

    /**
     * Initialize theme manager
     */
    initialize() {
        try {
            this.cacheElements();
            this.bindEvents();
            this.loadSavedTheme();
            this.initialized = true;
        } catch (error) {
            console.error('ThemeManager initialization failed:', error);
            throw error;
        }
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

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            this.setTheme(e.matches ? this.THEMES.DARK : this.THEMES.LIGHT);
        });
    }

    /**
     * Load saved theme from localStorage
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);

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

        // Persist to localStorage
        if (options.persist !== false) {
            localStorage.setItem(this.STORAGE_KEY, theme);
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
     * Get theme
     */
    getTheme() {
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
     * Cleanup
     */
    destroy() {
        if (this.themeToggle) {
            this.themeToggle.removeEventListener('click', this.toggleTheme);
        }

        this.themeToggle = null;
        this.themeIcon = null;
        this.initialized = false;

        console.log('🧹 ThemeManager destroyed');
    }
}