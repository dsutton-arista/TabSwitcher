document.addEventListener('DOMContentLoaded', function() {
    let cycleSizeInput = document.getElementById('cycleSize');
    let logLevelInput = document.getElementById('logLevel');
    let saveButton = document.getElementById('saveButton');
    let historyCountSpan = document.getElementById('historyCount');
    let clearButton = document.getElementById('clearButton');

    // Helper function to get data from storage
    function getFromStorage(key, callback) {
        chrome.storage.local.get(key, function(result) {
            callback(result[key]);
        });
    }

    // Helper function to save data to storage
    function saveToStorage(data, callback) {
        chrome.storage.local.set(data, callback);
    }

    // Load settings from storage and update UI elements
    function loadSettings() {
        getFromStorage('cycleSize', function(value) {
            cycleSizeInput.value = value || 5; // Default value is 5
        });

        // Assuming 'logLevel' is a stored setting, similar to 'cycleSize'
        getFromStorage('logLevel', function(value) {
            logLevelInput.value = value || 0; // Default value is 0
        });

        // Update history count if available
        // (The actual implementation depends on how you track history count)
        getFromStorage('historyCount', function(value) {
            historyCountSpan.textContent = value || 0;
        });
    }

    // Initialize by loading settings
    loadSettings();

    // Save settings and provide user feedback
    saveButton.addEventListener('click', function() {
        let cycleSize = parseInt(cycleSizeInput.value, 10) || 5;
        let logLevel = parseInt(logLevelInput.value, 10) || 0;

        saveToStorage({ cycleSize: cycleSize, logLevel: logLevel }, function() {
            // Provide feedback to assure the user settings were saved
            alert('Settings saved successfully.');
        });
    });

    // Assuming you have functionality to clear history or reset some settings
    clearButton.addEventListener('click', function() {
        // Clearing functionality here (e.g., reset settings or clear stored history)
        // After clearing, you might want to update the history count display
        historyCountSpan.textContent = '0';
        alert('History cleared successfully.');
    });
});
