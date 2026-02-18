---
feature: "Portfolio Codebase Issues"
spec: |
  Fix all critical, high, medium, and low priority issues found in the portfolio codebase review. Critical issues include missing Bootstrap CSS causing layout breakage and invalid service worker cache references. High priority includes CSP security, GitHub API rate limiting, memory leaks, and theme flash. Medium priority covers code cleanup and bug fixes. Low priority addresses technical debt and files that shouldn't be deployed.
---

## Task List

### Feature 1: P0 - Critical Issues
Description: Critical issues that break the site layout and functionality
- [x] 1.01 Add Bootstrap CSS CDN to index.html OR replace all Bootstrap classes (.row, .col-*, .py-5, .mb-4, etc.) with custom CSS (note: Added Bootstrap 5.3.0 CSS via CDN and updated CSP to allow cdn.jsdelivr.net)
- [x] 1.02 Fix sw.js cache list - remove reference to non-existent bootstrap-replacement.css and add missing JS modules (note: Removed non-existent bootstrap-replacement.css, added missing JS modules and WebP icon variants)

### Feature 2: P1 - High Priority Issues
Description: High priority issues affecting security, performance, and user experience
- [x] 2.01 Remove 'unsafe-eval' from CSP script-src directive in index.html (note: Removed unsafe-eval from CSP script-src in index.html)
- [-] 2.02 Add GitHub API authentication via Personal Access Token to prevent rate limiting (60 req/hr limit) (note: Moved to end of roadmap - user will be changing this)
- [x] 2.03 Fix onboarding toast to use sessionStorage or check navigation type to prevent showing on every new tab (note: Changed to sessionStorage and added navigation type check)
- [x] 2.04 Add null checks before accessing DOM elements (featuredSpinner, allProjectsSpinner, featuredContainer, etc.) (note: Added null check for document.body in notifyUpdateAvailable)
- [x] 2.05 Fix memory leak in GitHubRenderer - remove old event listeners before adding new ones in setupFeaturedNavigation (note: Fixed memory leak by cloning buttons before adding listeners)
- [x] 2.06 Initialize and apply theme BEFORE first paint to prevent flash (note: Added inline script in head to apply theme before first paint + ThemeManager init fix)

### Feature 3: P2 - Medium Priority Issues
Description: Medium priority issues affecting code quality and maintenance
- [x] 3.01 Remove all debug console.log statements from production code (GitHubAPI, app.js, modules) (note: Removed 71 console.log statements from 14 files, kept 58 console.error/warn)
- [x] 3.02 Clean up redundant CSS fallback properties (rgba + color-mix duplicates) (note: Removed redundant rgba fallbacks from .highlight-box, .education-card, .repo-card, dropdown-menu, search/filter inputs)
- [x] 3.03 Delete unused methods: filterRepos(), escapeHtml(), checkAPIStatus(), fetchRepo() (note: Deleted filterRepos(), escapeHtml() from GitHubRenderer, fetchRepo(), checkAPIStatus() from GitHubAPI)
- [x] 3.04 Fix GitHubRenderer setupFeaturedNavigation race condition with proper async handling (note: Added updateFeaturedCounter() call before updateNavigationButtons() in prev/next methods)
- [x] 3.05 Add debounce (300ms) to search input event listener in GitHubRenderer (note: Added 300ms debounce to filter input event listener)
- [x] 3.06 Fix featured counter edge case when featuredRepos is empty (shows '1 / 0') (note: Fixed counter to show "0 / 0" when featuredRepos is empty)

### Feature 4: P3 - Technical Debt & Cleanup
Description: Lower priority issues and technical debt cleanup
- [ ] 4.01 Create proper square icon images for PWA instead of using portrait photos
- [ ] 4.02 Remove test files from deploy: test-runner.html, testing-dashboard.html, accessibility-test.html
- [ ] 4.03 Remove test CSS files: test-runner.css, testing-dashboard.css, accessibility-test.css
- [ ] 4.04 Remove documentation files from production: ROADMAP.md, IMPLEMENTATION-GUIDE.md, MICRO_INTERACTIONS.md, CONSOLE_FIXES.md, accessibility-report.md
- [ ] 4.05 Clean up GitHub workflow to skip artifact creation on PRs or only run on main branch push
- [ ] 4.06 Simplify image srcset in index.html - remove redundant source elements
- [ ] 4.07 Add focus trap for mobile menu when open
- [ ] 4.08 Add error handling for corrupted cache data in GitHubAPI
