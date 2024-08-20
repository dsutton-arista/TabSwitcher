// tabHistoryManager.js

// Enumeration for tab cycling direction
const Direction = Object.freeze({
    NEXT: { value: 1, name: 'Next' },
    PREVIOUS: { value: -1, name: 'Previous' }
});

// Class responsible for managing the tab history and related operations
class TabHistoryManager {
    constructor(cycleSize = 3) {
        // List maintaining the order of accessed tabs
        this.tabHistory = [];

        // Maximum number of tabs to keep in the history
        this.historyLimit = 25;

        // Number of tabs to consider while cycling through tab history
        this.cycleSize = cycleSize;

        // Tab ID of the last active tab
        this.lastActiveId = undefined;

        // Level of log details to output
        this.logLevel = 0;
    }


    /**
     * Restores the state of the tab manager.
     * This function is used for loading the state from a saved object.
     *
     * @param {Object} state - The previously saved state of the tab manager.
     */
    getState() {
        return {
            tabHistory: this.tabHistory,     // The order of tabs as they were accessed
	    historyLimit: this.historyLimit, // Maximum number of entries 'tabHistory' can hold
            cycleSize: this.cycleSize,	     // Cycle size
        };
    }

    /**
     * Captures the current state of the tab manager.
     * This function is used for saving the state and must return a serializable object.
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

    // Update the size of the cycle while maintaining bounds and consistency
    changeCycleSize(newCycleSize) {
        if (newCycleSize > 0) { // Ensuring the cycle size is positive
            this.cycleSize = newCycleSize;
        } else {
            throw new Error('Cycle size must be a positive integer.');
        }
        return this.cycleSize;
    }

    // Update the level of the log while maintaining bounds and consistency
    changeLogLevel(newLogLevel) {
        this.logLevel = newLogLevel;
        return this.logLevel;
    }

    // Update the history size limit while ensuring it's within reasonable bounds
    changeHistorySize(newHistorySize) {
        if (newHistorySize >= 1 && newHistorySize <= 100) { // Bounds check
            this.historyLimit = newHistorySize;
        } else {
            throw new Error('History size must be between 1 and 100.');
        }
        return this.historyLimit;
    }

    currentTabId() {
        return this.tabHistory[this.tabHistory.length - 1];
    }

    currentTabIndex() {
        return this.tabHistory.length - 1;
    }

    tabToActivate(tabId, log = false) {
	if (tabId === null) {
	    return null;
	}

	if (this.tabHistory.length > 0 && this.tabHistory[this.tabHistory.length - 1] === tabId) {
            return tabId;
	}

	if (log && this.logLevel) {
	    console.time("tabToActivate  "+tabId.toString().substr(-3));
	    if (this.logLevel > 1)
		this.consoleLogState('Start Activate ' + tabId.toString().substr(-3));
	}

	if (this.tabHistory.includes(tabId)) {
            // If the tab is already in history, remove its old position.
            this.tabHistory = this.tabHistory.filter(id => id !== tabId);

	    if (this.tabHistory.includes(tabId)) {
		// There is a duplicate of the tab. Not expected
		this.consoleLogState('Duplicate tab found: '+tabId);
		this.tabHistory = this.tabHistory.filter(id => id !== tabId);
	    }
	}

	if (this.tabHistory.length > 0) {
            this.lastActiveId = this.tabHistory[this.tabHistory.length - 1];
	} else {
            this.lastActiveId = undefined;
	}

	// Append the tab to the end, making it the most recently used tab.
	this.tabHistory.push(tabId);
	this.maintainSize();

	if (log && this.logLevel) {
	    if (this.logLevel > 1)
		this.consoleLogState('End   Activate '+ tabId.toString().substr(-3));
	    console.timeEnd("tabToActivate  "+tabId.toString().substr(-3));
	}

	return tabId;
    }

    cycleTab(direction = Direction.NEXT, cycleSize = 3, log = false) {
	if (log || this.logLevel) {
	    console.time("cycleTab");
	    if (this.logLevel > 1)
		this.consoleLogState('Cycle start ' + direction.name.toString().substr(0, 4) + ' ' + cycleSize);
	}

	if (this.tabHistory.length === 0) return undefined;

        this.lastActiveId = this.tabHistory[this.tabHistory.length - 1];
        const effectiveCycleSize = Math.min(cycleSize, this.tabHistory.length);

        if (direction === Direction.NEXT) {
            const cycleStartIndex = this.tabHistory.length - effectiveCycleSize;
            const tabToMove = this.tabHistory.splice(cycleStartIndex, 1)[0];
            this.tabHistory.push(tabToMove);
        } else if (direction === Direction.PREVIOUS) {
            const offset = this.tabHistory.length - effectiveCycleSize;
            const tabToMove = this.tabHistory.pop();
            this.tabHistory.splice(offset, 0, tabToMove);
        } else {
            return undefined;
        }

        if (!this.checkState()) {
            throw new Error('State became inconsistent after cycling tab.');
        }

	if (log || this.logLevel) {
	    if (this.logLevel > 1)
		this.consoleLogState('Cycle end         ');
	    console.timeEnd("cycleTab");
	}

        return this.tabHistory[this.tabHistory.length - 1];
    }

    nextTab() {
        return this.cycleTab(Direction.NEXT, this.cycleSize);
    }

    previousTab() {
        return this.cycleTab(Direction.PREVIOUS, this.cycleSize);
    }

    switchTab() {
	if (this.logLevel) {
	    if (this.logLevel > 1)
		this.consoleLogState('Switch Tab Start');
	}
        let tabToSwitchTo = this.tabHistory.indexOf(this.lastActiveId);
        if (tabToSwitchTo === -1) {
            if (this.tabHistory.length > 0) {
                tabToSwitchTo = this.tabHistory.length - 1;
                this.lastActiveId = this.tabHistory[tabToSwitchTo];
            } else {
		if (this.logLevel) {
		    if (this.logLevel > 1)
			this.consoleLogState('Switch Tab End');
		}
                return undefined;
            }
        }

        const tabId = this.tabToActivate(this.lastActiveId);
	if (this.logLevel) {
	    if (this.logLevel > 1)
		this.consoleLogState('Switch Tab End');
	}
	return tabId;
    }

    removeTab(tabId) {
        const removeIndex = this.tabHistory.indexOf(tabId);
        if (removeIndex === -1) return;

	// Remove the deleted tab
        this.tabHistory.splice(removeIndex, 1);

        // Update lastActiveId to the correct tab
        if (this.tabHistory.length > 1) {
	    // Get the second-to-last tab in history, which should be the "new" last active tab
	    this.lastActiveId = this.tabHistory[this.tabHistory.length - 2];
	    if (this.logLevel > 1)
		this.consoleLogState('Remove Tab     '+ tabId.toString().substr(-3));
        } else {
	    this.lastActiveId = undefined; // Handle edge case where history is empty
        }

    }

    maintainSize() {
        while (this.tabHistory.length > this.historyLimit) {
            this.tabHistory.shift();
        }
    }

    setLogLevel(logLevel) {
        this.logLevel = logLevel;
    }

    consoleLogState(message) {
	this.checkState();
	const length = this.tabHistory.length;

	// Calculate the starting index for slicing the 'tabHistory' to get the last 'cycleSize' elements.
	const startSlice = Math.max(0, length - this.cycleSize);

	// Extract the last 'cycleSize' elements. If there are fewer elements than 'cycleSize', it takes all available.
	const lastElements = this.tabHistory.slice(startSlice);

	// Preparing the output message for the last elements, showing only the last three characters of each tabId.
	const lastElementsOutput = lastElements.length
              ? lastElements.map((id, index) => {
		  // Check if 'id' is valid before converting it to a string.
		  const shortId = id !== undefined ? id.toString().substr(-3) : 'undefined';  // Get the last three characters of the tabId.
		  return `${startSlice + index}:${shortId}`;  // Prepare the display string.
              }).join(' ')
              : 'None';

	// Check if 'currentTabId()' and 'this.lastActiveId' are valid before converting them to strings.
	const currentTabId = this.currentTabId();
	const currentTabString = currentTabId !== undefined ? currentTabId.toString().substr(-3) : 'undefined';
	const lastActiveString = this.lastActiveId !== undefined ? this.lastActiveId.toString().substr(-3) : 'undefined';

	console.log(
            `${message} - current: ...${currentTabString}`,
            `last: ...${lastActiveString}`,
            `history (${length})`,
            length ? `0:${(this.tabHistory[0] !== undefined ? this.tabHistory[0].toString().substr(-3) : 'undefined')} --> ` : '',  // Show the first one if available.
            lastElementsOutput,  // Output for the last 'cycleSize' elements.
            `log: ${this.logLevel}`
	);
    }

    getHistory() {
        return this.tabHistory;
    }

    getHistorySize() {
        return this.tabHistory.length;
    }

    checkState() {
        if (this.tabHistory.length > this.historyLimit) {
            console.error('Tab history exceeds the defined limit.');
            return false;
        }
        if (this.lastActiveId && !this.tabHistory.includes(this.lastActiveId)) {
            console.error('Last active tab ID is not in the tab history.');
            return false;
        }
        return true;
    }
}

// Exporting the class and constants to be available for other modules
// export { TabHistoryManager, Direction };
    
