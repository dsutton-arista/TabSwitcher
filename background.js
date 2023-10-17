// If TabHistoryManager is in a different file, you might need to import it here. This depends on how your project is structured.
// const TabHistoryManager = require('./TabHistoryManager'); // CommonJS import
// import TabHistoryManager from './TabHistoryManager'; // ES6 import

// Initialize the Tab History Manager
const tabHistoryManager = new TabHistoryManager();

// Listener for command inputs like switching tabs
chrome.commands.onCommand.addListener(function(command) {
    switch (command) {
        case "switch_to_previous_tab":
        chrome.tabs.update(tabHistoryManager.previousTab(true), {active: true});
	// This method should handle the logic of switching to the previous tab.
        break;
        case "switch_to_next_tab":
        chrome.tabs.update(tabHistoryManager.nextTab(true), {active: true});
        break;
        case "switch_between_current_and_last":
        chrome.tabs.update(tabHistoryManager.switchTab(true), {active: true});
    }
});

// Listener for when a tab is activated (selected)
chrome.tabs.onActivated.addListener(activeInfo => {
    tabHistoryManager.activateTab(activeInfo.tabId, true); // This method should internally handle adding the tab to history and other required logic.
});

// Listener for when a tab is closed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    tabHistoryManager.removeTab(tabId, true); // This method should internally handle removing the tab from history and other required logic.
});

// Assuming we need to keep track of the tab history across browser sessions, we might need to save the state.
// You should call this function whenever the internal state of your tabHistoryManager changes.
function saveState() {
    // Convert the manager's state to a storable format (like JSON)
    const stateToSave = tabHistoryManager.getState();

    chrome.storage.local.set({tabHistoryManagerState: stateToSave}, function() {
        if (chrome.runtime.lastError) {
            console.error('Error saving state:', chrome.runtime.lastError.message);
        } else {
            console.log('State saved');
        }
    });
}

// Similarly, you would need a function to load the state when the extension starts up.
function loadState() {
    chrome.storage.local.get('tabHistoryManagerState', function(data) {
        if (chrome.runtime.lastError) {
            console.error('Error loading state:', chrome.runtime.lastError.message);
            return;
        }
        
        if (data.tabHistoryManagerState) {
            tabHistoryManager.setState(data.tabHistoryManagerState);
            console.log('State loaded');
        } else {
            console.log('No saved state found');
        }
    });
}

// Call loadState at startup to initialize the manager's state.
loadState();

