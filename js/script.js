// Replace Font Awesome classes with custom icons
function replaceFontIcons() {
    const iconMappings = {
        'fas fa-moon': 'icon icon-moon',
        'fas fa-sun': 'icon icon-sun',
        'fas fa-exclamation-triangle': 'icon icon-exclamation-triangle',
        'fas fa-info-circle': 'icon icon-info-circle',
        'fas fa-star': 'icon icon-star',
        'fas fa-code-branch': 'icon icon-code-branch',
        'fas fa-clock': 'icon icon-clock',
        'fas fa-chevron-left': 'icon icon-chevron-left',
        'fas fa-chevron-right': 'icon icon-chevron-right',
        'fas fa-search': 'icon icon-search',
        'fas fa-envelope': 'icon icon-envelope',
        'fas fa-map-marker-alt': 'icon icon-map-marker-alt',
        'fas fa-arrow-up': 'icon icon-arrow-up',
        'fas fa-pause': 'icon icon-pause',
        'fas fa-play': 'icon icon-play',
        'fab fa-html5': 'icon icon-html5',
        'fab fa-css3-alt': 'icon icon-css3-alt',
        'fab fa-js': 'icon icon-js',
        'fab fa-react': 'icon icon-react',
        'fab fa-python': 'icon icon-python',
        'fab fa-php': 'icon icon-php',
        'fab fa-git-alt': 'icon icon-git-alt',
        'fab fa-bootstrap': 'icon icon-bootstrap',
        'fab fa-linkedin': 'icon icon-linkedin',
        'fab fa-github': 'icon icon-github',
        'fab fa-free-code-camp': 'icon icon-free-code-camp'
    };

    // Replace all Font Awesome classes
    Object.entries(iconMappings).forEach(([faClass, customClass]) => {
        const elements = document.querySelectorAll(`.${faClass.replace(/\s+/g, '.')}`);
        elements.forEach(element => {
            element.className = customClass;
        });
    });
}

// Image lazy loading with Intersection Observer
document.addEventListener('DOMContentLoaded', function() {
    // Replace Font Awesome icons immediately
    replaceFontIcons();
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                
                if (src) {
                    img.src = src;
                    img.onload = () => {
                        img.classList.add('loaded');
                        img.classList.remove('lazy-loading');
                    };
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    // Handle picture elements with lazy loading
    const pictureObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const picture = entry.target;
                const sources = picture.querySelectorAll('source[data-srcset]');
                const img = picture.querySelector('img[data-src]');
                
                // Update source elements
                sources.forEach(source => {
                    const srcset = source.dataset.srcset;
                    if (srcset) {
                        source.srcset = srcset;
                        source.removeAttribute('data-srcset');
                    }
                });
                
                // Update img element
                if (img) {
                    const src = img.dataset.src;
                    if (src) {
                        img.src = src;
                        img.onload = () => {
                            img.classList.add('loaded');
                            img.classList.remove('lazy-loading');
                        };
                        img.removeAttribute('data-src');
                    }
                }
                
                observer.unobserve(picture);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    // Observe all lazy-loaded images
    const lazyImages = document.querySelectorAll('img[data-src]:not(picture img)');
    lazyImages.forEach(img => {
        img.classList.add('lazy-loading');
        imageObserver.observe(img);
    });

    // Observe picture elements with lazy loading
    const lazyPictures = document.querySelectorAll('picture:has(img[data-src])');
    lazyPictures.forEach(picture => {
        const img = picture.querySelector('img[data-src]');
        if (img) {
            img.classList.add('lazy-loading');
        }
        pictureObserver.observe(picture);
    });
});

document.getElementById('menu-button').addEventListener('click', function (e) {
    const dropdownMenu = document.getElementById('dropdown-menu');
    const isVisible = dropdownMenu.classList.toggle('visible');
    this.setAttribute('aria-expanded', isVisible);
    e.stopPropagation();
});

document.addEventListener('click', function (e) {
    const dropdownMenu = document.getElementById('dropdown-menu');
    const menuButton = document.getElementById('menu-button');
    if (
        dropdownMenu.classList.contains('visible') &&
        !dropdownMenu.contains(e.target) &&
        e.target !== menuButton
    ) {
        dropdownMenu.classList.remove('visible');
    }
});

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    themeIcon.className = newTheme === 'dark' ? 'icon icon-sun' : 'icon icon-moon';
}

