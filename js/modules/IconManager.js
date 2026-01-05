/**
 * IconManager Module
 * Handles Font Awesome to custom icon replacement
 */

export class IconManager {
    constructor() {
        this.iconMappings = {
            'fas fa-moon': 'icon icon-moon',
            'fas fa-sun': 'icon icon-sun',
            'fas fa-exclamation-triangle': 'icon icon-exclamation-triangle',
            'fas fa-info-circle': 'icon icon-info-circle',
            'fas fa-star': 'icon icon-star',
            'fas fa-code-branch': 'icon icon-code-branch',
            'fas fa-clock': 'icon icon-clock',
            'fas fa-chevron-left': 'icon icon-chevron-left',
            'fas fa-chevron-right': 'icon icon-chevron-right',
            'fas fa-search': 'icon icon-search',
            'fas fa-envelope': 'icon icon-envelope',
            'fas fa-map-marker-alt': 'icon icon-map-marker-alt',
            'fas fa-arrow-up': 'icon icon-arrow-up',
            'fas fa-pause': 'icon icon-pause',
            'fas fa-play': 'icon icon-play',
            'fab fa-html5': 'icon icon-html5',
            'fab fa-css3-alt': 'icon icon-css3-alt',
            'fab fa-js': 'icon icon-js',
            'fab fa-react': 'icon icon-react',
            'fab fa-python': 'icon icon-python',
            'fab fa-php': 'icon icon-php',
            'fab fa-git-alt': 'icon icon-git-alt',
            'fab fa-bootstrap': 'icon icon-bootstrap',
            'fab fa-linkedin': 'icon icon-linkedin',
            'fab fa-github': 'icon icon-github',
            'fab fa-free-code-camp': 'icon icon-free-code-camp'
        };
        
        this.initialized = false;
    }

    /**
     * Initialize icon manager
     */
    initialize() {
        try {
            this.replaceFontIcons();
            this.initialized = true;
            console.log('🎨 IconManager initialized');
        } catch (error) {
            console.error('❌ IconManager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Replace all Font Awesome classes with custom icons
     */
    replaceFontIcons() {
        // Replace all Font Awesome classes
        Object.entries(this.iconMappings).forEach(([faClass, customClass]) => {
            const elements = document.querySelectorAll(`.${faClass.replace(/\s+/g, '.')}`);
            elements.forEach(element => {
                element.className = customClass;
            });
        });

        console.log(`🔄 Replaced ${Object.keys(this.iconMappings).length} icon types`);
    }

    /**
     * Update icon for theme toggle
     */
    updateThemeIcon(isDark) {
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = isDark ? 'icon icon-sun' : 'icon icon-moon';
        }
    }

    /**
     * Get icon class for icon name
     */
    getIconClass(iconName) {
        return this.iconMappings[iconName] || '';
    }

    /**
     * Add new icon mapping
     */
    addIconMapping(faClass, customClass) {
        this.iconMappings[faClass] = customClass;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.iconMappings = null;
        this.initialized = false;
    }
}