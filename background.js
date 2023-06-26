let tabIdHistory = [];

function switchTab(next = false) {
  chrome.storage.local.get('tabIdHistory', function(data) {
    let tabIdHistory = data.tabIdHistory || [];
    if (tabIdHistory.length > 0) {
      let switchToTabId;
      if (next) {
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
  }
});


chrome.tabs.onActivated.addListener(activeInfo => {
  let newTabId = activeInfo.tabId;
  chrome.storage.local.get('tabIdHistory', function(data) {
    tabIdHistory = data.tabIdHistory || [];
    let existingTabs = [];
    let checkTabs = tabIdHistory.map(id => new Promise(resolve =>
      chrome.tabs.get(id, tab => {
        if (!chrome.runtime.lastError) {
          existingTabs.push(id);
        }
        resolve();
      })
    ));

    Promise.all(checkTabs).then(() => {
      existingTabs = existingTabs.filter(id => id !== newTabId);
      existingTabs.push(newTabId);
      while (existingTabs.length > 3) {
        existingTabs.shift();
      }
      chrome.storage.local.set({tabIdHistory: existingTabs});
    });
  });
});
