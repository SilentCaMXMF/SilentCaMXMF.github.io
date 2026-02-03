/**
 * @file Micro-interactions Module
 * @description Enhanced micro-interactions for portfolio with accessibility and performance optimization
 * @version 2.0.0
 * @author Portfolio Development Team
 */

export class MicroInteractions {
    constructor(preferenceManager = null) {
        this.initialized = false;
        this.observer = null;
        this.rippleElements = new Set();
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.animationEnabled = !this.prefersReducedMotion.matches;
        this.preferenceManager = preferenceManager;
        
        // Animation queue for performance
        this.animationQueue = [];
        this.isProcessingQueue = false;
        
        // Performance tracking
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // Interaction states
        this.hoverStates = new Map();
        this.focusStates = new Set();
        
        // Bind methods
        this.createRipple = this.createRipple.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.observeElements = this.observeElements.bind(this);
        this.processAnimationQueue = this.processAnimationQueue.bind(this);
        
        // Listen for motion preference changes
        this.prefersReducedMotion.addEventListener('change', (e) => {
            this.animationEnabled = !e.matches;
            if (this.animationEnabled) {
                this.enableAnimations();
            } else {
                this.disableAnimations();
            }
        });
    }

    /**
     * Initialize all micro-interactions
     */
    async initialize() {
        try {
            console.log('🎬 Initializing micro-interactions...');
            
            // Initialize performance monitoring
            this.initPerformanceMonitoring();
            
            // Initialize ripple effects with enhanced feedback
            this.initRippleEffects();
            
            // Initialize enhanced hover states
            this.initEnhancedHoverStates();
            
            // Initialize scroll animations with intersection observer
            this.initScrollAnimations();
            
            // Initialize back to top with progress indicator
            this.initBackToTop();
            
            // Initialize enhanced theme toggle with transitions
            this.initThemeToggle();
            
            // Initialize skill bar animations with stagger effects
            this.initSkillBarAnimations();
            
            // Initialize timeline animations with cascade effect
            this.initTimelineAnimations();
            
            // Initialize loading enhancements with skeleton states
            this.initLoadingEnhancements();
            
            // Initialize form interactions with validation feedback
            this.initFormInteractions();
            
            // Initialize keyboard navigation enhancements
            this.initKeyboardEnhancements();
            
            // Initialize focus management for accessibility
            this.initFocusManagement();
            
            // Initialize mobile menu animations
            this.initMobileMenuAnimations();
            
            // Initialize toast notification system
            this.initToastNotifications();
            
            this.initialized = true;
            console.log('✅ Micro-interactions initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize micro-interactions:', error);
        }
    }

    /**
     * Initialize performance monitoring for animations
     */
    initPerformanceMonitoring() {
        // Monitor frame rate for animation performance
        let lastTime = performance.now();
        let frames = 0;
        
        const checkPerformance = (currentTime) => {
            frames++;
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                
                // Reduce animation complexity if FPS drops below 30
                if (fps < 30 && this.animationEnabled) {
                    console.warn(`Low FPS detected: ${fps}. Reducing animation complexity.`);
                    this.reduceAnimationComplexity();
                }
                
                frames = 0;
                lastTime = currentTime;
            }
            
            if (this.animationEnabled) {
                requestAnimationFrame(checkPerformance);
            }
        };
        
