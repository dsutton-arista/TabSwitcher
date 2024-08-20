// Singleton instance of TabHistoryManager with a predefined history size.
const tabHistoryManager = new TabHistoryManager(5);
let logLevel = 0;

// Utility function to handle retrieval of data from storage.
function getFromStorage(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                resolve(undefined);
            } else {
                resolve(result[key]);
            }
        });
    });
}

// Loading state from storage and initializing TabHistoryManager settings.
async function loadState() {
    const loggingLevel = await getFromStorage('logLevel');
    tabHistoryManager.setLogLevel(loggingLevel || 0);
    logLevel = loggingLevel || 0;

    const cycleSize = await getFromStorage('cycleSize');
    if (cycleSize) {
        tabHistoryManager.changeCycleSize(cycleSize);
    }

    const historyLimit = await getFromStorage('historyLimit');
    if (historyLimit) {
        tabHistoryManager.changeHistorySize(historyLimit);
    }
}

function saveTabHistory() {
    chrome.storage.local.set({ tabHistory: tabHistoryManager.getHistory() });
}

// Handling the activation of tabs and maintaining history.
function handleTabActivation(tabId, log = true) {

    try {
        tabHistoryManager.tabToActivate(tabId, log);
        tabHistoryManager.maintainSize(); // Enforce the history limit
        saveTabHistory();  // Save the updated history
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

        tabs.forEach(tab => handleTabActivation(tab.id, false));
    });
    console.log("Plugin Initialized and Ready");
}

// Extension initialization.
async function initializeExtension() {
    await loadState();
    initializeTabs();

    // Set the current displayed tab as the active one
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
	if (tabs.length > 0) {
            let currentTabId = tabs[0].id;
            tabHistoryManager.tabToActivate(currentTabId);
            saveTabHistory();  // Save the updated history
	} else {
            console.log("No active tab found.");
	}
    });


    chrome.commands.onCommand.addListener((command) => {
        if (logLevel > 1) console.time(command);

        try {
            switch (command) {
                case "switch_to_previous_tab":
                    chrome.tabs.update(tabHistoryManager.previousTab(), { active: true });
                    break;
                case "switch_to_next_tab":
                    chrome.tabs.update(tabHistoryManager.nextTab(), { active: true });
                    break;
                case "switch_between_current_and_last":
                    chrome.tabs.update(tabHistoryManager.switchTab(), { active: true });
                    break;
                default:
                    console.warn('Received unknown command:', command);
            }
        } catch (error) {
            console.error('Error executing command:', command, error);
        }

        if (logLevel > 1) console.timeEnd(command);
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
        handleTabActivation(activeInfo.tabId);
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
        try {
            tabHistoryManager.removeTab(tabId);
            tabHistoryManager.maintainSize(); // Enforce the history limit
            saveTabHistory();  // Save the updated history
        } catch (error) {
            console.error('Error handling tab removal:', error);
        }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'updateCycleSize') {
            try {
		tabHistoryManager.changeCycleSize(message.cycleSize);
		sendResponse({ success: true, message: 'Cycle size updated successfully.' });
            } catch (error) {
		console.error('Error updating cycle size:', error);
		sendResponse({ success: false, message: 'Failed to update cycle size.' });
            }

            return true; // Indicate that the response will be sent asynchronously
	}

	if (message.action === 'updateLogLevel') {
            try {
		tabHistoryManager.changeLogLevel(message.logLevel);
		logLevel = message.logLevel;
		sendResponse({ success: true, message: 'Log level updated successfully.' });
            } catch (error) {
		console.error('Error updating log level:', error);
		sendResponse({ success: false, message: 'Failed to update log level.' });
            }

            return true; // Indicate that the response will be sent asynchronously
	}

	if (message.action === 'updateHistorySize') {
            try {
		tabHistoryManager.changeHistorySize(message.historyLimit);
		saveTabHistory();  // Save the updated history
		sendResponse({ success: true, message: 'History size updated successfully.' });
            } catch (error) {
		console.error('Error updating History size:', error);
		sendResponse({ success: false, message: 'Failed to update history size.' });
            }

            return true; // Indicate that the response will be sent asynchronously
	}

	if (message.action === 'clearHistory') {
            // Clear the history in memory
            tabHistoryManager.setState({ tabHistory: [], cycleSize: tabHistoryManager.cycleSize });

            // Clear the history in storage
            chrome.storage.local.set({ tabHistory: [] }, () => {
		sendResponse({ success: true, message: 'History cleared successfully.' });
            });

            // Indicate that the response will be sent asynchronously
            return true;
	}
    });

}

// Initial state load and extension setup.
initializeExtension();
