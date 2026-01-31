/**
 * @file Logger Utility
 * @description Environment-aware logging utility for production-ready console output
 */

const Logger = {
    // Environment detection
    isDevelopment: window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '' ||
                   window.location.search.includes('debug=true'),

    // Logging levels
    levels: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        NONE: 4
    },

    currentLevel: 1, // Default to INFO

    /**
     * Set logging level
     */
    setLevel(level) {
        if (typeof level === 'string' && this.levels[level]) {
            this.currentLevel = this.levels[level];
        }
    },

    /**
     * Debug level logging (development only)
     */
    debug(...args) {
        if (this.isDevelopment && this.currentLevel <= this.levels.DEBUG) {
            console.debug('[DEBUG]', ...args);
        }
    },

    /**
     * Info level logging
     */
    info(...args) {
        if (this.currentLevel <= this.levels.INFO) {
            // Remove emoji prefix for cleaner logs
            const cleanArgs = args.map(arg => {
                if (typeof arg === 'string') {
                    return arg.replace(/^[🎨🎬🐙💾⚙️🧭⌨️🖼️🚨💿📦⭐🔄🔍📷🗑️🧹👉👈👆🌓🌙☀️🔀🕐✉️📍⚠️ℹ️🎓🐙💼🎓📦⚡🎨⚛️🐍💻🅱️🌐🎓🎯🎪🏠🔒📊🔧🚀💡📈🔍✨🤝🌍🔮🎭🎪🏆🎖️🎁🎀🎗️🎐🎒🎑🎈🎉🎊🎋🍂🍁🍀🌿🌾🌱🌿☘️🍃🪴🌵🌴🌲🌳🌴🌵🌱🌿☘️🍃🎍🎋🍂🍁🍀🌿🌾🌱🌿☘️🍃🪴🌵🌴🌲🌳🌴🌵🌱🌿☘️🍃🎍🎋🍂🍁🍀🌿🌾🌱🌿☘️🍃🪴🌵🌴🌲🌳🌴🌵🌱🌿☘️🍃🎍🎋🌿🌾🌱🌿☘️🍃🪴🌵🌴🌲🌳🌴🌵🌱🌿☘️🍃🎍🎋]/, '').trim();
                }
                return arg;
            });
            console.info('[INFO]', ...cleanArgs);
        }
    },

    /**
     * Warning level logging
     */
    warn(...args) {
        if (this.currentLevel <= this.levels.WARN) {
            const cleanArgs = args.map(arg => {
                if (typeof arg === 'string') {
                    return arg.replace(/^[⚠️🚨❌🔴🟠🟡]/, '').trim();
                }
                return arg;
            });
            console.warn('[WARN]', ...cleanArgs);
        }
    },

    /**
     * Error level logging
     */
    error(...args) {
        if (this.currentLevel <= this.levels.ERROR) {
            const cleanArgs = args.map(arg => {
                if (typeof arg === 'string') {
                    return arg.replace(/^[❌🚨🔴]/, '').trim();
                }
                return arg;
            });
            console.error('[ERROR]', ...cleanArgs);
        }
    },

    /**
     * Group log messages
     */
    group(label) {
        if (this.isDevelopment) {
            console.group(label);
        }
    },

    /**
     * End group
     */
    groupEnd() {
        if (this.isDevelopment) {
            console.groupEnd();
        }
    },

    /**
     * Table logging for arrays/objects
     */
    table(data) {
        if (this.isDevelopment) {
            console.table(data);
        }
    },

    /**
     * Time logging
     */
    time(label) {
        if (this.isDevelopment) {
            console.time(label);
        }
    },

    /**
     * Time end logging
     */
    timeEnd(label) {
        if (this.isDevelopment) {
            console.timeEnd(label);
        }
    }
};

// Export for use in modules
window.Logger = Logger;

// Also export for ES modules if needed
export { Logger };
