// tabHistoryManager.js
class TabHistoryManager {
    constructor(cycleSize = 3) {
        this.tabHistory = [];
        this.currentTabIndex = 0;
        this.cycleSize = cycleSize;
        this.lastAccessedTabIndex = -1;  // Initialize a tracker for the last accessed tab index.
    }

    /**
     * Captures the current state of the tab manager.
     * This function is used for saving the state and must return a serializable object.
     */
    getState() {
        return {
            tabHistory: this.tabHistory,           // The order of tabs as they were accessed
            currentTabIndex: this.currentTabIndex, // The index in 'tabHistory' that's currently active
            cycleSize: this.cycleSize,                     // Maximum number of entries 'tabHistory' can hold
            lastAccessedTabIndex: this.lastAccessedTabIndex  // The last tab Index that was accessed
        };
    }

    /**
     * Restores the state of the tab manager.
     * This function is used for loading the state from a saved object.
     *
     * @param {Object} state - The previously saved state of the tab manager.
     */
    setState(state) {
        // Ensure that the state contains all necessary properties to prevent errors.
        if (state && state.hasOwnProperty('tabHistory') && state.hasOwnProperty('currentTabIndex') 
            && state.hasOwnProperty('cycleSize') && state.hasOwnProperty('lastAccessedTabIndex')) {
            this.tabHistory = state.tabHistory;
            this.currentTabIndex = state.currentTabIndex;
            this.cycleSize = state.cycleSize;
            this.lastAccessedTabIndex = state.lastAccessedTabIndex;
        } else {
            throw new Error('Invalid state object. The state must contain tabHistory, currentTabIndex, cycleSize, and lastAccessedTabIndex.');
        }
    }
    
    changeCycleSize(newCycleSize) {
	return this.cycleSize = newCycleSize;
    }
    
    currentTabId() {
        return this.tabHistory[this.currentTabIndex];
    }
    
    currentTabIndex() {
        return currentTabIndex;
    }
    
    setActivateTab(tabId) {

        const tabIndex = this.tabHistory.indexOf(tabId);

	if (tabIndex >= 0 && tabIndex < this.tabHistory.length)
	    this.currentTabIndex = tabIndex;

        // Verify the internal state at the end of the method
        if (!this.checkState()) {
            throw new Error('State became inconsistent after activating tab before maintainSize.');
        }
        this.maintainSize();

        // Verify the internal state at the end of the method
        if (!this.checkState()) {
            throw new Error('State became inconsistent after activating tab after maintainSize.');
        }
    }

    activateTab(tabId, log = false) {
	if (log) {
	    this.consoleLogState('Start Activate Tab');
	}

	// Before activating the new tab, set the current tab as the last accessed.
        if (this.tabHistory.length > 0) {
            this.lastAccessedTabIndex = this.currentTabIndex
        }

	if (log) {
	    this.consoleLogState('1 Activate Tab');
	}

	if (this.tabHistory.includes(tabId)) {
            // If the tab is already in history, remove its old position.
            this.tabHistory = this.tabHistory.filter(id => id !== tabId);
        }

	if (log) {
	    this.consoleLogState('2 Activate Tab');
	}

	// Add the tab to the end of the history.
        this.tabHistory.push(tabId);
        this.currentTabIndex = this.tabHistory.length - 1;

	if (log) {
	    this.consoleLogState('3 Activate Tab');
	}

        // Verify the internal state at the end of the method
        if (!this.checkState()) {
            throw new Error('State became inconsistent after activating tab before maintainSize.');
        }
        this.maintainSize();

        // Verify the internal state at the end of the method
        if (!this.checkState()) {
            throw new Error('State became inconsistent after activating tab after maintainSize.');
        }

	if (log) {
	    this.consoleLogState('End Activate Tab');
	}


    }

    nextTab(log = false) {
	if (log) {
	    this.consoleLogState('Next start');
	}

	if (this.tabHistory.length === 0) {
            return undefined;
	}

	// Correct the index if it's out of bounds
	if (this.currentTabIndex >= this.tabHistory.length) {
            this.currentTabIndex = this.tabHistory.length - 1;
	}

        // update the lastaccessedtabindex
        this.lastAccessedTabIndex = this.currentTabIndex;
	
	this.currentTabIndex = (this.currentTabIndex + 1) % this.tabHistory.length;
	if (log) {
	    console.log('Next: New tab index: ', this.currentTabIndex);
	}

        // Verify the internal state at the end of the method
        if (!this.checkState()) {
            throw new Error('State became inconsistent after next tab.');
        }
	return this.tabHistory[this.currentTabIndex];
    }
    
