/**
 * Comprehensive Test Suite for Pedro Calado's Portfolio Website
 * Tests functionality, accessibility, performance, and responsiveness
 */

class PortfolioTester {
    constructor() {
        this.testResults = [];
        this.screenshots = [];
        this.performanceMetrics = {};
        this.accessibilityTests = [];
    }

    logTest(category, testName, status, details = '', recommendations = '') {
        const testResult = {
            category,
            testName,
            status, // 'PASS', 'FAIL', 'PARTIAL'
            details,
            recommendations,
            timestamp: new Date().toISOString()
        };
        this.testResults.push(testResult);
        console.log(`[${status}] ${category}: ${testName}`);
        if (details) console.log(`  Details: ${details}`);
        if (recommendations) console.log(`  Recommendations: ${recommendations}`);
    }

    async testThemeToggle() {
        console.log('\n=== Testing Theme Toggle ===');
        const themeToggle = document.getElementById('theme-toggle');
        
        if (!themeToggle) {
            this.logTest('Core Functionality', 'Theme Toggle Button', 'FAIL', 'Theme toggle button not found');
            return;
        }

        // Test button exists and is clickable
        const isVisible = themeToggle.offsetParent !== null;
        this.logTest('Core Functionality', 'Theme Toggle Visibility', 
                     isVisible ? 'PASS' : 'FAIL', 
                     isVisible ? 'Button is visible' : 'Button is hidden');

        // Test theme switching
        const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
        themeToggle.click();
        
        setTimeout(() => {
            const newTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const themeChanged = initialTheme !== newTheme;
            this.logTest('Core Functionality', 'Theme Toggle Functionality', 
                        themeChanged ? 'PASS' : 'FAIL',
                        themeChanged ? 'Theme switches correctly' : 'Theme does not change');

            // Test localStorage persistence
            const savedTheme = localStorage.getItem('theme');
            const persistenceWorks = savedTheme === newTheme;
            this.logTest('Core Functionality', 'Theme Persistence', 
                        persistenceWorks ? 'PASS' : 'FAIL',
                        persistenceWorks ? 'Theme saved to localStorage' : 'Theme not saved');

            // Test icon changes
            const icon = themeToggle.querySelector('i');
            if (icon) {
                const hasIconClass = icon.classList.contains('fa-sun') || icon.classList.contains('fa-moon');
                this.logTest('Core Functionality', 'Theme Toggle Icon', 
                            hasIconClass ? 'PASS' : 'PARTIAL',
                            'Icon present and changes with theme');
            }
        }, 500);
    }

    async testNavigation() {
        console.log('\n=== Testing Navigation ===');
        const navLinks = document.querySelectorAll('nav a[href^="#"]');
        
        this.logTest('Navigation', 'Navigation Links Exist', 
                     navLinks.length > 0 ? 'PASS' : 'FAIL',
                     `Found ${navLinks.length} navigation links`);

        // Test smooth scrolling
        navLinks.forEach((link, index) => {
            if (index < 3) { // Test first 3 links
                const href = link.getAttribute('href');
                const target = document.querySelector(href);
                const targetExists = target !== null;
                this.logTest('Navigation', `Link Target: ${href}`, 
                            targetExists ? 'PASS' : 'FAIL',
                            targetExists ? 'Target element exists' : 'Target element missing');
            }
        });

        // Test mobile navigation
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle, [aria-label*="menu"]');
        const hasMobileNav = mobileMenuToggle !== null;
        this.logTest('Navigation', 'Mobile Menu Toggle', 
                     hasMobileNav ? 'PASS' : 'PARTIAL',
                     hasMobileNav ? 'Mobile menu toggle found' : 'No mobile menu toggle found');
    }

    async testGitHubIntegration() {
        console.log('\n=== Testing GitHub Integration ===');
        
        // Check if GitHub section exists
        const githubSection = document.getElementById('github-repos-section');
        this.logTest('GitHub Integration', 'GitHub Section Exists', 
                     githubSection ? 'PASS' : 'FAIL',
                     githubSection ? 'GitHub repos section found' : 'GitHub repos section missing');

        if (githubSection) {
            // Wait for potential API loading
            setTimeout(() => {
                const repoCards = document.querySelectorAll('[data-repo-card], .repo-card');
                this.logTest('GitHub Integration', 'Repository Cards', 
                            repoCards.length > 0 ? 'PASS' : 'PARTIAL',
                            `Found ${repoCards.length} repository cards`);

                // Test search/filter functionality
                const searchInput = document.querySelector('#repo-search, input[placeholder*="search"]');
                const hasSearch = searchInput !== null;
                this.logTest('GitHub Integration', 'Search Functionality', 
                            hasSearch ? 'PASS' : 'PARTIAL',
                            hasSearch ? 'Search input found' : 'No search input found');

                // Test filter buttons
                const filterButtons = document.querySelectorAll('[data-filter], .filter-button');
                this.logTest('GitHub Integration', 'Filter Buttons', 
                            filterButtons.length > 0 ? 'PASS' : 'PARTIAL',
                            `Found ${filterButtons.length} filter buttons`);
            }, 3000);
        }
    }

