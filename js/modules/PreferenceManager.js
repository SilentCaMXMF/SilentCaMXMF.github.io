/**
 * PreferenceManager Module
 * Manages user preferences with localStorage persistence
 * Supports multiple preference types and provides change notifications
 * 
 * @example
 * const preferenceManager = new PreferenceManager();
 * await preferenceManager.initialize();
 * 
 * // Get preference
 * const theme = preferenceManager.get('theme');
 * 
 * // Set preference
 * preferenceManager.set('theme', 'dark');
 * 
 * // Listen for changes
 * preferenceManager.on('theme', (value) => console.log('Theme changed:', value));
 */

export class PreferenceManager {
    constructor() {
        this.preferences = {};
        this.listeners = new Map();
        this.initialized = false;
        this.STORAGE_KEY = 'portfolio-preferences';
        
        // Preference definitions with defaults
        this.preferenceDefinitions = {
            theme: {
                type: 'string',
                default: 'light',
                values: ['light', 'dark'],
                description: 'Color theme'
            },
            animations: {
                type: 'boolean',
                default: true,
                description: 'Enable/disable animations'
            },
            reducedMotion: {
                type: 'boolean',
                default: false,
                description: 'Reduce motion for accessibility'
            },
            fontSize: {
                type: 'string',
                default: 'medium',
                values: ['small', 'medium', 'large', 'xlarge'],
                description: 'Font size preference'
            },
            layout: {
                type: 'string',
                default: 'standard',
                values: ['standard', 'compact', 'spacious'],
                description: 'Layout density'
            },
            autoScroll: {
                type: 'boolean',
                default: true,
                description: 'Auto-scroll to section on navigation'
            },
            keyboardShortcuts: {
                type: 'boolean',
                default: true,
                description: 'Enable keyboard shortcuts'
            },
            notifications: {
                type: 'boolean',
                default: true,
                description: 'Show notifications'
            },
            language: {
                type: 'string',
                default: 'en',
                values: ['en', 'pt'],
                description: 'Interface language'
            }
        };
    }

    /**
     * Initialize preference manager
     */
    initialize() {
        try {
            this.loadPreferences();
            this.setupSystemPreferences();
            this.initialized = true;
        } catch (error) {
            console.error('❌ PreferenceManager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load preferences from localStorage
     */
    loadPreferences() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                this.preferences = { ...this.getDefaults(), ...parsed };
            } catch (error) {
                console.error('Failed to parse preferences:', error);
                this.preferences = this.getDefaults();
            }
        } else {
            this.preferences = this.getDefaults();
        }
    }

    /**
     * Get default preferences
     */
    getDefaults() {
        const defaults = {};
        for (const [key, definition] of Object.entries(this.preferenceDefinitions)) {
            defaults[key] = definition.default;
        }
        return defaults;
    }

    /**
     * Setup system preferences (respect user's OS settings)
     */
    setupSystemPreferences() {
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.set('reducedMotion', true, { persist: true, notify: false });
        }
        
