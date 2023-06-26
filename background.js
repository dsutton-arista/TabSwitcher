let tabIdHistory = [];

chrome.action.onClicked.addListener((tab) => {
  // Get tabIdHistory from storage
  chrome.storage.local.get('tabIdHistory', function(data) {
    let tabIdHistory = data.tabIdHistory || [];

    function switchToNextTab() {
      if (tabIdHistory.length > 0) {
        // Get the tab to switch to, which is the oldest in the array
        let switchToTabId = tabIdHistory[0];

        // Remove oldest tab from the start of the array
        tabIdHistory.shift();

        chrome.tabs.get(switchToTabId, function(tab) {
          if (chrome.runtime.lastError) {
            // This tab no longer exists, try the next one
            switchToNextTab();
          } else if (tab) {
            // Push this tab to the end of array, so we can cycle through the tabs
            tabIdHistory.push(switchToTabId);

            // Store updated history back to storage
            chrome.storage.local.set({tabIdHistory: tabIdHistory}, function() {
              chrome.tabs.update(switchToTabId, {active: true});
            });
          }
        });
      }
    }

    switchToNextTab();
  });
});


chrome.tabs.onActivated.addListener(activeInfo => {
  let newTabId = activeInfo.tabId;

  // Get existing history from storage
  chrome.storage.local.get('tabIdHistory', function(data) {
    let tabIdHistory = data.tabIdHistory || [];
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

          // Ensure tabIdHistory only contains the last three tab IDs
          while (tabIdHistory.length > 3) {
            tabIdHistory.shift();
          }

          // Store updated history back to storage
          chrome.storage.local.set({tabIdHistory: tabIdHistory});
        }
      });
    }
  });
});
