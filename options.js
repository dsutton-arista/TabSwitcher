window.onload = function() {
  let numTabsInput = document.getElementById('numTabs');
  let saveButton = document.getElementById('saveButton');
  let clearButton = document.getElementById('clearButton');

  // Load the current setting from storage
  chrome.storage.local.get('numTabs', function(data) {
    numTabsInput.value = data.numTabs || 3; // Default value is 3
  });

  // Save the setting when the save button is clicked
  saveButton.onclick = function() {
    let numTabs = parseInt(numTabsInput.value, 10);
    if (numTabs >= 1 && numTabs <= 10) {
      chrome.storage.local.set({numTabs: numTabs}, function() {
        alert('Settings saved successfully.');
      });
    } else {
      alert('Please enter a number between 1 and 10.');
    }
  };

  // Clear the history when the clear button is clicked
  clearButton.onclick = function() {
        chrome.storage.local.set({
            tabHistory: [],       // Clearing the main tab history
        }, function() {
            alert('Tab history cleared!');
        });    
  };

}


document.addEventListener('DOMContentLoaded', function() {
    // Load current settings when options page is loaded, if needed.
    loadCurrentSettings();

    // Save settings when saveButton is clicked.
    document.getElementById('saveButton').addEventListener('click', function() {
        // Logic to save settings...
    });

    // Clear tab history when clearButton is clicked.
    document.getElementById('clearButton').addEventListener('click', function() {
        chrome.storage.local.set({
            tabHistory: [],
            extendedTabIdHistory: []
        }, function() {
            alert('Tab history cleared!');
            updateHistoryCount(); // Update displayed count after clearing
        });
    });
});

function loadCurrentSettings() {
    chrome.storage.local.get(['tabHistory'], function(data) {
        let tabHistory = data.tabHistory || [];

        // Update the input value with the current setting, if you have any other settings logic...

        // Update the displayed count
        updateHistoryCount(tabHistory.length);
    });
}

function updateHistoryCount(count) {
    document.getElementById('historyCount').textContent = count || 0;
}
