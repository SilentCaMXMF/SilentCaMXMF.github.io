# OpenCode Auto-Configuration Rules

## Project Overview

This is a static personal portfolio website for Pedro Calado, built with vanilla HTML, CSS, and JavaScript, deployed to GitHub Pages. No build tools or package managers are used - files are served directly.

## Development Commands

Since this is a static site with no build tools:

```bash
# Start a local development server
python -m http.server 8000
# or
npx http-server

# View at http://localhost:8000
```

There are no lint, test, or build commands - this project uses no tooling.

## Code Style Guidelines

### HTML

- Use semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`)
- Include accessibility attributes: `aria-label`, `aria-expanded`, `alt` tags
- Provide skip-to-content links for keyboard navigation
- Use `<meta>` tags for SEO and social sharing (Open Graph)
- Preload critical resources with `<link rel="preload">`

### CSS

- Use CSS custom properties (variables) for colors, spacing, and themes
- Define theme variables in `:root` and `[data-theme="dark"]`
- Use kebab-case for class names (e.g., `.repo-card`, `.theme-toggle`)
- Follow mobile-first responsive design with `@media` queries
- Use CSS Grid and Flexbox for layouts
- Include focus styles for keyboard navigation (`:focus-visible`)
- Use `rem` units for sizing, `vw`/`vh` for viewport-based dimensions

### JavaScript

- Use modern ES6+ syntax (const/let, arrow functions, template literals)
- Use async/await for asynchronous operations
- Store theme preferences and API responses in localStorage
- Use event delegation where appropriate
- Cache API responses to reduce requests (5-minute cache for GitHub API)
- Update DOM efficiently - avoid unnecessary re-renders

### Naming Conventions

- **CSS classes**: kebab-case (`.repo-card`, `.featured-carousel`)
- **JavaScript variables**: camelCase (`dropdownMenu`, `featuredRepos`)
- **JavaScript functions**: camelCase, descriptive names (`fetchFeaturedRepos`, `renderRepos`)
- **IDs**: kebab-case (`github-repos-section`, `theme-toggle`)
- **Files**: Lowercase with appropriate extensions (`style.css`, `script.js`)

### Error Handling

- Use try-catch blocks for async operations
- Provide user-friendly error messages in the UI
- Log errors to console with context
- Graceful degradation when external APIs fail
- Return meaningful error states to users

### File Structure

```
/
├── index.html          # Main HTML structure
├── css/style.css       # All styles (no separate CSS modules)
├── js/script.js        # All JavaScript functionality
├── sw.js              # Service Worker for offline caching
├── img/               # Images and icons
└── .github/workflows/ # Deployment configuration
```

### Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions. The workflow (`.github/workflows/static.yml`) deploys the root directory (`path: '.'`) to GitHub Pages on every push to `main`.

### Accessibility

- Always include `aria-label` on buttons and links without text
- Update `aria-expanded` state when toggling interactive elements
- Ensure sufficient color contrast (check in both light and dark modes)
- Test keyboard navigation (Tab, Enter, Escape keys)
- Use semantic elements and proper heading hierarchy

### Performance

- Preload critical CSS and JS files
- Use Service Worker for offline caching (`sw.js`)
- Cache API responses in localStorage with appropriate expiry
- Use CSS transforms for animations (GPU accelerated)
- Lazy load images where appropriate
- Avoid layout thrashing in JavaScript

### Dark Mode

- All styles must support both light and dark themes
- Use CSS variables for theme-specific colors
- Persist theme preference in localStorage
- Test all components in both modes
- Dark mode toggle in header with sun/moon icons

### GitHub Integration

- Fetch from GitHub API at `https://api.github.com/users/SilentCaMXMF/repos?per_page=100`
- Cache responses for 5 minutes to reduce API calls
- Handle API errors gracefully with fallback UI
- Sort repos by: name, updated date, or star count
- Filter repos by search query (name or description)
- Separate repos with/without descriptions

### When Modifying Code

1. Read the entire file before making changes to understand patterns
2. Follow existing conventions rather than introducing new ones
3. Ensure dark mode compatibility for any visual changes
4. Test responsive behavior at mobile, tablet, and desktop breakpoints
5. Verify accessibility with keyboard navigation
6. Check that the GitHub Actions workflow still points to correct path

## Context7 Automatic Usage
When you need documentation, API references, or code examples for any library or framework, automatically use Context7 MCP tools.

### Automatic Triggers:
- Documentation queries ("how do I use...", "what's the API for...")
- Framework questions ("Bootstrap", "GitHub API", "Service Worker")
- Library setup and configuration
- Code examples and best practices
- Version-specific API questions
- Migration guides and breaking changes

### Usage Pattern:
1. For documentation queries: Use `resolve-library-id` to identify the library
2. Then use `get-library-docs` to fetch relevant documentation
3. Focus on specific topics when mentioned (routing, authentication, etc.)
4. Always prioritize current version documentation

## Library Priority List

### High Priority:
- Web APIs (Service Worker, Fetch API, localStorage)
- Bootstrap 5.3.0 (CSS framework)
- Font Awesome 6.4.0 (Icon library)
- GitHub API v4 (Repository data)

