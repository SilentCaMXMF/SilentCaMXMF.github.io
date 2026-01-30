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
            initialReposToShow: 3,
            containerId: 'github-repos',
            featuredContainerId: 'featured-container',
            featuredProjectId: 'featured-project',
            loadingSpinnerId: 'loading-spinner',
            featuredSpinnerId: 'featured-loading-spinner',
            noReposMessageId: 'no-repos-message',
            filterInputId: 'repo-filter',
            sortSelectId: 'repo-sort',
            ...options
        };
        this.eventManager = new EventManager();
    }

    /**
     * Initialize the renderer
     */
    initialize() {
        this.setupFilterAndSort();
        return this;
    }

    /**
     * Setup filter and sort event listeners
     */
    setupFilterAndSort() {
        const filterInput = document.getElementById(this.options.filterInputId);
        const sortSelect = document.getElementById(this.options.sortSelectId);

        if (filterInput) {
            filterInput.addEventListener('input', () => {
                const filtered = this.filterRepos(this.reposWithDesc, filterInput.value);
                this.renderRepos(filtered);
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                const filtered = this.filterRepos(this.reposWithDesc, filterInput ? filterInput.value : '');
                this.renderRepos(filtered);
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
                featuredContainer.innerHTML = `
                    <div class="alert alert-warning" role="alert">
                        <i class="fas fa-exclamation-triangle"></i>
                        Failed to load featured projects.
                    </div>
                `;
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
            featuredContainer.innerHTML = `
                <div class="alert alert-info" role="alert">
                    <i class="fas fa-info-circle"></i>
                    No featured projects found.
                </div>
            `;
            featuredContainer.style.display = 'block';
            return;
        }

        const repo = this.featuredRepos[this.currentFeaturedIndex];

        featuredProject.innerHTML = `
            <div class="repo-card featured h-100">
                <div class="star-badge">
                    <i class="fas fa-star"></i>
                </div>
                <div class="repo-header">
                    <div class="repo-name">${this.escapeHtml(repo.name)}</div>
                    <div class="repo-description">${this.escapeHtml(repo.description || 'No description available.')}</div>
                </div>
                <div class="repo-meta">
                    <span>
                        <i class="fas fa-code-branch"></i> ${this.escapeHtml(repo.language || 'N/A')}
                    </span>
                    <span>
                        <i class="fas fa-star"></i> ${repo.stargazers_count || 0}
                    </span>
                    <span>
                        <i class="fas fa-clock"></i> ${new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                </div>
                <div class="repo-footer">
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-link">
                        <i class="fab fa-github"></i> View Repository
                    </a>
                </div>
            </div>
        `;

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

            this.renderRepos(this.reposWithDesc.slice(0, this.options.initialReposToShow));

            if (this.reposWithoutDesc.length > 0) {
                this.showLoadMoreButton();
            }

            this.eventManager.emit('reposLoaded', { total: repos.length, withDesc: this.reposWithDesc.length });

        } catch (error) {
            console.error('Error rendering repos:', error);
            repoContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle"></i>
                        Failed to load repositories. Please try again later.
                    </div>
                </div>
            `;
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

        card.innerHTML = `
            <div class="repo-card h-100 compact" tabindex="0" role="article"
                 aria-label="Project: ${this.escapeHtml(repo.name)}">
                <div class="repo-header">
                    <span class="language-badge ${languageClass}"></span>
                    <div class="repo-name">${this.escapeHtml(repo.name)}</div>
                </div>
                <div class="repo-description">${this.escapeHtml(repo.description || 'No description available.')}</div>
                <div class="repo-meta">
                    <span>
                        <i class="fas fa-star"></i> ${repo.stargazers_count || 0}
                    </span>
                    <span>
                        <i class="fas fa-clock"></i> ${new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                </div>
                <div class="repo-footer">
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-link">
                        <i class="fab fa-github"></i> View Repository
                    </a>
                </div>
            </div>
        `;

        // Add keyboard support
        card.querySelector('.repo-card').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const viewLink = card.querySelector('.repo-link');
                if (viewLink) {
                    window.open(viewLink.href, '_blank');
                }
            }
        });

        return card;
    }

    /**
     * Show button to load repos without descriptions
     */
    showLoadMoreButton() {
        const repoContainer = document.getElementById(this.options.containerId);
        const filterInput = document.getElementById(this.options.filterInputId);

        if (!repoContainer) return;

        const btn = document.createElement('button');
        btn.textContent = 'Load repos without description';
        btn.className = 'btn btn-secondary my-3';
        btn.addEventListener('click', () => {
            const filtered = this.filterRepos(this.reposWithoutDesc, filterInput ? filterInput.value : '');
            this.appendRepos(filtered);
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
     * Filter repositories by search query
     */
    filterRepos(repos, query) {
        const lower = query.toLowerCase();
        const filtered = repos.filter(repo =>
            repo.name.toLowerCase().includes(lower) ||
            (repo.description && repo.description.toLowerCase().includes(lower))
        );
        return this.sortRepos(filtered);
    }

    /**
     * Sort repositories by selected criteria
     */
    sortRepos(repos) {
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
