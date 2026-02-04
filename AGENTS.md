# AGENTS.md - Development Guidelines for Agentic Coding Tools

## Project Overview

Static personal portfolio website (Pedro Calado) built with vanilla HTML/CSS/JavaScript. Deployed to GitHub Pages via GitHub Actions. **No build tools, no package managers, no testing frameworks** - files served directly.

## Development Commands

```bash
# Start local development server
npx http-server -p 8000
# or
python -m http.server 8000

# View at http://localhost:8000
```

## Code Style Guidelines

### JavaScript (js/script.js)
- Use IIFE wrapper: `(function() { 'use strict'; ... })();`
- Modern ES6+ syntax: `const`, `let`, arrow functions, template literals
- `async/await` for all async operations
- State in simple object: `const state = { repos: [], filteredRepos: [], ... }`
- Cache DOM elements at initialization: `elements = { themeToggle: null, ... }`

### HTML (index.html)
- Semantic HTML5: `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`
- Accessibility attributes: `aria-label`, `aria-expanded`, `alt`, `role`
- Skip-to-content link for keyboard users
- Bootstrap CDN classes for layout

### CSS (css/*.css)
- CSS custom properties (variables) in `:root` and `[data-theme="dark"]`
- Kebab-case class names: `.repo-card`, `.theme-toggle`
- Mobile-first responsive design with `@media` queries
- `rem` units for sizing, `vw`/`vh` for viewport dimensions

### Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| CSS classes | kebab-case | `.repo-card`, `.featured-carousel` |
| JavaScript variables | camelCase | `currentTheme`, `filteredRepos` |
| JavaScript functions | camelCase | `initTheme()`, `renderRepos()` |
| IDs | kebab-case | `github-repos-section`, `theme-toggle` |
| Files | lowercase | `style.css`, `script.js` |

### Error Handling
- Wrap async operations in `try-catch`
- Log errors with context: `console.error('Failed to load repos:', error)`
- Show user-friendly UI messages for failures
- Cache fallback: return cached data or show empty state

### Imports/Exports
- No ES6 modules - single flat JavaScript file
- No imports/exports in script.js
- All functionality in one file

## Testing

**No automated tests exist.** All testing is manual:
- Open browser DevTools (F12) → Console tab
- Check for red errors on page load
- Test interactive features manually
- Verify dark/light mode toggle works
- Test GitHub repos load and filter correctly

## File Structure

```
/
├── index.html           # Main HTML (46KB, extensive meta tags)
├── css/
│   ├── style.css        # Core styles
│   ├── accessibility-enhanced.css
│   └── repo-display-options.css
├── js/
│   ├── script.js        # All JS functionality (~400 lines)
│   └── app.js           # Legacy - unused, kept for reference
├── sw.js                # Service Worker (offline caching)
├── img/                 # Images (WebP + PNG fallbacks)
└── .github/workflows/   # GitHub Pages deployment
```

## Key Patterns

### Theme Toggle
```javascript
function toggleTheme() {
    state.currentTheme = state.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.currentTheme);
    localStorage.setItem('theme', state.currentTheme);
}
```

### GitHub API with Caching
```javascript
// Cache for 5 minutes
const cached = localStorage.getItem('github_repos');
if (cached && Date.now() - data.timestamp < 5 * 60 * 1000) {
    return JSON.parse(cached).repos;
}
```

### DOM Updates
```javascript
function renderRepos() {
    const html = state.filteredRepos.map(repo => createRepoCardHTML(repo)).join('');
    elements.githubRepos.innerHTML = html;
}
```

## Deployment

- **Automatic**: GitHub Actions deploys on push to `main`
- **Workflow**: `.github/workflows/static.yml` (deploys root `/`)
- **URL**: https://silentcamxmf.github.io/

## Important Notes

- Static site - never use `npm install` or build commands
- Bootstrap 5.3.0 via CDN for styling
- Font Awesome 6.4.0 via CDN for icons
- GitHub API: `https://api.github.com/users/SilentCaMXMF/repos?per_page=100`
- Always test dark mode after CSS changes
- Maintain accessibility (ARIA labels, keyboard navigation)
- Use `escapeHtml()` before inserting user content into DOM
