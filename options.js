window.onload = function() {
  let numTabsInput = document.getElementById('numTabs');
  let saveButton = document.getElementById('saveButton');

  // Load the current setting from storage
  chrome.storage.local.get('numTabs', function(data) {
    numTabsInput.value = data.numTabs || 3; // Default value is 3
  });

  // Save the setting when the save button is clicked
  saveButton.onclick = function() {
    let numTabs = parseInt(numTabsInput.value, 10);
    chrome.storage.local.set({numTabs: numTabs});
  };
}
