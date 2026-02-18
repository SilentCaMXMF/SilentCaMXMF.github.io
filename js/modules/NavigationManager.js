/**
 * NavigationManager Module
 * Handles smooth scrolling, mobile navigation, and single-page navigation
 */

export class NavigationManager {
    constructor() {
        this.menuButton = null;
        this.dropdownMenu = null;
        this.mainNav = null;
        this.navigationLinks = [];
        this.currentSection = null;
        this.initialized = false;
        
        // Debounce timer for scroll events
        this.scrollTimer = null;
        this.scrollThreshold = 50; // ms
    }

    /**
     * Initialize navigation manager
     */
    initialize() {
        try {
            this.cacheElements();
            this.bindEvents();
            this.setupSmoothScrolling();
            this.setupScrollSpy();
            this.initialized = true;
        } catch (error) {
            console.error('❌ NavigationManager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.menuButton = document.getElementById('menu-button');
        this.dropdownMenu = document.getElementById('dropdown-menu');
        this.mainNav = document.getElementById('main-nav');
        this.navigationLinks = document.querySelectorAll('nav a[href^="#"]');
        
        if (!this.menuButton || !this.dropdownMenu) {
            console.warn('Navigation elements not found:', {
                menuButton: !!this.menuButton,
                dropdownMenu: !!this.dropdownMenu
            });
            // Don't throw error, just log warning to prevent crashes
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Mobile menu toggle
        this.menuButton.addEventListener('click', (e) => this.toggleMobileMenu(e));
        
        // Close mobile menu on outside click
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        // Navigation links
        this.navigationLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigationClick(e));
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => this.handlePopState(e));
        
        // Handle initial hash
        if (window.location.hash) {
            this.navigateToSection(window.location.hash.substring(1));
        }
    }

    /**
     * Setup smooth scrolling
     */
    setupSmoothScrolling() {
        // Enable smooth scrolling behavior
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Add smooth scrolling to all anchor links
        this.navigationLinks.forEach(link => {
            link.setAttribute('data-smooth-scroll', 'true');
        });
    }

    /**
     * Setup scroll spy for active section tracking
     */
    setupScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        
        if (!sections.length) {
            return;
        }

        // Debounced scroll handler
        const handleScroll = () => {
            clearTimeout(this.scrollTimer);
            this.scrollTimer = setTimeout(() => {
                this.updateActiveSection(sections);
            }, this.scrollThreshold);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial check
        this.updateActiveSection(sections);
    }

    /**
     * Update active section based on scroll position
     */
    updateActiveSection(sections) {
        const scrollPosition = window.scrollY + 100; // Offset for header
        
        let currentSection = null;
        
        for (const section of sections) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id;
                break;
            }
        }
        
        if (currentSection !== this.currentSection) {
            this.currentSection = currentSection;
            this.updateActiveNavigation(currentSection);
            this.dispatchSectionChange(currentSection);
        }
    }

    /**
     * Update active navigation link
     */
    updateActiveSection(activeSection) {
        this.navigationLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            if (href === `#${activeSection}`) {
                link.setAttribute('aria-current', 'page');
                link.classList.add('active');
            } else {
                link.removeAttribute('aria-current');
                link.classList.remove('active');
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu(event) {
        event.stopPropagation();
        
        const isVisible = this.dropdownMenu.classList.toggle('visible');
        this.menuButton.setAttribute('aria-expanded', isVisible);
        
        // Prevent body scroll when menu is open
        if (isVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    /**
     * Handle outside click to close mobile menu
     */
    handleOutsideClick(event) {
        const isMenuOpen = this.dropdownMenu.classList.contains('visible');
        const isClickOutside = !this.dropdownMenu.contains(event.target) && 
                           event.target !== this.menuButton;
        
        if (isMenuOpen && isClickOutside) {
            this.closeMobileMenu();
        }
    }

    /**
     * Handle navigation link clicks
     */
    handleNavigationClick(event) {
        const href = event.currentTarget.getAttribute('href');
        
        if (href.startsWith('#')) {
            event.preventDefault();
            
            const targetId = href.substring(1);
            this.navigateToSection(targetId);
            
            // Close mobile menu if open
            this.closeMobileMenu();
        }
    }

    /**
     * Navigate to specific section
     */
    navigateToSection(sectionId) {
        try {
            const targetElement = document.getElementById(sectionId);
            
            if (!targetElement) {
                console.warn(`Section not found: ${sectionId}`);
                return false;
            }

            // Calculate scroll position with header offset
            const headerHeight = document.querySelector('header')?.offsetHeight || 0;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            // Smooth scroll to position
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update URL without triggering navigation
            if (history.pushState) {
                history.pushState(null, null, `#${sectionId}`);
            }
            
            // Announce to screen readers
            this.announceNavigation(sectionId);
            
            return true;
            
        } catch (error) {
            console.error('❌ Navigation failed:', error);
            return false;
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.dropdownMenu.classList.remove('visible');
        this.menuButton.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    /**
     * Handle browser popstate events
     */
    handlePopState(event) {
        const hash = window.location.hash;
        if (hash) {
            const sectionId = hash.substring(1);
            setTimeout(() => this.navigateToSection(sectionId), 100);
        }
    }

    /**
     * Announce navigation to screen readers
     */
    announceNavigation(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const sectionTitle = section.querySelector('h2, h1')?.textContent || sectionId;
            const announcement = `Navigated to ${sectionTitle} section`;
            
            // Create or update live region
            let liveRegion = document.getElementById('nav-live-region');
            if (!liveRegion) {
                liveRegion = document.createElement('div');
                liveRegion.id = 'nav-live-region';
                liveRegion.setAttribute('aria-live', 'polite');
                liveRegion.setAttribute('aria-atomic', 'true');
                liveRegion.className = 'sr-only';
                document.body.appendChild(liveRegion);
            }
            
            liveRegion.textContent = announcement;
        }
    }

    /**
     * Dispatch custom section change event
     */
    dispatchSectionChange(sectionId) {
        const event = new CustomEvent('sectionchange', {
            detail: { 
                section: sectionId, 
                previousSection: this.currentSection 
            },
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Get current active section
     */
    getCurrentSection() {
        return this.currentSection;
    }

    /**
     * Check if mobile menu is open
     */
    isMobileMenuOpen() {
        return this.dropdownMenu.classList.contains('visible');
    }

    /**
     * Get navigation statistics
     */
    getNavigationStats() {
        return {
            totalLinks: this.navigationLinks.length,
            currentSection: this.currentSection,
            mobileMenuOpen: this.isMobileMenuOpen()
        };
    }

    /**
     * Focus management for accessibility
     */
    focusSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            // Move focus to section heading
            const heading = section.querySelector('h1, h2, h3');
            if (heading) {
                heading.focus();
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        // Remove event listeners
        if (this.menuButton) {
            this.menuButton.removeEventListener('click', this.toggleMobileMenu);
        }
        
        document.removeEventListener('click', this.handleOutsideClick);
        window.removeEventListener('popstate', this.handlePopState);
        
        // Clear timers
        if (this.scrollTimer) {
            clearTimeout(this.scrollTimer);
        }
        
        // Reset styles
        document.body.style.overflow = '';
        
        this.menuButton = null;
        this.dropdownMenu = null;
        this.mainNav = null;
        this.navigationLinks = [];
        this.initialized = false;
    }
}