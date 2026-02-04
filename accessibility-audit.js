// Accessibility Audit Script for Pedro Calado Portfolio
// Tests WCAG 2.1 AA compliance using axe-core and manual checks

// Import axe-core if available
let axe;
if (typeof require !== 'undefined') {
    axe = require('axe-core');
} else if (window.axe) {
    axe = window.axe;
}

class AccessibilityAudit {
    constructor() {
        this.results = {
            automated: {},
            manual: {},
            summary: {
                totalViolations: 0,
                critical: 0,
                serious: 0,
                moderate: 0,
                minor: 0,
                passes: 0
            }
        };
        this.wcagLevel = 'AA';
    }

    async runComprehensiveAudit() {
        console.log('🔍 Starting Comprehensive Accessibility Audit...');
        console.log('📋 WCAG Level: 2.1', this.wcagLevel);
        
        // Automated testing with axe-core
        await this.runAutomatedTests();
        
        // Manual testing
        this.runManualTests();
        
        // Generate summary
        this.generateSummary();
        
        return this.results;
    }

    async runAutomatedTests() {
        console.log('🤖 Running Automated Tests...');
        
        if (!axe) {
            console.warn('⚠️ axe-core not available, skipping automated tests');
            return;
        }

        try {
            // Configure axe for WCAG 2.1 AA
            const axeConfig = {
                reporter: 'v2',
                runOnly: {
                    type: 'tag',
                    values: ['wcag2aa', 'wcag21aa']
                },
                rules: {
                    // Enable all WCAG 2.1 AA rules
                    'color-contrast': { enabled: true },
                    'keyboard-navigation': { enabled: true },
                    'focus-order-semantics': { enabled: true },
                    'aria-labels': { enabled: true },
                    'alt-text': { enabled: true },
                    'heading-order': { enabled: true },
                    'landmark-one-main': { enabled: true },
                    'page-has-heading-one': { enabled: true },
                    'skip-link': { enabled: true },
                    'tabindex': { enabled: true }
                }
            };

            // Run axe audit
            const results = await axe.run(document, axeConfig);
            
            this.results.automated = {
                violations: results.violations,
                passes: results.passes,
                incomplete: results.incomplete,
                timestamp: new Date().toISOString()
            };

            // Count violations by impact
            results.violations.forEach(violation => {
                this.results.summary.totalViolations++;
                switch (violation.impact) {
                    case 'critical':
                        this.results.summary.critical++;
                        break;
                    case 'serious':
                        this.results.summary.serious++;
                        break;
                    case 'moderate':
                        this.results.summary.moderate++;
                        break;
                    case 'minor':
                        this.results.summary.minor++;
                        break;
                }
            });

            this.results.summary.passes = results.passes.length;

            console.log(`✅ Automated tests completed: ${results.violations.length} violations found`);

        } catch (error) {
            console.error('❌ Automated testing failed:', error);
            this.results.automated.error = error.message;
        }
    }

    runManualTests() {
        console.log('👁️ Running Manual Tests...');
        
        this.manualColorContrastTest();
        this.manualKeyboardNavigationTest();
        this.manualScreenReaderTest();
        this.manualFocusManagementTest();
        this.manualAriaTest();
        this.manualSemanticTest();
        this.manualResponsiveTest();
        this.manualReducedMotionTest();
    }

