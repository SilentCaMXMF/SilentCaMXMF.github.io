/**
 * @file Event Manager
 * @description Simple event management system for custom events
 */

export class EventManager {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Subscribe to an event
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Subscribe to an event (one-time)
     */
    once(event, callback) {
        const wrappedCallback = (data) => {
            this.off(event, wrappedCallback);
            callback(data);
        };
        this.on(event, wrappedCallback);
    }

    /**
     * Unsubscribe from an event
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit an event
     */
    emit(event, data = {}) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for "${event}":`, error);
                }
            });
        }
    }

    /**
     * Remove all listeners
     */
    removeAllListeners() {
        this.listeners.clear();
    }

    /**
     * Get listener count for an event
     */
    listenerCount(event) {
        return this.listeners.has(event) ? this.listeners.get(event).length : 0;
    }

    /**
     * Get all events with listeners
     */
    getEvents() {
        return Array.from(this.listeners.keys());
    }
}
