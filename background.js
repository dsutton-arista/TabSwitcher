let tabIdHistory = [];

function switchTab(next = false) {
  chrome.storage.local.get('tabIdHistory', function(data) {
    let tabIdHistory = data.tabIdHistory || [];
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
      chrome.tabs.update(switchToTabId, {active: true}, function() {
        // save updated tab history only after switching the tab
        chrome.storage.local.set({tabIdHistory: tabIdHistory});
      });
    }
  });
}


chrome.action.onClicked.addListener(function() {
  switchTab();
});

chrome.commands.onCommand.addListener(function(command) {
  if (command === "switch_to_previous_tab") {
    switchTab();
  } else if (command === "switch_to_next_tab") {
    switchTab(true); // true indicates that it should switch to the "next" tab
  } else if (command === "switch_between_current_and_last") {
    switchBetweenCurrentAndLast();
  }
});

function switchBetweenCurrentAndLast() {
  // Get tabIdHistory from storage
  chrome.storage.local.get('tabIdHistory', function(data) {
    let tabIdHistory = data.tabIdHistory || [];
    if (tabIdHistory.length > 1) {
      // Get the second last tab id
      let secondLastTabId = tabIdHistory[tabIdHistory.length - 2];

      // Make the second last tab active
      chrome.tabs.update(secondLastTabId, {active: true});
    }
  });
}

chrome.tabs.onActivated.addListener(activeInfo => {
  let newTabId = activeInfo.tabId;

  chrome.storage.local.get(['tabIdHistory', 'numTabs'], function(data) {
    let tabIdHistory = data.tabIdHistory || [];
    let numTabs = data.numTabs || 3;
    let checksRemaining = tabIdHistory.length;

    // Check each tab in the history to see if it still exists
    for (let i = 0; i < tabIdHistory.length; i++) {
      chrome.tabs.get(tabIdHistory[i], function(tab) {
        if (chrome.runtime.lastError) {
          // This tab no longer exists, remove it from tabIdHistory
          tabIdHistory.splice(i, 1);
        }

        checksRemaining--;
        if (checksRemaining === 0) {
          // All checks are done, add the new tab to the history

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
        }
      });
    }
  });
});