        if (this.animationEnabled) {
            requestAnimationFrame(checkPerformance);
        }
    }

    /**
     * Reduce animation complexity for performance
     */
    reduceAnimationComplexity() {
        document.body.classList.add('reduced-animations');
        
        // Disable expensive animations
        const expensiveAnimations = document.querySelectorAll('.skill-level::after, .skeleton-card');
        expensiveAnimations.forEach(element => {
            element.style.animation = 'none';
        });
    }

    /**
     * Initialize enhanced hover states
     */
    initEnhancedHoverStates() {
        // Enhanced button hover effects
        const buttons = document.querySelectorAll('.btn, .theme-toggle, #back-to-top, .featured-nav-btn');
        buttons.forEach(button => {
            this.addButtonHoverEffects(button);
        });
        
        // Card hover effects
        const cards = document.querySelectorAll('.skill-card, .repo-card, .education-card');
        cards.forEach(card => {
            this.addCardHoverEffects(card);
        });
        
        // Navigation hover effects
        const navLinks = document.querySelectorAll('#main-nav a');
        navLinks.forEach(link => {
            this.addNavigationHoverEffects(link);
        });
        
        // Social link hover effects
        const socialLinks = document.querySelectorAll('.social-links a');
        socialLinks.forEach(link => {
            this.addSocialLinkHoverEffects(link);
        });
    }

    /**
     * Add enhanced hover effects to buttons
     */
    addButtonHoverEffects(button) {
        button.addEventListener('mouseenter', () => {
            if (!this.animationEnabled) return;
            
            button.style.transform = 'translateY(-2px) scale(1.02)';
            button.style.boxShadow = '0 8px 25px rgba(183, 204, 184, 0.3)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
            button.style.boxShadow = '';
        });
        
        button.addEventListener('mousedown', () => {
            if (!this.animationEnabled) return;
            button.style.transform = 'translateY(0) scale(0.98)';
        });
        
        button.addEventListener('mouseup', () => {
            if (!this.animationEnabled) return;
            button.style.transform = 'translateY(-2px) scale(1.02)';
        });
    }

    /**
     * Add hover effects to cards
     */
    addCardHoverEffects(card) {
        card.addEventListener('mouseenter', () => {
            if (!this.animationEnabled) return;
            
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(183, 204, 184, 0.25)';
            
            // Animate skill bars if skill card
            if (card.classList.contains('skill-card')) {
                const skillBar = card.querySelector('.skill-level');
                if (skillBar) {
                    skillBar.style.animation = 'skill-pulse 0.6s ease';
                }
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
            
            // Reset skill bar animation
            const skillBar = card.querySelector('.skill-level');
            if (skillBar) {
                skillBar.style.animation = '';
            }
        });
    }

    /**
     * Add navigation hover effects
     */
    addNavigationHoverEffects(link) {
        link.addEventListener('mouseenter', () => {
            if (!this.animationEnabled) return;
            
            link.style.transform = 'translateY(-1px)';
            
            // Animate underline
            const underline = document.createElement('span');
            underline.className = 'nav-underline';
            underline.style.cssText = `
                position: absolute;
                bottom: -2px;
                left: 50%;
                width: 0;
                height: 2px;
                background: var(--primary-color);
                transform: translateX(-50%);
                transition: width 0.3s ease;
            `;
            link.appendChild(underline);
            
            setTimeout(() => {
                underline.style.width = '80%';
            }, 10);
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.transform = '';
            
            const underline = link.querySelector('.nav-underline');
            if (underline) {
                underline.style.width = '0';
                setTimeout(() => underline.remove(), 300);
            }
        });
    }

    /**
     * Add social link hover effects
     */
    addSocialLinkHoverEffects(link) {
        link.addEventListener('mouseenter', () => {
            if (!this.animationEnabled) return;
            
            link.style.transform = 'translateX(5px)';
            link.style.color = 'var(--primary-color)';
            
            // Add shimmer effect
            const shimmer = document.createElement('span');
            shimmer.className = 'social-shimmer';
            shimmer.style.cssText = `
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(183, 204, 184, 0.2), transparent);
                transition: left 0.5s ease;
            `;
            link.appendChild(shimmer);
            
            setTimeout(() => {
                shimmer.style.left = '100%';
            }, 10);
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.transform = '';
            link.style.color = '';
            
            const shimmer = link.querySelector('.social-shimmer');
            if (shimmer) {
                setTimeout(() => shimmer.remove(), 500);
            }
        });
    }

    /**
     * Initialize keyboard navigation enhancements
     */
    initKeyboardEnhancements() {
        // Enhanced focus indicators
        document.addEventListener('keydown', (e) => {
            // Tab navigation enhancement
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        // Arrow key navigation for cards
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.handleArrowKeyNavigation(e);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Handle arrow key navigation
     */
    handleArrowKeyNavigation(e) {
        const focusedElement = document.activeElement;
        const isCard = focusedElement?.classList.contains('skill-card') || 
                      focusedElement?.classList.contains('repo-card') || 
                      focusedElement?.classList.contains('education-card');
        
        if (!isCard) return;
        
        e.preventDefault();
        
        const cards = Array.from(document.querySelectorAll('.skill-card, .repo-card, .education-card'));
        const currentIndex = cards.indexOf(focusedElement);
        let nextIndex;
        
        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                nextIndex = (currentIndex + 1) % cards.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                nextIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
                break;
        }
        
        if (cards[nextIndex]) {
            cards[nextIndex].focus();
            cards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Only trigger when not typing in input fields
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
            return;
        }
        
        switch (e.key.toLowerCase()) {
            case 't':
                // Toggle theme
                this.triggerThemeToggle();
                break;
            case '/':
                // Focus search
                e.preventDefault();
                this.focusSearch();
                break;
            case 'escape':
                // Close dropdowns/modals
                this.closeDropdowns();
                break;
            case 'p':
                // Pause/resume animations
                this.toggleAnimations();
                break;
            case 'h':
                // Skip to main content
                this.skipToMainContent();
                break;
        }
    }

    /**
     * Trigger theme toggle
     */
    triggerThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.click();
        }
    }

    /**
     * Focus search input
     */
    focusSearch() {
        const searchInput = document.getElementById('repo-filter');
        if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Close all dropdowns
     */
    closeDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown, #dropdown-menu');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('visible', 'show');
        });
    }

    /**
     * Toggle animations
     */
    toggleAnimations() {
        if (this.animationEnabled) {
            this.disableAnimations();
            this.showToast('Animations paused', 'info');
        } else {
            this.enableAnimations();
            this.showToast('Animations resumed', 'info');
        }
    }

    /**
     * Skip to main content
     */
    skipToMainContent() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Initialize focus management
     */
    initFocusManagement() {
        // Enhanced focus states
        const focusableElements = document.querySelectorAll(`
            button,
            a,
            input,
            select,
            textarea,
            [tabindex]:not([tabindex="-1"])
        `);
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.classList.add('focused');
                this.focusStates.add(element);
            });
            
            element.addEventListener('blur', () => {
                element.classList.remove('focused');
                this.focusStates.delete(element);
            });
        });
        
        // Focus trap for mobile menu
        this.setupFocusTrap();
    }

    /**
     * Setup focus trap for mobile menu
     */
    setupFocusTrap() {
        const mobileMenu = document.getElementById('dropdown-menu');
        if (!mobileMenu) return;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && mobileMenu.classList.contains('visible')) {
                const focusableElements = mobileMenu.querySelectorAll(`
                    button,
                    a,
                    input,
                    select,
                    textarea,
                    [tabindex]:not([tabindex="-1"])
                `);
                
                if (focusableElements.length === 0) return;
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }

    /**
     * Initialize mobile menu animations
     */
    initMobileMenuAnimations() {
        const menuButton = document.getElementById('menu-button');
        const dropdownMenu = document.getElementById('dropdown-menu');
        
        if (!menuButton || !dropdownMenu) return;
        
        menuButton.addEventListener('click', () => {
            const isVisible = dropdownMenu.classList.contains('visible');
            
            if (isVisible) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        });
    }

    /**
     * Open mobile menu with animation
     */
    openMobileMenu() {
        const dropdownMenu = document.getElementById('dropdown-menu');
        if (!dropdownMenu) return;
        
        dropdownMenu.classList.add('visible');
        
        // Animate menu items
        const menuItems = dropdownMenu.querySelectorAll('#menu-list li');
        menuItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }

    /**
     * Close mobile menu with animation
     */
    closeMobileMenu() {
        const dropdownMenu = document.getElementById('dropdown-menu');
        const menuButton = document.getElementById('menu-button');
        
        if (!dropdownMenu) return;
        
        const menuItems = dropdownMenu.querySelectorAll('#menu-list li');
        menuItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
            }, index * 50);
        });
        
        setTimeout(() => {
            dropdownMenu.classList.remove('visible');
            if (menuButton) {
                menuButton.focus();
            }
        }, menuItems.length * 50 + 300);
    }

    /**
     * Initialize toast notification system
     */
    initToastNotifications() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icon}</span>
                <span class="toast-message">${this.escapeHtml(message)}</span>
                <button class="toast-close" aria-label="Close notification">&times;</button>
            </div>
        `;
        
        // Add styles
        toast.style.cssText = `
            background: var(--card-bg);
            color: var(--light-text);
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            margin-bottom: 10px;
            max-width: 350px;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: auto;
            border-left: 4px solid ${this.getToastColor(type)};
        `;
        
        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.hideToast(toast);
        });
        
        container.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });
        
        // Auto-hide
        setTimeout(() => {
            this.hideToast(toast);
        }, duration);
    }

    /**
     * Hide toast notification
     */
    hideToast(toast) {
        if (!toast) return;
        
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Get toast icon based on type
     */
    getToastIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || icons.info;
    }

    /**
     * Get toast color based on type
     */
    getToastColor(type) {
        const colors = {
            info: 'var(--primary-color)',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444'
        };
        return colors[type] || colors.info;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Process animation queue for performance
     */
    processAnimationQueue(currentTime) {
        if (currentTime - this.lastFrameTime < this.frameInterval) {
            requestAnimationFrame(this.processAnimationQueue);
            return;
        }
        
        while (this.animationQueue.length > 0) {
            const animation = this.animationQueue.shift();
            animation();
        }
        
        this.lastFrameTime = currentTime;
        this.isProcessingQueue = false;
    }

    /**
     * Queue animation for performance optimization
     */
    queueAnimation(animation) {
        this.animationQueue.push(animation);
        
        if (!this.isProcessingQueue) {
            this.isProcessingQueue = true;
            requestAnimationFrame(this.processAnimationQueue);
        }
    }

    /**
     * Create ripple effect for buttons
     */
    initRippleEffects() {
        const buttons = document.querySelectorAll('.btn, .theme-toggle, #back-to-top, .featured-nav-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', this.createRipple);
            this.rippleElements.add(button);
        });
    }

    /**
     * Create ripple effect on click
     */
    createRipple(event) {
        if (!this.animationEnabled) return;
        
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
        `;

        button.appendChild(ripple);

        setTimeout(() => {
            if (button.contains(ripple)) {
                ripple.remove();
            }
        }, 600);
    }

    /**
     * Initialize scroll-based animations
     */
    initScrollAnimations() {
        if (!this.animationEnabled) return;

        // Create intersection observer for scroll animations
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateOnScroll(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Observe elements with staggered animations
        const animatableElements = document.querySelectorAll(`
            .timeline-item,
            .skill-card,
            .repo-card,
            .education-card,
            .section-title
        `);
        
        animatableElements.forEach((element, index) => {
            // Set initial state
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Add stagger delay
            element.style.setProperty('--stagger-delay', `${index * 100}ms`);
            
            this.observer.observe(element);
        });

        // Observe sections for background animations
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            this.observer.observe(section);
        });

        // Initialize scroll-based performance optimizations
        this.initScrollPerformanceOptimizations();
    }

    /**
     * Animate element when it comes into view
     */
    animateOnScroll(element) {
        // Trigger different animations based on element type
        if (element.classList.contains('timeline-item')) {
            this.animateTimelineItem(element);
        } else if (element.classList.contains('skill-card')) {
            this.animateSkillCard(element);
        } else if (element.classList.contains('repo-card')) {
            this.animateRepoCard(element);
        } else if (element.classList.contains('education-card')) {
            this.animateEducationCard(element);
        } else if (element.classList.contains('section-title')) {
            this.animateSectionTitle(element);
        } else if (element.tagName === 'SECTION') {
            this.animateSection(element);
        }
    }

    /**
     * Animate timeline item
     */
    animateTimelineItem(item) {
        const delay = item.style.getPropertyValue('--stagger-delay') || '0ms';
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
            
            // Animate timeline content with additional delay
            const content = item.querySelector('.timeline-content');
            if (content) {
                setTimeout(() => {
                    content.style.transform = 'scale(1)';
                    content.style.opacity = '1';
                }, 200);
            }
        }, parseInt(delay));
    }

    /**
     * Animate skill card
     */
    animateSkillCard(card) {
        const delay = card.style.getPropertyValue('--stagger-delay') || '0ms';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            
            // Animate skill bar
            setTimeout(() => {
                this.animateSkillBarInCard(card);
            }, 300);
        }, parseInt(delay));
    }

    /**
     * Animate skill bar within a card
     */
    animateSkillBarInCard(card) {
        const skillBar = card.querySelector('.skill-level');
        if (skillBar) {
            const targetWidth = skillBar.style.width || '0%';
            skillBar.style.transform = 'scaleX(0)';
            skillBar.style.transformOrigin = 'left';
            
            setTimeout(() => {
                skillBar.style.transition = 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                skillBar.style.transform = 'scaleX(1)';
                
                // Add shimmer effect
                const shimmer = document.createElement('div');
                shimmer.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    animation: shimmer 2s infinite;
                `;
                skillBar.appendChild(shimmer);
            }, 100);
        }
    }

    /**
     * Animate repo card
     */
    animateRepoCard(card) {
        const delay = card.style.getPropertyValue('--stagger-delay') || '0ms';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            
            // Animate card elements with cascade effect
            const elements = card.querySelectorAll('.repo-name, .repo-description, .repo-meta, .repo-footer');
            elements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, parseInt(delay));
    }

    /**
     * Animate education card
     */
    animateEducationCard(card) {
        const delay = card.style.getPropertyValue('--stagger-delay') || '0ms';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
            
            // Animate education items
            const items = card.querySelectorAll('.education-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, index * 150);
            });
        }, parseInt(delay));
    }

    /**
     * Animate section title
     */
    animateSectionTitle(title) {
        setTimeout(() => {
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
            
            // Animate title decorations
            setTimeout(() => {
                title.classList.add('animated');
            }, 300);
        }, 100);
    }

    /**
     * Animate section
     */
    animateSection(section) {
        // Add subtle background animation
        section.style.transition = 'background-color 0.6s ease';
    }

    /**
     * Initialize scroll performance optimizations
     */
    initScrollPerformanceOptimizations() {
        let ticking = false;
        
        const updateScrollEffects = () => {
            this.updateScrollEffects();
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        }, { passive: true });
    }

    /**
     * Update scroll-based effects
     */
    updateScrollEffects() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Header effects
        this.updateHeaderEffects(scrollY);
        
        // Back to top button
        this.updateBackToTop(scrollY, windowHeight);
        
        // Parallax effects (subtle)
        this.updateParallaxEffects(scrollY);
        
        // Progress indicator
        this.updateScrollIndicator(scrollY, documentHeight);
    }

    /**
     * Update header effects on scroll
     */
    updateHeaderEffects(scrollY) {
        const header = document.querySelector('header');
        if (header) {
            if (scrollY > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                header.style.backdropFilter = 'blur(15px)';
            } else {
                header.style.boxShadow = '';
                header.style.backdropFilter = '';
            }
        }
    }

    /**
     * Update back to top button visibility
     */
    updateBackToTop(scrollY, windowHeight) {
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            if (scrollY > windowHeight / 2) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    }

    /**
     * Update subtle parallax effects
     */
    updateParallaxEffects(scrollY) {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        // Subtle background parallax
        const body = document.body;
        if (body && scrollY > 0) {
            body.style.backgroundPositionY = `${scrollY * 0.1}px`;
        }
    }

    /**
     * Update scroll indicator
     */
    updateScrollIndicator(scrollY, documentHeight) {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            if (scrollY > 100) {
                scrollIndicator.classList.add('hide');
            } else {
                scrollIndicator.classList.remove('hide');
            }
        }
        
        // Update scroll percentage if element exists
        const scrollPercentage = document.querySelector('.scroll-percentage');
        if (scrollPercentage) {
            const scrollPercent = Math.round((scrollY / (documentHeight - window.innerHeight)) * 100);
            scrollPercentage.textContent = `${scrollPercent}%`;
        }
    }

    /**
     * Initialize back to top button with scroll progress
     */
    initBackToTop() {
        const backToTop = document.getElementById('back-to-top');
        if (!backToTop) return;

        // Add scroll percentage indicator
        const percentage = document.createElement('span');
        percentage.className = 'scroll-percentage';
        backToTop.appendChild(percentage);

        // Handle scroll events with throttling
        let ticking = false;
        const updateScrollProgress = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);
            
            percentage.textContent = `${scrollPercent}%`;
            
            // Show/hide button
            if (scrollTop > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        });
    }

    /**
     * Enhanced theme toggle with sophisticated animations
     */
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        // Add enhanced click animation
        themeToggle.addEventListener('click', (e) => {
            this.animateThemeToggle(themeToggle, e);
        });
        
        // Add hover effects
        this.addThemeToggleHoverEffects(themeToggle);
        
        // Add keyboard interaction
        this.addThemeToggleKeyboardInteraction(themeToggle);
        
        // Add transition coordination
        this.setupThemeTransitionCoordination();
    }

    /**
     * Animate theme toggle with particle effects
     */
    animateThemeToggle(toggle, event) {
        if (!this.animationEnabled) return;
        
        // Create ripple effect
        this.createRipple(event);
        
        // Add rotation animation
        toggle.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        toggle.style.transform = 'rotate(360deg) scale(1.1)';
        
        // Create particle effect
        this.createParticleEffect(toggle);
        
        // Animate icon change
        this.animateIconChange(toggle);
        
        // Reset animation
        setTimeout(() => {
            toggle.style.transform = '';
        }, 600);
    }

    /**
     * Create particle effect for theme toggle
     */
    createParticleEffect(toggle) {
        const rect = toggle.getBoundingClientRect();
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'theme-particle';
            
            const angle = (360 / particleCount) * i;
            const distance = 50;
            const x = Math.cos(angle * Math.PI / 180) * distance;
            const y = Math.sin(angle * Math.PI / 180) * distance;
            
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--primary-color);
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
                animation: particle-burst 0.8s ease-out forwards;
                --x: ${x}px;
                --y: ${y}px;
            `;
            
            toggle.appendChild(particle);
            
            setTimeout(() => {
                if (toggle.contains(particle)) {
                    particle.remove();
                }
            }, 800);
        }
    }

    /**
     * Animate icon change in theme toggle
     */
    animateIconChange(toggle) {
        const icon = toggle.querySelector('i');
        if (!icon) return;
        
        icon.style.transition = 'all 0.3s ease';
        icon.style.transform = 'scale(0) rotate(180deg)';
        icon.style.opacity = '0';
        
        setTimeout(() => {
            // Icon will be changed by ThemeManager
            icon.style.transform = 'scale(1) rotate(360deg)';
            icon.style.opacity = '1';
        }, 300);
    }

    /**
     * Add hover effects to theme toggle
     */
    addThemeToggleHoverEffects(toggle) {
        toggle.addEventListener('mouseenter', () => {
            if (!this.animationEnabled) return;
            
            toggle.style.transform = 'scale(1.1)';
            toggle.style.boxShadow = '0 4px 15px rgba(183, 204, 184, 0.4)';
        });
        
        toggle.addEventListener('mouseleave', () => {
            toggle.style.transform = '';
            toggle.style.boxShadow = '';
        });
    }

    /**
     * Add keyboard interaction to theme toggle
     */
    addThemeToggleKeyboardInteraction(toggle) {
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle.click();
            }
        });
    }

    /**
     * Setup theme transition coordination
     */
    setupThemeTransitionCoordination() {
        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    this.coordinateThemeTransition();
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    /**
     * Coordinate smooth theme transition
     */
    coordinateThemeTransition() {
        document.body.classList.add('theme-transitioning');
        
        // Create transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'theme-transition-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.1) 100%);
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Animate overlay
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            
            setTimeout(() => {
                overlay.style.opacity = '0';
                
                setTimeout(() => {
                    if (document.body.contains(overlay)) {
                        document.body.removeChild(overlay);
                    }
                    document.body.classList.remove('theme-transitioning');
                }, 300);
            }, 200);
        });
    }

    /**
     * Animate skill bars with enhanced effects
     */
    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-level');
        skillBars.forEach((bar, index) => {
            setTimeout(() => {
                this.animateSingleSkillBar(bar);
            }, index * 150);
        });
    }

    /**
     * Animate a single skill bar
     */
    animateSingleSkillBar(bar) {
        const computedWidth = window.getComputedStyle(bar).width;
        const targetWidth = computedWidth && computedWidth !== '0px' ? computedWidth : '0%';
        
        // Store original width
        bar.style.setProperty('--target-width', targetWidth);
        
        // Set initial state
        bar.style.transform = 'scaleX(0)';
        bar.style.transformOrigin = 'left';
        bar.style.transition = 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Animate to target width
        setTimeout(() => {
            bar.style.transform = 'scaleX(1)';
            bar.classList.add('animated');
            
            // Add shimmer effect
            this.addShimmerEffect(bar);
            
            // Add pulse effect at completion
            setTimeout(() => {
                this.addCompletionEffect(bar);
            }, 1500);
        }, 100);
    }

    /**
     * Add shimmer effect to skill bar
     */
    addShimmerEffect(bar) {
        const shimmer = document.createElement('div');
        shimmer.className = 'skill-shimmer';
        shimmer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: shimmer 2s infinite;
            pointer-events: none;
        `;
        bar.appendChild(shimmer);
    }

    /**
     * Add completion effect to skill bar
     */
    addCompletionEffect(bar) {
        // Create completion indicator
        const indicator = document.createElement('div');
        indicator.className = 'skill-completion';
        indicator.style.cssText = `
            position: absolute;
            right: -5px;
            top: 50%;
            transform: translateY(-50%) scale(0);
            width: 10px;
            height: 10px;
            background: var(--secondary-color);
            border-radius: 50%;
            transition: transform 0.3s ease;
        `;
        bar.appendChild(indicator);
        
        setTimeout(() => {
            indicator.style.transform = 'translateY(-50%) scale(1)';
        }, 10);
        
        setTimeout(() => {
            indicator.style.transform = 'translateY(-50%) scale(0)';
            setTimeout(() => indicator.remove(), 300);
        }, 1000);
    }

    /**
     * Initialize enhanced skill bar animations
     */
    initSkillBarAnimations() {
        const skillBars = document.querySelectorAll('.skill-bar');
        skillBars.forEach((bar, index) => {
            this.enhanceSkillBar(bar, index);
        });
    }

    /**
     * Enhance individual skill bar
     */
    enhanceSkillBar(bar, index) {
        const level = bar.querySelector('.skill-level');
        if (!level) return;
        
        // Add percentage indicator
        if (!bar.querySelector('.skill-percentage')) {
            const percentage = document.createElement('span');
            percentage.className = 'skill-percentage';
            percentage.style.cssText = `
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 0.8rem;
                font-weight: 600;
                color: var(--light-text);
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            // Extract percentage
            const width = level.style.width;
            if (width) {
                percentage.textContent = width.replace('%', '') + '%';
            }
            
            bar.appendChild(percentage);
        }
        
        // Add hover interaction
        bar.addEventListener('mouseenter', () => {
            this.animateSkillBarHover(bar, true);
        });
        
        bar.addEventListener('mouseleave', () => {
            this.animateSkillBarHover(bar, false);
        });
        
        // Add accessibility features
        this.enhanceSkillBarAccessibility(bar);
    }

    /**
     * Animate skill bar hover
     */
    animateSkillBarHover(bar, isHovering) {
        const level = bar.querySelector('.skill-level');
        const percentage = bar.querySelector('.skill-percentage');
        
        if (isHovering) {
            level.style.transform = 'scaleX(1.02)';
            level.style.filter = 'brightness(1.1)';
            
            if (percentage) {
                percentage.style.opacity = '1';
            }
        } else {
            level.style.transform = 'scaleX(1)';
            level.style.filter = '';
            
            if (percentage) {
                percentage.style.opacity = '0';
            }
        }
    }

    /**
     * Enhance skill bar accessibility
     */
    enhanceSkillBarAccessibility(bar) {
        const level = bar.querySelector('.skill-level');
        const skillCard = bar.closest('.skill-card');
        
        if (level && skillCard) {
            const skillName = skillCard.querySelector('h3')?.textContent || 'Skill';
            const percentage = level.style.width || '0%';
            
            // Enhance ARIA attributes
            bar.setAttribute('role', 'progressbar');
            bar.setAttribute('aria-label', `${skillName} proficiency: ${percentage}`);
            bar.setAttribute('aria-valuenow', percentage.replace('%', ''));
            bar.setAttribute('aria-valuemin', '0');
            bar.setAttribute('aria-valuemax', '100');
        }
    }

    /**
     * Initialize enhanced timeline animations
     */
    initTimelineAnimations() {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;
        
        // Enhance timeline styling
        timeline.style.position = 'relative';
        
        // Animate timeline line
        this.animateTimelineLine(timeline);
        
        // Setup timeline item animations
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            this.enhanceTimelineItem(item, index);
        });
        
        // Add keyboard navigation to timeline
        this.setupTimelineKeyboardNavigation();
    }

    /**
     * Animate timeline line
     */
    animateTimelineLine(timeline) {
        const line = document.querySelector('.timeline::before') || 
                     document.createElement('div');
        
        if (!document.querySelector('.timeline::before')) {
            line.className = 'timeline-line';
            line.style.cssText = `
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 2px;
                height: 0;
                background: var(--primary-color);
                transition: height 1.5s cubic-bezier(0.4, 0, 0.2, 1);
            `;
            timeline.appendChild(line);
            
            // Animate line growth
            setTimeout(() => {
                const fullHeight = timeline.scrollHeight;
                line.style.height = `${fullHeight}px`;
            }, 500);
        }
    }

    /**
     * Enhance individual timeline item
     */
    enhanceTimelineItem(item, index) {
        // Set initial state for animation
        const content = item.querySelector('.timeline-content');
        const date = item.querySelector('.timeline-date');
        
        // Initial states
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        
        if (content) {
            content.style.transform = 'scale(0.9)';
            content.style.opacity = '0';
            content.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        
        if (date) {
            date.style.opacity = '0';
            date.style.transform = 'translateX(-20px)';
            date.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        
        // Add hover effects
        this.addTimelineItemHoverEffects(item);
        
        // Add accessibility features
        this.enhanceTimelineItemAccessibility(item);
    }

    /**
     * Add hover effects to timeline items
     */
    addTimelineItemHoverEffects(item) {
        const content = item.querySelector('.timeline-content');
        
        item.addEventListener('mouseenter', () => {
            if (!this.animationEnabled) return;
            
            item.style.transform = 'translateY(-5px)';
            
            if (content) {
                content.style.transform = 'scale(1.02)';
                content.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
            
            if (content) {
                content.style.transform = 'scale(1)';
                content.style.boxShadow = '';
            }
        });
    }

    /**
     * Enhance timeline item accessibility
     */
    enhanceTimelineItemAccessibility(item) {
        // Make item keyboard accessible
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'article');
        
        // Add keyboard interaction
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = item.querySelector('a');
                if (link) {
                    link.click();
                }
            }
        });
        
        // Add ARIA labels
        const date = item.querySelector('.timeline-date');
        const content = item.querySelector('.timeline-content h3');
        
        if (date && content) {
            const dateText = date.textContent.trim();
            const titleText = content.textContent.trim();
            item.setAttribute('aria-label', `${dateText}: ${titleText}`);
        }
    }

    /**
     * Setup timeline keyboard navigation
     */
    setupTimelineKeyboardNavigation() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        document.addEventListener('keydown', (e) => {
            if (document.activeElement?.classList.contains('timeline-item')) {
                const currentIndex = Array.from(timelineItems).indexOf(document.activeElement);
                let nextIndex;
                
                switch (e.key) {
                    case 'ArrowDown':
                    case 'ArrowRight':
                        e.preventDefault();
                        nextIndex = (currentIndex + 1) % timelineItems.length;
                        break;
                    case 'ArrowUp':
                    case 'ArrowLeft':
                        e.preventDefault();
                        nextIndex = currentIndex === 0 ? timelineItems.length - 1 : currentIndex - 1;
                        break;
                    default:
                        return;
                }
                
                if (timelineItems[nextIndex]) {
                    timelineItems[nextIndex].focus();
                }
            }
        });
    }

    /**
     * Enhanced loading states with sophisticated animations
     */
    initLoadingEnhancements() {
        // Enhance existing loading spinners
        this.enhanceLoadingSpinners();
        
        // Create skeleton loaders
        this.createSkeletonLoaders();
        
        // Setup content fade-in animations
        this.setupContentAnimations();
        
        // Add loading progress indicators
        this.setupLoadingProgress();
        
        // Setup error state animations
        this.setupErrorStateAnimations();
    }

    /**
     * Enhance loading spinners
     */
    enhanceLoadingSpinners() {
        const spinners = document.querySelectorAll('.spinner-border');
        spinners.forEach((spinner, index) => {
            spinner.classList.add('loading-spinner-enhanced');
            
            // Add pulsing effect
            const pulse = document.createElement('div');
            pulse.className = 'spinner-pulse';
            pulse.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: inherit;
                opacity: 0.3;
                transform: translate(-50%, -50%);
                animation: pulse 1.5s infinite;
                animation-delay: ${index * 0.2}s;
            `;
            spinner.appendChild(pulse);
        });
    }

    /**
     * Create skeleton loaders
     */
    createSkeletonLoaders() {
        // Enhance existing skeleton cards
        const skeletonCards = document.querySelectorAll('.skeleton-card');
        skeletonCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            
            // Add shimmer effect
            const shimmer = document.createElement('div');
            shimmer.className = 'skeleton-shimmer';
            shimmer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 100%;
                background: linear-gradient(90deg, 
                    rgba(255,255,255,0.1) 25%, 
                    rgba(255,255,255,0.2) 50%, 
                    rgba(255,255,255,0.1) 75%);
                background-size: 200% 100%;
                animation: skeleton-shimmer 1.5s infinite;
                animation-delay: ${index * 0.2}s;
            `;
            card.appendChild(shimmer);
        });
    }

    /**
     * Setup content fade-in animations
     */
    setupContentAnimations() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Animate repo cards
                            const repoCards = node.querySelectorAll?.('.repo-card') || 
                                             (node.classList?.contains('repo-card') ? [node] : []);
                            repoCards.forEach((card, index) => {
                                this.animateContentEntry(card, index * 100);
                            });
                            
                            // Animate featured projects
                            const featuredContent = node.querySelector?.('.featured-project-content') ||
                                                   (node.classList?.contains('featured-project-content') ? [node] : null);
                            if (featuredContent) {
                                this.animateFeaturedContent(featuredContent);
                            }
                        }
                    });
                }
            });
        });

        // Observe containers for dynamic content
        const containers = [
            'github-repos',
            'featured-project',
            'featured-container'
        ];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                observer.observe(container, { childList: true, subtree: true });
            }
        });
    }

    /**
     * Animate content entry with stagger effect
     */
    animateContentEntry(element, delay) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px) scale(0.95)';
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
            
            // Add entrance animation
            element.classList.add('content-entrance');
        }, delay);
    }

    /**
     * Animate featured content
     */
    animateFeaturedContent(content) {
        content.style.opacity = '0';
        content.style.transform = 'scale(0.9) translateY(30px)';
        content.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            content.style.opacity = '1';
            content.style.transform = 'scale(1) translateY(0)';
            
            // Add spotlight effect
            this.createSpotlightEffect(content);
        }, 200);
    }

    /**
     * Create spotlight effect for featured content
     */
    createSpotlightEffect(element) {
        const spotlight = document.createElement('div');
        spotlight.className = 'spotlight-effect';
        spotlight.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%);
            transform: translate(-50%, -50%);
            border-radius: 50%;
            transition: all 1s ease;
            pointer-events: none;
            z-index: 10;
        `;
        
        element.style.position = 'relative';
        element.appendChild(spotlight);
        
        setTimeout(() => {
            spotlight.style.width = '300px';
            spotlight.style.height = '300px';
            spotlight.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            spotlight.style.opacity = '0';
            setTimeout(() => {
                if (element.contains(spotlight)) {
                    element.removeChild(spotlight);
                }
            }, 1000);
        }, 2000);
    }

    /**
     * Setup loading progress indicators
     */
    setupLoadingProgress() {
        // Create progress bars for long-loading content
        const loadingContainers = document.querySelectorAll('[data-loading="progress"]');
        loadingContainers.forEach(container => {
            const progressBar = document.createElement('div');
            progressBar.className = 'loading-progress';
            progressBar.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: var(--primary-color);
                width: 0;
                transition: width 0.3s ease;
            `;
            
            container.style.position = 'relative';
            container.appendChild(progressBar);
            
            // Simulate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress > 90) progress = 90;
                
                progressBar.style.width = `${progress}%`;
                
                if (progress >= 90) {
                    clearInterval(interval);
                }
            }, 500);
            
            // Clean up when content loads
            const observer = new MutationObserver(() => {
                const hasContent = container.querySelector('.repo-card, .skill-card, .education-card');
                if (hasContent) {
                    progressBar.style.width = '100%';
                    setTimeout(() => {
                        if (container.contains(progressBar)) {
                            container.removeChild(progressBar);
                        }
                    }, 300);
                    observer.disconnect();
                }
            });
            
            observer.observe(container, { childList: true, subtree: true });
        });
    }

    /**
     * Setup error state animations
     */
    setupErrorStateAnimations() {
        const errorContainers = document.querySelectorAll('[data-error-state]');
        errorContainers.forEach(container => {
            const observer = new MutationObserver(() => {
                const errorElement = container.querySelector('.alert, .error-message');
                if (errorElement) {
                    this.animateErrorState(errorElement);
                    observer.disconnect();
                }
            });
            
            observer.observe(container, { childList: true, subtree: true });
        });
    }

    /**
     * Animate error state
     */
    animateErrorState(errorElement) {
        errorElement.style.opacity = '0';
        errorElement.style.transform = 'translateY(-20px) scale(0.95)';
        errorElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            errorElement.style.opacity = '1';
            errorElement.style.transform = 'translateY(0) scale(1)';
            
            // Add shake effect
            setTimeout(() => {
                errorElement.style.animation = 'shake 0.5s ease';
            }, 200);
        }, 100);
    }

    /**
     * Show enhanced loading state
     */
    showEnhancedLoading(container, message = 'Loading...') {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'enhanced-loading';
        loadingElement.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="loading-text">${this.escapeHtml(message)}</div>
                <div class="loading-progress-bar">
                    <div class="loading-progress-fill"></div>
                </div>
            </div>
        `;
        
        container.appendChild(loadingElement);
        
        // Animate progress
        const progressFill = loadingElement.querySelector('.loading-progress-fill');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 85) progress = 85;
            
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
        }, 200);
        
        loadingElement.dataset.progressInterval = interval;
        
        return loadingElement;
    }

    /**
     * Hide enhanced loading state
     */
    hideEnhancedLoading(container, loadingElement) {
        if (!loadingElement) return;
        
        const progressFill = loadingElement.querySelector('.loading-progress-fill');
        if (progressFill) {
            progressFill.style.width = '100%';
        }
        
        loadingElement.style.opacity = '0';
        loadingElement.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            if (container.contains(loadingElement)) {
                container.removeChild(loadingElement);
            }
        }, 300);
        
        // Clear progress interval
        const interval = loadingElement.dataset.progressInterval;
        if (interval) {
            clearInterval(interval);
        }
    }

    /**
     * Initialize form interactions
     */
    initFormInteractions() {
        const inputs = document.querySelectorAll('input[type="text"], select');
        inputs.forEach(input => {
            // Add focus/blur animations
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });

            // Add input feedback animation
            input.addEventListener('input', () => {
                if (this.animationEnabled) {
                    input.style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        input.style.transform = 'scale(1)';
                    }, 100);
                }
            });
        });
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        // Throttled scroll handling
        if (!this.scrollTicking) {
            requestAnimationFrame(() => {
                // Scroll-related animations handled by individual components
                this.scrollTicking = false;
            });
            this.scrollTicking = true;
        }
    }

    /**
     * Observe elements for animations
     */
    observeElements() {
        if (this.observer) {
            const elements = document.querySelectorAll('.timeline-item, .skill-card, .fade-in-on-scroll');
            elements.forEach(element => {
                this.observer.observe(element);
            });
        }
    }

    /**
     * Enable animations
     */
    enableAnimations() {
        document.body.style.setProperty('--micro-motion', 'normal');
        this.initScrollAnimations();
    }

    /**
     * Disable animations for reduced motion preference
     */
    disableAnimations() {
        document.body.style.setProperty('--micro-motion', 'reduced');
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    /**
     * Cleanup method
     */
    destroy() {
        // Remove ripple event listeners
        this.rippleElements.forEach(element => {
            element.removeEventListener('click', this.createRipple);
        });
        
        // Disconnect intersection observer
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Remove scroll listener
        window.removeEventListener('scroll', this.handleScroll);
        
        this.initialized = false;
        console.log('🧹 Micro-interactions cleaned up');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window !== 'undefined') {
        window.microInteractions = new MicroInteractions();
        // Initialize with a small delay to ensure other modules are loaded
        setTimeout(() => {
            window.microInteractions.initialize();
        }, 500);
    }
});

export default MicroInteractions;