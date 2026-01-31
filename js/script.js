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

            // Initialize menu toggle
            const menuButton = document.getElementById('menu-button');
            const dropdownMenu = document.getElementById('dropdown-menu');

            if (menuButton && dropdownMenu) {
                menuButton.addEventListener('click', function(e) {
                    const isVisible = dropdownMenu.classList.toggle('visible');
                    this.setAttribute('aria-expanded', isVisible);
                    e.stopPropagation();
                });

                document.addEventListener('click', function(e) {
                    if (
                        dropdownMenu.classList.contains('visible') &&
                        !dropdownMenu.contains(e.target) &&
                        e.target !== menuButton
                    ) {
                        dropdownMenu.classList.remove('visible');
                    }
                });
            }

            // Initialize animation toggle
            const animationToggle = document.getElementById('animation-toggle');
            if (animationToggle) {
                const animationIcon = animationToggle.querySelector('i');

                function updateAnimationState() {
                    const animationsPaused = localStorage.getItem('animationsPaused') === 'true';
                    if (animationsPaused) {
                        document.body.classList.add('animations-paused');
                        document.documentElement.setAttribute('data-animations', 'paused');
                        if (animationIcon) animationIcon.className = 'fas fa-play';
                    } else {
                        document.body.classList.remove('animations-paused');
                        document.documentElement.setAttribute('data-animations', 'enabled');
                        if (animationIcon) animationIcon.className = 'fas fa-pause';
                    }
                }

                animationToggle.addEventListener('click', function() {
                    const isPaused = document.body.classList.contains('animations-paused');
                    localStorage.setItem('animationsPaused', (!isPaused).toString());
                    updateAnimationState();
                });

                updateAnimationState();
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
