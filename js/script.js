/**
 * Pedro Calado Portfolio - Main JavaScript
 * Simplified, flat architecture - no modules or complex class hierarchies
 * All functionality consolidated in one file for easy maintenance
 */

(function() {
    'use strict';

    // ========================================
    // STATE MANAGEMENT (Simple and flat)
    // ========================================
    // Configuration constants
    const CONFIG = {
        CACHE_DURATION_MS: 5 * 60 * 1000,
        GITHUB_REPOS_PER_PAGE: 100,
        FEATURED_REPOS_COUNT: 5,
        DEBOUNCE_DELAY_MS: 300,
        SCROLL_TO_TOP_THRESHOLD: 300
    };

    const state = {
        repos: [],
        filteredRepos: [],
        featuredRepos: [],
        currentTheme: getStoredTheme(),
        currentLanguage: 'all',
        currentSort: 'name',
        isLoading: true
    };

    // AbortController for fetch requests
    let currentAbortController = null;

    function getStoredTheme() {
        try {
            return localStorage.getItem('theme') || 'light';
        } catch (e) {
            console.warn('Storage unavailable:', e);
            return 'light';
        }
    }

    // ========================================
    // DOM ELEMENTS (Cache for performance)
    // ========================================
    const elements = {
        themeToggle: null,
        themeIcon: null,
        menuButton: null,
        dropdownMenu: null,
        repoFilter: null,
        languageFilter: null,
        repoSort: null,
        featuredGrid: null,
        featuredEmpty: null,
        featuredLoadingSpinner: null,
        loadingSpinner: null,
        githubRepos: null,
        noReposMessage: null,
        currentYear: null,
        backToTop: null
    };

    // ========================================
    // INITIALIZATION
    // ========================================
    function init() {
        console.log('Initializing Portfolio...');

        // Cache DOM elements
        cacheElements();

        // Setup core functionality
        initTheme();
        initNavigation();
        initFeaturedCarousel();
        initRepoFilters();
        initBackToTop();
        initCurrentYear();

        // Load GitHub data
        loadGitHubRepos();

        // Register service worker
        registerServiceWorker();

        console.log('Portfolio initialized successfully');
    }

    function cacheElements() {
        elements.themeToggle = document.getElementById('theme-toggle');
        elements.themeIcon = elements.themeToggle ? elements.themeToggle.querySelector('i') : null;
        elements.menuButton = document.getElementById('menu-button');
        elements.dropdownMenu = document.getElementById('dropdown-menu');
        elements.repoFilter = document.getElementById('repo-filter');
        elements.languageFilter = document.getElementById('language-filter');
        elements.repoSort = document.getElementById('repo-sort');
        elements.featuredGrid = document.getElementById('featured-grid');
        elements.featuredEmpty = document.getElementById('featured-empty');
        elements.featuredLoadingSpinner = document.getElementById('featured-loading-spinner');
        elements.loadingSpinner = document.getElementById('loading-spinner');
        elements.githubRepos = document.getElementById('github-repos');
        elements.noReposMessage = document.getElementById('no-repos-message');
        elements.currentYear = document.getElementById('current-year');
        elements.backToTop = document.getElementById('back-to-top');
    }

    // ========================================
    // THEME MANAGEMENT
    // ========================================
    function initTheme() {
        if (!elements.themeToggle) return;

        // Set initial theme
        document.documentElement.setAttribute('data-theme', state.currentTheme);
        updateThemeIcon();

        // Add click handler
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
        // Mobile menu toggle
        if (elements.menuButton && elements.dropdownMenu) {
            elements.menuButton.addEventListener('click', toggleMobileMenu);
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleSmoothScroll);
        });

        // Keyboard navigation
        initKeyboardNavigation();
    }

    function toggleMobileMenu() {
        const isExpanded = elements.menuButton.getAttribute('aria-expanded') === 'true';
        elements.menuButton.setAttribute('aria-expanded', !isExpanded);
        elements.menuButton.setAttribute('aria-label', !isExpanded ? 'Close menu' : 'Toggle menu');
        elements.dropdownMenu.hidden = isExpanded;
    }

    function handleSmoothScroll(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Close mobile menu if open
            if (elements.dropdownMenu && elements.dropdownMenu.hidden === false) {
                elements.menuButton.setAttribute('aria-expanded', 'false');
                elements.dropdownMenu.hidden = true;
            }
        }
    }

    function initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC closes mobile menu
            if (e.key === 'Escape') {
                if (elements.dropdownMenu && elements.dropdownMenu.hidden === false) {
                    elements.menuButton.setAttribute('aria-expanded', 'false');
                    elements.dropdownMenu.hidden = true;
                    elements.menuButton.focus();
                }
            }

            // Keyboard shortcuts (ignore if modifier keys are pressed)
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            // Theme toggle with 'T'
            if (e.key === 't' || e.key === 'T') {
                toggleTheme();
            }

            // Pause animations with 'P'
            if (e.key === 'p' || e.key === 'P') {
                toggleAnimations();
            }

            // Carousel navigation removed - using static grid now
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
    // FEATURED PROJECTS GRID (Replaced Carousel)
    // ========================================
    function initFeaturedCarousel() {
        // No longer needed - grid is static now
        // Keeping function for compatibility
    }

    function navigateFeatured(direction) {
        // No longer needed - grid is static now
    }

    function renderFeatured() {
        if (!elements.featuredGrid || state.featuredRepos.length === 0) return;

        const html = state.featuredRepos.map((repo, index) => createFeaturedCardHTML(repo, index)).join('');
        elements.featuredGrid.innerHTML = html;
    }

    /**
     * Creates HTML for a featured project card with thumbnail
     * @param {Object} repo - Repository object
     * @param {number} index - Index for animation delay
     * @returns {string} HTML string
     */
    function createFeaturedCardHTML(repo, index) {
        const description = repo.description || 'No description available';
        const stars = repo.stargazers_count || 0;
        const forks = repo.forks_count || 0;
        const language = repo.language || 'Unknown';
        const url = isValidUrl(repo.html_url) ? repo.html_url : '#';
        const homepage = isValidUrl(repo.homepage) ? repo.homepage : null;

        // Generate tech tags based on language and common technologies
        const tags = generateTechTags(repo);

        // Get a gradient background for thumbnail based on repo name
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

    /**
     * Generates technology tags based on repo language and common patterns
     * @param {Object} repo - Repository object
     * @returns {Array} Array of tag objects
     */
    function generateTechTags(repo) {
        const tags = [];
        const language = repo.language || '';
        const name = repo.name.toLowerCase();

        // Map language to tag
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

        // Add language tag
        if (languageTags[language]) {
            tags.push(languageTags[language]);
        } else if (language) {
            tags.push({ name: language, icon: 'fas fa-code' });
        }

        // Add additional tags based on repo name
        if (name.includes('portfolio') || name.includes('website')) {
            tags.push({ name: 'Web', icon: 'fas fa-globe' });
        }
        if (name.includes('api')) {
            tags.push({ name: 'API', icon: 'fas fa-server' });
        }
        if (name.includes('game')) {
            tags.push({ name: 'Game', icon: 'fas fa-gamepad' });
        }

        // Limit to 3 tags for clean display
        return tags.slice(0, 3);
    }

    /**
     * Gets a gradient background based on repo name for visual variety
     * @param {string} repoName - Repository name
     * @returns {string} CSS gradient value
     */
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

        // Use consistent hash based on repo name
        let hash = 0;
        for (let i = 0; i < repoName.length; i++) {
            hash = repoName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % gradients.length;
        return gradients[index];
    }

    function updateFeaturedCounter() {
        // No longer needed - grid is static now
    }

    function updateFeaturedButtons() {
        // No longer needed - grid is static now
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

    // ========================================
    // GITHUB REPOSITORIES
    // ========================================
    /**
     * Fetches GitHub repositories with caching and abort support
     * @async
     * @returns {Promise<void>}
     */
    async function loadGitHubRepos() {
        showLoading();
        showFeaturedLoading();

        // Cancel previous request if exists
        if (currentAbortController) {
            currentAbortController.abort();
        }
        currentAbortController = new AbortController();

        try {
            // Check cache first
            const cachedData = getCachedRepos();
            if (cachedData) {
                console.log('Using cached repos data');
                handleReposLoaded(cachedData);
                return;
            }

            // Fetch from GitHub API
            const response = await fetch(
                `https://api.github.com/users/SilentCaMXMF/repos?per_page=${CONFIG.GITHUB_REPOS_PER_PAGE}&sort=updated`,
                { signal: currentAbortController.signal }
            );

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const repos = await response.json();

            // Cache the response
            cacheRepos(repos);

            handleReposLoaded(repos);

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
                return;
            }
            console.error('Failed to load repos:', error);
            showError();
        }
    }

    function handleReposLoaded(repos) {
        // Sort by updated date (most recent first)
        state.repos = repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        // Filter repos with descriptions for better UX
        state.featuredRepos = state.repos
            .filter(repo => repo.description && repo.description.length > 10)
            .slice(0, CONFIG.FEATURED_REPOS_COUNT);

        // Prepare filtered repos
        filterRepos();

        // Populate language filter
        populateLanguageFilter();

        // Hide loading and render
        hideLoading();
        hideFeaturedLoading();
        renderRepos();
        renderFeatured();
    }

    function filterRepos() {
        let filtered = [...state.repos];

        // Filter by search query
        const query = (elements.repoFilter ? elements.repoFilter.value : '').toLowerCase();
        if (query) {
            filtered = filtered.filter(repo =>
                (repo.name && repo.name.toLowerCase().includes(query)) ||
                (repo.description && repo.description.toLowerCase().includes(query)) ||
                (repo.language && repo.language.toLowerCase().includes(query))
            );
        }

        // Filter by language
        if (state.currentLanguage !== 'all') {
            filtered = filtered.filter(repo => repo.language === state.currentLanguage);
        }

        // Sort repos
        switch (state.currentSort) {
            case 'updated':
                filtered = filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                break;
            case 'stars':
                filtered = filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
                break;
            case 'name':
            default:
                filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        state.filteredRepos = filtered;
    }

    function populateLanguageFilter() {
        if (!elements.languageFilter) return;

        // Get unique languages
        const languages = [...new Set(state.repos.map(repo => repo.language).filter(Boolean))].sort();

        // Save current selection
        const currentSelection = elements.languageFilter.value;

        // Rebuild options
        elements.languageFilter.innerHTML = '<option value="">All Languages</option>';
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang;
            elements.languageFilter.appendChild(option);
        });

        // Restore selection if still valid
        if (languages.includes(currentSelection)) {
            elements.languageFilter.value = currentSelection;
        }
    }

    function renderRepos() {
        if (!elements.githubRepos) return;

        if (state.filteredRepos.length === 0) {
            if (elements.noReposMessage) {
                elements.noReposMessage.style.display = 'block';
            }
            elements.githubRepos.innerHTML = '';
            return;
        }

        if (elements.noReposMessage) {
            elements.noReposMessage.style.display = 'none';
        }

        const html = state.filteredRepos.map(repo => createRepoCardHTML(repo)).join('');
        elements.githubRepos.innerHTML = html;
    }

    function createRepoCardHTML(repo) {
        const description = repo.description || 'No description available';
        const stars = repo.stargazers_count || 0;
        const forks = repo.forks_count || 0;
        const language = repo.language || 'Unknown';
        const updated = new Date(repo.updated_at).toLocaleDateString();
        const url = isValidUrl(repo.html_url) ? repo.html_url : '#';
        const homepage = isValidUrl(repo.homepage) ? repo.homepage : null;

        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 repo-card">
                    <div class="card-body">
                        <h3 class="card-title repo-title">
                            <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
                                ${escapeHtml(repo.name)}
                            </a>
                        </h3>
                        <p class="card-text repo-description">${escapeHtml(description)}</p>
                        <div class="repo-meta">
                            <span class="repo-language">
                                <i class="fas fa-circle" style="color: ${getLanguageColor(language)}"></i>
                                ${escapeHtml(language)}
                            </span>
                            <span class="repo-stars"><i class="fas fa-star"></i> ${stars}</span>
                            <span class="repo-forks"><i class="fas fa-code-branch"></i> ${forks}</span>
                        </div>
                        <p class="repo-updated">Updated: ${updated}</p>
                    </div>
                    <div class="card-footer repo-footer">
                        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary">
                            <i class="fab fa-github"></i> View
                        </a>
                        ${homepage ? `
                            <a href="${escapeHtml(homepage)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">
                                <i class="fas fa-external-link-alt"></i> Demo
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // ========================================
    // REPO FILTERS
    // ========================================
    function initRepoFilters() {
        if (elements.repoFilter) {
            let debounceTimer;
            elements.repoFilter.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    filterRepos();
                    renderRepos();
                }, CONFIG.DEBOUNCE_DELAY_MS);
            });
        }

        if (elements.languageFilter) {
            elements.languageFilter.addEventListener('change', () => {
                state.currentLanguage = elements.languageFilter.value;
                filterRepos();
                renderRepos();
            });
        }

        if (elements.repoSort) {
            elements.repoSort.addEventListener('change', () => {
                state.currentSort = elements.repoSort.value;
                filterRepos();
                renderRepos();
            });
        }
    }

    // ========================================
    // CACHING
    // ========================================
    /**
     * Retrieves cached repositories from localStorage
     * @returns {Array|null} Cached repos or null if expired/invalid
     */
    function getCachedRepos() {
        try {
            const cached = localStorage.getItem('github_repos');
            if (!cached) return null;

            const data = JSON.parse(cached);
            const now = Date.now();

            // Cache valid for configured duration
            if (now - data.timestamp > CONFIG.CACHE_DURATION_MS) {
                localStorage.removeItem('github_repos');
                return null;
            }

            return data.repos;
        } catch (e) {
            return null;
        }
    }

    /**
     * Caches repositories in localStorage
     * @param {Array} repos - Array of repository objects
     */
    function cacheRepos(repos) {
        try {
            const data = {
                timestamp: Date.now(),
                repos: repos
            };
            localStorage.setItem('github_repos', JSON.stringify(data));
        } catch (e) {
            console.warn('Storage unavailable:', e);
        }
    }

    // ========================================
    // LOADING & ERROR STATES
    // ========================================
    function showLoading() {
        state.isLoading = true;
        if (elements.loadingSpinner) {
            elements.loadingSpinner.style.display = 'block';
        }
    }

    function hideLoading() {
        state.isLoading = false;
        if (elements.loadingSpinner) {
            elements.loadingSpinner.style.display = 'none';
        }
    }

    function showError() {
        hideLoading();
        hideFeaturedLoading();

        // Hide skeleton loaders and show error message
        document.querySelectorAll('.skeleton-repo-card').forEach(el => el.style.display = 'none');

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

        if (elements.githubRepos) {
            elements.githubRepos.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle"></i>
                        Failed to load repositories. Please refresh the page.
                    </div>
                </div>
            `;
        }
    }

    // ========================================
    // UTILITIES
    // ========================================
    /**
     * Escapes HTML entities to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Validates if a URL is safe to use
     * @param {string} url - URL to validate
     * @returns {boolean} True if URL is valid and safe
     */
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
    // SERVICE WORKER REGISTRATION
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
