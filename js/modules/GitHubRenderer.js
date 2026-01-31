/**
 * @file GitHub Renderer Module
 * @description Handles rendering of GitHub repositories and featured projects
 * @version 1.0.0
 */

import { EventManager } from './EventManager.js';

/**
 * GitHubRenderer - Handles all repository display logic
 */
export class GitHubRenderer {
    constructor(options = {}) {
        this.featuredRepos = [];
        this.currentFeaturedIndex = 0;
        this.allRepos = [];
        this.reposWithDesc = [];
        this.reposWithoutDesc = [];
        this.options = {
            maxFeaturedRepos: 5,
            initialReposToShow: 6,
            containerId: 'github-repos',
            featuredContainerId: 'featured-container',
            featuredProjectId: 'featured-project',
            loadingSpinnerId: 'loading-spinner',
            featuredSpinnerId: 'featured-loading-spinner',
            noReposMessageId: 'no-repos-message',
            filterInputId: 'repo-filter',
            sortSelectId: 'repo-sort',
            languageFilterId: 'language-filter',
            ...options
        };
        this.currentLanguageFilter = '';
        this.filteredRepos = [];
        this.eventManager = new EventManager();
    }

    /**
     * Initialize the renderer
     */
    initialize() {
        this.setupFilterAndSort();
        this.setupLanguageFilter();
        return this;
    }

    /**
     * Setup language filter dropdown
     */
    setupLanguageFilter() {
        const select = document.getElementById(this.options.languageFilterId);
        if (!select) return;

        select.addEventListener('change', (e) => {
            this.currentLanguageFilter = e.target.value;
            this.applyFilters();
        });
    }

