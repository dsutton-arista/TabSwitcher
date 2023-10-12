const EXTENDED_HISTORY_LIMIT = 100;

function switchTab(tabIdHistory, next = false) {
  if (tabIdHistory.length > 0) {
    let switchToTabId;
    if (next) {
      // for next tab: get the first tab and move it to the end
      switchToTabId = tabIdHistory.shift();
      tabIdHistory.push(switchToTabId);
    } else {
      // for previous tab: Get the last two tabs. The last one is current tab, the one before that is the previous tab.
      let currentTabId = tabIdHistory.pop();
      switchToTabId = tabIdHistory.pop();
      tabIdHistory.unshift(currentTabId, switchToTabId);  // Add them back but switch their positions.
    }
    chrome.tabs.update(switchToTabId, {active: true});
  }
  return tabIdHistory;
}

function switchBetweenCurrentAndLast(tabIdHistory) {
  if (tabIdHistory.length > 1) {
    // Get the second last tab id
    let secondLastTabId = tabIdHistory[tabIdHistory.length - 2];

    // Make the second last tab active
    chrome.tabs.update(secondLastTabId, {active: true});
  }
}

chrome.commands.onCommand.addListener(function(command) {
  chrome.storage.local.get(['tabIdHistory', 'numTabs'], function(data) {
    let tabIdHistory = data.tabIdHistory || [];
    let checksRemaining = tabIdHistory.length;
    let validTabIds = [];

    // Check each tab in the history to see if it still exists
    tabIdHistory.forEach((tabId, i) => {
      chrome.tabs.get(tabId, function(tab) {
        checksRemaining--;
        if (!chrome.runtime.lastError) {
          // This tab still exists, add it to validTabIds
          validTabIds.push(tabId);
        }
        if (checksRemaining === 0) {
          // All checks are done
          if (command === "switch_to_previous_tab") {
            validTabIds = switchTab(validTabIds);
          } else if (command === "switch_to_next_tab") {
            validTabIds = switchTab(validTabIds, true); // true indicates that it should switch to the "next" tab
          } else if (command === "switch_between_current_and_last") {
            switchBetweenCurrentAndLast(validTabIds);
          }
          // Now that the command is executed, update the tabIdHistory in storage
          chrome.storage.local.set({tabIdHistory: validTabIds});
        }
      });
    });
  });
});


chrome.tabs.onActivated.addListener(activeInfo => {
    let newTabId = activeInfo.tabId;

    chrome.storage.local.get(['tabIdHistory', 'extendedTabIdHistory', 'numTabs'], function(data) {
        let tabIdHistory = data.tabIdHistory || [];
        extendedTabIdHistory = data.extendedTabIdHistory || [];
        let numTabs = data.numTabs || 3;

        // Remove newTabId if it's already in the array
        tabIdHistory = tabIdHistory.filter(id => id !== newTabId);

        // Add newTabId to the end of the array
        tabIdHistory.push(newTabId);

        // Ensure tabIdHistory only contains the last numTabs tab IDs
        while (tabIdHistory.length > numTabs) {
            tabIdHistory.shift();
        }

        // Add newTabId to extendedTabIdHistory if not already there
        if (!extendedTabIdHistory.includes(newTabId)) {
            extendedTabIdHistory.push(newTabId);
            while (extendedTabIdHistory.length > EXTENDED_HISTORY_LIMIT) {
                extendedTabIdHistory.shift();
            }
        }

        // Store updated histories back to storage
        chrome.storage.local.set({
            tabIdHistory: tabIdHistory,
            extendedTabIdHistory: extendedTabIdHistory
        });
    });
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    chrome.storage.local.get(['tabIdHistory', 'extendedTabIdHistory'], function(data) {
        let tabIdHistory = data.tabIdHistory || [];
        let extendedTabIdHistory = data.extendedTabIdHistory || [];
        
        let index = tabIdHistory.indexOf(tabId);
        if (index !== -1) {
            tabIdHistory.splice(index, 1); // Remove from primary history
    
            // Add most recent from extended history not already in primary history
            for (let i = extendedTabIdHistory.length - 1; i >= 0; i--) {
                if (!tabIdHistory.includes(extendedTabIdHistory[i])) {
                    tabIdHistory.push(extendedTabIdHistory[i]);
                    break;
                }
            }
            // Store both histories back to storage in one go
            chrome.storage.local.set({
                tabIdHistory: tabIdHistory,
                extendedTabIdHistory: extendedTabIdHistory
            });
        }
    });
});