themeToggle.addEventListener('click', toggleTheme);

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeIcon.className = savedTheme === 'dark' ? 'icon icon-sun' : 'icon icon-moon';

let featuredRepos = [];
let currentFeaturedIndex = 0;

async function fetchFeaturedRepos() {
    const featuredContainer = document.getElementById("featured-container");
    const featuredSpinner = document.getElementById("featured-loading-spinner");
    
    featuredSpinner.style.display = 'block';
    
    try {
        const response = await fetch("https://api.github.com/users/SilentCaMXMF/repos?per_page=100");
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const allRepos = await response.json();
        
        const reposWithDescriptions = allRepos.filter(repo => repo.description && repo.description.trim() !== "");
        
        const sortedRepos = [...reposWithDescriptions].sort((a, b) => {
            const dateCompare = new Date(b.updated_at) - new Date(a.updated_at);
            if (dateCompare !== 0) return dateCompare;
            return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        });
        
        featuredRepos = sortedRepos.slice(0, 5);
        currentFeaturedIndex = 0;
        
        renderFeaturedRepos();
        setupFeaturedNavigation();
        
    } catch (error) {
        console.error("Error fetching featured repos:", error);
        document.getElementById("featured-container").innerHTML = `
            <div class="alert alert-warning" role="alert">
                <i class="fas fa-exclamation-triangle"></i> 
                Failed to load featured projects.
            </div>
        `;
        featuredContainer.style.display = 'block';
    } finally {
        featuredSpinner.style.display = 'none';
    }
}

function renderFeaturedRepos() {
    const featuredProject = document.getElementById("featured-project");
    const featuredContainer = document.getElementById("featured-container");
    const featuredSkeleton = document.getElementById("featured-skeleton");
    
    // Remove skeleton loader
    if (featuredSkeleton) {
        featuredSkeleton.remove();
    }
    
    if (featuredRepos.length === 0) {
        featuredContainer.innerHTML = `
            <div class="alert alert-info" role="alert">
                <i class="fas fa-info-circle"></i> 
                No featured projects found.
            </div>
        `;
        featuredContainer.style.display = 'block';
        return;
    }
    
    const repo = featuredRepos[currentFeaturedIndex];
    
    featuredProject.innerHTML = `
        <div class="repo-card featured h-100">
            <div class="star-badge">
                <i class="fas fa-star"></i>
            </div>
            <div class="repo-header">
                <div class="repo-name">${repo.name}</div>
                <div class="repo-description">${repo.description || "No description available."}</div>
            </div>
            <div class="repo-meta">
                <span>
                    <i class="fas fa-code-branch"></i> ${repo.language || 'N/A'}
                </span>
                <span>
                    <i class="fas fa-star"></i> ${repo.stargazers_count || 0}
                </span>
                <span>
                    <i class="fas fa-clock"></i> ${new Date(repo.updated_at).toLocaleDateString()}
                </span>
            </div>
            <div class="repo-footer">
                <a href="${repo.html_url}" target="_blank" class="repo-link">
                    <i class="fab fa-github"></i> View Repository
                </a>
            </div>
        </div>
    `;
    
    updateFeaturedCounter();
    featuredContainer.style.display = 'block';
}

function setupFeaturedNavigation() {
    const prevBtn = document.getElementById("featured-prev");
    const nextBtn = document.getElementById("featured-next");
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", showPreviousFeatured);
        nextBtn.addEventListener("click", showNextFeatured);
        updateNavigationButtons();
    }
}

function showPreviousFeatured() {
    if (currentFeaturedIndex > 0) {
        currentFeaturedIndex--;
        renderFeaturedRepos();
        updateNavigationButtons();
    }
}

