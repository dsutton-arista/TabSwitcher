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
        this.historyLimit = 100;

        // Number of tabs to consider while cycling through tab history
        this.cycleSize = cycleSize;

        // Tab ID of the last active tab
        this.lastActiveId = undefined;

        // Level of log details to output
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

    // Update the size of the cycle while maintaining bounds and consistency
    changeCycleSize(newCycleSize) {
        if (newCycleSize > 0) { // Ensuring the cycle size is positive
            this.cycleSize = newCycleSize;
        } else {
            throw new Error('Cycle size must be a positive integer.');
        }
        return this.cycleSize;
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

    currentTabId(log = false) {
        return this.tabHistory[this.tabHistory.length - 1];
    }
    
    currentTabIndex() {
        return this.tabHistory.length - 1;
    }

    tabToActivate(tabId, log = false) {
	if (log || this.logLevel) {
	    console.time("tabToActivate"+tabId);
	    if (this.logLevel > 1)
		this.consoleLogState('Start Activate Tab. Activate: ' + tabId);
	}

	if (this.tabHistory[this.tabHistory.length-1] === tabId) return tabId;

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
	    console.timeEnd("tabToActivate"+tabId);
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
		this.consoleLogState('Start switch. logLevel:' + this.logLevel);
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
		  return `[${startSlice + index}]: ...${shortId}`;  // Prepare the display string.
              }).join(' ')
              : 'None';

	// Check if 'currentTabId()' and 'this.lastActiveId' are valid before converting them to strings.
	const currentTabId = this.currentTabId();
	const currentTabString = currentTabId !== undefined ? currentTabId.toString().substr(-3) : 'undefined';
	const lastActiveString = this.lastActiveId !== undefined ? this.lastActiveId.toString().substr(-3) : 'undefined';

	console.log(
            `${message} - Current tab history (${length})`,
            length ? `[0]: ...${(this.tabHistory[0] !== undefined ? this.tabHistory[0].toString().substr(-3) : 'undefined')} ... ` : '',  // Show the first one if available.
            lastElementsOutput,  // Output for the last 'cycleSize' elements.
            `current: ...${currentTabString}`,
            `lastActiveId: ...${lastActiveString}`,
            `logLevel: ${this.logLevel}`
	);
    }

    // Ensures the tab history does not exceed the maximum allowed size
    maintainSize() {
        // Remove excess items from the beginning of the history if it exceeds the limit
        while (this.tabHistory.length > this.historyLimit) {
            this.tabHistory.shift(); // This removes the oldest element (first in array)
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

    // A method to validate the current state of the tab manager
    // This method can be enhanced based on the specific constraints and requirements of the tab manager
    checkState() {
        // Checks ensuring the consistency of the tab history
        if (this.tabHistory.length > this.historyLimit) {
            console.error('Tab history exceeds the defined limit.');
            return false;
        }
        
        // Check for the validity of the last active ID
        if (this.lastActiveId && !this.tabHistory.includes(this.lastActiveId)) {
            console.error('Last active tab ID is not in the tab history.');
            return false;
        }
        
        // ... Additional consistency and sanity checks can be added here ...

        return true; // All checks have passed, state is consistent
    }
}

// Exporting the class and constants to be available for other modules
// export { TabHistoryManager, Direction };
    