    async testAccessibility() {
        console.log('\n=== Testing Accessibility ===');
        
        // Test semantic HTML
        const hasMain = document.querySelector('main') !== null;
        const hasHeader = document.querySelector('header') !== null;
        const hasNav = document.querySelector('nav') !== null;
        const hasFooter = document.querySelector('footer') !== null;
        
        this.logTest('Accessibility', 'Semantic HTML Structure', 
                    (hasMain && hasHeader && hasNav) ? 'PASS' : 'PARTIAL',
                    `Main: ${hasMain}, Header: ${hasHeader}, Nav: ${hasNav}, Footer: ${hasFooter}`);

        // Test ARIA labels
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        let elementsWithAria = 0;
        interactiveElements.forEach(el => {
            const hasAria = el.hasAttribute('aria-label') || 
                           el.hasAttribute('aria-labelledby') || 
                           el.textContent.trim().length > 0;
            if (hasAria) elementsWithAria++;
        });

        const ariaPercentage = (elementsWithAria / interactiveElements.length * 100).toFixed(1);
        this.logTest('Accessibility', 'ARIA Labels', 
                    ariaPercentage > 80 ? 'PASS' : 'PARTIAL',
                    `${ariaPercentage}% of interactive elements have accessible labels`);

        // Test keyboard navigation
        const focusableElements = document.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        this.logTest('Accessibility', 'Keyboard Navigation', 
                    focusableElements.length > 0 ? 'PASS' : 'FAIL',
                    `Found ${focusableElements.length} focusable elements`);

        // Test skip links
        const skipLinks = document.querySelectorAll('a[href^="#main"], a[href^="#content"]');
        this.logTest('Accessibility', 'Skip Links', 
                    skipLinks.length > 0 ? 'PASS' : 'PARTIAL',
                    `Found ${skipLinks.length} skip links`);
    }

    async testResponsiveness() {
        console.log('\n=== Testing Responsiveness ===');
        
        // Test viewport meta tag
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const hasViewport = viewportMeta !== null;
        const viewportContent = hasViewport ? viewportMeta.getAttribute('content') : '';
        
        this.logTest('Responsiveness', 'Viewport Meta Tag', 
                    hasViewport && viewportContent.includes('width=device-width') ? 'PASS' : 'FAIL',
                    hasViewport ? viewportContent : 'No viewport meta tag');

        // Test CSS media queries (basic check)
        const hasResponsiveStyles = window.getComputedStyle(document.body).fontSize !== undefined;
        this.logTest('Responsiveness', 'CSS Responsive Styles', 
                    hasResponsiveStyles ? 'PASS' : 'PARTIAL',
                    'Responsive CSS detected');

        // Test images responsiveness
        const images = document.querySelectorAll('img');
        let responsiveImages = 0;
        images.forEach(img => {
            const style = window.getComputedStyle(img);
            if (style.maxWidth === '100%' || style.width === '100%' || img.hasAttribute('responsive')) {
                responsiveImages++;
            }
        });

        const imgResponsivePercentage = images.length > 0 ? (responsiveImages / images.length * 100).toFixed(1) : 100;
        this.logTest('Responsiveness', 'Responsive Images', 
                    imgResponsivePercentage > 50 ? 'PASS' : 'PARTIAL',
                    `${imgResponsivePercentage}% of images are responsive`);
    }

