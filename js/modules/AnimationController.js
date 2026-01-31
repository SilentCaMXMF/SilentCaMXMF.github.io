/**
 * AnimationController Module
 * Controls animations, micro-interactions, and animation preferences
 * Integrated with PreferenceManager for unified preference management
 */

export class AnimationController {
    constructor(preferenceManager = null) {
        this.animationToggle = null;
        this.animationIcon = null;
        this.isPaused = false;
        this.initialized = false;
        
        // PreferenceManager integration
        this.preferenceManager = preferenceManager;
        
        // Legacy localStorage key for backward compatibility
        this.storageKey = 'portfolio-animations-enabled';
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // CSS custom properties for animation control
        this.animationProperties = [
            'animation-duration',
            'transition-duration',
            'animation-iteration-count'
        ];
    }

    /**
     * Initialize animation controller
     */
    initialize() {
        try {
            this.cacheElements();
            this.bindEvents();
            this.loadAnimationPreference();
            this.setupPreferenceListeners();
            this.setupReducedMotionListener();
            this.initialized = true;
            console.log('🎬 AnimationController initialized');
        } catch (error) {
            console.error('❌ AnimationController initialization failed:', error);
            throw error;
        }
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.animationToggle = document.getElementById('animation-toggle');
        this.animationIcon = this.animationToggle?.querySelector('i');
        
        if (!this.animationToggle || !this.animationIcon) {
            throw new Error('Animation toggle elements not found');
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.animationToggle.addEventListener('click', () => this.toggleAnimations());
    }

    /**
     * Load saved animation preference
     */
    loadAnimationPreference() {
        let savedPreference;
        let animationsEnabled = true; // Default to enabled
        let shouldPause = false;
        
        if (this.preferenceManager) {
            // Get from PreferenceManager
            animationsEnabled = this.preferenceManager.get('animations');
            const reducedMotion = this.preferenceManager.get('reducedMotion');
            
            // Respect reduced motion preference
            if (reducedMotion) {
                shouldPause = true;
            }
            
            savedPreference = animationsEnabled;
        } else {
            // Fallback to localStorage for backward compatibility
            savedPreference = localStorage.getItem(this.storageKey);
            
            // Default to enabled if not explicitly set
            animationsEnabled = savedPreference !== 'false' && savedPreference !== false;
        }
        
        // Respect system reduced motion preference
        if (this.prefersReducedMotion) {
            shouldPause = true;
        }
        
        // CRITICAL: Delay animation control to allow loading states to initialize
        setTimeout(() => {
            // Pause animations if reduced motion is preferred
            if (shouldPause) {
                this.pauseAnimations();
                return;
            }
            
            // Apply animation preference (default to enabled)
            if (animationsEnabled !== false) {
                this.resumeAnimations();
            } else {
                this.pauseAnimations();
            }
        }, 100); // Small delay to let LoadingStates enhance spinners first
    }

    /**
     * Setup preference change listeners
     */
    setupPreferenceListeners() {
        if (!this.preferenceManager) {
            return;
        }
        
        // Listen for animation preference changes
        this.preferenceManager.on('animations', (enabled) => {
            if (enabled) {
                this.resumeAnimations();
            } else {
                this.pauseAnimations();
            }
        });
        
        // Listen for reduced motion preference changes
        this.preferenceManager.on('reducedMotion', (reduced) => {
            if (reduced) {
                this.pauseAnimations();
                this.showReducedMotionNotice();
            } else {
                // Re-apply animation preference
                const animationsEnabled = this.preferenceManager.get('animations');
                if (animationsEnabled) {
                    this.resumeAnimations();
                }
            }
        });
    }

    /**
     * Setup reduced motion listener
     */
    setupReducedMotionListener() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', (e) => {
            if (e.matches) {
                this.pauseAnimations();
                this.showReducedMotionNotice();
            } else {
                this.loadAnimationPreference();
            }
        });
    }

    /**
     * Toggle animations on/off
     */
    toggleAnimations() {
        const newPausedState = !this.isPaused;
        
        if (newPausedState) {
            this.pauseAnimations();
        } else {
            this.resumeAnimations();
        }
        
        const enabled = !newPausedState;
        this.saveAnimationPreference(enabled);
        this.announceAnimationChange(enabled);
    }

    /**
     * Pause all animations
     */
    pauseAnimations() {
        try {
            // Add specific CSS class for pausing non-essential animations only
            document.documentElement.classList.add('animations-paused-non-essential');
            
            // Update CSS custom properties
            this.setAnimationSpeed(0);
            
            // Update button state
            this.updateToggleButton(true);
            
            this.isPaused = true;
            
            // Pause CSS animations
            this.pauseCSSAnimations();
            
            console.log('⏸️ Animations paused');
            
        } catch (error) {
            console.error('❌ Error pausing animations:', error);
        }
    }

    /**
     * Resume all animations
     */
    resumeAnimations() {
        try {
            // Remove CSS class for animation control
            document.documentElement.classList.remove('animations-paused-non-essential');
            
            // Reset CSS custom properties
            this.setAnimationSpeed(1);
            
            // Update button state
            this.updateToggleButton(false);
            
            this.isPaused = false;
            
            // Resume CSS animations
            this.resumeCSSAnimations();
            
            console.log('▶️ Animations resumed');
            
        } catch (error) {
            console.error('❌ Error resuming animations:', error);
        }
    }

    /**
     * Set animation speed
     */
    setAnimationSpeed(speed) {
        const root = document.documentElement;
        
        this.animationProperties.forEach(property => {
            root.style.setProperty(`--${property}`, speed === 0 ? '0s' : '');
        });
    }

    /**
     * Update toggle button state
     */
    updateToggleButton(isPaused) {
        if (this.animationToggle) {
            // Update aria-pressed
            this.animationToggle.setAttribute('aria-pressed', isPaused);
            
            // Update aria-label
            this.animationToggle.setAttribute('aria-label', 
                isPaused ? 'Resume animations' : 'Pause animations');
            
            // Update icon
            if (this.animationIcon) {
                this.animationIcon.className = isPaused ? 'fas fa-play' : 'fas fa-pause';
            }
        }
    }

    /**
     * Pause all CSS animations (except loading spinners)
     */
    pauseCSSAnimations() {
        const animatedElements = document.querySelectorAll('*');
        
        animatedElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const animationName = computedStyle.animationName;
            
            // Skip loading indicators - these should always animate
            const isLoadingElement = element.classList.contains('spinner-border') || 
                                    element.classList.contains('loading-spinner') ||
                                    element.getAttribute('role') === 'status';
            if (isLoadingElement) return;
            
            // Skip loading spinners and essential loading elements
            if (animationName && animationName !== 'none') {
                // Don't pause loading-related animations
                const isLoadingElement = 
                    element.classList.contains('spinner-border') ||
                    element.classList.contains('loading-spinner') ||
                    element.classList.contains('loading-spinner-enhanced') ||
                    element.classList.contains('skeleton-loader') ||
                    element.classList.contains('skeleton') ||
                    element.getAttribute('role') === 'status' ||
                    element.getAttribute('aria-live') === 'polite' ||
                    element.closest('.loading-spinner') ||
                    element.closest('[role="status"]');
                
                if (!isLoadingElement) {
                    element.style.animationPlayState = 'paused';
                }
            }
        });
    }

    /**
     * Resume all CSS animations
     */
    resumeCSSAnimations() {
        const animatedElements = document.querySelectorAll('*');
        
        animatedElements.forEach(element => {
            // Clear any inline animation-play-state to let CSS take over
            if (element.style.animationPlayState) {
                element.style.animationPlayState = '';
            }
        });
    }

    /**
     * Save animation preference
     */
    saveAnimationPreference(enabled) {
        if (this.preferenceManager) {
            this.preferenceManager.set('animations', enabled);
        } else {
            // Fallback to localStorage for backward compatibility
            localStorage.setItem(this.storageKey, enabled.toString());
        }
    }

    /**
     * Announce animation change to screen readers
     */
    announceAnimationChange(enabled) {
        const message = enabled ? 'Animations resumed' : 'Animations paused';
        
        // Create or update live region
        let liveRegion = document.getElementById('animation-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'animation-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }

    /**
     * Show reduced motion notice
     */
    showReducedMotionNotice() {
        const notice = document.createElement('div');
        notice.className = 'reduced-motion-notice';
        notice.innerHTML = `
            <div class="notice-content">
                <h3>♿ Animations Disabled</h3>
                <p>Animations have been disabled based on your system preferences for reduced motion.</p>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
                    Got it
                </button>
            </div>
        `;
        
        // Add styles for notice
        notice.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--dark-bg, #2c2c2c);
            color: var(--light-text, #fff);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 300px;
        `;
        
        document.body.appendChild(notice);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (notice.parentElement) {
                notice.remove();
            }
        }, 5000);
    }

    /**
     * Check if animations are paused
     */
    areAnimationsPaused() {
        return this.isPaused;
    }

    /**
     * Check if reduced motion is preferred
     */
    prefersReducedMotion() {
        return this.prefersReducedMotion;
    }

    /**
     * Get animation statistics
     */
    getAnimationStats() {
        const animatedElements = document.querySelectorAll('[class*="animate"], [class*="fade"], [class*="slide"]');
        
        return {
            isPaused: this.isPaused,
            prefersReducedMotion: this.prefersReducedMotion,
            animatedElementsCount: animatedElements.length,
            totalAnimations: this.countCSSAnimations()
        };
    }

    /**
     * Count CSS animations on the page
     */
    countCSSAnimations() {
        const stylesheets = Array.from(document.styleSheets);
        let animationCount = 0;
        
        try {
            stylesheets.forEach(stylesheet => {
                const rules = Array.from(stylesheet.cssRules || []);
                rules.forEach(rule => {
                    if (rule.style && rule.style.animationName && rule.style.animationName !== 'none') {
                        animationCount++;
                    }
                });
            });
        } catch (error) {
            // Cross-origin stylesheets may throw errors
        }
        
        return animationCount;
    }

    /**
     * Add new animation to element
     */
    addAnimation(element, animationName, options = {}) {
        if (!element || !animationName) {
            return false;
        }
        
        const {
            duration = '0.3s',
            delay = '0s',
            iterationCount = '1',
            direction = 'normal',
            fillMode = 'both'
        } = options;
        
        element.style.animation = `${animationName} ${duration} ${delay} ${iterationCount} ${direction} ${fillMode}`;
        
        return true;
    }

    /**
     * Remove animation from element
     */
    removeAnimation(element) {
        if (element) {
            element.style.animation = '';
            return true;
        }
        return false;
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.animationToggle) {
            this.animationToggle.removeEventListener('click', this.toggleAnimations);
        }
        
        // Resume animations before destroying
        this.resumeAnimations();
        
        this.animationToggle = null;
        this.animationIcon = null;
        this.initialized = false;
        
        console.log('🧹 AnimationController destroyed');
    }
}