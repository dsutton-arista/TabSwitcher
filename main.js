// Singleton instance of TabHistoryManager with a predefined history size.
const tabHistoryManager = new TabHistoryManager(5);
let logLevel = 0;

// Utility function to handle retrieval of data from storage.
function getFromStorage(key, callback) {
    try {
        chrome.storage.local.get([key], function(result) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                return;
            }
            callback(result[key]);
        });
    } catch (error) {
        console.error('Error retrieving from storage:', error);
    }
}

// Loading state from storage and initializing TabHistoryManager settings.
function loadState() {
    getFromStorage('logLevel', (loggingLevel) => {
        tabHistoryManager.setLogLevel(loggingLevel);
	logLevel = loggingLevel;
    });

    getFromStorage('cycleSize', (size) => {
        if (size) {
            tabHistoryManager.changeCycleSize(size);
        }
    });
}

// Handling the activation of tabs and maintaining history.
function handleTabActivation(tabId) {
    try {
        tabHistoryManager.tabToActivate(tabId);
    } catch (error) {
        console.error('Error handling tab activation:', error);
    }
}

// Initializing tabs on extension setup.
function initializeTabs() {
    chrome.tabs.query({windowType: 'normal'}, function(tabs) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }

        tabs.forEach(tab => handleTabActivation(tab.id));
    });
}

// Setup when the extension is installed or updated.
chrome.runtime.onInstalled.addListener(function() {
    initializeTabs();
});

chrome.runtime.onStartup.addListener(function() {
    // Load tab history state from storage
    initializeTabs();
});

// Listener for command inputs from the user.
chrome.commands.onCommand.addListener(function(command) {
    if (logLevel > 2)
	console.time(command);

    loadState();  // Ensuring we're working with the latest settings.

    try {
        switch (command) {
            case "switch_to_previous_tab":
                chrome.tabs.update(tabHistoryManager.previousTab(), {active: true});
                break;
            case "switch_to_next_tab":
                chrome.tabs.update(tabHistoryManager.nextTab(), {active: true});
                break;
            case "switch_between_current_and_last":
                chrome.tabs.update(tabHistoryManager.switchTab(), {active: true});
                break;
            // Include default case to handle unknown commands.
            default:
                console.warn('Received unknown command:', command);
        }
    } catch (error) {
        console.error('Error executing command:', command, error);
    }

    if (logLevel > 0)
	console.timeEnd(command);
});

// Monitoring tab activation to maintain the history queue.
chrome.tabs.onActivated.addListener(activeInfo => {
    handleTabActivation(activeInfo.tabId);
});

// Monitoring tab removal to maintain a clean state.
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    try {
        tabHistoryManager.removeTab(tabId);
    } catch (error) {
        console.error('Error handling tab removal:', error);
    }
});

// Initial state load.
loadState();