    previousTab(log = false) {
	if (log) {
	    this.consoleLogState('Prev start');
	}

	if (this.tabHistory.length === 0) {
            return undefined;
	}

        // // update the lastaccessedtabindex
        // this.lastAccessedIndex = this.currentTabIndex;

	// If you're at the start of the list, the previous tab should take you to the end.
	if (this.currentTabIndex === 0) {
            this.currentTabIndex = this.tabHistory.length - 1;
	} else {
            // Otherwise, just move to the previous index.
            this.currentTabIndex--;
	}

	if (log) {
	    console.log('Prev: New tab index: ', this.currentTabIndex);
	}

	// Verify the internal state at the end of the method
        if (!this.checkState()) {
            throw new Error('State became inconsistent after previous tab.');
        }
	return this.tabHistory[this.currentTabIndex];
    }

    switchTab(log = false) {
	if (log) {
	    this.consoleLogState('Start switch');
	}

        // If there's not enough history or there's no last accessed tab, maintain the current state.
        if (this.tabHistory.length < 2 || this.lastAccessedTabIndex === -1) {
            return this.currentTabId();
        }
	// curr 3 last 2
        const lastAccessedIndex = this.lastAccessedTabIndex;

        if (lastAccessedIndex === -1) {
            // The last accessed tab is no longer in the history. Can't switch.
            return this.currentTabId(); // or handle this some other way
        }

        // Update the last accessed tab to be the one we switched from.
        this.lastAccessedTabIndex = this.currentTabIndex

        // Switch to the last accessed tab by updating the current tab index.
        this.currentTabIndex = lastAccessedIndex;

	if (log) {
	    this.consoleLogState('End switch');
	}
	
        // Return the ID of the now-current tab.
        return this.tabHistory[this.currentTabIndex];
    }

    removeTab(tabId, log = false) {
	if (log) {
	    this.consoleLogState('Start remove');
	}
	
	// Find the index of the tab to be removed.
	const removeIndex = this.tabHistory.indexOf(tabId);

	// If the tab doesn't exist in the history, there's nothing to remove.
	if (removeIndex === -1) return;

	// Remove the tab from the history.
	this.tabHistory.splice(removeIndex, 1);

	// If we removed the current tab, we need to adjust the current tab index.
	if (this.currentTabIndex === removeIndex) {
            // If the removed tab was the last in the list, move the current tab index back.
            if (removeIndex === this.tabHistory.length) {
		this.currentTabIndex--;
            }
            // Note: If it wasn't the last tab, the current tab index now naturally points to the next tab due to the splice.
	} else if (removeIndex < this.currentTabIndex) {
            // If we removed a tab before the current one, we need to adjust the index to stay on the current tab.
            this.currentTabIndex--;
	}

	// Check if the removed tab is the last accessed one.
	if (this.lastAccessedTabIndex === removeIndex) {
            // We need to determine a new last accessed tab or nullify if it's not applicable.
            // For simplicity, we could nullify or set it to the current tab if they're different.
            this.lastAccessedTabIndex = this.currentTabIndex;
	}

	// Optional: if there are no more tabs, you could reset the currentTabIndex to a default state (like -1)
	if (this.tabHistory.length === 0) {
            this.currentTabIndex = 0; // No tabs are open.
            this.lastAccessedTabIndex = -1; // No last accessed tab.
	}

	if (log) {
	    this.consoleLogState('End remove');
	}
	
	// Ensure the internal state's consistency after a removal.
	if (!this.checkState()) {
            throw new Error('State became inconsistent after removing a tab.');
	}
    }

    consoleLogState(message) {
	console.log(message + ' - Current tab history: ', this.tabHistory, ' current: ', this.currentTabId(), ' (', this.currentTabIndex, ') lastAccessedTabid: ', this.tabHistory[this.lastAccessedTabIndex], ' (', this.lastAccessedTabIndex, ')');
    }
    
    maintainSize() {
        while (this.tabHistory.length > this.cycleSize) {
            this.tabHistory.shift(); // Remove the oldest tab.
        }
    }

    getHistory() {
        return this.tabHistory;
    }

    getHistorySize() {
	return this.tabHistory.length;
    }

    checkState() {
        // Check if the current tab index is within the valid range
        if (this.currentTabIndex < 0 || this.currentTabIndex > this.tabHistory.length) {
            console.error('Invalid state: currentTabIndex is out of bounds.' + this.currentTabIndex);
            return false;
        }

        // ... any other state validation checks ...

        // If all checks pass, return true indicating a valid state
        return true;
    }    
    
}

module.exports = TabHistoryManager;
