/**
 * @file ErrorBoundary Module
 * @description Error boundary implementation for catching and gracefully handling component errors
 */

export class ErrorBoundary {
    constructor(options = {}) {
        this.fallback = options.fallback || this.defaultFallback.bind(this);
        this.onError = options.onError || this.defaultOnError.bind(this);
        this.ignoreErrors = options.ignoreErrors || [];
    }

    /**
     * Wrap an async function with error boundary
     */
    async wrap(fn, context = 'component') {
        try {
            return await fn();
        } catch (error) {
            this.handleError(error, context);
            return null;
        }
    }

    /**
     * Wrap a promise with error boundary
     */
    wrapPromise(promise, context = 'component') {
        return promise.catch(error => {
            this.handleError(error, context);
            return null;
        });
    }

    /**
     * Handle an error
     */
    handleError(error, context = 'unknown') {
        // Check if error should be ignored
        if (this.shouldIgnore(error)) {
            return null;
        }

        const errorData = {
            message: error?.message || error || 'Unknown error',
            stack: error?.stack || '',
            context,
            timestamp: Date.now()
        };

        // Call custom error handler
        this.onError(errorData);

        // Return fallback UI
        return this.fallback(errorData);
    }

    /**
     * Check if error should be ignored
     */
    shouldIgnore(error) {
        const errorMessage = error?.message || String(error);
        return this.ignoreErrors.some(ignore =>
            errorMessage.includes(ignore)
        );
    }

    /**
     * Default fallback UI
     */
    defaultFallback(errorData) {
        return {
            type: 'error',
            message: 'Something went wrong',
            details: errorData.message,
            retry: true,
            context: errorData.context
        };
    }

    /**
     * Default error handler
     */
    defaultOnError(errorData) {
        console.error(`[ErrorBoundary] Error in ${errorData.context}:`, errorData.message);
    }

    /**
     * Create an error boundary for a specific element
     */
    createBoundary(elementId, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`ErrorBoundary: Element ${elementId} not found`);
            return null;
        }

        return {
            element,
            showError(message, details = '') {
                this.element.innerHTML = `
                    <div class="error-boundary" role="alert">
                        <div class="error-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="error-message">${this.escapeHtml(message)}</div>
                        ${details ? `<div class="error-details">${this.escapeHtml(details)}</div>` : ''}
                        <button class="error-retry btn btn-primary" onclick="location.reload()">
                            <i class="fas fa-redo"></i> Try Again
                        </button>
                    </div>
                `;
                this.element.classList.add('error-visible');
            },
            hideError() {
                this.element.classList.remove('error-visible');
            },
            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        };
    }

    /**
     * Show error in element
     */
    showError(elementId, message, details = '') {
        const boundary = this.createBoundary(elementId);
        if (boundary) {
            boundary.showError(message, details);
        }
    }

    /**
     * Hide error in element
     */
    hideError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('error-visible');
        }
    }
}

/**
 * AsyncErrorBoundary - Specialized boundary for async operations
 */
export class AsyncErrorBoundary extends ErrorBoundary {
    constructor(options = {}) {
        super(options);
        this.pendingState = options.pendingState || this.defaultPendingState.bind(this);
        this.errorState = options.errorState || this.defaultErrorState.bind(this);
    }

    /**
     * Wrap an async function with loading and error states
     */
    async execute(asyncFn, options = {}) {
        const { elementId, loadingMessage = 'Loading...' } = options;

        // Show loading state
        if (elementId) {
            this.showLoading(elementId, loadingMessage);
        }

        try {
            const result = await asyncFn();

            // Hide loading state
            if (elementId) {
                this.hideLoading(elementId);
            }

            return result;
        } catch (error) {
            // Show error state
            if (elementId) {
                this.showErrorState(elementId, error.message || 'Failed to load');
            }

            // Handle error through parent
            this.handleError(error, options.context || 'async');

            return null;
        }
    }

    /**
     * Show loading state
     */
    showLoading(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="loading-state" role="status" aria-live="polite">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">${message}</span>
                    </div>
                    <div class="loading-message">${message}</div>
                </div>
            `;
            element.classList.add('loading-visible');
        }
    }

    /**
     * Hide loading state
     */
    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('loading-visible');
        }
    }

    /**
     * Show error state
     */
    showErrorState(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="error-state" role="alert">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>${this.escapeHtml(message)}</span>
                </div>
            `;
            element.classList.add('error-visible');
        }
    }

    /**
     * Default pending state template
     */
    defaultPendingState(message) {
        return `
            <div class="loading-state" role="status" aria-live="polite">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">${message}</span>
                </div>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Default error state template
     */
    defaultErrorState(message) {
        return `
            <div class="error-state" role="alert">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add CSS for error boundary
const errorBoundaryStyles = `
    .error-boundary {
        text-align: center;
        padding: 40px 20px;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .error-icon {
        font-size: 3rem;
        margin-bottom: 20px;
        color: #f4a460;
    }

    .error-message {
        font-size: 1.25rem;
        color: #fff;
        margin-bottom: 10px;
    }

    .error-details {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 20px;
    }

    .error-retry {
        margin-top: 20px;
    }

    .loading-state {
        text-align: center;
        padding: 40px 20px;
    }

    .loading-message {
        margin-top: 15px;
        color: rgba(255, 255, 255, 0.7);
    }

    .error-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 20px;
        background: rgba(255, 0, 0, 0.1);
        border-radius: 8px;
        color: #f4a460;
    }

    .error-visible,
    .loading-visible {
        display: block !important;
    }
`;

// Inject styles
const styleElement = document.createElement('style');
styleElement.textContent = errorBoundaryStyles;
document.head.appendChild(styleElement);

// Export instances
export const errorBoundary = new ErrorBoundary();
export const asyncErrorBoundary = new AsyncErrorBoundary();
