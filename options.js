document.addEventListener('DOMContentLoaded', function() {
    let historyLimitInput = document.getElementById('historyLimit'); // Added this line
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
        getFromStorage('historyLimit', function(value) { // Added this block
            historyLimitInput.value = value || 50; // Default value is 50
        });

        getFromStorage('cycleSize', function(value) {
            cycleSizeInput.value = value || 5; // Default value is 5
        });

        getFromStorage('logLevel', function(value) {
            logLevelInput.value = value || 0; // Default value is 0
        });

        // Update history count if available
        getFromStorage('tabHistory', function(history) {
            historyCountSpan.textContent = (history && history.length) || 0;
        });
    }

    // Initialize by loading settings
    loadSettings();

    // Save settings and provide user feedback
    saveButton.addEventListener('click', function() {
	let historyLimit = parseInt(historyLimitInput.value, 10) || 50;
	let cycleSize = parseInt(cycleSizeInput.value, 10) || 5;
	let logLevel = parseInt(logLevelInput.value, 10) || 0;

	saveToStorage({ historyLimit: historyLimit, cycleSize: cycleSize, logLevel: logLevel }, function() {
            // Notify the background script of the new cycleSize
            chrome.runtime.sendMessage({ action: 'updateCycleSize', cycleSize: cycleSize }, function(response) {
		if (!(response && response.success)) {
                    alert('Failed to update cycle size.');
		}
            });
            // Notify the background script of the new loglevel
            chrome.runtime.sendMessage({ action: 'updateLogLevel', logLevel: logLevel }, function(response) {
		if (!(response && response.success)) {
                    alert('Failed to update log level.');
		}
            });
            // Notify the background script of the new history size
            chrome.runtime.sendMessage({ action: 'updateHistorySize', historyLimit: historyLimit }, function(response) {
		if (response && response.success) {
                // After updating the history size, reload the history count
                    getFromStorage('tabHistory', function(history) {
			historyCountSpan.textContent = (history && history.length) || 0;
                    });
		} else {
                    alert('Failed to update history limit.');
		}
            });
	    loadSettings();
            alert('Settings saved successfully.');
	});
    });


    // Clear history and update display
    clearButton.addEventListener('click', function() {
	chrome.runtime.sendMessage({ action: 'clearHistory' }, function(response) {
            if (response && response.success) {
		historyCountSpan.textContent = '0';
		alert(response.message);
            } else {
		alert('Failed to clear history.');
            }
	});
    });

});