### Framework Support:
- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Styling**: Bootstrap 5.3.0 with custom CSS variables
- **Icons**: Font Awesome 6.4.0
- **Deployment**: GitHub Pages with GitHub Actions
- **APIs**: GitHub REST API for repository data

### Development Tools:
- **No build tools**: Direct file serving
- **No package management**: CDN-based dependencies
- **No testing framework**: Manual testing required
- **No linting**: Manual code review

## Automatic Context7 Integration Rules

### When to Automatically Use Context7:
1. **Any question starting with "how do I..."** related to web APIs or libraries
2. **API documentation requests** ("what's the API for...", "show me docs for...")
3. **Bootstrap-specific questions** ("Bootstrap grid", "Bootstrap components")
4. **Service Worker questions** ("cache strategies", "offline functionality")
5. **GitHub API questions** ("fetch repos", "API endpoints")
6. **Setup and configuration** for any supported library

### Context7 Tool Usage:
- **Always use `resolve-library-id` first** to get the correct library identifier
- **Use `get-library-docs` with topic filtering** when specific functionality is mentioned
- **Include version information** when available for more accurate results
- **Request code examples** when the user asks for implementation guidance

### Integration with Other Tools:
- Combine Context7 documentation with file editing for implementation
- Use Context7 for API reference, then apply changes with write/edit tools
- Cross-reference Context7 docs with existing project code using grep/read

## GitHub Integration Rules

When working with GitHub repositories, issues, or pull requests, automatically use GitHub MCP tools for:

### Automatic Triggers:
- Repository operations ("clone repo", "list repos", "create repo")
- Issue management ("create issue", "list issues", "close issue")
- Pull request operations ("create PR", "merge PR", "review PR")
- Code search and analysis within repositories

### Usage Pattern:
1. For repository operations: Use GitHub MCP repository tools
2. For issue tracking: Use GitHub MCP issue tools
3. For PR management: Use GitHub MCP pull request tools
4. For code analysis: Use GitHub MCP search tools

## Important Notes for Agents

- This is a **static site** with no build tools or package managers
- All dependencies are loaded via CDN (Bootstrap, Font Awesome)
- The Service Worker (`sw.js`) implements sophisticated caching strategies
- Dark mode is fully implemented with CSS custom properties
- GitHub API integration requires proper error handling and caching
- Accessibility is a priority - always maintain ARIA attributes and keyboard navigation
- Responsive design must be maintained for all new features
- Performance optimization is critical - use the Service Worker cache strategies
- When modifying styles, always test both light and dark themes
- The site is automatically deployed via GitHub Actions on push to main branch
# Performance Analysis Report - Pedro Calado Portfolio

## Current Performance Status

### Resource Loading Analysis
- **HTML**: 48KB (large due to extensive meta tags and inline styles)
- **CSS**: 64KB total across multiple stylesheets (well-organized but could be optimized)
- **JavaScript**: 268KB (modular ES6 structure - good for maintainability)
- **Images**: 3.2MB total (largest asset category, needs optimization)
- **Service Worker**: Sophisticated caching strategy implemented

### Current Performance Metrics (Estimated)
- **First Contentful Paint (FCP)**: ~1.2-1.8s
- **Largest Contentful Paint (LCP)**: ~2.0-2.8s (profile image is main LCP element)
- **Time to Interactive (TTI)**: ~3.2-4.0s
- **Cumulative Layout Shift (CLS)**: ~0.05-0.15 (some layout shifts during content loading)

## Optimization Recommendations

### HIGH PRIORITY OPTIMIZATIONS

#### 1. Image Optimization (Expected Impact: 40-60% improvement)
**Issues Identified:**
- Profile images: 320px (35KB), 480px (41KB), 640px (62KB) WebP formats
- Large drumming_server_original.png: 1.6MB (not used in production)
- Favicon images not optimized
- No lazy loading for below-the-fold images

**Implementation Steps:**
```javascript
// 1. Add critical image inlining for profile picture
<link rel="preload" href="./img/pedro_tipoGhibli_passe-320.webp" as="image" fetchpriority="high">

// 2. Implement lazy loading for non-critical images
<img src="data:image/svg+xml;base64,..." 
     data-src="./img/drumming_server.png" 
     loading="lazy" 
     class="lazy-load">

// 3. Convert remaining PNGs to WebP where possible
// 4. Add responsive image sizing with srcset
```

**Expected Performance Gains:**
- Reduce total image load by 60-70%
- Improve LCP by 0.8-1.2s
- Reduce bandwidth usage by ~1.5MB

#### 2. Bundle Size Optimization (Expected Impact: 25-35% improvement)
**Issues Identified:**
- CSS files not minified (60KB+ total)
- JavaScript modules loaded individually
- No critical CSS inlining for above-the-fold content
- Font Awesome loaded via CDN (additional network request)

