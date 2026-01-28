/**
 * LoadingStates Module
 * Provides comprehensive loading states and transitions for interactive elements
 * 
 * @example
 * const loadingStates = new LoadingStates();
 * await loadingStates.initialize();
 * 
 * // Show loading on button
 * loadingStates.showButtonLoading(button, 'Loading...');
 * 
 * // Hide loading
 * loadingStates.hideButtonLoading(button);
 */

export class LoadingStates {
    constructor() {
        this.loadingElements = new Map();
        this.initialized = false;
        
        // Loading state types
        this.LOADING_TYPES = {
            BUTTON: 'button',
            INPUT: 'input',
            CARD: 'card',
            SECTION: 'section',
            MODAL: 'modal',
            LIST: 'list'
        };
        
        // CSS classes
        this.CSS_CLASSES = {
            LOADING: 'is-loading',
            LOADED: 'is-loaded',
            ERROR: 'has-error',
            SUCCESS: 'has-success',
            DISABLED: 'is-disabled',
            PROCESSING: 'is-processing'
        };
        
        // Default configurations
        this.defaultConfig = {
            showSpinner: true,
            showText: true,
            disableElement: true,
            fadeInDuration: 200,
            fadeOutDuration: 150,
            minLoadingTime: 500
        };
    }

    /**
     * Initialize loading states module
     */
    initialize() {
        try {
            this.addGlobalStyles();
            this.setupExistingLoadingElements();
            this.initialized = true;
            console.log('⏳ LoadingStates initialized');
        } catch (error) {
            console.error('❌ LoadingStates initialization failed:', error);
            throw error;
        }
    }

