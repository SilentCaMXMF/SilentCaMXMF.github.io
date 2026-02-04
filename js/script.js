/**
 * Legacy JavaScript - Minimal Polyfill for Older Browsers
 * This file only loads in browsers that don't support ES modules
 * All modern functionality is handled by app.js (ES modules)
 */

(function() {
    'use strict';

    // Check if browser supports ES modules
    try {
        eval('const x = () => {}; const y = { x };');
    } catch (e) {
        // ES modules not supported - use legacy mode
        console.log('Browser does not support ES modules, using legacy mode');

        // Initialize legacy theme toggle
        document.addEventListener('DOMContentLoaded', function() {
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                const themeIcon = themeToggle.querySelector('i');
                if (themeIcon) {
                    function toggleTheme() {
                        const currentTheme = document.documentElement.getAttribute('data-theme');
                        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                        document.documentElement.setAttribute('data-theme', newTheme);
                        localStorage.setItem('theme', newTheme);
                        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                    }

                    themeToggle.addEventListener('click', toggleTheme);

                    const savedTheme = localStorage.getItem('theme') || 'light';
                    document.documentElement.setAttribute('data-theme', savedTheme);
                    themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            }

            // Initialize current year
            const yearElement = document.getElementById('current-year');
            if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
            }





            // Initialize skip links
            document.querySelectorAll('nav a[href^="#"]').forEach(function(anchor) {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });

            // Make cards keyboard accessible
            document.querySelectorAll('.repo-card, .skill-card, .education-card').forEach(function(card) {
                card.setAttribute('tabindex', '0');
            });
        });
    }
})();
