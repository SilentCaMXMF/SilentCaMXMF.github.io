/**
 * GitHubAPI Module
 * Handles GitHub API requests with error handling and caching
 */

export class GitHubAPI {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.baseURL = 'https://api.github.com';
        this.username = 'SilentCaMXMF';
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.initialized = false;
        
        // Cache keys
        this.CACHE_KEYS = {
            REPOS: 'github-repos-cache',
            FEATURED: 'github-featured-cache'
        };
    }

    /**
     * Initialize GitHub API module
     */
    initialize() {
        try {
            this.validateConfiguration();
            this.initialized = true;
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
        
        if (!this.cacheManager) {
            throw new Error('CacheManager is required');
        }
    }

    /**
     * Fetch all repositories with caching
     */
    async fetchRepos() {
        const cacheKey = this.CACHE_KEYS.REPOS;
        
        try {
            // Try to get from cache first
            let cachedData;
            try {
                cachedData = this.cacheManager.get(cacheKey);
            } catch (cacheError) {
                // Corrupted cache data - clear and continue to fetch
                this.cacheManager.delete(cacheKey);
                cachedData = null;
            }
            
            if (cachedData && !this.cacheManager.isExpired(cacheKey)) {
                return cachedData;
            }

            // Fetch from API
            const repos = await this.fetchWithRetry(
                `${this.baseURL}/users/${this.username}/repos?per_page=100`,
                `Failed to fetch repositories`
            );

            // Cache the results
            this.cacheManager.set(cacheKey, repos, this.cacheExpiry);
            
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
        const cacheKey = this.CACHE_KEYS.FEATURED;
        
        try {
            // Try to get from cache first
            const cachedData = this.cacheManager.get(cacheKey);
            if (cachedData && !this.cacheManager.isExpired(cacheKey)) {
                return cachedData;
            }

            // Fetch all repos first
            const allRepos = await this.fetchRepos();
            
            // Filter and sort for featured
            const featured = this.processFeaturedRepos(allRepos);
            
            // Cache the results
            this.cacheManager.set(cacheKey, featured, this.cacheExpiry);
            
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
            // Try to get from cache first
            let cachedData;
            try {
                cachedData = this.cacheManager.get(cacheKey);
            } catch (cacheError) {
                // Corrupted cache data - clear and continue to fetch
                this.cacheManager.delete(cacheKey);
                cachedData = null;
            }
            
            if (cachedData && !this.cacheManager.isExpired(cacheKey)) {
                return cachedData;
            }

            const url = `${this.baseURL}/users/${this.username}`;
            const profile = await this.fetchWithRetry(
                url, 
                'Failed to fetch user profile'
            );

            // Cache for longer time
            this.cacheManager.set(cacheKey, profile, 30 * 60 * 1000); // 30 minutes
            
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
     * Clear all cached data
     */
    clearCache() {
        Object.values(this.CACHE_KEYS).forEach(key => {
            this.cacheManager.delete(key);
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        this.cacheManager = null;
        this.initialized = false;
    }
}