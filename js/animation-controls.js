// Animation controls and enhanced interactions
// Add this to your existing script.js

// Animation control functionality
const animationController = {
  init() {
    this.createAnimationControl();
    this.loadAnimationPreference();
    this.setupIntersectionObserver();
    this.setupEnhancedInteractions();
  },

  createAnimationControl() {
    const control = document.createElement('button');
    control.className = 'animation-control';
    control.innerHTML = '<i class="fas fa-pause"></i>';
    control.setAttribute('aria-label', 'Toggle animations');
    control.title = 'Pause/Resume animations';
    
    control.addEventListener('click', () => this.toggleAnimations());
    document.body.appendChild(control);
  },

  toggleAnimations() {
    const body = document.body;
    const control = document.querySelector('.animation-control i');
    const isPaused = body.classList.toggle('animations-paused');
    
    control.className = isPaused ? 'fas fa-play' : 'fas fa-pause';
    localStorage.setItem('animationsPaused', isPaused);
    
    // Announce to screen readers
    this.announceToScreenReader(isPaused ? 'Animations paused' : 'Animations resumed');
  },

  loadAnimationPreference() {
    const isPaused = localStorage.getItem('animationsPaused') === 'true';
    if (isPaused) {
      document.body.classList.add('animations-paused');
      const control = document.querySelector('.animation-control i');
      if (control) control.className = 'fas fa-play';
    }
  },

  setupIntersectionObserver() {
    // Fade in sections when they come into view
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });
  },

  setupEnhancedInteractions() {
    this.setupMagneticButtons();
    this.setupParallaxEffect();
    this.setupSmoothScroll();
  },

  setupMagneticButtons() {
    // Only apply on hover-capable devices (skip touch devices)
    if (!window.matchMedia('(hover: hover)').matches) return;

    const buttons = document.querySelectorAll('.btn');
    const magneticStrength = 0.2;

    buttons.forEach(button => {
      let rafId = null;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let isHovering = false;

      // Pre-calculate button dimensions to avoid layout thrashing
      let rect = button.getBoundingClientRect();

      // Update rect on resize
      const updateRect = () => {
        rect = button.getBoundingClientRect();
      };
      window.addEventListener('resize', updateRect, { passive: true });

      const animate = () => {
        if (!isHovering && Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1) {
          // Stop animation when settled
          button.style.transform = '';
          rafId = null;
          return;
        }

        // Smooth interpolation (lerp) for natural motion
        currentX += (targetX - currentX) * 0.15;
        currentY += (targetY - currentY) * 0.15;

        // Batch DOM write
        button.style.transform = `translate(${currentX}px, ${currentY}px)`;

        rafId = requestAnimationFrame(animate);
      };

      button.addEventListener('mouseenter', () => {
        isHovering = true;
        updateRect();
      });

      button.addEventListener('mousemove', (e) => {
        if (!isHovering) return;

        // Calculate target position (throttled via RAF)
        targetX = (e.clientX - rect.left - rect.width / 2) * magneticStrength;
        targetY = (e.clientY - rect.top - rect.height / 2) * magneticStrength;

        // Start RAF loop if not already running
        if (!rafId) {
          rafId = requestAnimationFrame(animate);
        }
      });

      button.addEventListener('mouseleave', () => {
        isHovering = false;
        targetX = 0;
        targetY = 0;

        // RAF continues until animation settles naturally
        if (!rafId) {
          rafId = requestAnimationFrame(animate);
        }
      });
    });
  },

  setupParallaxEffect() {
    // Respect user's motion preferences
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

    const parallaxElements = document.querySelectorAll('.skill-card, .repo-card');
    if (parallaxElements.length === 0) return;

    // Pre-calculate element speeds to avoid DOM reads in the animation loop
    const elementsWithSpeed = Array.from(parallaxElements).map((element, index) => ({
      element,
      speed: (0.5 + (index * 0.1)) / 10
    }));

    let ticking = false;
    let lastScrollY = window.pageYOffset;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;

      // Batch all DOM writes together
      elementsWithSpeed.forEach(({ element, speed }) => {
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });

      ticking = false;
      lastScrollY = scrolled;
    };

    const onScroll = () => {
      // Skip if scroll position hasn't changed significantly (optional optimization)
      const currentScrollY = window.pageYOffset;
      if (Math.abs(currentScrollY - lastScrollY) < 1) return;

      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial render
    updateParallax();
  },

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  },

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }
};

// Enhanced loading states
const enhancedLoading = {
  showSkeleton(container, count = 3) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-card';
      skeleton.innerHTML = `
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
      `;
      container.appendChild(skeleton);
    }
  },

  showEnhancedSpinner(container) {
    container.innerHTML = `
      <div class="featured-loading">
        <div class="loading-enhanced"></div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <p>Loading amazing projects...</p>
      </div>
    `;
  }
};

// Touch device optimizations
const touchOptimizations = {
  init() {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      this.optimizeForTouch();
    }
  },

  optimizeForTouch() {
    // Increase touch targets
    document.querySelectorAll('.btn, .skill-card, .repo-card').forEach(element => {
      element.style.minHeight = '48px';
      element.style.minWidth = '48px';
    });

    // Remove hover effects on touch devices
    const style = document.createElement('style');
    style.textContent = `
      @media (hover: none) {
        .skill-card:hover,
        .repo-card:hover,
        .btn:hover {
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// Performance monitoring
const performanceMonitor = {
  init() {
    this.measureAnimationPerformance();
  },

  measureAnimationPerformance() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 16.67) { // More than one frame
            console.warn(`Slow animation detected: ${entry.name} took ${entry.duration}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });
    }
  }
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  animationController.init();
  touchOptimizations.init();
  performanceMonitor.init();
});

// Make enhanced loading available globally
window.enhancedLoading = enhancedLoading;