    /**
     * Add global CSS styles for loading states
     */
    addGlobalStyles() {
        const styleId = 'loading-states-styles';
        
        if (document.getElementById(styleId)) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Loading States Base Styles */
            .is-loading {
                position: relative;
                overflow: hidden;
                pointer-events: none;
            }
            
            .is-disabled {
                pointer-events: none;
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .is-processing {
                cursor: wait;
            }
            
            /* Button Loading States */
            .btn.is-loading {
                color: transparent !important;
            }
            
            .btn.is-loading::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 16px;
                height: 16px;
                margin: -8px 0 0 -8px;
                border: 2px solid currentColor;
                border-radius: 50%;
                border-top-color: transparent;
                animation: spin 1s linear infinite;
            }
            
            /* Input Loading States */
            .is-loading::after {
                content: '';
                position: absolute;
                top: 50%;
                right: 12px;
                width: 16px;
                height: 16px;
                margin-top: -8px;
                border: 2px solid var(--primary-color, #9ab891);
                border-radius: 50%;
                border-top-color: transparent;
                animation: spin 1s linear infinite;
            }
            
            /* Card Loading States */
            .card.is-loading {
                min-height: 200px;
            }
            
            .card.is-loading .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: inherit;
                backdrop-filter: blur(2px);
            }
            
            /* List Loading States */
            .is-loading .skeleton-loader {
                display: block;
            }
            
            /* Modal Loading States */
            .modal.is-loading .modal-content {
                position: relative;
                min-height: 150px;
            }
            
            .modal.is-loading .loading-spinner {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            /* Success and Error States */
            .has-success {
                border-color: #28a745 !important;
                background-color: rgba(40, 167, 69, 0.1) !important;
            }
            
            .has-error {
                border-color: #dc3545 !important;
                background-color: rgba(220, 53, 69, 0.1) !important;
            }
            
            /* Loading Spinner */
            .loading-spinner {
                width: 32px;
                height: 32px;
                border: 3px solid var(--primary-color, #9ab891);
                border-radius: 50%;
                border-top-color: transparent;
                animation: spin 1s linear infinite;
            }
            
            .loading-spinner.small {
                width: 20px;
                height: 20px;
                border-width: 2px;
            }
            
            .loading-spinner.large {
                width: 48px;
                height: 48px;
                border-width: 4px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Skeleton Loader */
            .skeleton-loader {
                background: linear-gradient(90deg, 
                    var(--primary-color, #9ab891) 25%, 
                    rgba(255, 255, 255, 0.1) 50%, 
                    var(--primary-color, #9ab891) 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 4px;
                height: 1em;
                margin: 0.25em 0;
            }
            
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            
            /* Pulse Animation */
            .pulse-animation {
                animation: pulse 2s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            /* Respect reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .loading-spinner,
                .skeleton-loader {
                    animation: none !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Setup existing loading elements in the DOM
     */
    setupExistingLoadingElements() {
        // Find existing loading spinners
        const existingSpinners = document.querySelectorAll('.loading-spinner, [role="status"][aria-live="polite"]');
        existingSpinners.forEach(spinner => {
            this.enhanceSpinner(spinner);
        });
        
        // Find existing skeleton loaders
        const existingSkeletons = document.querySelectorAll('.skeleton-repo-card, .skeleton-card');
        existingSkeletons.forEach(skeleton => {
            this.enhanceSkeletonLoader(skeleton);
        });
    }

    /**
     * Show loading state on button
     */
    showButtonLoading(button, loadingText = 'Loading...', options = {}) {
        const config = { ...this.defaultConfig, ...options };
        const loadingId = this.generateLoadingId();
        
        // Store original state
        this.loadingElements.set(loadingId, {
            element: button,
            originalText: button.textContent,
            originalDisabled: button.disabled,
            type: this.LOADING_TYPES.BUTTON
        });
        
        // Add loading class
        button.classList.add(this.CSS_CLASSES.LOADING);
        
        if (config.disableElement) {
            button.disabled = true;
        }
        
        // Update button content
        if (config.showSpinner || config.showText) {
            const content = [];
            
            if (config.showSpinner) {
                content.push('<span class="loading-spinner small"></span>');
            }
            
            if (config.showText) {
                content.push(`<span class="loading-text">${loadingText}</span>`);
            }
            
            button.innerHTML = content.join(' ');
        }
        
        // Animate in
        this.fadeIn(button, config.fadeInDuration);
        
        // Set minimum loading time
        if (config.minLoadingTime > 0) {
            setTimeout(() => {
                this.minLoadingTimes.delete(loadingId);
            }, config.minLoadingTime);
            
            this.minLoadingTimes = this.minLoadingTimes || new Map();
            this.minLoadingTimes.set(loadingId, true);
        }
        
        return loadingId;
    }

    /**
     * Hide loading state on button
     */
    hideButtonLoading(loadingId, options = {}) {
        const loadingData = this.loadingElements.get(loadingId);
        
        if (!loadingData || loadingData.type !== this.LOADING_TYPES.BUTTON) {
            return false;
        }
        
        const { button, originalText, originalDisabled } = loadingData;
        const config = { ...this.defaultConfig, ...options };
        
        // Check minimum loading time
        if (this.minLoadingTimes?.has(loadingId)) {
            return false; // Can't hide yet
        }
        
        // Remove loading class
        button.classList.remove(this.CSS_CLASSES.LOADING);
        
        // Restore original state
        button.disabled = originalDisabled;
        button.textContent = originalText;
        
        // Animate out
        this.fadeOut(button, config.fadeOutDuration);
        
        // Clean up
        this.loadingElements.delete(loadingId);
        
        return true;
    }

    /**
     * Show loading state on input field
     */
    showInputLoading(input, options = {}) {
        const config = { ...this.defaultConfig, ...options };
        const loadingId = this.generateLoadingId();
        
        // Store original state
        this.loadingElements.set(loadingId, {
            element: input,
            originalPlaceholder: input.placeholder,
            originalDisabled: input.disabled,
            type: this.LOADING_TYPES.INPUT
        });
        
        // Add loading classes
        input.classList.add(this.CSS_CLASSES.LOADING);
        input.classList.add(this.CSS_CLASSES.PROCESSING);
        
        if (config.disableElement) {
            input.disabled = true;
        }
        
        // Add loading indicator
        if (config.showSpinner) {
            const wrapper = document.createElement('div');
            wrapper.className = 'input-loading-wrapper';
            wrapper.style.cssText = 'position: relative;';
            
            // Clone input wrapper
            const inputWrapper = input.parentElement;
            if (inputWrapper) {
                inputWrapper.appendChild(wrapper);
                wrapper.appendChild(input);
            }
            
            // Add spinner
            const spinner = this.createSpinner('small');
            spinner.style.cssText = `
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
            `;
            
            wrapper.appendChild(spinner);
        }
        
        return loadingId;
    }

    /**
     * Hide loading state on input field
     */
    hideInputLoading(loadingId) {
        const loadingData = this.loadingElements.get(loadingId);
        
        if (!loadingData || loadingData.type !== this.LOADING_TYPES.INPUT) {
            return false;
        }
        
        const { input, originalPlaceholder, originalDisabled } = loadingData;
        
        // Remove loading classes
        input.classList.remove(this.CSS_CLASSES.LOADING);
        input.classList.remove(this.CSS_CLASSES.PROCESSING);
        
        // Restore original state
        input.disabled = originalDisabled;
        input.placeholder = originalPlaceholder;
        
        // Remove loading wrapper
        const wrapper = input.closest('.input-loading-wrapper');
        if (wrapper) {
            const parent = wrapper.parentElement;
            if (parent) {
                parent.insertBefore(input, wrapper);
                wrapper.remove();
            }
        }
        
        // Clean up
        this.loadingElements.delete(loadingId);
        
        return true;
    }

    /**
     * Show loading state on card
     */
    showCardLoading(card, options = {}) {
        const config = { ...this.defaultConfig, ...options };
        const loadingId = this.generateLoadingId();
        
        // Store original state
        this.loadingElements.set(loadingId, {
            element: card,
            originalContent: card.innerHTML,
            type: this.LOADING_TYPES.CARD
        });
        
        // Add loading class
        card.classList.add(this.CSS_CLASSES.LOADING);
        
        if (config.showSpinner) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading...</div>
            `;
            
            card.style.position = 'relative';
            card.appendChild(overlay);
        }
        
        return loadingId;
    }

    /**
     * Hide loading state on card
     */
    hideCardLoading(loadingId) {
        const loadingData = this.loadingElements.get(loadingId);
        
        if (!loadingData || loadingData.type !== this.LOADING_TYPES.CARD) {
            return false;
        }
        
        const { card, originalContent } = loadingData;
        
        // Remove loading overlay
        const overlay = card.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Remove loading class
        card.classList.remove(this.CSS_CLASSES.LOADING);
        
        // Clean up
        this.loadingElements.delete(loadingId);
        
        return true;
    }

    /**
     * Show loading state on list
     */
    showListLoading(listContainer, itemCount = 3, options = {}) {
        const config = { ...this.defaultConfig, ...options };
        const loadingId = this.generateLoadingId();
        
        // Store original state
        this.loadingElements.set(loadingId, {
            element: listContainer,
            originalContent: listContainer.innerHTML,
            type: this.LOADING_TYPES.LIST
        });
        
        // Add loading class
        listContainer.classList.add(this.CSS_CLASSES.LOADING);
        
        if (config.showSpinner) {
            const skeletonItems = Array.from({ length: itemCount }, () => 
                this.createSkeletonItem()
            );
            
            listContainer.innerHTML = skeletonItems.join('');
        }
        
        return loadingId;
    }

    /**
     * Hide loading state on list
     */
    hideListLoading(loadingId, newContent = null) {
        const loadingData = this.loadingElements.get(loadingId);
        
        if (!loadingData || loadingData.type !== this.LOADING_TYPES.LIST) {
            return false;
        }
        
        const { listContainer, originalContent } = loadingData;
        
        // Remove loading class
        listContainer.classList.remove(this.CSS_CLASSES.LOADING);
        
        // Restore or update content
        if (newContent !== null) {
            listContainer.innerHTML = newContent;
        } else {
            listContainer.innerHTML = originalContent;
        }
        
        // Clean up
        this.loadingElements.delete(loadingId);
        
        return true;
    }

    /**
     * Create skeleton item for lists
     */
    createSkeletonItem() {
        return `
            <div class="skeleton-loader">
                <div class="skeleton-loader" style="width: 60%;"></div>
                <div class="skeleton-loader" style="width: 100%;"></div>
                <div class="skeleton-loader" style="width: 80%;"></div>
            </div>
        `;
    }

    /**
     * Create loading spinner
     */
    createSpinner(size = '') {
        const spinner = document.createElement('div');
        spinner.className = `loading-spinner ${size}`.trim();
        return spinner;
    }

    /**
     * Enhance existing spinner
     */
    enhanceSpinner(spinner) {
        if (!spinner.classList.contains('loading-spinner')) {
            spinner.classList.add('loading-spinner');
        }
        
        // Add aria attributes if missing
        if (!spinner.getAttribute('role')) {
            spinner.setAttribute('role', 'status');
        }
        
        if (!spinner.getAttribute('aria-live')) {
            spinner.setAttribute('aria-live', 'polite');
        }
        
        // CRITICAL: Ensure spinner animations are immune to pause controls
        this.protectSpinnerAnimations(spinner);
    }

    /**
     * Protect spinner animations from being paused by animation controls
     */
    protectSpinnerAnimations(spinner) {
        // Add data attribute for CSS protection
        spinner.setAttribute('data-loading-essential', 'true');
        
        // Force animation to run regardless of global animation state
        spinner.style.setProperty('animation-play-state', 'running', 'important');
        
        // Override any future attempts to pause this animation
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || 
                     mutation.attributeName === 'class')) {
                    // Re-force running state if it gets changed
                    if (spinner.style.animationPlayState === 'paused') {
                        spinner.style.setProperty('animation-play-state', 'running', 'important');
                    }
                }
            });
        });
        
        observer.observe(spinner, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // Store observer for cleanup
        spinner._animationObserver = observer;
    }

    /**
     * Protect loading animations from being paused
     */
    protectLoadingAnimations(spinner) {
        if (!spinner) return;
        
        // Force animation state with higher specificity
        spinner.style.setProperty('animation-play-state', 'running', 'important');
        
        // Create observer to maintain animation state
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'style') {
                    spinner.style.setProperty('animation-play-state', 'running', 'important');
                }
            });
        });
        
        observer.observe(spinner, { attributes: true, attributeFilter: ['style'] });
        return observer;
    }

    /**
     * Enhance skeleton loader
     */
    enhanceSkeletonLoader(skeleton) {
        if (!skeleton.classList.contains('skeleton-loader')) {
            skeleton.classList.add('skeleton-loader');
        }
        
        // Add accessibility attributes
        if (!skeleton.getAttribute('aria-hidden')) {
            skeleton.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Show success state
     */
    showSuccess(element, message = null) {
        element.classList.add(this.CSS_CLASSES.SUCCESS);
        element.classList.remove(this.CSS_CLASSES.ERROR);
        
        if (message) {
            this.showToast(message, 'success');
        }
        
        setTimeout(() => {
            element.classList.remove(this.CSS_CLASSES.SUCCESS);
        }, 3000);
    }

    /**
     * Show error state
     */
    showError(element, message = null) {
        element.classList.add(this.CSS_CLASSES.ERROR);
        element.classList.remove(this.CSS_CLASSES.SUCCESS);
        
        if (message) {
            this.showToast(message, 'error');
        }
        
        // Auto-remove error state after 5 seconds
        setTimeout(() => {
            element.classList.remove(this.CSS_CLASSES.ERROR);
        }, 5000);
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 4000) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = message;
        
        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: #28a745;' : ''}
            ${type === 'error' ? 'background: #dc3545;' : ''}
            ${type === 'info' ? 'background: var(--primary-color, #9ab891);' : ''}
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }

    /**
     * Fade in element
     */
    fadeIn(element, duration = 200) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 50);
    }

    /**
     * Fade out element
     */
    fadeOut(element, duration = 200) {
        element.style.transition = `opacity ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '0';
        }, 50);
    }

    /**
     * Generate unique loading ID
     */
    generateLoadingId() {
        return `loading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get loading statistics
     */
    getLoadingStats() {
        const activeLoading = Array.from(this.loadingElements.values());
        
        return {
            totalActive: this.loadingElements.size,
            byType: {
                button: activeLoading.filter(l => l.type === this.LOADING_TYPES.BUTTON).length,
                input: activeLoading.filter(l => l.type === this.LOADING_TYPES.INPUT).length,
                card: activeLoading.filter(l => l.type === this.LOADING_TYPES.CARD).length,
                section: activeLoading.filter(l => l.type === this.LOADING_TYPES.SECTION).length,
                modal: activeLoading.filter(l => l.type === this.LOADING_TYPES.MODAL).length,
                list: activeLoading.filter(l => l.type === this.LOADING_TYPES.LIST).length
            }
        };
    }

    /**
     * Clear all loading states
     */
    clearAllLoadingStates() {
        this.loadingElements.forEach((loadingData, id) => {
            const { type, element } = loadingData;
            
            switch (type) {
                case this.LOADING_TYPES.BUTTON:
                    this.hideButtonLoading(id);
                    break;
                case this.LOADING_TYPES.INPUT:
                    this.hideInputLoading(id);
                    break;
                case this.LOADING_TYPES.CARD:
                    this.hideCardLoading(id);
                    break;
                case this.LOADING_TYPES.LIST:
                    this.hideListLoading(id);
                    break;
            }
        });
        
        this.loadingElements.clear();
        console.log('🧹 All loading states cleared');
    }

    /**
     * Cleanup
     */
    destroy() {
        this.clearAllLoadingStates();
        
        // Clean up animation observers
        const spinners = document.querySelectorAll('[data-loading-essential="true"]');
        spinners.forEach(spinner => {
            if (spinner._animationObserver) {
                spinner._animationObserver.disconnect();
                spinner._animationObserver = null;
            }
        });
        
        // Remove global styles
        const style = document.getElementById('loading-states-styles');
        if (style) {
            style.remove();
        }
        
        this.initialized = false;
        
        console.log('🧹 LoadingStates destroyed');
    }
}