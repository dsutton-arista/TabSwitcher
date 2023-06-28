let tabIdHistory = [];

function switchTab(tabIdHistory, next = false) {
  if (tabIdHistory.length > 0) {
    let switchToTabId;
    if (next === false) {
      // Get the last tab, move it to the start, and then do it again
      switchToTabId = tabIdHistory.pop();
      tabIdHistory.unshift(switchToTabId);
      switchToTabId = tabIdHistory.pop();
      tabIdHistory.unshift(switchToTabId);
    } else {
      // get the first tab and move it to the end
      switchToTabId = tabIdHistory.shift();
      tabIdHistory.push(switchToTabId);
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

  chrome.storage.local.get(['tabIdHistory', 'numTabs'], function(data) {
    let tabIdHistory = data.tabIdHistory || [];
    let numTabs = data.numTabs || 3;

    // Remove newTabId if it's already in the array
    tabIdHistory = tabIdHistory.filter(id => id !== newTabId);

    // Add newTabId to the end of the array
    tabIdHistory.push(newTabId);

    // Ensure tabIdHistory only contains the last numTabs tab IDs
    while (tabIdHistory.length > numTabs) {
      tabIdHistory.shift();
    }

    // Store updated history back to storage
    chrome.storage.local.set({tabIdHistory: tabIdHistory});
  });
});
