/**
 * MobileNavigation Module
 * Enhances mobile navigation with touch gestures and improved interactions
 * 
 * @example
 * const mobileNav = new MobileNavigation();
 * await mobileNav.initialize();
 * 
 * // Add swipe gestures
 * mobileNav.enableSwipeGestures();
 */

export class MobileNavigation {
    constructor(navigationManager) {
        this.navigationManager = navigationManager;
        this.menuButton = null;
        this.dropdownMenu = null;
        this.touchStartX = null;
        this.touchStartY = null;
        this.swipeThreshold = 50;
        this.swipeVelocityThreshold = 0.3;
        this.initialized = false;
        
        // Touch gesture states
        this.gestures = {
            SWIPE_LEFT: 'swipeLeft',
            SWIPE_RIGHT: 'swipeRight',
            SWIPE_UP: 'swipeUp',
            SWIPE_DOWN: 'swipeDown',
            TAP: 'tap',
            LONG_PRESS: 'longPress'
        };
        
        // Mobile detection
        this.isMobile = this.detectMobile();
        
        // Touch event timing
        this.touchStartTime = 0;
        this.longPressThreshold = 500;
        
        // Haptic feedback
        this.hapticSupported = this.checkHapticSupport();
        
        // Focus trap setup flag
        this.focusTrapSetup = false;
    }

    /**
     * Initialize mobile navigation
     */
    initialize() {
        try {
            this.cacheElements();
            this.bindEvents();
            this.setupMobileOptimizations();
            this.initialized = true;
        } catch (error) {
            console.error('MobileNavigation initialization failed:', error);
            throw error;
        }
    }