function showNextFeatured() {
    if (currentFeaturedIndex < featuredRepos.length - 1) {
        currentFeaturedIndex++;
        renderFeaturedRepos();
        updateNavigationButtons();
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById("featured-prev");
    const nextBtn = document.getElementById("featured-next");
    
    if (prevBtn) {
        prevBtn.disabled = currentFeaturedIndex === 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentFeaturedIndex === featuredRepos.length - 1;
    }
}

function updateFeaturedCounter() {
    const counter = document.getElementById("featured-counter");
    if (counter) {
        counter.textContent = `${currentFeaturedIndex + 1} / ${featuredRepos.length}`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchFeaturedRepos();
    
    const repoContainer = document.getElementById("github-repos");
    const filterInput = document.getElementById("repo-filter");
    const sortSelect = document.getElementById("repo-sort");
    const loadingSpinner = document.getElementById("loading-spinner");
    const noReposMessage = document.getElementById("no-repos-message");
    
    let allRepos = [];
    let reposWithDesc = [];
    let reposWithoutDesc = [];

    async function fetchRepos() {
        loadingSpinner.style.display = 'block';
        noReposMessage.style.display = 'none';
        
        const cacheKey = 'github-repos-cache';
        const cacheExpiry = 5 * 60 * 1000;
        
        try {
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                const { data, timestamp } = JSON.parse(cachedData);
                const now = Date.now();
                
                if (now - timestamp < cacheExpiry) {
                    allRepos = data;
                }
            }
            
            if (allRepos.length === 0) {
                const response = await fetch("https://api.github.com/users/SilentCaMXMF/repos?per_page=100");
                
                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`);
                }
                
                allRepos = await response.json();
                
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: allRepos,
                    timestamp: Date.now()
                }));
            }
            
            reposWithDesc = allRepos.filter(repo => repo.description && repo.description.trim() !== "");
            reposWithoutDesc = allRepos.filter(repo => !repo.description || repo.description.trim() === "");
            
            renderRepos(reposWithDesc.slice(0, 3));
            
            if (reposWithoutDesc.length > 0) {
                showLoadMoreButton();
            }
            
        } catch (error) {
            console.error("Error fetching repos:", error);
            repoContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Failed to load repositories. Please try again later.
                    </div>
                </div>
            `;
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    function filterRepos(repos, query) {
        const lower = query.toLowerCase();
        const filtered = repos.filter(repo =>
            repo.name.toLowerCase().includes(lower) ||
            (repo.description && repo.description.toLowerCase().includes(lower))
        );
        return sortRepos(filtered);
    }

    function sortRepos(repos) {
        const sortType = sortSelect.value;
        return [...repos].sort((a, b) => {
            if (sortType === "name") {
                return a.name.localeCompare(b.name);
            } else if (sortType === "updated") {
                return new Date(b.updated_at) - new Date(a.updated_at);
            } else if (sortType === "stars") {
                return (b.stargazers_count || 0) - (a.stargazers_count || 0);
            }
            return 0;
        });
    }

    function renderRepos(repos) {
        // Remove skeleton loaders first
        const skeletonCards = repoContainer.querySelectorAll('.skeleton-repo-card');
        skeletonCards.forEach(card => card.remove());
        
        repoContainer.innerHTML = "";
        
        if (repos.length === 0) {
            noReposMessage.style.display = 'block';
            return;
        }
        
        noReposMessage.style.display = 'none';

        repos.forEach(repo => {
            const card = document.createElement("div");
            card.className = "col-md-6 col-lg-4 mb-4";

            card.innerHTML = `
                <div class="repo-card h-100">
                    <div class="repo-header">
                        <div class="repo-name">${repo.name}</div>
                        <div class="repo-description">${repo.description || "No description available."}</div>
                    </div>
                    <div class="repo-meta">
                        <span>
                            <i class="fas fa-star"></i> ${repo.stargazers_count || 0}
                        </span>
                        <span>
                            <i class="fas fa-clock"></i> ${new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div class="repo-footer">
                        <a href="${repo.html_url}" target="_blank" class="repo-link">
                            <i class="fab fa-github"></i> View Repository
                        </a>
                    </div>
                </div>
            `;

            repoContainer.appendChild(card);
        });
    }

    function showLoadMoreButton() {
        const btn = document.createElement("button");
        btn.textContent = "Load repos without description";
        btn.className = "btn btn-secondary my-3";
        btn.addEventListener("click", () => {
            const filtered = filterRepos(reposWithoutDesc, filterInput.value);
            appendRepos(filtered);
            btn.remove();
        });

        repoContainer.parentElement.insertBefore(btn, repoContainer.nextSibling);
    }

    function appendRepos(repos) {
        repos.forEach(repo => {
            const card = document.createElement("div");
            card.className = "col-md-6 col-lg-4 mb-4";

            card.innerHTML = `
                <div class="repo-card h-100">
                    <div class="repo-header">
                        <div class="repo-name">${repo.name}</div>
                        <div class="repo-description">${repo.description || "No description available."}</div>
                    </div>
                    <div class="repo-meta">
                        <span>
                            <i class="fas fa-star"></i> ${repo.stargazers_count || 0}
                        </span>
                        <span>
                            <i class="fas fa-clock"></i> ${new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div class="repo-footer">
                        <a href="${repo.html_url}" target="_blank" class="repo-link">
                            <i class="fab fa-github"></i> View Repository
                        </a>
                    </div>
                </div>
            `;

            repoContainer.appendChild(card);
        });
    }

    filterInput.addEventListener("input", () => {
        const filtered = filterRepos(reposWithDesc, filterInput.value);
        renderRepos(filtered);
    });

    sortSelect.addEventListener("change", () => {
        const filtered = filterRepos(reposWithDesc, filterInput.value);
        renderRepos(filtered);
    });

    fetchRepos();
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Animation control functionality
    const animationToggle = document.getElementById('animation-toggle');
    const animationIcon = animationToggle.querySelector('i');

    // Create screen reader announcement element
    const announcementEl = document.createElement('div');
    announcementEl.setAttribute('id', 'animation-announcement');
    announcementEl.setAttribute('aria-live', 'polite');
    announcementEl.setAttribute('aria-atomic', 'true');
    announcementEl.className = 'sr-only';
    announcementEl.textContent = 'Animations enabled';
    document.body.appendChild(announcementEl);

    // Function to announce animation state changes to screen readers
    function announceAnimationState(isPaused) {
        const message = isPaused ? 'Animations paused' : 'Animations enabled';
        announcementEl.textContent = '';
        // Small delay to ensure screen readers announce changes
        setTimeout(() => {
            announcementEl.textContent = message;
        }, 50);
    }

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize animation state (prioritize reduced motion over saved preference)
    let animationsPaused = prefersReducedMotion || localStorage.getItem('animationsPaused') === 'true';

    function updateAnimationState() {
        if (animationsPaused) {
            document.body.classList.add('animations-paused');
            document.documentElement.setAttribute('data-animations', 'paused');
            animationIcon.className = 'fas fa-play';
            animationToggle.setAttribute('title', 'Play animations');
            animationToggle.setAttribute('aria-label', 'Play animations');
            animationToggle.setAttribute('aria-pressed', 'true');
        } else {
            document.body.classList.remove('animations-paused');
            document.documentElement.setAttribute('data-animations', 'enabled');
            animationIcon.className = 'fas fa-pause';
            animationToggle.setAttribute('title', 'Pause animations');
            animationToggle.setAttribute('aria-label', 'Pause animations');
            animationToggle.setAttribute('aria-pressed', 'false');
        }
    }

    // Initialize animation state
    updateAnimationState();

    // Listen for changes in prefers-reduced-motion
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        if (e.matches) {
            animationsPaused = true;
            localStorage.setItem('animationsPaused', animationsPaused);
            updateAnimationState();
            announceAnimationState(animationsPaused);
        }
    });

    animationToggle.addEventListener('click', function() {
        animationsPaused = !animationsPaused;
        localStorage.setItem('animationsPaused', animationsPaused);
        updateAnimationState();
        announceAnimationState(animationsPaused);
    });
});

// ==========================================
// KEYBOARD NAVIGATION IMPROVEMENTS
// ==========================================

// Enhanced single-page navigation with keyboard support
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            // Update aria-current for navigation
            document.querySelectorAll('nav a[aria-current="page"]')
                .forEach(link => link.removeAttribute('aria-current'));
            this.setAttribute('aria-current', 'page');
            
            // Smooth scroll to target
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Set focus to target for screen readers
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus({ preventScroll: true });
            
            // Announce navigation to screen readers
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = `Navigated to ${targetElement.querySelector('h2, h3')?.textContent || 'section'}`;
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        }
    });
});