        // Check for dark mode preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.set('theme', 'dark', { persist: true, notify: false });
        }
        
        // Listen for system preference changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.set('reducedMotion', e.matches, { persist: true, notify: true });
        });
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            this.set('theme', e.matches ? 'dark' : 'light', { persist: true, notify: true });
        });
    }

    /**
     * Get a preference value
     */
    get(key) {
        const definition = this.preferenceDefinitions[key];
        
        if (!definition) {
            console.warn(`Unknown preference: ${key}`);
            return undefined;
        }
        
        return this.preferences[key] ?? definition.default;
    }

    /**
     * Set a preference value
     */
    set(key, value, options = {}) {
        const definition = this.preferenceDefinitions[key];
        
        if (!definition) {
            console.warn(`Cannot set unknown preference: ${key}`);
            return false;
        }
        
        // Validate value type
        if (definition.type === 'boolean' && typeof value !== 'boolean') {
            value = Boolean(value);
        } else if (definition.type === 'string' && typeof value !== 'string') {
            value = String(value);
        }
        
        // Validate against allowed values
        if (definition.values && !definition.values.includes(value)) {
            console.warn(`Invalid value for ${key}: ${value}. Allowed values: ${definition.values.join(', ')}`);
            return false;
        }
        
        const oldValue = this.preferences[key];
        this.preferences[key] = value;
        
        // Persist to localStorage
        if (options.persist !== false) {
            this.savePreferences();
        }
        
        // Notify listeners
        if (options.notify !== false && oldValue !== value) {
            this.notifyListeners(key, value, oldValue);
        }
        
        return true;
    }

    /**
     * Toggle a boolean preference
     */
    toggle(key, options = {}) {
        const definition = this.preferenceDefinitions[key];
        
        if (!definition || definition.type !== 'boolean') {
            console.warn(`Cannot toggle non-boolean preference: ${key}`);
            return false;
        }
        
        const currentValue = this.get(key);
        return this.set(key, !currentValue, options);
    }

    /**
     * Set multiple preferences at once
     */
    setMultiple(prefs, options = {}) {
        for (const [key, value] of Object.entries(prefs)) {
            this.set(key, value, { ...options, notify: false });
        }
        
        // Save once
        if (options.persist !== false) {
            this.savePreferences();
        }
        
        // Notify for all changed preferences
        if (options.notify !== false) {
            for (const [key, value] of Object.entries(prefs)) {
                const listeners = this.listeners.get(key);
                if (listeners) {
                    listeners.forEach(callback => callback(value, this.preferences[key]));
                }
            }
        }
    }

    /**
     * Save preferences to localStorage
     */
    savePreferences() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.preferences));
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    }

    /**
     * Reset preferences to defaults
     */
    reset() {
        this.preferences = this.getDefaults();
        this.savePreferences();
        
        // Notify all listeners
        for (const [key, listeners] of this.listeners) {
            const value = this.preferences[key];
            listeners.forEach(callback => callback(value, this.preferences[key]));
        }
    }

    /**
     * Register a listener for preference changes
     */
    on(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        
        this.listeners.get(key).push(callback);
        
        // Immediately call with current value
        callback(this.get(key), this.preferences[key]);
    }

    /**
     * Remove a listener
     */
    off(key, callback) {
        const listeners = this.listeners.get(key);
        
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Notify listeners of preference change
     */
    notifyListeners(key, newValue, oldValue) {
        const listeners = this.listeners.get(key);
        
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error(`Error in preference listener for ${key}:`, error);
                }
            });
        }
        
        // Dispatch custom event
        const event = new CustomEvent('preferencechange', {
            detail: { key, value: newValue, oldValue }
        });
        window.dispatchEvent(event);
    }

    /**
     * Get all preferences
     */
    getAll() {
        return { ...this.preferences };
    }

    /**
     * Get preference definitions
     */
    getDefinitions() {
        return { ...this.preferenceDefinitions };
    }

    /**
     * Check if a preference is valid
     */
    isValid(key) {
        return key in this.preferenceDefinitions;
    }

    /**
     * Get preference metadata
     */
    getMeta(key) {
        return this.preferenceDefinitions[key] || null;
    }

    /**
     * Export preferences as JSON
     */
    export() {
        return JSON.stringify(this.preferences, null, 2);
    }

    /**
     * Import preferences from JSON
     */
    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            
            // Validate and merge
            const validPrefs = {};
            for (const [key, value] of Object.entries(imported)) {
                if (this.isValid(key)) {
                    validPrefs[key] = value;
                }
            }
            
            this.setMultiple(validPrefs);
            return true;
        } catch (error) {
            console.error('Failed to import preferences:', error);
            return false;
        }
    }

    /**
     * Clear all preferences
     */
    clear() {
        this.preferences = this.getDefaults();
        this.savePreferences();
    }

    /**
     * Get preference statistics
     */
    getStats() {
        return {
            totalPreferences: Object.keys(this.preferenceDefinitions).length,
            activeListeners: this.listeners.size,
            customValues: Object.keys(this.preferences).length,
            storageUsage: JSON.stringify(this.preferences).length
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        this.listeners.clear();
        this.initialized = false;
    }
}