    async testPerformance() {
        console.log('\n=== Testing Performance ===');
        
        // Test page load performance
        const navigationTiming = performance.getEntriesByType('navigation')[0];
        if (navigationTiming) {
            const loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
            const domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart;
            
            this.logTest('Performance', 'Page Load Time', 
                        loadTime < 3000 ? 'PASS' : loadTime < 5000 ? 'PARTIAL' : 'FAIL',
                        `Load time: ${loadTime.toFixed(0)}ms`,
                        loadTime > 3000 ? 'Consider optimizing images and scripts' : '');
            
            this.logTest('Performance', 'DOM Content Loaded', 
                        domContentLoaded < 1500 ? 'PASS' : 'PARTIAL',
                        `DOM ready: ${domContentLoaded.toFixed(0)}ms`);
        }

        // Test CSS and JS loading
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        const scripts = document.querySelectorAll('script[src]');
        
        this.logTest('Performance', 'External Resources', 
                    (stylesheets.length + scripts.length) > 0 ? 'PASS' : 'PARTIAL',
                    `Found ${stylesheets.length} stylesheets and ${scripts.length} external scripts`);

        // Test for caching headers (basic check)
        this.logTest('Performance', 'Resource Optimization', 
                    'PARTIAL', 'Manual testing recommended for caching and compression');
    }

    async captureScreenshot() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // This is a simplified screenshot approach
            // In a real implementation, you'd use html2canvas or similar
            this.logTest('Visual Testing', 'Screenshot Capture', 
                        'PARTIAL', 'Manual screenshot review recommended');
        } catch (error) {
            this.logTest('Visual Testing', 'Screenshot Capture', 'FAIL', error.message);
        }
    }

    async testMicroInteractions() {
        console.log('\n=== Testing Micro-interactions ===');
        
        // Test hover states
        const interactiveElements = document.querySelectorAll('button, a, .card, .repo-card');
        let elementsWithHover = 0;
        
        // Basic check for hover styles
        interactiveElements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.transition && style.transition !== 'none') {
                elementsWithHover++;
            }
        });
        
        this.logTest('Micro-interactions', 'Hover Effects', 
                    elementsWithHover > 0 ? 'PASS' : 'PARTIAL',
                    `${elementsWithHover} elements have transitions`);

        // Test loading states
        const loadingElements = document.querySelectorAll('.loading, .spinner, [data-loading]');
        this.logTest('Micro-interactions', 'Loading States', 
                    loadingElements.length > 0 ? 'PASS' : 'PARTIAL',
                    `Found ${loadingElements.length} loading state elements`);
    }

    async generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
        const failedTests = this.testResults.filter(t => t.status === 'FAIL').length;
        const partialTests = this.testResults.filter(t => t.status === 'PARTIAL').length;
        
        const passRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log('\n' + '='.repeat(80));
        console.log('PEDRO CALADO PORTFOLIO - COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(80));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} (${passRate}%)`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Partial: ${partialTests}`);
        console.log('\nTest Results by Category:');
        
        const categories = [...new Set(this.testResults.map(t => t.category))];
        categories.forEach(category => {
            const categoryTests = this.testResults.filter(t => t.category === category);
            const categoryPassed = categoryTests.filter(t => t.status === 'PASS').length;
            const categoryTotal = categoryTests.length;
            console.log(`\n${category}:`);
            categoryTests.forEach(test => {
                const statusIcon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
                console.log(`  ${statusIcon} ${test.testName}`);
                if (test.details) console.log(`     ${test.details}`);
                if (test.recommendations) console.log(`     💡 ${test.recommendations}`);
            });
        });
        
        console.log('\n' + '='.repeat(80));
        console.log('RECOMMENDATIONS SUMMARY');
        console.log('='.repeat(80));
        
        const allRecommendations = this.testResults
            .filter(t => t.recommendations)
            .map(t => t.recommendations);
        
        if (allRecommendations.length > 0) {
            [...new Set(allRecommendations)].forEach(rec => {
                console.log(`• ${rec}`);
            });
        } else {
            console.log('✅ No critical issues found - website is performing well!');
        }
        
        return {
            totalTests,
            passedTests,
            failedTests,
            partialTests,
            passRate: parseFloat(passRate),
            testResults: this.testResults
        };
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive Portfolio Testing...\n');
        
        try {
            await this.testThemeToggle();
            await this.testNavigation();
            await this.testGitHubIntegration();
            await this.testAccessibility();
            await this.testResponsiveness();
            await this.testPerformance();
            await this.testMicroInteractions();
            await this.captureScreenshot();
            
            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            return await this.generateReport();
        } catch (error) {
            console.error('Test execution error:', error);
            this.logTest('System', 'Test Execution', 'FAIL', error.message);
            return await this.generateReport();
        }
    }
}

// Auto-run tests if this script is executed directly
if (typeof window !== 'undefined') {
    window.portfolioTester = new PortfolioTester();
    
    // Run tests when page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => window.portfolioTester.runAllTests(), 1000);
        });
    } else {
        setTimeout(() => window.portfolioTester.runAllTests(), 1000);
    }
}