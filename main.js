//import TabHistoryManager from './tabHistoryManager.js'; // for default import

// Initialize the Tab History Manager
const tabHistoryManager = new TabHistoryManager(5);

// Listener for command inputs like switching tabs
chrome.commands.onCommand.addListener(function(command) {
    console.time(command);	
    loadState();
    switch (command) {
    case "switch_to_previous_tab":
        chrome.tabs.update(tabHistoryManager.previousTab(), {active: true});
        break;
    case "switch_to_next_tab":
        chrome.tabs.update(tabHistoryManager.nextTab(), {active: true});
        break;
    case "switch_between_current_and_last":
        chrome.tabs.update(tabHistoryManager.switchTab(), {active: true});
    }
    console.timeEnd(command);
});

// Listener for when a tab is activated (selected)
chrome.tabs.onActivated.addListener(activeInfo => {
    tabHistoryManager.tabToActivate(activeInfo.tabId); // This method should internally handle adding the tab to history and other required logic.
});

// Listener for when a tab is closed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    tabHistoryManager.removeTab(tabId); // This method should internally handle removing the tab from history and other required logic.
});

// Similarly, you would need a function to load the state when the extension starts up.
function loadState() {
    // Load the current settings from storage
    chrome.storage.local.get(['logging'], function(data) {
	tabHistoryManager.setLogLevel(data.logging);
    });

    // Load the current settings from storage
    chrome.storage.local.get(['cycleSize'], function(data) {
        // console.log('data.cycleSize value currently is ' + data.cycleSize);
	tabHistoryManager.changeCycleSize(data.cycleSize);
    });
}

// This function fetches all the tabs, iterates over them, and performs an action.
function initializeTabs() {
  // Query for obtaining all the normal browser window tabs
  chrome.tabs.query({windowType: 'normal'}, function(tabs) {
    for (let tab of tabs) {
	// Performing the action on each tab
        // console.log('activating tab ' + tab.id);
	tabHistoryManager.tabToActivate(tab.id);
    }
  });
}

// Event to handle when the extension is installed or updated, or Chrome is updated.
// In Manifest V3, the 'onInstalled' event is used instead of 'onStartup' for initial setup after installation or update.
chrome.runtime.onInstalled.addListener(function() {
  initializeTabs();
});

// Call loadState at startup to initialize the manager's state.
loadState();