    manualColorContrastTest() {
        console.log('🎨 Testing Color Contrast...');
        
        const contrastIssues = [];
        const elements = document.querySelectorAll('*');
        
        elements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            
            // Skip transparent or hidden elements
            if (backgroundColor === 'rgba(0, 0, 0, 0)' || 
                styles.display === 'none' || 
                styles.visibility === 'hidden') {
                return;
            }
            
            // Check if element has text content
            if (element.textContent.trim().length > 0) {
                // Convert colors to RGB values for contrast calculation
                const rgb1 = this.hexToRgb(color);
                const rgb2 = this.hexToRgb(backgroundColor);
                
                if (rgb1 && rgb2) {
                    const contrast = this.calculateContrast(rgb1, rgb2);
                    
                    // WCAG AA requires 4.5:1 for normal text
                    if (contrast < 4.5) {
                        contrastIssues.push({
                            element: element.tagName + (element.id ? '#' + element.id : '') + (element.className ? '.' + element.className.split(' ').join('.') : ''),
                            contrast: contrast.toFixed(2),
                            text: element.textContent.substring(0, 50) + '...',
                            color: color,
                            backgroundColor: backgroundColor
                        });
                    }
                }
            }
        });

        this.results.manual.colorContrast = {
            issues: contrastIssues,
            total: contrastIssues.length,
            status: contrastIssues.length === 0 ? 'PASS' : 'FAIL'
        };

        console.log(`📊 Color contrast test: ${contrastIssues.length} issues found`);
    }

    manualKeyboardNavigationTest() {
        console.log('⌨️ Testing Keyboard Navigation...');
        
        const keyboardIssues = [];
        
        // Check for focusable elements
        const focusableElements = document.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
        );

        // Test tab order
        let tabOrder = [];
        focusableElements.forEach((element, index) => {
            const tabIndex = element.getAttribute('tabindex');
            if (tabIndex && parseInt(tabIndex) > 0) {
                tabOrder.push({
                    element: element.tagName + (element.id ? '#' + element.id : ''),
                    tabindex: tabIndex,
                    position: index
                });
            }
        });

        // Check for missing skip links
        const skipLinks = document.querySelectorAll('a[href^="#main-content"], .skip-link');
        if (skipLinks.length === 0) {
            keyboardIssues.push({
                type: 'missing-skip-link',
                description: 'No skip link found for keyboard navigation'
            });
        }

        // Check for keyboard traps
        const modals = document.querySelectorAll('[role="dialog"], .modal');
        modals.forEach(modal => {
            const focusableInModal = modal.querySelectorAll(
                'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
            );
            if (focusableInModal.length === 0 && modal.style.display !== 'none') {
                keyboardIssues.push({
                    type: 'keyboard-trap',
                    element: modal.tagName + (modal.id ? '#' + modal.id : ''),
                    description: 'Modal may trap keyboard focus'
                });
            }
        });

        this.results.manual.keyboardNavigation = {
            focusableElements: focusableElements.length,
            tabOrderIssues: tabOrder,
            issues: keyboardIssues,
            total: keyboardIssues.length,
            status: keyboardIssues.length === 0 ? 'PASS' : 'FAIL'
        };

        console.log(`⌨️ Keyboard navigation test: ${keyboardIssues.length} issues found`);
    }

    manualScreenReaderTest() {
        console.log('🔊 Testing Screen Reader Compatibility...');
        
        const screenReaderIssues = [];
        
        // Check for missing alt text
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            if (!img.alt && img.getAttribute('alt') !== '') {
                screenReaderIssues.push({
                    type: 'missing-alt',
                    element: 'img',
                    src: img.src,
                    position: index
                });
            }
        });

        // Check for proper heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        headings.forEach((heading, index) => {
            const currentLevel = parseInt(heading.tagName.substring(1));
            if (currentLevel > lastLevel + 1) {
                screenReaderIssues.push({
                    type: 'heading-skip',
                    element: heading.tagName,
                    text: heading.textContent.substring(0, 30),
                    from: lastLevel,
                    to: currentLevel,
                    position: index
                });
            }
            lastLevel = currentLevel;
        });

        // Check for ARIA labels
        const buttonsWithoutText = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttonsWithoutText.forEach(button => {
            if (button.textContent.trim() === '') {
                screenReaderIssues.push({
                    type: 'missing-aria-label',
                    element: 'button',
                    position: Array.from(document.querySelectorAll('button')).indexOf(button)
                });
            }
        });

        this.results.manual.screenReader = {
            totalImages: images.length,
            totalHeadings: headings.length,
            imagesWithoutAlt: screenReaderIssues.filter(issue => issue.type === 'missing-alt').length,
            headingIssues: screenReaderIssues.filter(issue => issue.type === 'heading-skip').length,
            ariaLabelIssues: screenReaderIssues.filter(issue => issue.type === 'missing-aria-label').length,
            issues: screenReaderIssues,
            total: screenReaderIssues.length,
            status: screenReaderIssues.length === 0 ? 'PASS' : 'FAIL'
        };

        console.log(`🔊 Screen reader test: ${screenReaderIssues.length} issues found`);
    }

    manualFocusManagementTest() {
        console.log('🎯 Testing Focus Management...');
        
        const focusIssues = [];
        
        // Check focus styles
        const focusableElements = document.querySelectorAll(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach((element, index) => {
            // Check if element has focus styles
            const styles = window.getComputedStyle(element, ':focus');
            const hasFocusOutline = styles.outline !== 'none' || styles.boxShadow !== 'none';
            
            if (!hasFocusOutline) {
                focusIssues.push({
                    type: 'missing-focus-style',
                    element: element.tagName + (element.id ? '#' + element.id : '') + (element.className ? '.' + element.className.split(' ').join('.') : ''),
                    position: index
                });
            }
        });

        // Check for visible focus indicators
        const focusIndicators = document.querySelectorAll(':focus-visible');
        if (focusIndicators.length === 0 && document.activeElement) {
            focusIssues.push({
                type: 'no-visible-focus',
                description: 'No visible focus indicator found'
            });
        }

        this.results.manual.focusManagement = {
            totalFocusableElements: focusableElements.length,
            elementsWithoutFocusStyles: focusIssues.filter(issue => issue.type === 'missing-focus-style').length,
            issues: focusIssues,
            total: focusIssues.length,
            status: focusIssues.length === 0 ? 'PASS' : 'FAIL'
        };

        console.log(`🎯 Focus management test: ${focusIssues.length} issues found`);
    }

    manualAriaTest() {
        console.log('♿ Testing ARIA Implementation...');
        
        const ariaIssues = [];
        
        // Check for ARIA roles
        const elementsWithRoles = document.querySelectorAll('[role]');
        elementsWithRoles.forEach(element => {
            const role = element.getAttribute('role');
            const tagName = element.tagName.toLowerCase();
            
            // Check for invalid role usage
            const validRoles = ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search', 'form', 'region', 'dialog', 'alert', 'status'];
            if (!validRoles.includes(role) && !role.startsWith('aria-')) {
                ariaIssues.push({
                    type: 'invalid-role',
                    element: tagName,
                    role: role,
                    description: `Invalid or non-standard ARIA role: ${role}`
                });
            }
        });

        // Check for aria-label and aria-labelledby
        const elementsWithAriaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]');
        elementsWithAriaLabels.forEach(element => {
            const ariaLabel = element.getAttribute('aria-label');
            const ariaLabelledBy = element.getAttribute('aria-labelledby');
            
            if (ariaLabelledBy) {
                const labelElement = document.getElementById(ariaLabelledBy);
                if (!labelElement) {
                    ariaIssues.push({
                        type: 'invalid-aria-labelledby',
                        element: element.tagName + (element.id ? '#' + element.id : ''),
                        referencedId: ariaLabelledBy,
                        description: `aria-labelledby references non-existent element: ${ariaLabelledBy}`
                    });
                }
            }
        });

        this.results.manual.aria = {
            totalElementsWithRoles: elementsWithRoles.length,
            totalElementsWithLabels: elementsWithAriaLabels.length,
            issues: ariaIssues,
            total: ariaIssues.length,
            status: ariaIssues.length === 0 ? 'PASS' : 'FAIL'
        };

        console.log(`♿ ARIA test: ${ariaIssues.length} issues found`);
    }

    manualSemanticTest() {
        console.log('🏗️ Testing Semantic HTML...');
        
        const semanticIssues = [];
        
        // Check for landmark elements
        const requiredLandmarks = ['main', 'header', 'nav'];
        requiredLandmarks.forEach(landmark => {
            const elements = document.querySelectorAll(landmark);
            if (elements.length === 0) {
                semanticIssues.push({
                    type: 'missing-landmark',
                    landmark: landmark,
                    description: `Missing required landmark element: ${landmark}`
                });
            }
        });

        // Check for proper heading structure
        const h1Elements = document.querySelectorAll('h1');
        if (h1Elements.length === 0) {
            semanticIssues.push({
                type: 'missing-h1',
                description: 'Page missing h1 element'
            });
        } else if (h1Elements.length > 1) {
            semanticIssues.push({
                type: 'multiple-h1',
                count: h1Elements.length,
                description: `Page has ${h1Elements.length} h1 elements (should have only 1)`
            });
        }

        this.results.manual.semantic = {
            h1Count: h1Elements.length,
            landmarkIssues: semanticIssues.filter(issue => issue.type === 'missing-landmark').length,
            headingIssues: semanticIssues.filter(issue => issue.type.startsWith('missing-h') || issue.type.startsWith('multiple-h')).length,
            issues: semanticIssues,
            total: semanticIssues.length,
            status: semanticIssues.length === 0 ? 'PASS' : 'FAIL'
        };

        console.log(`🏗️ Semantic HTML test: ${semanticIssues.length} issues found`);
    }

    manualResponsiveTest() {
        console.log('📱 Testing Responsive Design...');
        
        const responsiveIssues = [];
        
        // Test zoom levels (200% and 400%)
        const originalViewportWidth = window.innerWidth;
        
        // Simulate 200% zoom
        document.body.style.zoom = '2';
        setTimeout(() => {
            const scrollWidthAt200 = document.body.scrollWidth;
            if (scrollWidthAt200 > originalViewportWidth * 2) {
                responsiveIssues.push({
                    type: 'horizontal-scroll-at-200',
                    description: 'Horizontal scrolling appears at 200% zoom'
                });
            }
            
            // Simulate 400% zoom
            document.body.style.zoom = '4';
            setTimeout(() => {
                const scrollWidthAt400 = document.body.scrollWidth;
                if (scrollWidthAt400 > originalViewportWidth * 4) {
                    responsiveIssues.push({
                        type: 'horizontal-scroll-at-400',
                        description: 'Horizontal scrolling appears at 400% zoom'
                    });
                }
                
                // Reset zoom
                document.body.style.zoom = '1';
            }, 100);
        }, 100);

        // Check for touch target sizes (minimum 44x44px)
        const touchTargets = document.querySelectorAll('a, button, input, select, textarea');
        touchTargets.forEach(target => {
            const rect = target.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                responsiveIssues.push({
                    type: 'small-touch-target',
                    element: target.tagName + (target.id ? '#' + target.id : ''),
                    width: rect.width,
                    height: rect.height
                });
            }
        });

        this.results.manual.responsive = {
            totalTouchTargets: touchTargets.length,
            smallTouchTargets: responsiveIssues.filter(issue => issue.type === 'small-touch-target').length,
            zoomIssues: responsiveIssues.filter(issue => issue.type.includes('zoom')).length,
            issues: responsiveIssues,
            total: responsiveIssues.length,
            status: responsiveIssues.length === 0 ? 'PASS' : 'FAIL'
        };

        console.log(`📱 Responsive test: ${responsiveIssues.length} issues found`);
    }

    manualReducedMotionTest() {
        console.log('🎬 Testing Reduced Motion...');
        
        const motionIssues = [];
        
        // Check for prefers-reduced-motion support
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Look for animations that don't respect reduced motion
        const animatedElements = document.querySelectorAll('*');
        animatedElements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const animation = styles.animation;
            const transition = styles.transition;
            
            if (prefersReducedMotion && (animation !== 'none' && animation !== '')) {
                motionIssues.push({
                    type: 'animation-not-respecting-reduced-motion',
                    element: element.tagName + (element.className ? '.' + element.className.split(' ').join('.') : ''),
                    animation: animation
                });
            }
        });

        // Check for reduced motion CSS
        const reducedMotionStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
        let hasReducedMotionCSS = false;
        
        reducedMotionStyles.forEach(styleElement => {
            const content = styleElement.textContent || styleElement.href;
            if (content && content.includes('prefers-reduced-motion')) {
                hasReducedMotionCSS = true;
            }
        });

        if (!hasReducedMotionCSS) {
            motionIssues.push({
                type: 'missing-reduced-motion-css',
                description: 'No CSS found that respects prefers-reduced-motion'
            });
        }

        this.results.manual.reducedMotion = {
            prefersReducedMotion: prefersReducedMotion,
            hasReducedMotionCSS: hasReducedMotionCSS,
            animatedElementsNotRespectingPreference: motionIssues.filter(issue => issue.type === 'animation-not-respecting-reduced-motion').length,
            issues: motionIssues,
            total: motionIssues.length,
            status: motionIssues.length === 0 ? 'PASS' : 'FAIL'
        };

        console.log(`🎬 Reduced motion test: ${motionIssues.length} issues found`);
    }

    generateSummary() {
        console.log('📊 Generating Accessibility Summary...');
        
        const totalManualIssues = Object.values(this.results.manual).reduce((sum, test) => sum + test.total, 0);
        const manualPasses = Object.values(this.results.manual).filter(test => test.status === 'PASS').length;
        const totalManualTests = Object.keys(this.results.manual).length;
        
        this.results.summary = {
            ...this.results.summary,
            manualIssues: totalManualIssues,
            manualPasses: manualPasses,
            manualTests: totalManualTests,
            wcagCompliance: this.calculateWCAGCompliance(),
            recommendations: this.generateRecommendations(),
            timestamp: new Date().toISOString()
        };

        console.log(`✨ Summary: ${this.results.summary.totalViolations} automated violations, ${totalManualIssues} manual issues`);
        console.log(`📈 WCAG Compliance: ${this.results.summary.wcagCompliance.level} (${this.results.summary.wcagCompliance.score}%)`);
    }

    calculateWCAGCompliance() {
        const totalTests = Object.keys(this.results.manual).length;
        const passedTests = Object.values(this.results.manual).filter(test => test.status === 'PASS').length;
        const automatedPasses = this.results.summary.passes || 0;
        const automatedTotal = (this.results.summary.passes || 0) + (this.results.summary.totalViolations || 0);
        
        const score = Math.round(((passedTests / totalTests) * 0.6 + (automatedTotal > 0 ? (automatedPasses / automatedTotal) * 0.4 : 1)) * 100);
        
        let level = 'Non-Compliant';
        if (score >= 95) level = 'WCAG 2.1 AAA';
        else if (score >= 85) level = 'WCAG 2.1 AA';
        else if (score >= 70) level = 'WCAG 2.1 A';
        else if (score >= 50) level = 'Partial Compliance';
        
        return { level, score };
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Analyze manual test results
        Object.entries(this.results.manual).forEach(([testName, result]) => {
            if (result.status === 'FAIL') {
                switch (testName) {
                    case 'colorContrast':
                        recommendations.push({
                            priority: 'HIGH',
                            category: 'Visual Accessibility',
                            issue: 'Color Contrast Issues',
                            recommendation: 'Increase color contrast ratios to meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)',
                            implementation: 'Use CSS color contrast tools to adjust colors, consider darker text or lighter backgrounds'
                        });
                        break;
                    case 'keyboardNavigation':
                        recommendations.push({
                            priority: 'HIGH',
                            category: 'Motor Accessibility',
                            issue: 'Keyboard Navigation Problems',
                            recommendation: 'Ensure all interactive elements are keyboard accessible and logical tab order',
                            implementation: 'Add skip links, fix tab order, ensure no keyboard traps'
                        });
                        break;
                    case 'screenReader':
                        recommendations.push({
                            priority: 'HIGH',
                            category: 'Screen Reader Support',
                            issue: 'Screen Reader Compatibility',
                            recommendation: 'Add proper alt text for images and ensure proper heading structure',
                            implementation: 'Add descriptive alt text, fix heading hierarchy, add ARIA labels where needed'
                        });
                        break;
                    case 'focusManagement':
                        recommendations.push({
                            priority: 'MEDIUM',
                            category: 'Visual Accessibility',
                            issue: 'Focus Management',
                            recommendation: 'Ensure visible focus indicators for all interactive elements',
                            implementation: 'Add :focus-visible styles with clear visual indicators'
                        });
                        break;
                    case 'reducedMotion':
                        recommendations.push({
                            priority: 'MEDIUM',
                            category: 'Motor Accessibility',
                            issue: 'Motion Preferences',
                            recommendation: 'Respect user\'s motion preferences',
                            implementation: 'Add @media (prefers-reduced-motion: reduce) CSS rules'
                        });
                        break;
                }
            }
        });
        
        return recommendations.sort((a, b) => {
            const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    // Utility functions
    hexToRgb(color) {
        if (!color || color === 'transparent') return null;
        
        // Convert hex to RGB
        let hex = color.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : this.parseRgbString(color);
    }

    parseRgbString(color) {
        const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3])
            };
        }
        return null;
    }

    calculateContrast(rgb1, rgb2) {
        const l1 = this.calculateLuminance(rgb1);
        const l2 = this.calculateLuminance(rgb2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    calculateLuminance(rgb) {
        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;
        
        const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    // Export results as JSON
    exportResults() {
        return JSON.stringify(this.results, null, 2);
    }

    // Generate HTML report
    generateHTMLReport() {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Audit Report - Pedro Calado Portfolio</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
        .header { background: #2d7a4e; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0; color: #2d7a4e; }
        .metric .value { font-size: 2em; font-weight: bold; }
        .pass { color: #28a745; }
        .fail { color: #dc3545; }
        .test-section { margin-bottom: 30px; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
        .test-section h2 { color: #2d7a4e; margin-top: 0; }
        .issue { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0; }
        .recommendation { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 15px 0; }
        .priority-high { border-left-color: #dc3545; }
        .priority-medium { border-left-color: #ffc107; }
        .priority-low { border-left-color: #28a745; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        th { background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Accessibility Audit Report</h1>
        <p><strong>Website:</strong> Pedro Calado Portfolio</p>
        <p><strong>WCAG Level:</strong> 2.1 ${this.wcagLevel}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Overall Compliance:</strong> ${this.results.summary.wcagCompliance.level} (${this.results.summary.wcagCompliance.score}%)</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total Violations</h3>
            <div class="value ${this.results.summary.totalViolations === 0 ? 'pass' : 'fail'}">${this.results.summary.totalViolations}</div>
        </div>
        <div class="metric">
            <h3>Critical Issues</h3>
            <div class="value ${this.results.summary.critical === 0 ? 'pass' : 'fail'}">${this.results.summary.critical}</div>
        </div>
        <div class="metric">
            <h3>Serious Issues</h3>
            <div class="value ${this.results.summary.serious === 0 ? 'pass' : 'fail'}">${this.results.summary.serious}</div>
        </div>
        <div class="metric">
            <h3>Manual Issues</h3>
            <div class="value ${this.results.summary.manualIssues === 0 ? 'pass' : 'fail'}">${this.results.summary.manualIssues}</div>
        </div>
    </div>

    ${this.generateManualTestsHTML()}
    
    ${this.generateRecommendationsHTML()}

</body>
</html>`;
        return html;
    }

    generateManualTestsHTML() {
        let html = '<h2>🧪 Manual Test Results</h2>';
        
        Object.entries(this.results.manual).forEach(([testName, result]) => {
            html += `
                <div class="test-section">
                    <h2>${this.getTestIcon(testName)} ${this.formatTestName(testName)}</h2>
                    <p><strong>Status:</strong> <span class="${result.status.toLowerCase()}">${result.status}</span></p>
                    <p><strong>Issues Found:</strong> ${result.total}</p>`;
            
            if (result.total > 0) {
                html += '<h3>Issues:</h3>';
                result.issues.forEach(issue => {
                    html += `<div class="issue">
                        <strong>${issue.type || 'Issue'}:</strong> ${issue.description || JSON.stringify(issue)}
                    </div>`;
                });
            }
            
            html += '</div>';
        });
        
        return html;
    }

    generateRecommendationsHTML() {
        let html = '<h2>💡 Recommendations</h2>';
        
        this.results.summary.recommendations.forEach(rec => {
            html += `
                <div class="recommendation priority-${rec.priority.toLowerCase()}">
                    <h3>${rec.category} - ${rec.priority} Priority</h3>
                    <p><strong>Issue:</strong> ${rec.issue}</p>
                    <p><strong>Recommendation:</strong> ${rec.recommendation}</p>
                    <p><strong>Implementation:</strong> ${rec.implementation}</p>
                </div>
            `;
        });
        
        return html;
    }

    getTestIcon(testName) {
        const icons = {
            colorContrast: '🎨',
            keyboardNavigation: '⌨️',
            screenReader: '🔊',
            focusManagement: '🎯',
            aria: '♿',
            semantic: '🏗️',
            responsive: '📱',
            reducedMotion: '🎬'
        };
        return icons[testName] || '🧪';
    }

    formatTestName(testName) {
        const names = {
            colorContrast: 'Color Contrast',
            keyboardNavigation: 'Keyboard Navigation',
            screenReader: 'Screen Reader Compatibility',
            focusManagement: 'Focus Management',
            aria: 'ARIA Implementation',
            semantic: 'Semantic HTML',
            responsive: 'Responsive Design',
            reducedMotion: 'Reduced Motion'
        };
        return names[testName] || testName;
    }
}

// Export for use in browser or Node
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityAudit;
} else {
    window.AccessibilityAudit = AccessibilityAudit;
}