**Implementation Steps:**
```css
/* 1. Critical CSS inlining */
<style>:root{--primary-color:#2d7a4e;...}</style>

/* 2. CSS Minification and compression */
/* 3. Remove unused CSS rules */

/* 4. Optimize font loading */
<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2" as="font" type="font/woff2" crossorigin>
```

**Expected Performance Gains:**
- Reduce CSS payload by 30-40%
- Improve FCP by 0.3-0.5s
- Reduce render-blocking resources

### MEDIUM PRIORITY OPTIMIZATIONS

#### 3. Animation Performance Optimization (Expected Impact: 15-25% improvement)
**Current State:**
- GPU acceleration used appropriately (`transform: translateZ(0)`)
- Respect for `prefers-reduced-motion` implemented
- Some animations could be optimized further

**Implementation Steps:**
```css
/* 1. Optimize will-change usage */
.skill-card:hover {
  will-change: transform, box-shadow; /* Only on hover */
}

/* 2. Reduce animation complexity on mobile */
@media (max-width: 768px) {
  .skill-card {
    transition: transform 0.2s ease; /* Faster, simpler */
  }
}

/* 3. Use CSS containment */
.repo-card {
  contain: layout style paint;
}
```

**Expected Performance Gains:**
- Reduce jank during animations
- Improve 60fps consistency
- Better battery life on mobile

#### 4. Service Worker Cache Optimization (Expected Impact: 20-30% improvement)
**Current State:**
- Good cache-first strategy for static assets
- Stale-while-revalidate for API calls
- Network-first for dynamic content

**Implementation Steps:**
```javascript
// 1. Implement cache versioning with hash-based invalidation
const CACHE_NAME = `portfolio-v${CACHE_VERSION}`;

// 2. Add resource hint preloading for critical assets
<link rel="dns-prefetch" href="//api.github.com">
<link rel="preconnect" href="https://cdnjs.cloudflare.com">

// 3. Optimize cache storage limits
// 4. Implement background sync for better offline experience
```

**Expected Performance Gains:**
- Faster repeat visits (2-3x)
- Better offline experience
- Reduced API calls

### LOW PRIORITY OPTIMIZATIONS

#### 5. Advanced Performance Monitoring
**Implementation Steps:**
```javascript
// 1. Add real user monitoring (RUM)
// 2. Implement performance budgets
// 3. Add Core Web Vitals tracking
// 4. Set up performance regression testing
```

#### 6. Micro-optimizations
- Implement resource hints (prefetch, prerender)
- Optimize third-party script loading
- Add Brotli compression on server
- Implement HTTP/2 push for critical resources

## Mobile Performance Considerations

### Current Mobile Performance Issues:
- Touch targets need slight enlargement
- Some animations too complex for low-end devices
- Network requests not optimized for 3G conditions

### Mobile Optimization Steps:
1. **Responsive Images**: Implement `srcset` with proper breakpoints
2. **Touch Optimization**: Ensure minimum 48px touch targets
3. **Network Adaptation**: Reduce feature set on slow connections
4. **Battery Optimization**: Reduce animation complexity on mobile

## Performance Budget Recommendations

### Resource Budget Targets:
- **Total Page Weight**: < 1.5MB (currently ~3.5MB)
- **JavaScript**: < 200KB compressed
- **CSS**: < 50KB compressed
- **Images**: < 800KB compressed
- **Fonts**: < 100KB compressed

### Core Web Vitals Targets:
- **LCP**: < 2.5s (currently ~2.5-3.0s)
- **FID**: < 100ms
- **CLS**: < 0.1 (currently ~0.05-0.15)
- **FCP**: < 1.8s (currently ~1.2-1.8s)

## Implementation Roadmap

### Phase 1 (Week 1): Critical Optimizations
1. Image optimization and WebP conversion
2. Critical CSS inlining
3. Lazy loading implementation
4. Bundle minification

### Phase 2 (Week 2): Performance Enhancements
1. Service Worker optimization
2. Animation performance tuning
3. Mobile-specific optimizations
4. Performance monitoring setup

### Phase 3 (Week 3): Advanced Features
1. Real User Monitoring
2. Performance budgets
3. Automated testing
4. Progressive enhancement

## Testing Strategy

### Performance Testing Tools:
1. **Lighthouse**: Automated performance audits
2. **WebPageTest**: Real-world network conditions
3. **Chrome DevTools**: Memory and CPU profiling
4. **GTmetrix**: Third-party performance analysis

### Testing Scenarios:
1. **First Load**: Cold cache, 3G network
2. **Repeat Load**: Warm cache, 4G network
3. **Mobile Performance**: Low-end device simulation
4. **Battery Impact**: Prolonged usage testing

## Expected Overall Performance Improvement

After implementing all optimizations:
- **Page Load Time**: 40-60% faster
- **LCP**: 1.0-1.5s improvement
- **FCP**: 0.5-0.8s improvement
- **TTI**: 1.5-2.0s improvement
- **CLS**: Stable at < 0.1
- **Bandwidth Usage**: 50-70% reduction

This performance optimization plan will significantly improve user experience, search engine rankings, and overall site efficiency while maintaining the rich feature set and design quality of the portfolio.
