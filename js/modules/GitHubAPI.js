/**
 * GitHubAPI Module
 * Handles GitHub API requests with error handling and caching
 */

export class GitHubAPI {
    constructor() {
        this.baseURL = 'https://api.github.com';
        this.username = 'SilentCaMXMF';
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.initialized = false;
    }

    /**
     * Initialize GitHub API module
     */
    initialize() {
        try {
            this.validateConfiguration();
            this.initialized = true;
            console.log('🐙 GitHubAPI initialized');
        } catch (error) {
            console.error('❌ GitHubAPI initialization failed:', error);
            throw error;
        }
    }

    /**
     * Validate API configuration
     */
    validateConfiguration() {
        if (!this.username) {
            throw new Error('GitHub username is required');
        }
    }

    /**
     * Get cached data from localStorage
     */
    getCached(cacheKey) {
        try {
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const isExpired = Date.now() - timestamp > this.cacheExpiry;

            return isExpired ? null : { data, isExpired: false };
        } catch (error) {
            console.warn('Failed to get cached data:', error);
            return null;
        }
    }

    /**
     * Set cached data in localStorage
     */
    setCached(cacheKey, data) {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache data:', error);
        }
    }

    /**
     * Fetch all repositories with caching
     */
    async fetchRepos() {
        const cacheKey = 'github-repos-cache';

        try {
            // Try to get from cache first
            const cached = this.getCached(cacheKey);
            if (cached) {
                console.log('📦 Using cached repos data');
                return cached.data;
            }

            // Fetch from API
            const repos = await this.fetchWithRetry(
                `${this.baseURL}/users/${this.username}/repos?per_page=100`,
                `Failed to fetch repositories`
            );

            // Cache the results
            this.setCached(cacheKey, repos);

            console.log(`📊 Fetched ${repos.length} repositories`);
            return repos;

        } catch (error) {
            console.error('❌ Error fetching repositories:', error);
            throw error;
        }
    }

    /**
     * Fetch featured repositories (top 5 with descriptions)
     */
    async fetchFeaturedRepos() {
        const cacheKey = 'github-featured-cache';

        try {
            // Try to get from cache first
            const cached = this.getCached(cacheKey);
            if (cached) {
                console.log('📦 Using cached featured repos data');
                return cached.data;
            }

            // Fetch all repos first
            const allRepos = await this.fetchRepos();

            // Filter and sort for featured
            const featured = this.processFeaturedRepos(allRepos);

            // Cache the results
            this.setCached(cacheKey, featured);

            console.log(`⭐ Fetched ${featured.length} featured repositories`);
            return featured;

        } catch (error) {
            console.error('❌ Error fetching featured repositories:', error);
            throw error;
        }
    }

    /**
     * Process repositories for featured section
     */
    processFeaturedRepos(repos) {
        return repos
            .filter(repo => repo.description && repo.description.trim() !== '')
            .sort((a, b) => {
                // Sort by updated date, then by stars
                const dateCompare = new Date(b.updated_at) - new Date(a.updated_at);
                if (dateCompare !== 0) return dateCompare;
                return (b.stargazers_count || 0) - (a.stargazers_count || 0);
            })
            .slice(0, 5);
    }

    /**
     * Fetch with retry logic
     */
    async fetchWithRetry(url, errorMessage, retries = 0) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': `Portfolio-App/${this.username}`
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error(`${errorMessage}: Request timeout`);
            }
            
            if (retries < this.maxRetries) {
                console.warn(`🔄 Retrying (${retries + 1}/${this.maxRetries}): ${errorMessage}`);
                
                // Exponential backoff
                await this.delay(this.retryDelay * Math.pow(2, retries));
                
                return this.fetchWithRetry(url, errorMessage, retries + 1);
            }
            
            throw new Error(`${errorMessage}: ${error.message}`);
        }
    }

    /**
     * Fetch single repository details
     */
    async fetchRepo(repoName) {
        const cacheKey = `github-repo-${repoName}`;

        try {
            // Check cache first
            const cached = this.getCached(cacheKey);
            if (cached) {
                return cached.data;
            }

            const url = `${this.baseURL}/repos/${this.username}/${repoName}`;
            const repo = await this.fetchWithRetry(
                url,
                `Failed to fetch repository ${repoName}`
            );

            // Cache for shorter time
            this.setCached(cacheKey, repo);

            return repo;

        } catch (error) {
            console.error(`❌ Error fetching repository ${repoName}:`, error);
            throw error;
        }
    }

    /**
     * Search repositories
     */
    async searchRepos(query, language = null) {
        try {
            let url = `${this.baseURL}/search/repositories?q=${encodeURIComponent(query)}+user:${this.username}`;

            if (language) {
                url += `+language:${encodeURIComponent(language)}`;
            }

            url += '&sort=updated&order=desc';

            const data = await this.fetchWithRetry(url, `Failed to search repositories`);

            return data.items || [];

        } catch (error) {
            console.error('❌ Error searching repositories:', error);
            throw error;
        }
    }

    /**
     * Get user profile information
     */
    async getUserProfile() {
        const cacheKey = 'github-user-profile';

        try {
            // Check cache first
            const cached = this.getCached(cacheKey);
            if (cached) {
                return cached.data;
            }

            const url = `${this.baseURL}/users/${this.username}`;
            const profile = await this.fetchWithRetry(
                url,
                'Failed to fetch user profile'
            );

            // Cache for longer time
            this.setCached(cacheKey, profile);

            return profile;

        } catch (error) {
            console.error('❌ Error fetching user profile:', error);
            throw error;
        }
    }

    /**
     * Helper function for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if API is available
     */
    async checkAPIStatus() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
            const response = await fetch(`${this.baseURL}/rate_limit`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response.ok;

        } catch (error) {
            clearTimeout(timeoutId);
            console.warn('⚠️ GitHub API status check failed:', error);
            return false;
        }
    }

    /**
     * Clear all cached data
     */
    clearCache() {
        localStorage.removeItem('github-repos-cache');
        localStorage.removeItem('github-featured-cache');
        localStorage.removeItem('github-user-profile');

        console.log('🧹 GitHub API cache cleared');
    }

    /**
     * Cleanup
     */
    destroy() {
        this.initialized = false;

        console.log('🧹 GitHubAPI destroyed');
    }
}