    /**
     * Detect if device is mobile
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    /**
     * Check haptic feedback support
     */
    checkHapticSupport() {
        return 'vibrate' in navigator;
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.menuButton = document.getElementById('menu-button');
        this.dropdownMenu = document.getElementById('dropdown-menu');
        
        if (!this.dropdownMenu) {
            console.warn('Mobile navigation dropdown not found');
        }
        
        if (!this.menuButton) {
            console.warn('Mobile navigation menu button not found');
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Only bind events if elements exist
        if (this.menuButton) {
            this.menuButton.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
            this.menuButton.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        }
        
        if (this.dropdownMenu) {
            // Touch events for dropdown
            this.dropdownMenu.addEventListener('touchstart', (e) => this.handleMenuTouchStart(e), { passive: true });
            this.dropdownMenu.addEventListener('touchmove', (e) => this.handleMenuTouchMove(e), { passive: true });
            this.dropdownMenu.addEventListener('touchend', (e) => this.handleMenuTouchEnd(e), { passive: true });
            
            // Prevent default touch behaviors on menu
            this.dropdownMenu.addEventListener('touchmove', (e) => {
                if (this.isMenuOpen()) {
                    e.preventDefault();
                }
            }, { passive: false });
        }

        // Touch events for menu
        this.menuButton.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.menuButton.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        // Touch events for dropdown
        this.dropdownMenu.addEventListener('touchstart', (e) => this.handleMenuTouchStart(e), { passive: true });
        this.dropdownMenu.addEventListener('touchmove', (e) => this.handleMenuTouchMove(e), { passive: true });
        this.dropdownMenu.addEventListener('touchend', (e) => this.handleMenuTouchEnd(e), { passive: true });
        
        // Prevent default touch behaviors on menu
        this.dropdownMenu.addEventListener('touchmove', (e) => {
            if (this.isMenuOpen()) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    /**
     * Setup mobile-specific optimizations
     */
    setupMobileOptimizations() {
        if (!this.isMobile) {
            return;
        }

        // Add mobile class to body
        document.body.classList.add('mobile-device');
        
        // Optimize touch targets
        this.optimizeTouchTargets();
        
        // Add mobile-specific CSS classes
        this.menuButton.classList.add('mobile-optimized');
        this.dropdownMenu.classList.add('mobile-optimized');
        
        // Setup viewport meta tag
        this.setupViewportOptimization();
    }

    /**
     * Optimize touch targets for mobile
     */
    optimizeTouchTargets() {
        const touchTargets = this.menuButton.querySelectorAll('button, a');
        
        touchTargets.forEach(target => {
            // Ensure minimum touch target size (44px)
            const computedStyle = window.getComputedStyle(target);
            const width = parseInt(computedStyle.width);
            const height = parseInt(computedStyle.height);
            
            if (width < 44 || height < 44) {
                target.style.minWidth = '44px';
                target.style.minHeight = '44px';
                target.classList.add('touch-optimized');
            }
        });
    }

    /**
     * Setup viewport optimization
     */
    setupViewportOptimization() {
        let viewport = document.querySelector('meta[name="viewport"]');
        
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        // Set viewport for mobile
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    }

    /**
     * Handle click on menu button
     */
    handleClick(e) {
        const isVisible = this.dropdownMenu.classList.toggle('visible');
        this.menuButton.setAttribute('aria-expanded', isVisible);
        e.stopPropagation();

        // Setup focus trap and focus first item when menu opens
        if (isVisible) {
            this.setupFocusTrap();
            this.focusFirstMenuItem();
        }

        // Announce to screen readers
        this.announceMenuState(isVisible);
    }

    /**
     * Handle clicks outside the menu to close it
     */
    handleOutsideClick(e) {
        if (
            this.dropdownMenu.classList.contains('visible') &&
            !this.dropdownMenu.contains(e.target) &&
            e.target !== this.menuButton
        ) {
            this.dropdownMenu.classList.remove('visible');
            this.menuButton.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * Handle touch start
     */
    handleTouchStart(event) {
        const touch = event.touches[0];
        if (!touch) {
            return;
        }
        
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchStartTime = Date.now();
        
        // Visual feedback
        this.menuButton.classList.add('touch-pressed');
        this.triggerHaptic('light');
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(event) {
        const touch = event.changedTouches[0];
        if (!touch || this.touchStartX === null) {
            return;
        }
        
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;
        const touchDuration = Date.now() - this.touchStartTime;
        
        // Remove visual feedback
        this.menuButton.classList.remove('touch-pressed');
        
        // Check for long press
        if (touchDuration > this.longPressThreshold) {
            this.handleLongPress();
            return;
        }
        
        // Handle as tap
        this.handleTap();
        
        this.touchStartX = null;
        this.touchStartY = null;
    }

    /**
     * Handle tap gesture
     */
    handleTap() {
        // Toggle menu
        const isVisible = this.dropdownMenu.classList.toggle('visible');
        this.menuButton.setAttribute('aria-expanded', isVisible);
        
        // Setup focus trap and focus first item when menu opens
        if (isVisible) {
            this.setupFocusTrap();
            this.focusFirstMenuItem();
        }
        
        // Haptic feedback
        this.triggerHaptic('medium');
        
        // Dispatch tap event

        
        // Announce to screen readers
        this.announceMenuState(isVisible);
    }

    /**
     * Handle long press gesture
     */
    handleLongPress() {
        // Enhanced menu opening with animation
        this.openMenuWithAnimation();
        
        // Haptic feedback
        this.triggerHaptic('heavy');
        
        // Dispatch long press event

    }

    /**
     * Handle menu touch start
     */
    handleMenuTouchStart(event) {
        const touch = event.touches[0];
        if (!touch) {
            return;
        }
        
        this.menuTouchStartX = touch.clientX;
        this.menuTouchStartY = touch.clientY;
    }

    /**
     * Handle menu touch move
     */
    handleMenuTouchMove(event) {
        const touch = event.touches[0];
        if (!touch || this.menuTouchStartX === null) {
            return;
        }
        
        const currentX = touch.clientX;
        const currentY = touch.clientY;
        const deltaX = currentX - this.menuTouchStartX;
        
        // Enable horizontal scrolling in menu
        if (Math.abs(deltaX) > 10) {
            event.preventDefault();
            this.dropdownMenu.scrollBy(-deltaX, 0);
        }
    }

    /**
     * Handle menu touch end
     */
    handleMenuTouchEnd(event) {
        const touch = event.changedTouches[0];
        if (!touch || this.menuTouchStartX === null) {
            return;
        }
        
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;
        const deltaX = touchEndX - this.menuTouchStartX;
        const deltaY = touchEndY - this.menuTouchStartY;
        
        this.menuTouchStartX = null;
        this.menuTouchStartY = null;
        
        // Detect swipe gestures
        if (Math.abs(deltaX) > this.swipeThreshold) {
            if (deltaX > 0) {
                this.handleSwipeRight();
            } else {
                this.handleSwipeLeft();
            }
        }
    }

    /**
     * Handle swipe left gesture
     */
    handleSwipeLeft() {
        // Navigate to previous section
        if (this.navigationManager) {
            const sections = ['summary-section', 'experience-section', 'education-section', 'skills-section', 'github-repos-section', 'contacts'];
            const currentSection = this.navigationManager.getCurrentSection();
            const currentIndex = sections.indexOf(currentSection);
            
            if (currentIndex > 0) {
                const prevSection = sections[currentIndex - 1];
                this.navigationManager.navigateToSection(prevSection);
                
                // Close menu
                this.closeMenu();
                
                // Haptic feedback
                this.triggerHaptic('light');
            }
        }
        
        this.dispatchGestureEvent(this.gestures.SWIPE_LEFT, { direction: 'left' });
    }

    /**
     * Handle swipe right gesture
     */
    handleSwipeRight() {
        // Navigate to next section
        if (this.navigationManager) {
            const sections = ['summary-section', 'experience-section', 'education-section', 'skills-section', 'github-repos-section', 'contacts'];
            const currentSection = this.navigationManager.getCurrentSection();
            const currentIndex = sections.indexOf(currentSection);
            
            if (currentIndex < sections.length - 1 && currentIndex >= 0) {
                const nextSection = sections[currentIndex + 1];
                this.navigationManager.navigateToSection(nextSection);
                
                // Close menu
                this.closeMenu();
                
                // Haptic feedback
                this.triggerHaptic('light');
            }
        }
        
        this.dispatchGestureEvent(this.gestures.SWIPE_RIGHT, { direction: 'right' });
    }

    /**
     * Open menu with enhanced animation
     */
    openMenuWithAnimation() {
        this.dropdownMenu.classList.add('visible');
        this.dropdownMenu.classList.add('long-press-animation');
        this.menuButton.setAttribute('aria-expanded', 'true');
        
        // Add ripple effect
        this.addRippleEffect(this.menuButton);
        
        // Setup focus trap and focus first item
        this.setupFocusTrap();
        this.focusFirstMenuItem();
        
        setTimeout(() => {
            this.dropdownMenu.classList.remove('long-press-animation');
        }, 300);
    }

    /**
     * Add ripple effect to element
     */
    addRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = rect.width / 2 - 10;
        const y = rect.height / 2 - 10;
        
        ripple.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
        `;
        
        element.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }

    /**
     * Enable swipe gestures
     */
    enableSwipeGestures() {
        if (!this.isMobile) {
            console.warn('Swipe gestures only available on mobile devices');
            return false;
        }

        document.body.addEventListener('touchstart', (e) => this.handleGlobalTouchStart(e), { passive: true });
        document.body.addEventListener('touchend', (e) => this.handleGlobalTouchEnd(e), { passive: true });

        return true;
    }

    /**
     * Handle global touch start for swipe gestures
     */
    handleGlobalTouchStart(event) {
        const touch = event.touches[0];
        if (!touch) {
            return;
        }
        
        this.globalTouchStartX = touch.clientX;
        this.globalTouchStartY = touch.clientY;
    }

    /**
     * Handle global touch end for swipe gestures
     */
    handleGlobalTouchEnd(event) {
        const touch = event.changedTouches[0];
        if (!touch || this.globalTouchStartX === null) {
            return;
        }
        
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;
        const deltaX = touchEndX - this.globalTouchStartX;
        const deltaY = touchEndY - this.globalTouchStartY;
        
        // Detect horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.swipeThreshold) {
            if (deltaX > 0) {
                this.handleGlobalSwipeRight();
            } else {
                this.handleGlobalSwipeLeft();
            }
        }
        
        this.globalTouchStartX = null;
        this.globalTouchStartY = null;
    }

    /**
     * Handle global swipe left
     */
    handleGlobalSwipeLeft() {
        // Navigate to previous section or close menu
        if (this.isMenuOpen()) {
            this.closeMenu();
        } else {
            // Navigate to previous section
            this.navigationManager?.navigateSection('previous');
        }
        
        this.triggerHaptic('light');
        this.dispatchGestureEvent(this.gestures.SWIPE_LEFT, { global: true, direction: 'left' });
    }

    /**
     * Handle global swipe right
     */
    handleGlobalSwipeRight() {
        // Navigate to next section
        this.navigationManager?.navigateSection('next');
        
        this.triggerHaptic('light');
        this.dispatchGestureEvent(this.gestures.SWIPE_RIGHT, { global: true, direction: 'right' });
    }

    /**
     * Trigger haptic feedback
     */
    triggerHaptic(type = 'light') {
        if (!this.hapticSupported) {
            return;
        }
        
        switch (type) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(25);
                break;
            case 'heavy':
                navigator.vibrate(50);
                break;
        }
    }

    /**
     * Check if menu is open
     */
    isMenuOpen() {
        return this.dropdownMenu?.classList.contains('visible');
    }

    /**
     * Close menu
     */
    closeMenu() {
        this.dropdownMenu.classList.remove('visible');
        this.menuButton.setAttribute('aria-expanded', 'false');
        
        // Remove body scroll lock
        document.body.style.overflow = '';
        
        this.dispatchGestureEvent(this.gestures.TAP, { action: 'close-menu' });
    }

    /**
     * Setup focus trap for mobile menu accessibility
     * Traps Tab key within menu and allows Escape to close
     */
    setupFocusTrap() {
        // Prevent duplicate setup
        if (this.focusTrapSetup) return;
        
        const menu = document.getElementById('dropdown-menu');
        const menuLinks = menu?.querySelectorAll('a');
        if (!menu || !menuLinks.length) return;

        const firstLink = menuLinks[0];
        const lastLink = menuLinks[menuLinks.length - 1];

        menu.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstLink) {
                        e.preventDefault();
                        lastLink.focus();
                    }
                } else {
                    if (document.activeElement === lastLink) {
                        e.preventDefault();
                        firstLink.focus();
                    }
                }
            }
            if (e.key === 'Escape') {
                this.closeMenu();
                document.getElementById('menu-button')?.focus();
            }
        });
        
        this.focusTrapSetup = true;
    }

    /**
     * Focus first menu item when menu opens
     */
    focusFirstMenuItem() {
        const menuLinks = this.dropdownMenu?.querySelectorAll('a');
        if (menuLinks && menuLinks.length > 0) {
            menuLinks[0].focus();
        }
    }

    /**
     * Announce menu state to screen readers
     */
    announceMenuState(isOpen) {
        const message = isOpen ? 'Menu opened' : 'Menu closed';
        
        // Create or update live region
        let liveRegion = document.getElementById('mobile-nav-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'mobile-nav-live-region';
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
     * Dispatch custom gesture event
     */
    dispatchGestureEvent(gestureType, data = {}) {
        const event = new CustomEvent('mobilegesture', {
            detail: {
                gesture: gestureType,
                ...data,
                timestamp: Date.now()
            },
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Add mobile navigation styles
     */
    addMobileStyles() {
        const styleId = 'mobile-navigation-styles';
        
        if (document.getElementById(styleId)) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Mobile Navigation Styles */
            .mobile-device .mobile-optimized {
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
            }
            
            .mobile-device .touch-pressed {
                transform: scale(0.95);
                transition: transform 0.1s ease;
            }
            
            .mobile-device .long-press-animation {
                animation: longPressPulse 0.3s ease-out;
            }
            
            @keyframes longPressPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            .ripple-effect {
                position: absolute;
                border-radius: 50%;
                background: rgba(154, 184, 145, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            .mobile-optimized.visible {
                max-height: 70vh;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            }
            
            /* Touch target improvements */
            .touch-optimized {
                position: relative;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            .touch-optimized::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 44px;
                height: 44px;
                transform: translate(-50%, -50%);
                pointer-events: none;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Get mobile navigation statistics
     */
    getMobileStats() {
        return {
            isMobile: this.isMobile,
            hapticSupported: this.hapticSupported,
            menuOpen: this.isMenuOpen(),
            gesturesSupported: Object.keys(this.gestures).length,
            touchOptimized: document.querySelectorAll('.touch-optimized').length
        };
    }

    /**
     * Update mobile detection
     */
    updateMobileDetection() {
        this.isMobile = this.detectMobile();
        
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
        } else {
            document.body.classList.remove('mobile-device');
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        // Remove event listeners
        if (this.menuButton) {
            this.menuButton.removeEventListener('touchstart', this.handleTouchStart);
            this.menuButton.removeEventListener('touchend', this.handleTouchEnd);
        }
        
        if (this.dropdownMenu) {
            this.dropdownMenu.removeEventListener('touchstart', this.handleMenuTouchStart);
            this.dropdownMenu.removeEventListener('touchmove', this.handleMenuTouchMove);
            this.dropdownMenu.removeEventListener('touchend', this.handleMenuTouchEnd);
        }
        
        document.body.removeEventListener('touchstart', this.handleGlobalTouchStart);
        document.body.removeEventListener('touchend', this.handleGlobalTouchEnd);
        
        // Remove mobile classes
        document.body.classList.remove('mobile-device');
        this.menuButton.classList.remove('mobile-optimized', 'touch-optimized');
        this.dropdownMenu.classList.remove('mobile-optimized');
        
        // Remove styles
        const style = document.getElementById('mobile-navigation-styles');
        if (style) {
            style.remove();
        }
        
        this.menuButton = null;
        this.dropdownMenu = null;
        this.initialized = false;
    }
}