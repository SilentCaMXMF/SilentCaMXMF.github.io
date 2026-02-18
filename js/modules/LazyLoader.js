/**
 * LazyLoader Module
 * Handles image lazy loading with Intersection Observer
 */

export class LazyLoader {
    constructor() {
        this.imageObserver = null;
        this.pictureObserver = null;
        this.initialized = false;
        
        // Observer options
        this.observerOptions = {
            rootMargin: '50px 0px',
            threshold: 0.01
        };
    }

    /**
     * Initialize lazy loader
     */
    initialize() {
        try {
            this.createObservers();
            this.observeElements();
            this.initialized = true;
        } catch (error) {
            console.error('❌ LazyLoader initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create Intersection Observers
     */
    createObservers() {
        // Image observer for standalone images
        this.imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target, observer);
                }
            });
        }, this.observerOptions);

        // Picture observer for picture elements
        this.pictureObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadPicture(entry.target, observer);
                }
            });
        }, this.observerOptions);
    }

    /**
     * Observe all lazy-loadable elements
     */
    observeElements() {
        // Observe standalone images
        const lazyImages = document.querySelectorAll('img[data-src]:not(picture img)');
        lazyImages.forEach(img => {
            img.classList.add('lazy-loading');
            this.imageObserver.observe(img);
        });

        // Observe picture elements (fallback for browsers without :has() support)
        const allPictures = document.querySelectorAll('picture');
        const lazyPictures = Array.from(allPictures).filter(picture => {
            const img = picture.querySelector('img[data-src]');
            return img !== null;
        });
        
        lazyPictures.forEach(picture => {
            const img = picture.querySelector('img[data-src]');
            if (img) {
                img.classList.add('lazy-loading');
            }
            this.pictureObserver.observe(picture);
        });
    }

    /**
     * Load a single image
     */
    loadImage(img, observer) {
        const src = img.dataset.src;
        
        if (src) {
            // Create new image to preload
            const newImg = new Image();
            
            newImg.onload = () => {
                img.src = src;
                img.classList.add('loaded');
                img.classList.remove('lazy-loading');
                observer.unobserve(img);
            };
            
            newImg.onerror = () => {
                console.warn(`⚠️ Failed to load image: ${src}`);
                img.classList.add('error');
                observer.unobserve(img);
            };
            
            newImg.src = src;
        }
    }

    /**
     * Load a picture element with sources
     */
    loadPicture(picture, observer) {
        const sources = picture.querySelectorAll('source[data-srcset]');
        const img = picture.querySelector('img[data-src]');
        
        try {
            // Update source elements first
            sources.forEach(source => {
                const srcset = source.dataset.srcset;
                if (srcset) {
                    source.srcset = srcset;
                    source.removeAttribute('data-srcset');
                }
            });
            
            // Then update img element
            if (img) {
                const src = img.dataset.src;
                if (src) {
                    img.src = src;
                    img.onload = () => {
                        img.classList.add('loaded');
                        img.classList.remove('lazy-loading');
                        img.removeAttribute('data-src');
                    };
                    observer.unobserve(picture);
                }
            }
            
        } catch (error) {
            console.error('❌ Error loading picture:', error);
            observer.unobserve(picture);
        }
    }

    /**
     * Add new element to observe
     */
    observe(element) {
        if (element.tagName === 'PICTURE') {
            this.pictureObserver.observe(element);
        } else if (element.tagName === 'IMG') {
            this.imageObserver.observe(element);
        }
    }

    /**
     * Remove element from observation
     */
    unobserve(element) {
        if (element.tagName === 'PICTURE' && this.pictureObserver) {
            this.pictureObserver.unobserve(element);
        } else if (element.tagName === 'IMG' && this.imageObserver) {
            this.imageObserver.unobserve(element);
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        
        if (this.pictureObserver) {
            this.pictureObserver.disconnect();
        }
        
        this.initialized = false;
    }
}