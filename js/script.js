/**
 * Pedro Calado Portfolio - Main JavaScript
 * Simplified, flat architecture - no modules or complex class hierarchies
 * All functionality consolidated in one file for easy maintenance
 */

(function() {
    'use strict';

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        FEATURED_REPOS_COUNT: 5,
        SCROLL_TO_TOP_THRESHOLD: 300
    };

    const state = {
        repos: [],
        featuredRepos: [],
        currentTheme: getStoredTheme()
    };

    function getStoredTheme() {
        try {
            return localStorage.getItem('theme') || 'light';
        } catch (e) {
            console.warn('Storage unavailable:', e);
            return 'light';
        }
    }

    // ========================================
    // DOM ELEMENTS
    // ========================================
    const elements = {
        themeToggle: null,
        themeIcon: null,
        menuButton: null,
        dropdownMenu: null,
        featuredGrid: null,
        featuredEmpty: null,
        featuredLoadingSpinner: null,
        currentYear: null,
        backToTop: null
    };

    // ========================================
    // INITIALIZATION
    // ========================================
    function init() {
        console.log('Initializing Portfolio...');

        cacheElements();
        initTheme();
        initNavigation();
        initFeaturedCarousel();
        initBackToTop();
        initCurrentYear();
        loadGitHubRepos();
        registerServiceWorker();

        console.log('Portfolio initialized successfully');
    }

    function cacheElements() {
        elements.themeToggle = document.getElementById('theme-toggle');
        elements.themeIcon = elements.themeToggle ? elements.themeToggle.querySelector('i') : null;
        elements.menuButton = document.getElementById('menu-button');
        elements.dropdownMenu = document.getElementById('dropdown-menu');
        elements.featuredGrid = document.getElementById('featured-grid');
        elements.featuredEmpty = document.getElementById('featured-empty');
        elements.featuredLoadingSpinner = document.getElementById('featured-loading-spinner');
        elements.currentYear = document.getElementById('current-year');
        elements.backToTop = document.getElementById('back-to-top');
    }

    // ========================================
    // THEME MANAGEMENT
    // ========================================
    function initTheme() {
        if (!elements.themeToggle) return;

        document.documentElement.setAttribute('data-theme', state.currentTheme);
        updateThemeIcon();

        elements.themeToggle.addEventListener('click', toggleTheme);
    }

    function toggleTheme() {
        state.currentTheme = state.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', state.currentTheme);
        try {
            localStorage.setItem('theme', state.currentTheme);
        } catch (e) {
            console.warn('Storage unavailable:', e);
        }
        updateThemeIcon();
    }

    function updateThemeIcon() {
        if (elements.themeIcon) {
            elements.themeIcon.className = state.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // ========================================
    // NAVIGATION
    // ========================================
    function initNavigation() {
        if (elements.menuButton && elements.dropdownMenu) {
            elements.menuButton.addEventListener('click', toggleMobileMenu);
        }

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleSmoothScroll);
        });

        initKeyboardNavigation();
    }

    function toggleMobileMenu() {
        const isExpanded = elements.menuButton.getAttribute('aria-expanded') === 'true';
        elements.menuButton.setAttribute('aria-expanded', !isExpanded);
        elements.menuButton.setAttribute('aria-label', !isExpanded ? 'Close menu' : 'Toggle menu');
        elements.dropdownMenu.classList.toggle('visible');
    }

    function handleSmoothScroll(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (elements.dropdownMenu && elements.dropdownMenu.classList.contains('visible')) {
                elements.menuButton.setAttribute('aria-expanded', 'false');
                elements.dropdownMenu.classList.remove('visible');
            }
        }
    }

    function initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (elements.dropdownMenu && elements.dropdownMenu.classList.contains('visible')) {
                    elements.menuButton.setAttribute('aria-expanded', 'false');
                    elements.dropdownMenu.classList.remove('visible');
                    elements.menuButton.focus();
                }
            }

            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key === 't' || e.key === 'T') {
                toggleTheme();
            }

            if (e.key === 'p' || e.key === 'P') {
                toggleAnimations();
            }
        });
    }

    function toggleAnimations() {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        document.documentElement.classList.toggle('animations-reduced', !prefersReduced);
        try {
            localStorage.setItem('animations-reduced', !prefersReduced);
        } catch (e) {
            console.warn('Storage unavailable:', e);
        }
    }

    // ========================================
    // FEATURED PROJECTS GRID
    // ========================================
    function initFeaturedCarousel() {
        // Grid is rendered statically, no initialization needed
    }

    function renderFeatured() {
        if (!elements.featuredGrid || state.featuredRepos.length === 0) return;

        const html = state.featuredRepos.map((repo, index) => createFeaturedCardHTML(repo, index)).join('');
        elements.featuredGrid.innerHTML = html;
    }

    function createFeaturedCardHTML(repo, index) {
        const description = repo.description || 'No description available';
        const stars = repo.stargazers_count || 0;
        const language = repo.language || 'Unknown';
        const url = isValidUrl(repo.html_url) ? repo.html_url : '#';
        const homepage = isValidUrl(repo.homepage) ? repo.homepage : null;

        const tags = generateTechTags(repo);
        const gradient = getRepoGradient(repo.name);

        return `
            <article class="featured-card" style="animation-delay: ${index * 0.1}s;" aria-label="${escapeHtml(repo.name)} project">
                <div class="featured-card-thumbnail" style="background: ${gradient};">
                    ${homepage ? `
                        <img src="${homepage}" 
                             alt="${escapeHtml(repo.name)} preview" 
                             loading="lazy"
                             onerror="this.style.display='none'">
                    ` : ''}
                    ${!homepage ? `
                        <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                            <i class="fas fa-project-diagram" style="font-size: 3rem; color: rgba(255,255,255,0.3);"></i>
                        </div>
                    ` : ''}
                </div>
                <div class="featured-card-content">
                    <h3 class="featured-card-title">${escapeHtml(repo.name)}</h3>
                    <p class="featured-card-description">${escapeHtml(description)}</p>
                    
                    <div class="featured-card-tags" role="list" aria-label="Technologies used">
                        ${tags.map(tag => `
                            <span class="featured-tag" role="listitem">
                                <i class="${tag.icon}" aria-hidden="true"></i>
                                ${escapeHtml(tag.name)}
                            </span>
                        `).join('')}
                    </div>
                    
                    <div class="featured-card-actions">
                        <a href="${escapeHtml(url)}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn btn-primary"
                           aria-label="View ${escapeHtml(repo.name)} code on GitHub">
                            <i class="fab fa-github" aria-hidden="true"></i> Code
                        </a>
                        ${homepage ? `
                            <a href="${escapeHtml(homepage)}" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               class="btn btn-outline"
                               aria-label="View ${escapeHtml(repo.name)} live demo">
                                <i class="fas fa-external-link-alt" aria-hidden="true"></i> Live
                            </a>
                        ` : ''}
                    </div>
                </div>
                ${stars > 0 ? `
                    <div class="star-badge" aria-label="${stars} stars">
                        <i class="fas fa-star" aria-hidden="true"></i>
                    </div>
                ` : ''}
            </article>
        `;
    }

    function generateTechTags(repo) {
        const tags = [];
        const language = repo.language || '';
        const name = repo.name.toLowerCase();

        const languageTags = {
            'JavaScript': { name: 'JavaScript', icon: 'fab fa-js' },
            'TypeScript': { name: 'TypeScript', icon: 'fab fa-js' },
            'Python': { name: 'Python', icon: 'fab fa-python' },
            'HTML': { name: 'HTML', icon: 'fab fa-html5' },
            'CSS': { name: 'CSS', icon: 'fab fa-css3-alt' },
            'React': { name: 'React', icon: 'fab fa-react' },
            'Vue': { name: 'Vue', icon: 'fab fa-vuejs' },
            'PHP': { name: 'PHP', icon: 'fab fa-php' },
            'Java': { name: 'Java', icon: 'fab fa-java' },
            'C#': { name: 'C#', icon: 'fas fa-code' },
            'Ruby': { name: 'Ruby', icon: 'fas fa-gem' },
            'Go': { name: 'Go', icon: 'fas fa-code' },
            'Rust': { name: 'Rust', icon: 'fas fa-cog' },
            'Shell': { name: 'Shell', icon: 'fas fa-terminal' }
        };

        if (languageTags[language]) {
            tags.push(languageTags[language]);
        } else if (language) {
            tags.push({ name: language, icon: 'fas fa-code' });
        }

        if (name.includes('portfolio') || name.includes('website')) {
            tags.push({ name: 'Web', icon: 'fas fa-globe' });
        }
        if (name.includes('api')) {
            tags.push({ name: 'API', icon: 'fas fa-server' });
        }
        if (name.includes('game')) {
            tags.push({ name: 'Game', icon: 'fas fa-gamepad' });
        }

        return tags.slice(0, 3);
    }

    function getRepoGradient(repoName) {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            'linear-gradient(135deg, #2d7a4e 0%, #1a3a28 100%)',
            'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)'
        ];

        let hash = 0;
        for (let i = 0; i < repoName.length; i++) {
            hash = repoName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % gradients.length;
        return gradients[index];
    }

    function showFeaturedLoading() {
        if (elements.featuredLoadingSpinner) {
            elements.featuredLoadingSpinner.style.display = 'block';
        }
        if (elements.featuredGrid) {
            elements.featuredGrid.style.display = 'none';
        }
        if (elements.featuredEmpty) {
            elements.featuredEmpty.style.display = 'none';
        }
    }

    function hideFeaturedLoading() {
        if (elements.featuredLoadingSpinner) {
            elements.featuredLoadingSpinner.style.display = 'none';
        }
        
        if (state.featuredRepos.length > 0) {
            if (elements.featuredGrid) {
                elements.featuredGrid.style.display = 'grid';
            }
            if (elements.featuredEmpty) {
                elements.featuredEmpty.style.display = 'none';
            }
        } else {
            if (elements.featuredGrid) {
                elements.featuredGrid.style.display = 'none';
            }
            if (elements.featuredEmpty) {
                elements.featuredEmpty.style.display = 'block';
            }
        }
    }

    function showFeaturedError() {
        hideFeaturedLoading();

        if (elements.featuredGrid) {
            elements.featuredGrid.innerHTML = `
                <div class="col-12 text-center py-4">
                    <div class="alert alert-warning" role="alert" style="max-width: 500px; margin: 0 auto;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Unable to load featured projects</strong>
                        <p class="mb-0 mt-2">Please refresh the page to try again.</p>
                    </div>
                </div>
            `;
            elements.featuredGrid.style.display = 'grid';
        }
    }

    // ========================================
    // GITHUB API
    // ========================================
    const GITHUB_API_URL = 'https://api.github.com/users/SilentCaMXMF/repos?per_page=100&sort=updated';

    async function loadGitHubRepos() {
        showFeaturedLoading();

        try {
            const cached = localStorage.getItem('github_repos');
            if (cached) {
                const data = JSON.parse(cached);
                if (Date.now() - data.timestamp < 5 * 60 * 1000) {
                    handleReposLoaded(data.repos);
                    return;
                }
            }

            const response = await fetch(GITHUB_API_URL);
            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

            const repos = await response.json();
            localStorage.setItem('github_repos', JSON.stringify({ timestamp: Date.now(), repos }));
            handleReposLoaded(repos);
        } catch (error) {
            console.error('Failed to load repos:', error);
            showFeaturedError();
        }
    }

    function handleReposLoaded(repos) {
        state.repos = repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        state.featuredRepos = state.repos
            .filter(repo => repo.description && repo.description.length > 10)
            .slice(0, CONFIG.FEATURED_REPOS_COUNT);

        hideFeaturedLoading();
        renderFeatured();
    }

    // ========================================
    // UTILITIES
    // ========================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function isValidUrl(url) {
        if (!url) return false;
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'https:' || parsed.protocol === 'http:';
        } catch {
            return false;
        }
    }

    function getLanguageColor(language) {
        const colors = {
            'JavaScript': '#f1e05a',
            'Python': '#3572A5',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'TypeScript': '#2b7489',
            'Java': '#b07219',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Go': '#00ADD8',
            'Rust': '#dea584',
            'C': '#555555',
            'C++': '#f34b7d',
            'C#': '#178600',
            'Shell': '#89e051',
            'Vue': '#41b883',
            'React': '#61dafb'
        };
        return colors[language] || '#6e7681';
    }

    // ========================================
    // BACK TO TOP
    // ========================================
    function initBackToTop() {
        if (!elements.backToTop) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > CONFIG.SCROLL_TO_TOP_THRESHOLD) {
                elements.backToTop.classList.add('show');
            } else {
                elements.backToTop.classList.remove('show');
            }
        });

        elements.backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ========================================
    // CURRENT YEAR
    // ========================================
    function initCurrentYear() {
        if (elements.currentYear) {
            elements.currentYear.textContent = new Date().getFullYear();
        }
    }

    // ========================================
    // SERVICE WORKER
    // ========================================
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => {
                        console.log('Service Worker registered:', registration.scope);
                    })
                    .catch(error => {
                        console.log('Service Worker registration failed:', error);
                    });
            });
        }
    }

    // ========================================
    // START APPLICATION
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
