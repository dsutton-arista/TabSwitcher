// tabHistoryManager.js

const Direction = Object.freeze({
    NEXT: { value: 1, name: 'Next' },
    PREVIOUS: { value: -1, name: 'Previous' }
});


class TabHistoryManager {

    constructor(cycleSize = 3) {
        this.tabHistory = [];
	this.historyLimit = 100;
        this.cycleSize = cycleSize;
	this.lastActiveId = undefined;
	this.logLevel = 0;
    }

    /**
     * Captures the current state of the tab manager.
     * This function is used for saving the state and must return a serializable object.
     */
    getState() {
        return {
            tabHistory: this.tabHistory,           // The order of tabs as they were accessed
            cycleSize: this.cycleSize,                     // Maximum number of entries 'tabHistory' can hold
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
        if (state && state.hasOwnProperty('tabHistory')
            && state.hasOwnProperty('cycleSize') ) {
            this.tabHistory = state.tabHistory;
            this.cycleSize = state.cycleSize;
        } else {
            throw new Error('Invalid state object. The state must contain tabHistory and cycleSize.');
        }
    }
    
    changeCycleSize(newCycleSize) {
	return this.cycleSize = newCycleSize;
    }
    
    changeHistorySize(newHistorySize) {
	return this.historyLimit = newHistorySize;
    }
    
    currentTabId(log = false) {
	if (log || this.logLevel) {
            this.consoleLogState('Current Tab Id');
	}
        return this.tabHistory[this.tabHistory.length - 1];
    }
    
    currentTabIndex() {
        return this.tabHistory.length - 1;
    }

    tabToActivate(tabId, log = false) {
	if (log || this.logLevel) {
	    console.time("tabToActivate");
	    if (this.logLevel > 1)
		this.consoleLogState('Start Activate Tab. Activate: ' + tabId);
	}

	if (this.tabHistory.includes(tabId)) {
            // If the tab is already in history, remove its old position.
            this.tabHistory = this.tabHistory.filter(id => id !== tabId);
	}

	this.lastActiveId = this.tabHistory[this.tabHistory.length - 1];

	// Append the tab to the end, making it the most recently used tab.
	this.tabHistory.push(tabId);

	this.maintainSize()

	if (log || this.logLevel) {
	    if (this.logLevel > 1)
		this.consoleLogState('End Activate Tab');
	    console.timeEnd("tabToActivate");
	}

	return this.tabHistory[this.tabHistory.length - 1];
    }

    cycleTab(direction = Direction.NEXT, cycleSize = 3, log = false) {
	if (log || this.logLevel) {
	    console.time("cycleTab");
	    if (this.logLevel > 1)
		this.consoleLogState('Cycle start ' + direction.name + ' ' + cycleSize);
	}

	// Check for an empty history.
	if (this.tabHistory.length === 0) {
	    if (log || this.logLevel) console.timeEnd("cycleTab");
            return undefined; // No tabs available to cycle.
	}

	this.lastActiveId = this.tabHistory[this.tabHistory.length - 1];
	
	// Adjust cycle size if it's larger than the available history.
	const effectiveCycleSize = Math.min(cycleSize, this.tabHistory.length);
	if (!effectiveCycleSize) {
	    if (log || this.logLevel) console.timeEnd("cycleTab");
	    return this.tabHistory[this.tabHistory.length - 1];
	}

	if (direction === Direction.NEXT) { // Cycling forwards.
	    // This means we take the first tab in the cycle range and move it to the end of the cycle range.

	    // Identify the start of the cycle range.
	    const cycleStartIndex = this.tabHistory.length - effectiveCycleSize;

	    // Remove the first tab in the cycle range.
	    const tabToMove = this.tabHistory.splice(cycleStartIndex, 1)[0];

	    // Add it back to the end of the history, effectively moving it to the end of the cycle range.
	    this.tabHistory.push(tabToMove);
	}
	else if (direction === Direction.PREVIOUS) { // Cycling backwards.
            // Remove the tab from the end of the history and place it just before the effective cycle range.
	    const offset = this.tabHistory.length - effectiveCycleSize;
            const tabToMove = this.tabHistory.pop();
            this.tabHistory.splice(offset, 0, tabToMove);
	}
	else return undefined;

	if (log || this.logLevel) {
	    if (this.logLevel > 1)
		this.consoleLogState('Cycle end');
	    console.timeEnd("cycleTab");
	}

	// Consistency check after cycling.
	if (!this.checkState()) {
            throw new Error('State became inconsistent after cycling tab.');
	}

	// Return the ID of the now-current tab.
	return this.tabHistory[this.tabHistory.length - 1];
    }

    nextTab(log = false) {
	if (log || this.logLevel) {
	    if (this.logLevel > 1)
		this.consoleLogState('Next start');
	}
	return this.cycleTab(Direction.NEXT, this.cycleSize, log);
    }

    previousTab(log = false) {
	if (log || this.logLevel) {
	    if (this.logLevel > 1)
		this.consoleLogState('Previous start');
	}
	return this.cycleTab(Direction.PREVIOUS, this.cycleSize, log);
    }

    switchTab(log = false) {
	if (log || this.logLevel) {
	    if (this.logLevel > 1)
		this.consoleLogState('Start switch');
	}
	// if (this.tabHistory.length > 2)
	//     return this.tabHistory[this.tabHistory.length -  2];
	// else if (this.tabHistory.length == 1)
	//     return this.tabHistory[0];
	// else
	//     return undefined;

	let tabToSwitchTo = this.tabHistory.indexOf(this.lastActiveId);
	if (tabToSwitchTo === -1) {
	    // Last active tab is unknown - if there are tabs assume that last one in the history
	    if (this.tabHistory.length > 0) {
		tabToSwitchTo = this.tabHistory.length -  1;
		this.lastActiveId = this.tabHistory[tabToSwitchTo];
	    }
	    else return undefined;  // Tab not in history.
	}

	return this.tabToActivate(this.lastActiveId, log);
    }

    removeTab(tabId, log = false) {
	if (log || this.logLevel) {
	    if (this.logLevel > 1)
		this.consoleLogState('Start remove');
	}

	const removeIndex = this.tabHistory.indexOf(tabId);
	if (removeIndex === -1) return;  // Tab not in history.

	this.tabHistory.splice(removeIndex, 1);  // Remove the tab.

	if (log || this.logLevel) {
	    if (this.logLevel > 1)
		this.consoleLogState('End remove');
	}
    }

    consoleLogState(message) {
	console.log(message + ' - Current tab history: ', this.tabHistory, ' current: ', this.currentTabId(),
		    'lastActiveId: ', this.lastActiveId);
    }
    
    maintainSize() {
        while (this.tabHistory.length > this.historyLimit) {
            this.tabHistory.shift(); // Remove the oldest tab.
        }
    }

    setLogLevel(logLevel) {
        this.logLevel = logLevel;
    }

    getHistory() {
        return this.tabHistory;
    }

    getHistorySize() {
	return this.tabHistory.length;
    }

    checkState() {
        // If all checks pass, return true indicating a valid state
        return true;
    }    
    
}

// module.exports = TabHistoryManager;
