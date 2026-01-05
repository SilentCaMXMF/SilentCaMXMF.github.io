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
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        if (window.matchMedia('(hover: hover)').matches) {
          const rect = button.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        }
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = '';
      });
    });
  },

  setupParallaxEffect() {
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.skill-card, .repo-card');
        
        parallaxElements.forEach((element, index) => {
          const speed = 0.5 + (index * 0.1);
          const yPos = -(scrolled * speed / 10);
          element.style.transform = `translateY(${yPos}px)`;
        });
      });
    }
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