    /**
     * Populate language filter options dynamically
     */
    populateLanguageFilter() {
        const select = document.getElementById(this.options.languageFilterId);
        if (!select || this.allRepos.length === 0) return;

        // Get unique languages from all repos
        const languages = [...new Set(this.allRepos
            .map(r => r.language)
            .filter(Boolean))]
            .sort();

        // Clear existing options except "All Languages"
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Add language options
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang;
            select.appendChild(option);
        });
    }

    /**
     * Apply both text filter and language filter
     */
    applyFilters() {
        const filterInput = document.getElementById(this.options.filterInputId);
        const query = filterInput ? filterInput.value : '';

        let repos = [...this.reposWithDesc];

        // Apply language filter
        if (this.currentLanguageFilter) {
            repos = repos.filter(repo => repo.language === this.currentLanguageFilter);
        }

        // Apply text filter
        if (query) {
            const lower = query.toLowerCase();
            repos = repos.filter(repo =>
                repo.name.toLowerCase().includes(lower) ||
                (repo.description && repo.description.toLowerCase().includes(lower))
            );
        }

        // Apply sorting
        repos = this.sortRepos(repos);

        this.renderRepos(repos);
    }

    /**
     * Setup filter and sort event listeners
     */
    setupFilterAndSort() {
        const filterInput = document.getElementById(this.options.filterInputId);
        const sortSelect = document.getElementById(this.options.sortSelectId);

        if (filterInput) {
            filterInput.addEventListener('input', () => {
                this.applyFilters();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    }

    /**
     * Render featured projects from provided data
     */
    renderFeaturedReposFromData(repos) {
        const featuredContainer = document.getElementById(this.options.featuredContainerId);
        const featuredSpinner = document.getElementById(this.options.featuredSpinnerId);

        // Hide spinner
        if (featuredSpinner) {
            featuredSpinner.style.display = 'none';
        }

        try {
            const reposWithDescriptions = repos.filter(repo =>
                repo.description && repo.description.trim() !== ''
            );

            const sortedRepos = [...reposWithDescriptions].sort((a, b) => {
                const dateCompare = new Date(b.updated_at) - new Date(a.updated_at);
                if (dateCompare !== 0) return dateCompare;
                return (b.stargazers_count || 0) - (a.stargazers_count || 0);
            });

            this.featuredRepos = sortedRepos.slice(0, this.options.maxFeaturedRepos);
            this.currentFeaturedIndex = 0;

            this.renderFeaturedRepos();
            this.setupFeaturedNavigation();

        } catch (error) {
            console.error('Error rendering featured repos:', error);
            if (featuredContainer) {
                featuredContainer.innerHTML = '';

                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-warning';
                alertDiv.setAttribute('role', 'alert');

                const icon = document.createElement('i');
                icon.className = 'fas fa-exclamation-triangle';

                alertDiv.appendChild(icon);
                alertDiv.appendChild(document.createTextNode(' Failed to load featured projects.'));

                featuredContainer.appendChild(alertDiv);
                featuredContainer.style.display = 'block';
            }
        }
    }

    /**
     * Render the current featured project
     */
    renderFeaturedRepos() {
        const featuredProject = document.getElementById(this.options.featuredProjectId);
        const featuredContainer = document.getElementById(this.options.featuredContainerId);

        if (!featuredContainer) return;

        // Remove skeleton loader if present
        const featuredSkeleton = document.getElementById('featured-skeleton');
        if (featuredSkeleton) {
            featuredSkeleton.remove();
        }

        if (this.featuredRepos.length === 0) {
            featuredContainer.innerHTML = '';

            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-info';
            alertDiv.setAttribute('role', 'alert');

            const icon = document.createElement('i');
            icon.className = 'fas fa-info-circle';

            alertDiv.appendChild(icon);
            alertDiv.appendChild(document.createTextNode(' No featured projects found.'));

            featuredContainer.appendChild(alertDiv);
            featuredContainer.style.display = 'block';
            return;
        }

        const repo = this.featuredRepos[this.currentFeaturedIndex];

        // SECURITY: Using DOM methods instead of innerHTML to prevent XSS
        const cardDiv = document.createElement('div');
        cardDiv.className = 'repo-card featured h-100';

        const starBadge = document.createElement('div');
        starBadge.className = 'star-badge';
        const starIcon = document.createElement('i');
        starIcon.className = 'fas fa-star';
        starBadge.appendChild(starIcon);

        const repoHeader = document.createElement('div');
        repoHeader.className = 'repo-header';

        const repoName = document.createElement('div');
        repoName.className = 'repo-name';
        repoName.textContent = repo.name;

        const repoDesc = document.createElement('div');
        repoDesc.className = 'repo-description';
        repoDesc.textContent = repo.description || 'No description available.';

        repoHeader.appendChild(repoName);
        repoHeader.appendChild(repoDesc);

        const repoMeta = document.createElement('div');
        repoMeta.className = 'repo-meta';

        const langSpan = document.createElement('span');
        const langIcon = document.createElement('i');
        langIcon.className = 'fas fa-code-branch';
        langSpan.appendChild(langIcon);
        langSpan.appendChild(document.createTextNode(' ' + (repo.language || 'N/A')));

        const starsSpan = document.createElement('span');
        const starsIcon = document.createElement('i');
        starsIcon.className = 'fas fa-star';
        starsSpan.appendChild(starsIcon);
        starsSpan.appendChild(document.createTextNode(' ' + (repo.stargazers_count || 0)));

        const dateSpan = document.createElement('span');
        const dateIcon = document.createElement('i');
        dateIcon.className = 'fas fa-clock';
        dateSpan.appendChild(dateIcon);
        dateSpan.appendChild(document.createTextNode(' ' + new Date(repo.updated_at).toLocaleDateString()));

        repoMeta.appendChild(langSpan);
        repoMeta.appendChild(starsSpan);
        repoMeta.appendChild(dateSpan);

        const repoFooter = document.createElement('div');
        repoFooter.className = 'repo-footer';

        const repoLink = document.createElement('a');
        repoLink.href = repo.html_url;
        repoLink.target = '_blank';
        repoLink.rel = 'noopener noreferrer';
        repoLink.className = 'repo-link';

        const githubIcon = document.createElement('i');
        githubIcon.className = 'fab fa-github';
        repoLink.appendChild(githubIcon);
        repoLink.appendChild(document.createTextNode(' View Repository'));

        repoFooter.appendChild(repoLink);

        cardDiv.appendChild(starBadge);
        cardDiv.appendChild(repoHeader);
        cardDiv.appendChild(repoMeta);
        cardDiv.appendChild(repoFooter);

        featuredProject.innerHTML = '';
        featuredProject.appendChild(cardDiv);

        this.updateFeaturedCounter();
        featuredContainer.style.display = 'block';
    }

    /**
     * Setup featured project navigation
     */
    setupFeaturedNavigation() {
        const prevBtn = document.getElementById('featured-prev');
        const nextBtn = document.getElementById('featured-next');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => this.showPreviousFeatured());
            nextBtn.addEventListener('click', () => this.showNextFeatured());
            this.updateNavigationButtons();
        }
    }

    /**
     * Show previous featured project
     */
    showPreviousFeatured() {
        if (this.currentFeaturedIndex > 0) {
            this.currentFeaturedIndex--;
            this.renderFeaturedRepos();
            this.updateNavigationButtons();
            this.eventManager.emit('featuredNavigate', { index: this.currentFeaturedIndex });
        }
    }

    /**
     * Show next featured project
     */
    showNextFeatured() {
        if (this.currentFeaturedIndex < this.featuredRepos.length - 1) {
            this.currentFeaturedIndex++;
            this.renderFeaturedRepos();
            this.updateNavigationButtons();
            this.eventManager.emit('featuredNavigate', { index: this.currentFeaturedIndex });
        }
    }

    /**
     * Update navigation button states
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('featured-prev');
        const nextBtn = document.getElementById('featured-next');

        if (prevBtn) {
            const isDisabled = this.currentFeaturedIndex === 0;
            prevBtn.disabled = isDisabled;
            prevBtn.setAttribute('aria-disabled', isDisabled.toString());
        }

        if (nextBtn) {
            const isDisabled = this.currentFeaturedIndex === this.featuredRepos.length - 1;
            nextBtn.disabled = isDisabled;
            nextBtn.setAttribute('aria-disabled', isDisabled.toString());
        }
    }

    /**
     * Update featured counter display
     */
    updateFeaturedCounter() {
        const counter = document.getElementById('featured-counter');
        if (counter) {
            counter.textContent = `${this.currentFeaturedIndex + 1} / ${this.featuredRepos.length}`;
        }
    }

    /**
     * Render all projects from provided data
     */
    renderReposFromData(repos) {
        const repoContainer = document.getElementById(this.options.containerId);
        const loadingSpinner = document.getElementById(this.options.loadingSpinnerId);
        const noReposMessage = document.getElementById(this.options.noReposMessageId);

        if (!repoContainer) {
            console.error('GitHub renderer: github-repos container not found');
            return;
        }

        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (noReposMessage) noReposMessage.style.display = 'none';

        try {
            this.allRepos = repos;
            this.reposWithDesc = repos.filter(repo => repo.description && repo.description.trim() !== '');
            this.reposWithoutDesc = repos.filter(repo => !repo.description || repo.description.trim() === '');

            // Populate language filter with available languages
            this.populateLanguageFilter();

            // Apply initial render with filters
            this.applyFilters();

            if (this.reposWithoutDesc.length > 0) {
                this.showLoadMoreButton();
            }

            this.eventManager.emit('reposLoaded', { total: repos.length, withDesc: this.reposWithDesc.length });

        } catch (error) {
            console.error('Error rendering repos:', error);
            repoContainer.innerHTML = '';

            const colDiv = document.createElement('div');
            colDiv.className = 'col-12';

            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger';
            alertDiv.setAttribute('role', 'alert');

            const icon = document.createElement('i');
            icon.className = 'fas fa-exclamation-triangle';

            alertDiv.appendChild(icon);
            alertDiv.appendChild(document.createTextNode(' Failed to load repositories. Please try again later.'));

            colDiv.appendChild(alertDiv);
            repoContainer.appendChild(colDiv);
        }
    }

    /**
     * Render repository cards
     */
    renderRepos(repos) {
        const repoContainer = document.getElementById(this.options.containerId);
        const noReposMessage = document.getElementById(this.options.noReposMessageId);

        if (!repoContainer) return;

        // Remove skeleton loaders first
        const skeletonCards = repoContainer.querySelectorAll('.skeleton-repo-card');
        skeletonCards.forEach(card => card.remove());

        repoContainer.innerHTML = '';

        if (repos.length === 0) {
            if (noReposMessage) noReposMessage.style.display = 'block';
            return;
        }

        if (noReposMessage) noReposMessage.style.display = 'none';

        repos.forEach(repo => {
            const card = this.createRepoCard(repo);
            repoContainer.appendChild(card);
        });
    }

    /**
     * Create a single repository card element
     */
    createRepoCard(repo) {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        const languageClass = (repo.language || 'unknown').toLowerCase().replace(/\+/g, 'plus');

        // SECURITY: Using DOM methods instead of innerHTML to prevent XSS
        const repoCard = document.createElement('div');
        repoCard.className = 'repo-card h-100 compact';
        repoCard.setAttribute('tabindex', '0');
        repoCard.setAttribute('role', 'article');
        repoCard.setAttribute('aria-label', `Project: ${repo.name}`);

        const repoHeader = document.createElement('div');
        repoHeader.className = 'repo-header';

        const langBadge = document.createElement('span');
        langBadge.className = `language-badge ${languageClass}`;

        const repoName = document.createElement('div');
        repoName.className = 'repo-name';
        repoName.textContent = repo.name;

        repoHeader.appendChild(langBadge);
        repoHeader.appendChild(repoName);

        const repoDesc = document.createElement('div');
        repoDesc.className = 'repo-description';
        repoDesc.textContent = repo.description || 'No description available.';

        const repoMeta = document.createElement('div');
        repoMeta.className = 'repo-meta';

        const starsSpan = document.createElement('span');
        const starsIcon = document.createElement('i');
        starsIcon.className = 'fas fa-star';
        starsSpan.appendChild(starsIcon);
        starsSpan.appendChild(document.createTextNode(' ' + (repo.stargazers_count || 0)));

        const dateSpan = document.createElement('span');
        const dateIcon = document.createElement('i');
        dateIcon.className = 'fas fa-clock';
        dateSpan.appendChild(dateIcon);
        dateSpan.appendChild(document.createTextNode(' ' + new Date(repo.updated_at).toLocaleDateString()));

        repoMeta.appendChild(starsSpan);
        repoMeta.appendChild(dateSpan);

        const repoFooter = document.createElement('div');
        repoFooter.className = 'repo-footer';

        const repoLink = document.createElement('a');
        repoLink.href = repo.html_url;
        repoLink.target = '_blank';
        repoLink.rel = 'noopener noreferrer';
        repoLink.className = 'repo-link';

        const githubIcon = document.createElement('i');
        githubIcon.className = 'fab fa-github';
        repoLink.appendChild(githubIcon);
        repoLink.appendChild(document.createTextNode(' View Repository'));

        repoFooter.appendChild(repoLink);

        repoCard.appendChild(repoHeader);
        repoCard.appendChild(repoDesc);
        repoCard.appendChild(repoMeta);
        repoCard.appendChild(repoFooter);

        // Add keyboard support
        repoCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.open(repo.html_url, '_blank');
            }
        });

        card.appendChild(repoCard);
        return card;
    }

    /**
     * Show button to load repos without descriptions
     */
    showLoadMoreButton() {
        const repoContainer = document.getElementById(this.options.containerId);

        if (!repoContainer) return;

        // Remove existing load more button if present
        const existingBtn = repoContainer.parentElement.querySelector('.load-more-btn');
        if (existingBtn) existingBtn.remove();

        const btn = document.createElement('button');
        btn.textContent = `Load repos without description (${this.reposWithoutDesc.length})`;
        btn.className = 'btn btn-secondary my-3 load-more-btn';
        btn.addEventListener('click', () => {
            this.appendRepos(this.reposWithoutDesc);
            btn.remove();
        });

        repoContainer.parentElement.insertBefore(btn, repoContainer.nextSibling);
    }

    /**
     * Append additional repositories
     */
    appendRepos(repos) {
        const repoContainer = document.getElementById(this.options.containerId);
        if (!repoContainer) return;

        repos.forEach(repo => {
            const card = this.createRepoCard(repo);
            repoContainer.appendChild(card);
        });
    }

    /**
     * Filter repositories by search query (legacy method - use applyFilters instead)
     */
    filterRepos(repos, query) {
        const lower = query.toLowerCase();
        const filtered = repos.filter(repo =>
            repo.name.toLowerCase().includes(lower) ||
            (repo.description && repo.description.toLowerCase().includes(lower))
        );
        return this.sortReposList(filtered);
    }

    /**
     * Sort repositories by selected criteria
     */
    sortRepos(repos) {
        return this.sortReposList(repos);
    }

    /**
     * Sort a list of repositories by selected criteria
     */
    sortReposList(repos) {
        const sortSelect = document.getElementById(this.options.sortSelectId);
        const sortType = sortSelect ? sortSelect.value : 'updated';

        return [...repos].sort((a, b) => {
            if (sortType === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortType === 'updated') {
                return new Date(b.updated_at) - new Date(a.updated_at);
            } else if (sortType === 'stars') {
                return (b.stargazers_count || 0) - (a.stargazers_count || 0);
            }
            return 0;
        });
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
     * Get current featured index
     */
    getCurrentFeaturedIndex() {
        return this.currentFeaturedIndex;
    }

    /**
     * Get all repositories
     */
    getAllRepos() {
        return this.allRepos;
    }

    /**
     * Get repositories with descriptions
     */
    getReposWithDesc() {
        return this.reposWithDesc;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.eventManager.removeAllListeners();
        this.featuredRepos = [];
        this.allRepos = [];
        this.reposWithDesc = [];
        this.reposWithoutDesc = [];
    }
}
