/**
 * Manual Testing Script for Portfolio Website
 * Run this in browser console to get comprehensive test results
 */

function runPortfolioTests() {
    console.clear();
    console.log('🚀 Starting Portfolio Tests...\n');
    
    const results = {
        core: [],
        accessibility: [],
        performance: [],
        responsive: [],
        github: []
    };

    // 1. Core Functionality Tests
    console.log('=== CORE FUNCTIONALITY ===');
    
    // Theme Toggle Test
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        results.core.push('✅ Theme toggle button found');
        
        const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
        themeToggle.click();
        
        setTimeout(() => {
            const newTheme = document.documentElement.getAttribute('data-theme') || 'light';
            if (initialTheme !== newTheme) {
                results.core.push('✅ Theme toggle works correctly');
            } else {
                results.core.push('❌ Theme toggle not working');
            }
        }, 500);
        
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            results.core.push('✅ Theme persistence in localStorage');
        } else {
            results.core.push('❌ Theme not saved to localStorage');
        }
    } else {
        results.core.push('❌ Theme toggle button not found');
    }
    
    // Navigation Tests
    const navLinks = document.querySelectorAll('nav a[href^=\"#"]');
    if (navLinks.length > 0) {
        results.core.push(`✅ Found ${navLinks.length} navigation links`);
        
        // Test first navigation link
        const firstLink = navLinks[0];
        const targetId = firstLink.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            results.core.push(`✅ Navigation target ${targetId} exists`);
        } else {
            results.core.push(`❌ Navigation target ${targetId} missing`);
        }
    } else {
        results.core.push('❌ No navigation links found');
    }
    
    // Mobile Navigation
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle, button[aria-label*=\"menu\"]');
    if (mobileMenuToggle) {
        results.core.push('✅ Mobile menu toggle found');
    } else {
        results.core.push('⚠️ Mobile menu toggle not found');
    }

    // 2. Accessibility Tests
    console.log('\n=== ACCESSIBILITY ===');
    
    // Semantic HTML
    const hasMain = document.querySelector('main') !== null;
    const hasHeader = document.querySelector('header') !== null;
    const hasNav = document.querySelector('nav') !== null;
    const hasFooter = document.querySelector('footer') !== null;
    
    if (hasMain && hasHeader && hasNav) {
        results.accessibility.push('✅ Semantic HTML structure present');
    } else {
        results.accessibility.push('❌ Missing semantic elements');
    }
    
    // ARIA Labels
    const buttons = document.querySelectorAll('button');
    let buttonsWithAria = 0;
    buttons.forEach(button => {
        if (button.hasAttribute('aria-label') || button.textContent.trim()) {
            buttonsWithAria++;
        }
    });
    
    if (buttonsWithAria / buttons.length > 0.8) {
        results.accessibility.push(`✅ ${buttonsWithAria}/${buttons.length} buttons have accessibility labels`);
    } else {
        results.accessibility.push(`⚠️ Only ${buttonsWithAria}/${buttons.length} buttons have accessibility labels`);
    }
    
    // Skip Links
    const skipLinks = document.querySelectorAll('a[href*=\"skip\"], a[href*=\"main\"], a[href*=\"content\"]');
    if (skipLinks.length > 0) {
        results.accessibility.push('✅ Skip navigation links found');
    } else {
        results.accessibility.push('⚠️ No skip links found');
    }
    
    // Focus Management
    const focusableElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex=\"0\"]');
    if (focusableElements.length > 0) {
        results.accessibility.push(`✅ ${focusableElements.length} focusable elements found`);
    } else {
        results.accessibility.push('❌ No focusable elements found');
    }

    // 3. Performance Tests
    console.log('\n=== PERFORMANCE ===');
    
    const navigationTiming = performance.getEntriesByType('navigation')[0];
    if (navigationTiming) {
        const loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
        const domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart;
        
        if (loadTime < 3000) {
            results.performance.push(`✅ Page load time: ${loadTime.toFixed(0)}ms`);
        } else if (loadTime < 5000) {
            results.performance.push(`⚠️ Page load time: ${loadTime.toFixed(0)}ms (could be optimized)`);
        } else {
            results.performance.push(`❌ Page load time: ${loadTime.toFixed(0)}ms (needs optimization)`);
        }
        
        if (domContentLoaded < 1500) {
            results.performance.push(`✅ DOM ready: ${domContentLoaded.toFixed(0)}ms`);
        } else {
            results.performance.push(`⚠️ DOM ready: ${domContentLoaded.toFixed(0)}ms`);
        }
    }
    
    // Resource Count
    const stylesheets = document.querySelectorAll('link[rel=\"stylesheet\"]').length;
    const scripts = document.querySelectorAll('script[src]').length;
    const images = document.querySelectorAll('img').length;
    
    results.performance.push(`📊 Resources: ${stylesheets} CSS, ${scripts} JS scripts, ${images} images`);

    // 4. Responsive Design Tests
    console.log('\n=== RESPONSIVE DESIGN ===');
    
    // Viewport Meta Tag
    const viewportMeta = document.querySelector('meta[name=\"viewport\"]');
    if (viewportMeta && viewportMeta.getAttribute('content').includes('width=device-width')) {
        results.responsive.push('✅ Viewport meta tag properly configured');
    } else {
        results.responsive.push('❌ Viewport meta tag missing or misconfigured');
    }
    
    // Current viewport size
    const width = window.innerWidth;
    results.responsive.push(`📱 Current viewport: ${width}px`);
    
    if (width <= 768) {
        results.responsive.push('📱 Currently in mobile viewport');
    } else if (width <= 1024) {
        results.responsive.push('📱 Currently in tablet viewport');
    } else {
        results.responsive.push('🖥️ Currently in desktop viewport');
    }

    // 5. GitHub Integration Tests
    console.log('\n=== GITHUB INTEGRATION ===');
    
    const githubSection = document.getElementById('github-repos-section');
    if (githubSection) {
        results.github.push('✅ GitHub repositories section found');
        
        setTimeout(() => {
            const repoCards = document.querySelectorAll('[data-repo-card], .repo-card');
            if (repoCards.length > 0) {
                results.github.push(`✅ Found ${repoCards.length} repository cards`);
            } else {
                results.github.push('⚠️ No repository cards loaded yet (API may be loading)');
            }
            
            const searchInput = document.querySelector('#repo-search, input[placeholder*=\"search\"]');
            if (searchInput) {
                results.github.push('✅ Search functionality found');
            } else {
                results.github.push('⚠️ No search input found');
            }
        }, 2000);
    } else {
        results.github.push('❌ GitHub repositories section not found');
    }

    // Generate Summary Report
    setTimeout(() => {
        console.log('\n' + '='.repeat(80));
        console.log('📊 COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(80));
        
        const allResults = [
            ...results.core,
            ...results.accessibility,
            ...results.performance,
            ...results.responsive,
            ...results.github
        ];
        
        const passCount = allResults.filter(r => r.includes('✅')).length;
        const warningCount = allResults.filter(r => r.includes('⚠️')).length;
        const failCount = allResults.filter(r => r.includes('❌')).length;
        
        console.log(`\n📈 SUMMARY:`);
        console.log(`✅ Passed: ${passCount}`);
        console.log(`⚠️ Warnings: ${warningCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`📊 Total Tests: ${allResults.length}`);
        
        console.log(`\n📋 DETAILED RESULTS:`);
        console.log('\n🔧 CORE FUNCTIONALITY:');
        results.core.forEach(result => console.log(`  ${result}`));
        
        console.log('\n♿ ACCESSIBILITY:');
        results.accessibility.forEach(result => console.log(`  ${result}`));
        
        console.log('\n⚡ PERFORMANCE:');
        results.performance.forEach(result => console.log(`  ${result}`));
        
        console.log('\n📱 RESPONSIVE DESIGN:');
        results.responsive.forEach(result => console.log(`  ${result}`));
        
        console.log('\n🐙 GITHUB INTEGRATION:');
        results.github.forEach(result => console.log(`  ${result}`));
        
        console.log('\n' + '='.repeat(80));
        console.log('💡 RECOMMENDATIONS:');
        
        if (failCount > 0) {
            console.log('• Address critical issues marked with ❌');
        }
        if (warningCount > 0) {
            console.log('• Review warnings marked with ⚠️ for potential improvements');
        }
        if (warningCount === 0 && failCount === 0) {
            console.log('✅ Excellent! No critical issues found.');
        }
        
        // Test specific breakpoints (quick test)
        console.log('\n🔍 BREAKPOINT TESTS:');
        const originalWidth = window.innerWidth;
        
        // Test mobile
        window.resizeTo(375, 667);
        setTimeout(() => {
            console.log(`📱 Mobile (375px): ${document.body.scrollWidth}px width`);
            
            // Test tablet
            window.resizeTo(768, 1024);
            setTimeout(() => {
                console.log(`📱 Tablet (768px): ${document.body.scrollWidth}px width`);
                
                // Test desktop
                window.resizeTo(originalWidth, window.innerHeight);
                setTimeout(() => {
                    console.log(`🖥️ Desktop (${originalWidth}px): ${document.body.scrollWidth}px width`);
                    console.log('\n🎉 Test suite completed!');
                }, 500);
            }, 500);
        }, 500);
        
    }, 3000);
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    console.log('Portfolio test script loaded. Run runPortfolioTests() to execute.');
}