// Make interactive cards keyboard accessible
document.querySelectorAll('.repo-card, .skill-card, .education-card, .timeline-item').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'article');
    
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const link = card.querySelector('a[href]');
            if (link) {
                link.click();
            }
        }
    });
});

// Featured project navigation keyboard support
document.getElementById('featured-prev')?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        showPreviousFeatured();
    }
});

document.getElementById('featured-next')?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        showNextFeatured();
    }
});

// Search and filter keyboard support
document.getElementById('repo-filter')?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.target.value = '';
        e.target.dispatchEvent(new Event('input'));
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Skip to main content: Alt + Tab (but prevent default browser behavior)
    if (e.altKey && e.key === 'Tab' && e.shiftKey === false) {
        e.preventDefault();
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.focus();
        }
    }
    
    // Search focus: / key
    if (e.key === '/' && e.ctrlKey === false && e.altKey === false && 
        document.activeElement.tagName !== 'INPUT' && 
        document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('repo-filter');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Animation toggle: Alt + A
    if (e.key === 'a' && e.altKey === true && e.ctrlKey === false) {
        e.preventDefault();
        const toggle = document.getElementById('animation-toggle');
        if (toggle) {
            toggle.click();
        }
    }
    
    // Theme toggle: Alt + T
    if (e.key === 't' && e.altKey === true && e.ctrlKey === false) {
        e.preventDefault();
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.click();
        }
    }
    
    // Back to top: Alt + Home
    if (e.key === 'Home' && e.altKey === true) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            backToTop.focus();
        }
    }
});

