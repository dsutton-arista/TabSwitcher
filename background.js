// background.js

let settings = {
  tabsToCycle: 5,
};

// Map to store the tabs array copy per window
let tabsCopy = {};

// Load settings from storage
chrome.storage.sync.get(['tabsToCycle'], (result) => {
  if (result.tabsToCycle) settings.tabsToCycle = result.tabsToCycle;
});

// Update settings when changed
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.tabsToCycle) {
    settings.tabsToCycle = changes.tabsToCycle.newValue;
  }
});

// Command handlers
chrome.commands.onCommand.addListener((command) => {
  chrome.windows.getLastFocused({ populate: false }, (window) => {
    if (window) {
      const windowId = window.id;
      if (command === 'switch-to-previous-tab') {
        toggleTab(windowId);
      } else {

	  chrome.tabs.query({ windowId: windowId }, (tabs) => {
              let tabsToCycle = settings.tabsToCycle;
              if (command.endsWith('-X2')) {
		  tabsToCycle *= 2;
              }

              // Ensure tabsToCycle does not exceed the number of tabs in the window
              tabsToCycle = Math.min(tabsToCycle, tabs.length);

              if (command.startsWith('cycle-back')) {
		  previousTab(windowId, 1, tabsToCycle);
              } else if (command.startsWith('cycle-forward')) {
		  nextTab(windowId, 1, tabsToCycle);
              }
          });
      }
    }
  });
});

// Function to make a copy of the tabs array for a window
function makeTabsCopy(windowId, tabsToCycle, callback) {
  chrome.tabs.query({ windowId: windowId }, function (tabs) {
    if (tabs.length === 0) {
      delete tabsCopy[windowId];
      if (callback) callback();
      return;
    }

    let tabsDataArray = tabs.map(tab => ({ id: tab.id, lastAccessed: tab.lastAccessed }));
    tabsDataArray.sort((a, b) => b.lastAccessed - a.lastAccessed);
    tabsDataArray = tabsDataArray.slice(0, tabsToCycle);

    // Move the active tab to index 0
    chrome.tabs.query({ windowId: windowId, active: true }, function (activeTabs) {
      const activeTabId = activeTabs[0].id;
      let activeIndex = tabsDataArray.findIndex(tabData => tabData.id === activeTabId);
      if (activeIndex > -1) {
        const [activeTabData] = tabsDataArray.splice(activeIndex, 1);
        tabsDataArray.unshift(activeTabData);
      }

      tabsCopy[windowId] = {
        tabs: tabsDataArray,
        tabsToCycle: tabsToCycle,
      };
      if (callback) callback();
    });
  });
}

// Function to validate tabsCopy and remove any closed tabs
function validateTabsCopy(windowId, tabsToCycle, callback) {
  if (!tabsCopy[windowId] || tabsCopy[windowId].tabsToCycle !== tabsToCycle) {
    makeTabsCopy(windowId, tabsToCycle, callback);
    return;
  }

  chrome.tabs.query({ windowId: windowId }, function (tabs) {
    const openTabIds = new Set(tabs.map(tab => tab.id));
    let tabsData = tabsCopy[windowId];

    // Remove closed tabs
    tabsData.tabs = tabsData.tabs.filter(tabData => openTabIds.has(tabData.id));

    // Add more tabs if needed
    if (tabsData.tabs.length < tabsToCycle) {
      const existingTabIds = new Set(tabsData.tabs.map(tabData => tabData.id));
      const additionalTabs = tabs
        .filter(tab => !existingTabIds.has(tab.id))
        .map(tab => ({ id: tab.id, lastAccessed: tab.lastAccessed }));

      // Combine and sort
      tabsData.tabs = tabsData.tabs.concat(additionalTabs);
      tabsData.tabs.sort((a, b) => b.lastAccessed - a.lastAccessed);
      tabsData.tabs = tabsData.tabs.slice(0, tabsToCycle);
    }

    // Move the active tab to index 0
    chrome.tabs.query({ windowId: windowId, active: true }, function (activeTabs) {
      const activeTabId = activeTabs[0].id;
      let activeIndex = tabsData.tabs.findIndex(tabData => tabData.id === activeTabId);
      if (activeIndex > -1) {
        const [activeTabData] = tabsData.tabs.splice(activeIndex, 1);
        tabsData.tabs.unshift(activeTabData);
      } else {
        // Active tab not in tabsData.tabs; remake tabsCopy
        makeTabsCopy(windowId, tabsToCycle, callback);
        return;
      }
      if (callback) callback();
    });
  });
}

// On tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  const windowId = activeInfo.windowId;
  const activeTabId = activeInfo.tabId;

  const tabsToCycle = tabsCopy[windowId] ? tabsCopy[windowId].tabsToCycle : settings.tabsToCycle;

  validateTabsCopy(windowId, tabsToCycle, () => {
    if (tabsCopy[windowId]) {
      let tabsData = tabsCopy[windowId];
      let activeIndex = tabsData.tabs.findIndex(tabData => tabData.id === activeTabId);
      if (activeIndex > -1) {
        const [activeTabData] = tabsData.tabs.splice(activeIndex, 1);
        tabsData.tabs.unshift(activeTabData);
      } else {
        makeTabsCopy(windowId, tabsToCycle, () => {});
      }
    } else {
      makeTabsCopy(windowId, tabsToCycle, () => {});
    }
  });
});

// Function to cycle to the previous tab
function previousTab(windowId, steps, tabsToCycle) {
  validateTabsCopy(windowId, tabsToCycle, () => {
    if (!tabsCopy[windowId]) {
      return;
    }

    let tabsData = tabsCopy[windowId];

    // Rotate the array to the left
    for (let i = 0; i < steps; i++) {
      const firstTab = tabsData.tabs.shift();
      tabsData.tabs.push(firstTab);
    }

    const targetTabId = tabsData.tabs[0].id;
    chrome.tabs.update(targetTabId, { active: true });
  });
}

// Function to cycle to the next tab
function nextTab(windowId, steps, tabsToCycle) {
  validateTabsCopy(windowId, tabsToCycle, () => {
    if (!tabsCopy[windowId]) {
      return;
    }

    let tabsData = tabsCopy[windowId];

    // Rotate the array to the right
    for (let i = 0; i < steps; i++) {
      const lastTab = tabsData.tabs.pop();
      tabsData.tabs.unshift(lastTab);
    }

    const targetTabId = tabsData.tabs[0].id;
    chrome.tabs.update(targetTabId, { active: true });
  });
}

// Toggle to the last active tab
function toggleTab(windowId) {
  chrome.tabs.query({ windowId: windowId }, function (tabs) {
    tabs.sort((a, b) => b.lastAccessed - a.lastAccessed);

    if (tabs.length < 2) return;

    const previousTabId = tabs[1].id;

    chrome.tabs.update(previousTabId, { active: true });
  });
}
