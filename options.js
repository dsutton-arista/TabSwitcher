window.onload = function() {
  let cycleSizeInput = document.getElementById('cycleSize');
  let logLevelInput = document.getElementById('logLevel');
  let saveButton = document.getElementById('saveButton');

  // Load the current setting from storage
  chrome.storage.local.get('cycleSize', function(data) {
    cycleSizeInput.value = data.cycleSize || 5; // Default value is 5
  });

  // Save the setting when the save button is clicked
    saveButton.onclick = function() {
	let cycleSize = parseInt(cycleSizeInput.value, 10);
	chrome.storage.local.set({cycleSize: cycleSize}, function() {
	    onOptionSet('cycleSize', cycleSize);
	});

	let logLevel = parseInt(logLevelInput.value, 10);
	chrome.storage.local.set({logLevel: logLevel}, function() {
	    onOptionSet('logLevel', logLevel);
	});
        alert('Settings saved successfully.');
    }
}

// In your options.js
function onOptionSet(key, value) {
    // Save it to chrome's storage
    chrome.storage.sync.set({[key]: value}, function() {
        console.log('Value is set to ' + value);
    });
}

// window.onload = function() {
//   let numCycleSize = document.getElementById('cycleSize');
//   let numHistoryLimit = document.getElementById('historyLimit');
//   let numHistoryCount = document.getElementById('historyCount');
//   let saveButton = document.getElementById('saveButton');
//   let clearButton = document.getElementById('clearButton');

//   // Load the current setting from storage
//   chrome.storage.local.get('cycleSize', function(data) {
//     cycleSizeInput.value = data.cycleSize || 3; // Default value is 3
//   });

//   // Save the setting when the save button is clicked
//   saveButton.onclick = function() {
//     let cycleSize = parseInt(cycleSizeInput.value, 10);
//     if (cycleSize >= 1 && cycleSize <= 10) {
//       chrome.storage.local.set({cycleSize: cycleSize}, function() {
//         alert('Settings saved successfully.');
//       });
//     } else {
//       alert('Please enter a number between 1 and 10.');
//     }
//   };

//   // Clear the history when the clear button is clicked
//   clearButton.onclick = function() {
//         chrome.storage.local.set({
//             tabHistory: [],       // Clearing the main tab history
//         }, function() {
//             alert('Tab history cleared!');
//         });    
//   };

// }


// document.addEventListener('DOMContentLoaded', function() {
//     // Load current settings when options page is loaded, if needed.
//     loadCurrentSettings();

//     // Save settings when saveButton is clicked.
//     document.getElementById('saveButton').addEventListener('click', function() {
//         // Logic to save settings...
//     });

//     // Clear tab history when clearButton is clicked.
//     document.getElementById('clearButton').addEventListener('click', function() {
//         chrome.storage.local.set({
//             tabHistory: [],
//         }, function() {
//             alert('Tab history cleared!');
//             updateHistoryCount(); // Update displayed count after clearing
//         });
//     });
// });

// function loadCurrentSettings() {
//     chrome.storage.local.get(['tabHistory'], function(data) {
//         let tabHistory = data.tabHistory || [];

//         // Update the input value with the current setting, if you have any other settings logic...

//         // Update the displayed count
//         updateHistoryCount(tabHistory.length);
//         updateHistoryLimit(historyLimit);
//     });
// }

// function updateHistoryCount(count) {
//     document.getElementById('historyCount').textContent = count || 0;
// }

// function updateHistoryLimit(count) {
//     document.getElementById('historyLimit').textContent = count || 0;
// }