// Focus management for dynamic content
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        announcement.remove();
    }, 1000);
}

// Update featured navigation buttons accessibility
function updateNavigationButtons() {
    const prevBtn = document.getElementById("featured-prev");
    const nextBtn = document.getElementById("featured-next");
    
    if (prevBtn) {
        const isDisabled = currentFeaturedIndex === 0;
        prevBtn.disabled = isDisabled;
        prevBtn.setAttribute('aria-disabled', isDisabled.toString());
    }
    
    if (nextBtn) {
        const isDisabled = currentFeaturedIndex === featuredRepos.length - 1;
        nextBtn.disabled = isDisabled;
        nextBtn.setAttribute('aria-disabled', isDisabled.toString());
    }
}

// Enhance skip link with keyboard shortcut hint
document.querySelector('.skip-link')?.addEventListener('focus', function() {
    this.setAttribute('aria-label', 'Skip to main content (Alt+Tab to activate)');
});

document.querySelector('.skip-link')?.addEventListener('blur', function() {
    this.setAttribute('aria-label', 'Skip to main content');
});

// Add keyboard support for certificate links
document.querySelectorAll('.cert-link')?.forEach(link => {
    link.setAttribute('aria-label', `View certificate for ${link.closest('.education-item')?.querySelector('h4')?.textContent || 'certification'}`);
});

// Add keyboard support for project cards
document.querySelectorAll('.repo-card')?.forEach((card, index) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Project: ${card.querySelector('.repo-name')?.textContent || 'Repository'}`);
    
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const viewLink = card.querySelector('.repo-link');
            if (viewLink) {
                window.open(viewLink.href, '_blank');
            }
        }
    });
});

// Ensure proper focus order for forms
document.getElementById('repo-filter')?.addEventListener('focus', function() {
    this.parentElement.classList.add('focused');
});

document.getElementById('repo-filter')?.addEventListener('blur', function() {
    this.parentElement.classList.remove('focused');
});

document.getElementById('repo-sort')?.addEventListener('focus', function() {
    this.classList.add('focused');
});

document.getElementById('repo-sort')?.addEventListener('blur', function() {
    this.classList.remove('focused');
});
