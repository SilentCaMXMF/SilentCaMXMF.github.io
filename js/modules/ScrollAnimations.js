/**
 * ScrollAnimations Module
 * Implements smooth scroll-triggered animations using Intersection Observer
 * 
 * @example
 * const scrollAnimations = new ScrollAnimations();
 * await scrollAnimations.initialize();
 * 
 * // Animate sections on scroll
 * scrollAnimations.observeSection(document.getElementById('about-section'));
 */

export class ScrollAnimations {
    constructor(preferenceManager = null) {
        this.observer = null;
        this.animatedElements = new Set();
        this.initialized = false;
        
        // PreferenceManager integration
        this.preferenceManager = preferenceManager;
        this.animationsEnabled = true;
        
        // Animation configurations
        this.animationTypes = {
            FADE_IN_UP: 'fadeInUp',
            FADE_IN_DOWN: 'fadeInDown',
            FADE_IN_LEFT: 'fadeInLeft',
            FADE_IN_RIGHT: 'fadeInRight',
            SLIDE_IN_UP: 'slideInUp',
            SLIDE_IN_DOWN: 'slideInDown',
            SCALE_IN: 'scaleIn',
            REVEAL: 'reveal'
        };
        
        // Default animation settings
        this.defaultSettings = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
            duration: 800,
            delay: 0,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            stagger: 0
        };
    }

    /**
     * Initialize scroll animations
     */
    initialize() {
        try {
            this.loadAnimationPreference();
            this.setupPreferenceListeners();
            this.createIntersectionObserver();
            this.observeSections();
            this.addDynamicStyles();
            this.initialized = true;
            console.log('🎬 ScrollAnimations initialized');
        } catch (error) {
            console.error('❌ ScrollAnimations initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load animation preference
     */
    loadAnimationPreference() {
        if (this.preferenceManager) {
            this.animationsEnabled = this.preferenceManager.get('animations');
            
            // Check reduced motion preference
            const reducedMotion = this.preferenceManager.get('reducedMotion');
            if (reducedMotion) {
                this.animationsEnabled = false;
            }
        } else {
            // Check system reduced motion preference
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.animationsEnabled = false;
            }
        }
    }

    /**
     * Setup preference change listeners
     */
    setupPreferenceListeners() {
        if (!this.preferenceManager) {
            return;
        }
        
        this.preferenceManager.on('animations', (enabled) => {
            this.animationsEnabled = enabled;
            if (enabled) {
                this.enableAnimations();
            } else {
                this.disableAnimations();
            }
        });
        
        this.preferenceManager.on('reducedMotion', (reduced) => {
            if (reduced) {
                this.animationsEnabled = false;
                this.disableAnimations();
            } else {
                this.animationsEnabled = this.preferenceManager.get('animations');
                if (this.animationsEnabled) {
                    this.enableAnimations();
                }
            }
        });
    }

    /**
     * Create Intersection Observer
     */
    createIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, {
            threshold: [0, 0.1, 0.5, 1],
            rootMargin: this.defaultSettings.rootMargin
        });
    }

    /**
     * Observe all main sections
     */
    observeSections() {
        const sections = document.querySelectorAll('section[id]');
        sections.forEach((section, index) => {
            // Skip the first section (already visible)
            if (index > 0) {
                this.observeSection(section, {
                    animation: this.animationTypes.FADE_IN_UP,
                    delay: index * 100, // Stagger effect
                    duration: 1000
                });
            }
        });
        
        console.log(`👁️ Set up scroll animations for ${sections.length} sections`);
    }

    /**
     * Observe a specific element for animation
     */
    observeSection(element, options = {}) {
        if (!element || !this.observer) {
            return false;
        }

        const settings = { ...this.defaultSettings, ...options };
        
        // Store animation data
        element.dataset.scrollAnimation = settings.animation;
        element.dataset.animationDuration = settings.duration;
        element.dataset.animationDelay = settings.delay;
        
        // Add initial state
        this.addInitialState(element);
        
        // Start observing
        this.observer.observe(element);
        this.animatedElements.add(element);
        
        return true;
    }

    /**
     * Add initial state to element before animation
     */
    addInitialState(element) {
        // Don't hide elements if animations are disabled
        if (!this.animationsEnabled) {
            return;
        }
        
        const animation = element.dataset.scrollAnimation;
        
        // Set initial transform and opacity based on animation type
        switch (animation) {
            case this.animationTypes.FADE_IN_UP:
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                break;
            case this.animationTypes.FADE_IN_DOWN:
                element.style.opacity = '0';
                element.style.transform = 'translateY(-30px)';
                break;
            case this.animationTypes.FADE_IN_LEFT:
                element.style.opacity = '0';
                element.style.transform = 'translateX(30px)';
                break;
            case this.animationTypes.FADE_IN_RIGHT:
                element.style.opacity = '0';
                element.style.transform = 'translateX(-30px)';
                break;
            case this.animationTypes.SLIDE_IN_UP:
                element.style.opacity = '0';
                element.style.transform = 'translateY(50px)';
                break;
            case this.animationTypes.SLIDE_IN_DOWN:
                element.style.opacity = '0';
                element.style.transform = 'translateY(-50px)';
                break;
            case this.animationTypes.SCALE_IN:
                element.style.opacity = '0';
                element.style.transform = 'scale(0.8)';
                break;
            case this.animationTypes.REVEAL:
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                element.style.clipPath = 'inset(0 0 100% 0)';
                break;
        }
        
        // Add transition properties
        element.style.transition = `none`; // Disabled initially
    }

    /**
     * Animate element when it comes into view
     */
    animateElement(element) {
        if (!this.animationsEnabled) {
            // Skip animation if disabled
            element.style.opacity = '1';
            element.style.transform = 'none';
            element.style.clipPath = 'none';
            this.animatedElements.delete(element);
            this.observer.unobserve(element);
            return;
        }
        
        if (this.animatedElements.has(element)) {
            this.animatedElements.delete(element);
        } else {
            return; // Already animated
        }

        const animation = element.dataset.scrollAnimation;
        const duration = parseInt(element.dataset.animationDelay) || this.defaultSettings.duration;
        const delay = parseInt(element.dataset.animationDelay) || this.defaultSettings.delay;
        
        // Enable transitions
        element.style.transition = `
            opacity ${duration}ms ${this.defaultSettings.easing} ${delay}ms,
            transform ${duration}ms ${this.defaultSettings.easing} ${delay}ms
        `;
        
        // Special handling for reveal animation
        if (animation === this.animationTypes.REVEAL) {
            element.style.clipPath = 'inset(0 0 0 0)';
            setTimeout(() => {
                element.style.clipPath = '';
                element.style.transition = '';
            }, duration + delay);
        } else {
            // Animate to final state
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0) translateX(0) scale(1)';
                
                // Clean up after animation
                setTimeout(() => {
                    element.style.transition = '';
                }, duration + delay);
            }, 50); // Small delay to ensure transition is applied
        }
        
        // Add animation class for styling
        element.classList.add('scroll-animated');
        element.classList.add(`scroll-${animation}`);
        
        // Dispatch animation event
        this.dispatchAnimationEvent(element, animation);
        
        // Stop observing this element
        this.observer.unobserve(element);
    }

    /**
     * Add dynamic CSS styles for animations
     */
    addDynamicStyles() {
        const styleId = 'scroll-animations-styles';
        
        if (document.getElementById(styleId)) {
            return; // Styles already added
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Scroll Animation Base Styles */
            .scroll-animated {
                will-change: opacity, transform;
                backface-visibility: hidden;
                perspective: 1000px;
            }
            
            /* Fade In Up */
            .scroll-fadeInUp {
                transform-origin: center bottom;
            }
            
            /* Fade In Down */
            .scroll-fadeInDown {
                transform-origin: center top;
            }
            
            /* Fade In Left */
            .scroll-fadeInLeft {
                transform-origin: right center;
            }
            
            /* Fade In Right */
            .scroll-fadeInRight {
                transform-origin: left center;
            }
            
            /* Slide In Up */
            .scroll-slideInUp {
                transform-origin: center bottom;
            }
            
            /* Slide In Down */
            .scroll-slideInDown {
                transform-origin: center top;
            }
            
            /* Scale In */
            .scroll-scaleIn {
                transform-origin: center center;
            }
            
            /* Reveal */
            .scroll-reveal {
                transform-origin: center center;
            }
            
            /* Respect reduced motion preference */
            @media (prefers-reduced-motion: reduce) {
                .scroll-animated {
                    transition: none !important;
                    animation: none !important;
                    opacity: 1 !important;
                    transform: none !important;
                    clip-path: none !important;
                }
            }
            
            /* Enhanced contrast for accessibility */
            @media (prefers-contrast: high) {
                .scroll-animated {
                    filter: contrast(1.2);
                }
            }
            
            /* Performance optimization */
            .scroll-animated {
                contain: layout style paint;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Animate skill bars when visible
     */
    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-bar[role="progressbar"]');
        
        skillBars.forEach((bar, index) => {
            // Skip animation setup if animations are disabled
            if (!this.animationsEnabled) {
                return;
            }
            
            this.observeSection(bar, {
                animation: this.animationTypes.REVEAL,
                duration: 1500,
                delay: 200 + (index * 100)
            });
            
            // Add custom skill bar animation
            const skillLevel = bar.querySelector('.skill-level');
            if (skillLevel) {
                const finalWidth = skillLevel.style.width;
                
                // Set initial state
                if (this.animationsEnabled) {
                    skillLevel.style.transform = 'scaleX(0)';
                    skillLevel.style.width = '100%';
                    
                    // Animate when visible
                    setTimeout(() => {
                        skillLevel.style.transform = 'scaleX(1)';
                    }, 200 + (index * 100));
                } else {
                    skillLevel.style.transform = 'scaleX(1)';
                }
            }
        });
    }

    /**
     * Animate timeline items
     */
    animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item[role="listitem"]');
        
        timelineItems.forEach((item, index) => {
            this.observeSection(item, {
                animation: this.animationTypes.FADE_IN_LEFT,
                delay: index * 150,
                duration: 800
            });
        });
    }

    /**
     * Animate featured project
     */
    animateFeaturedProject(element) {
        return this.observeSection(element, {
            animation: this.animationTypes.SCALE_IN,
            duration: 600,
            delay: 0
        });
    }

    /**
     * Animate repo cards with stagger
     */
    animateRepoCards(container) {
        const cards = container.querySelectorAll('.repo-card');
        
        cards.forEach((card, index) => {
            this.observeSection(card, {
                animation: this.animationTypes.FADE_IN_UP,
                delay: index * 100,
                duration: 500
            });
        });
    }

    /**
     * Dispatch custom animation event
     */
    dispatchAnimationEvent(element, animationType) {
        const event = new CustomEvent('scrollelementanimated', {
            detail: {
                element,
                animationType,
                timestamp: Date.now()
            },
            bubbles: true,
            cancelable: true
        });
        
        element.dispatchEvent(event);
    }

    /**
     * Add new animation type
     */
    addAnimationType(name, config) {
        this.animationTypes[name] = config;
    }

    /**
     * Get available animation types
     */
    getAnimationTypes() {
        return { ...this.animationTypes };
    }

    /**
     * Update animation settings
     */
    updateSettings(newSettings) {
        this.defaultSettings = { ...this.defaultSettings, ...newSettings };
        
        // Re-observe elements with new settings
        if (this.initialized) {
            this.resetAnimations();
        }
    }

    /**
     * Reset all animations
     */
    resetAnimations() {
        // Clear current observations
        if (this.observer) {
            this.animatedElements.forEach(element => {
                this.observer.unobserve(element);
            });
        }
        
        // Clear animations
        this.animatedElements.clear();
        
        // Re-initialize
        if (this.initialized) {
            this.observeSections();
        }
    }

    /**
     * Disable animations
     */
    disableAnimations() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Reset all animated elements to final state
        document.querySelectorAll('.scroll-animated').forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'none';
            element.style.transition = 'none';
            element.style.clipPath = 'none';
            element.classList.remove('scroll-animated');
        });
        
        console.log('⏸️ Scroll animations disabled');
    }

    /**
     * Enable animations
     */
    enableAnimations() {
        if (!this.observer) {
            this.createIntersectionObserver();
        }
        
        this.resetAnimations();
        console.log('▶️ Scroll animations enabled');
    }

    /**
     * Get animation statistics
     */
    getAnimationStats() {
        return {
            totalAnimated: this.animatedElements.size,
            animationTypes: Object.keys(this.animationTypes).length,
            supportedAnimations: this.getAnimationTypes(),
            settings: { ...this.defaultSettings }
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        this.animatedElements.clear();
        this.initialized = false;
        
        // Remove dynamic styles
        const style = document.getElementById('scroll-animations-styles');
        if (style) {
            style.remove();
        }
        
        console.log('🧹 ScrollAnimations destroyed');
    }
}