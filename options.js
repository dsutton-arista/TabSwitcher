// options.js

document.addEventListener('DOMContentLoaded', () => {
  const tabsToCycleInput = document.getElementById('tabsToCycle');
  const saveButton = document.getElementById('save');

  // Load current settings
  chrome.storage.sync.get(['tabsToCycle'], (result) => {
    tabsToCycleInput.value = result.tabsToCycle || 5;
  });

  saveButton.addEventListener('click', () => {
    const tabsToCycle = parseInt(tabsToCycleInput.value, 10);

    chrome.storage.sync.set({
      tabsToCycle: tabsToCycle
    }, () => {
      alert('Settings saved.');
    });
  });
});
