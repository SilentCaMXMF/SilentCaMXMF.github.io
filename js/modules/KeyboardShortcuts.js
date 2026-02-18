/**
 * KeyboardShortcuts Module
 * Provides keyboard navigation and accessibility shortcuts
 */

export class KeyboardShortcuts {
    constructor(navigationManager, preferenceManager = null) {
        this.navigationManager = navigationManager;
        this.preferenceManager = preferenceManager;
        this.shortcuts = new Map();
        this.enabled = true;
        this.initialized = false;
        
        // Default shortcuts
        this.defaultShortcuts = {
            'Tab': { 
                action: 'skipToContent', 
                description: 'Skip to main content',
                preventDefault: true 
            },
            '/': { 
                action: 'focusSearch', 
                description: 'Focus search box',
                preventDefault: true 
            },
            'Alt+A': { 
                action: 'toggleAnimations', 
                description: 'Toggle animations',
                preventDefault: true 
            },
            'Alt+T': { 
                action: 'toggleTheme', 
                description: 'Toggle theme',
                preventDefault: true 
            },
            'Escape': { 
                action: 'closeModal', 
                description: 'Close modal/dropdown',
                preventDefault: true 
            },
            'ArrowUp': { 
                action: 'previousSection', 
                description: 'Previous section',
                preventDefault: false 
            },
            'ArrowDown': { 
                action: 'nextSection', 
                description: 'Next section',
                preventDefault: false 
            },
            'Home': { 
                action: 'firstSection', 
                description: 'First section',
                preventDefault: true 
            },
            'End': { 
                action: 'lastSection', 
                description: 'Last section',
                preventDefault: true 
            }
        };
    }

