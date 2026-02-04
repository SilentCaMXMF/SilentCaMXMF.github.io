/**
 * ErrorHandler Module
 * Provides comprehensive error handling and logging
 */

export class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.initialized = false;
        
        // Error types
        this.ERROR_TYPES = {
            NETWORK: 'network',
            API: 'api', 
            VALIDATION: 'validation',
            PERMISSION: 'permission',
            TIMEOUT: 'timeout',
            UNKNOWN: 'unknown'
        };
        
        // Severity levels
        this.SEVERITY = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical'
        };
    }

    /**
     * Initialize error handler
     */
    initialize() {
        try {
            this.setupGlobalErrorHandling();
            this.initialized = true;
            console.log('🚨 ErrorHandler initialized');
        } catch (error) {
            console.error('❌ ErrorHandler initialization failed:', error);
            throw error;
        }
    }

    /**
     * Setup global error handling
     */
    setupGlobalErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Unhandled promise rejection', {
                type: this.ERROR_TYPES.UNKNOWN,
                severity: this.SEVERITY.HIGH,
                context: 'global'
            });
            event.preventDefault();
        });

        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'Uncaught error', {
                type: this.ERROR_TYPES.UNKNOWN,
                severity: this.SEVERITY.CRITICAL,
                context: 'global',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
            event.preventDefault();
        });
    }

    /**
     * Handle an error
     */
    handleError(error, message = '', options = {}) {
        const errorData = this.createErrorData(error, message, options);
        this.logError(errorData);
        this.reportError(errorData);
        this.showErrorToUser(errorData);
        
        return errorData;
    }

    /**
     * Create structured error data
     */
    createErrorData(error, message, options) {
        const timestamp = Date.now();
        const errorId = this.generateErrorId();
        
        return {
            id: errorId,
            timestamp,
            message: message || error?.message || 'Unknown error',
            stack: error?.stack || '',
            type: options.type || this.ERROR_TYPES.UNKNOWN,
            severity: options.severity || this.SEVERITY.MEDIUM,
            context: options.context || 'application',
            userAgent: navigator.userAgent,
            url: window.location.href,
            additional: options.additional || {},
            handled: true
        };
    }

    /**
     * Generate unique error ID
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Log error to console and internal log
     */
    logError(errorData) {
        // Add to internal log
        this.errorLog.push(errorData);
        
        // Trim log if too large
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.maxLogSize);
        }
        
        // Console logging with appropriate level
        const logMessage = `[${errorData.severity.toUpperCase()}] ${errorData.message}`;
        
        switch (errorData.severity) {
            case this.SEVERITY.CRITICAL:
                console.error(logMessage, errorData);
                break;
            case this.SEVERITY.HIGH:
                console.error(logMessage, errorData);
                break;
            case this.SEVERITY.MEDIUM:
                console.warn(logMessage, errorData);
                break;
            case this.SEVERITY.LOW:
                console.info(logMessage, errorData);
                break;
            default:
                console.log(logMessage, errorData);
        }
        
        // Log stack trace if available
        if (errorData.stack) {
            console.group('Stack Trace');
            console.error(errorData.stack);
            console.groupEnd();
        }
    }

    /**
     * Report error to external service (optional)
     */
    reportError(errorData) {
        // Only report high severity errors in production
        if (this.isProduction() && errorData.severity === this.SEVERITY.CRITICAL) {
            this.sendErrorReport(errorData);
        }
    }

    /**
     * Send error report to external service
     */
    async sendErrorReport(errorData) {
        try {
            // You can integrate with error reporting services like Sentry, Bugsnag, etc.
            // For now, just store in localStorage for debugging
            const reports = JSON.parse(localStorage.getItem('error-reports') || '[]');
            reports.push({
                ...errorData,
                reportedAt: Date.now()
            });
            
            // Keep only last 50 reports
            const limitedReports = reports.slice(-50);
            localStorage.setItem('error-reports', JSON.stringify(limitedReports));
            
        } catch (reportingError) {
            console.error('Failed to report error:', reportingError);
        }
    }

    /**
     * Show error to user
     */
    showErrorToUser(errorData) {
        // Only show errors to user for high severity
        if (errorData.severity === this.SEVERITY.HIGH || errorData.severity === this.SEVERITY.CRITICAL) {
            this.displayErrorNotification(errorData);
        }
    }

    /**
     * Display error notification to user
     */
    displayErrorNotification(errorData) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');

        const isReloadable = this.isReloadableError(errorData);

        // SECURITY: Using DOM methods instead of innerHTML to prevent XSS
        const contentDiv = document.createElement('div');
        contentDiv.className = 'notification-content';

        const heading = document.createElement('h3');
        heading.textContent = '⚠️ Something went wrong';

        const messageP = document.createElement('p');
        messageP.textContent = errorData.message || 'An error occurred';

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'notification-actions';

        if (isReloadable) {
            const reloadBtn = document.createElement('button');
            reloadBtn.className = 'btn btn-primary';
            reloadBtn.textContent = 'Reload Page';
            reloadBtn.addEventListener('click', () => location.reload());
            actionsDiv.appendChild(reloadBtn);
        }

        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'btn btn-secondary';
        dismissBtn.textContent = 'Dismiss';
        dismissBtn.addEventListener('click', () => notification.remove());
        actionsDiv.appendChild(dismissBtn);

        contentDiv.appendChild(heading);
        contentDiv.appendChild(messageP);
        contentDiv.appendChild(actionsDiv);
        notification.appendChild(contentDiv);

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--dark-bg, #2c2c2c);
            color: var(--light-text, #fff);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 400px;
            border-left: 4px solid var(--focus-color, #4a9eff);
        `;

        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    /**
     * Check if error suggests page reload
     */
    isReloadableError(errorData) {
        const reloadableKeywords = ['network', 'timeout', 'cors', 'fetch', 'connection'];
        const message = errorData.message.toLowerCase();
        
        return reloadableKeywords.some(keyword => message.includes(keyword));
    }

    /**
     * Log warning message
     */
    logWarning(message, data = {}) {
        const warningData = {
            id: this.generateErrorId(),
            timestamp: Date.now(),
            message,
            type: this.ERROR_TYPES.VALIDATION,
            severity: this.SEVERITY.LOW,
            context: 'warning',
            additional: data
        };
        
        this.logError(warningData);
    }

    /**
     * Log info message
     */
    logInfo(message, data = {}) {
        const infoData = {
            id: this.generateErrorId(),
            timestamp: Date.now(),
            message,
            type: this.ERROR_TYPES.UNKNOWN,
            severity: this.SEVERITY.LOW,
            context: 'info',
            additional: data
        };
        
        this.logError(infoData);
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        const now = Date.now();
        const last24h = now - (24 * 60 * 60 * 1000);
        
        const recentErrors = this.errorLog.filter(error => error.timestamp > last24h);
        const errorsByType = {};
        const errorsBySeverity = {};
        
        this.errorLog.forEach(error => {
            errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
            errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
        });
        
        return {
            totalErrors: this.errorLog.length,
            recentErrors: recentErrors.length,
            errorsByType,
            errorsBySeverity,
            lastError: this.errorLog[this.errorLog.length - 1] || null
        };
    }

    /**
     * Get error history
     */
    getErrorHistory(limit = 50) {
        return this.errorLog.slice(-limit);
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        localStorage.removeItem('error-reports');
        console.log('🧹 Error log cleared');
    }

    /**
     * Export error data
     */
    exportErrorData() {
        return {
            errors: this.errorLog,
            stats: this.getErrorStats(),
            exportedAt: Date.now()
        };
    }

    /**
     * Check if running in production
     */
    isProduction() {
        return !['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname) &&
               !window.location.hostname.includes('dev') &&
               !window.location.hostname.includes('staging');
    }

    /**
     * Create custom error
     */
    createError(message, type = this.ERROR_TYPES.UNKNOWN, severity = this.SEVERITY.MEDIUM) {
        const error = new Error(message);
        error.type = type;
        error.severity = severity;
        return error;
    }

    /**
     * Handle network errors specifically
     */
    handleNetworkError(error, context = '') {
        return this.handleError(error, 'Network error occurred', {
            type: this.ERROR_TYPES.NETWORK,
            severity: this.SEVERITY.HIGH,
            context: context || 'network',
            additional: {
                isOnline: navigator.onLine,
                connection: navigator.connection?.effectiveType || 'unknown'
            }
        });
    }

    /**
     * Handle API errors specifically
     */
    handleAPIError(error, endpoint = '', statusCode = null) {
        return this.handleError(error, `API error: ${endpoint}`, {
            type: this.ERROR_TYPES.API,
            severity: this.SEVERITY.HIGH,
            context: 'api',
            additional: {
                endpoint,
                statusCode
            }
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        this.errorLog = [];
        this.initialized = false;
        
        console.log('🧹 ErrorHandler destroyed');
    }
}