    /**
     * Initialize keyboard shortcuts
     */
    initialize() {
        try {
            this.loadKeyboardPreference();
            this.setupPreferenceListeners();
            this.setupShortcuts();
            this.bindEvents();
            this.createHelpModal();
            this.initialized = true;
        } catch (error) {
            console.error('❌ KeyboardShortcuts initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load keyboard shortcut preference
     */
    loadKeyboardPreference() {
        if (this.preferenceManager) {
            this.enabled = this.preferenceManager.get('keyboardShortcuts');
        }
    }

    /**
     * Setup preference change listeners
     */
    setupPreferenceListeners() {
        if (!this.preferenceManager) {
            return;
        }
        
        this.preferenceManager.on('keyboardShortcuts', (enabled) => {
            this.enabled = enabled;
        });
    }

    /**
     * Setup default shortcuts
     */
    setupShortcuts() {
        Object.entries(this.defaultShortcuts).forEach(([key, config]) => {
            this.shortcuts.set(key, config);
        });
    }

    /**
     * Bind keyboard events
     */
    bindEvents() {
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    /**
     * Handle keyboard events
     */
    handleKeyDown(event) {
        if (!this.enabled) {
            return;
        }

        const key = this.getKeyString(event);
        const shortcut = this.shortcuts.get(key);
        
        if (shortcut) {
            if (shortcut.preventDefault) {
                event.preventDefault();
            }
            
            this.executeAction(shortcut.action, event);
            this.announceShortcut(shortcut.description);
        }
    }

    /**
     * Get normalized key string
     */
    getKeyString(event) {
        const parts = [];
        
        if (event.altKey) parts.push('Alt');
        if (event.ctrlKey) parts.push('Ctrl');
        if (event.shiftKey) parts.push('Shift');
        if (event.metaKey) parts.push('Meta');
        
        const key = event.key;
        parts.push(key);
        
        return parts.join('+');
    }

    /**
     * Execute keyboard shortcut action
     */
    executeAction(action, event) {
        try {
            switch (action) {
                case 'skipToContent':
                    this.skipToContent();
                    break;
                    
                case 'focusSearch':
                    this.focusSearch();
                    break;
                    
                case 'toggleAnimations':
                    this.toggleAnimations();
                    break;
                    
                case 'toggleTheme':
                    this.toggleTheme();
                    break;
                    
                case 'closeModal':
                    this.closeModal();
                    break;
                    
                case 'previousSection':
                    this.navigateSection('previous');
                    break;
                    
                case 'nextSection':
                    this.navigateSection('next');
                    break;
                    
                case 'firstSection':
                    this.navigateSection('first');
                    break;
                    
                case 'lastSection':
                    this.navigateSection('last');
                    break;
                    
                default:
                    console.warn(`Unknown keyboard action: ${action}`);
            }
        } catch (error) {
            console.error(`Error executing keyboard action ${action}:`, error);
        }
    }

    /**
     * Skip to main content
     */
    skipToContent() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Focus search box
     */
    focusSearch() {
        const searchBox = document.getElementById('repo-filter');
        if (searchBox) {
            searchBox.focus();
            searchBox.select();
        }
    }



    /**
     * Toggle theme
     */
    toggleTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.click();
        }
    }

    /**
     * Close modal or dropdown
     */
    closeModal() {

        
        // Close any open modals
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
    }

    /**
     * Navigate between sections
     */
    navigateSection(direction) {
        if (!this.navigationManager) {
            return;
        }
        
        const sections = Array.from(document.querySelectorAll('section[id]'));
        const currentSection = this.navigationManager.getCurrentSection();
        
        if (!sections.length) {
            return;
        }
        
        let targetSection;
        let currentIndex = currentSection ? 
            sections.findIndex(section => section.id === currentSection) : -1;
        
        switch (direction) {
            case 'previous':
                currentIndex = currentIndex <= 0 ? sections.length - 1 : currentIndex - 1;
                break;
            case 'next':
                currentIndex = currentIndex >= sections.length - 1 ? 0 : currentIndex + 1;
                break;
            case 'first':
                currentIndex = 0;
                break;
            case 'last':
                currentIndex = sections.length - 1;
                break;
        }
        
        targetSection = sections[currentIndex];
        if (targetSection) {
            this.navigationManager.navigateToSection(targetSection.id);
        }
    }

    /**
     * Announce shortcut action to screen readers
     */
    announceShortcut(description) {
        // Create or update live region
        let liveRegion = document.getElementById('keyboard-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'keyboard-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = description;
        
        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }

    /**
     * Create help modal
     */
    createHelpModal() {
        const helpButton = document.createElement('button');
        helpButton.innerHTML = '⌨️ Help';
        helpButton.className = 'keyboard-help-btn';
        helpButton.setAttribute('aria-label', 'Keyboard shortcuts help');
        helpButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--primary-color, #9ab891);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            z-index: 100;
            font-size: 14px;
        `;
        
        helpButton.addEventListener('click', () => this.showHelpModal());
        document.body.appendChild(helpButton);
    }

    /**
     * Show help modal
     */
    showHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'keyboard-help-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'help-title');
        
        const shortcutsList = Array.from(this.shortcuts.entries())
            .map(([key, config]) => `
                <tr>
                    <td><kbd>${this.formatKey(key)}</kbd></td>
                    <td>${config.description}</td>
                </tr>
            `)
            .join('');
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="help-title">⌨️ Keyboard Shortcuts</h2>
                    <button class="modal-close" aria-label="Close help">&times;</button>
                </div>
                <div class="modal-body">
                    <table class="shortcuts-table">
                        <thead>
                            <tr>
                                <th>Shortcut</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${shortcutsList}
                        </tbody>
                    </table>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="this.closest('.keyboard-help-modal').remove()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        document.body.appendChild(modal);
        
        // Bind close events
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => modal.remove());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Focus modal
        modal.focus();
    }

    /**
     * Format key for display
     */
    formatKey(key) {
        return key
            .replace('Alt', 'Alt + ')
            .replace('Ctrl', 'Ctrl + ')
            .replace('Shift', 'Shift + ')
            .replace('Meta', 'Cmd + ');
    }

    /**
     * Add custom shortcut
     */
    addShortcut(key, action, description, preventDefault = true) {
        this.shortcuts.set(key, {
            action,
            description,
            preventDefault
        });
    }

    /**
     * Remove shortcut
     */
    removeShortcut(key) {
        return this.shortcuts.delete(key);
    }

    /**
     * Enable/disable shortcuts
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Get all shortcuts
     */
    getShortcuts() {
        return Object.fromEntries(this.shortcuts);
    }

    /**
     * Cleanup
     */
    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // Remove help button
        const helpButton = document.querySelector('.keyboard-help-btn');
        if (helpButton) {
            helpButton.remove();
        }
        
        // Remove help modal if open
        const helpModal = document.querySelector('.keyboard-help-modal');
        if (helpModal) {
            helpModal.remove();
        }
        
        this.shortcuts.clear();
        this.enabled = false;
        this.initialized = false;
    }
}