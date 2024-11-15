# Tab Switcher 
Tab Switcher is a Chrome extension that allows you to switch between your most recently used tabs using keyboard shortcuts.

## Rationale
Chrome does not have built-in functionality that allows you to cycle between the most recently used tabs with keyboard shortcuts.
The native tab switching in Chrome only allows users to move to the next or previous tab in the order they appear in the tab bar (e.g `Ctrl + Tab` and `Ctrl + Shift + Tab` on MacOS).
Chrome also has a shortcut `Alt/Ctrl + [1-9]` to switch to a specific tab by its position in the tab bar (1 for the first tab, 2 for the second, and so on).
This extension provides more advanced tab management by keeping a history of tabs and switching among them in the order they were last accessed.

## Features
Switch to the previous tab using `Alt+P`
Switch to the next tab using `Alt+N`
Toggle between current and last tab using `Alt+S`
The number of tabs in the switching history can be configured by the user (defaults to 5).
If you are looking for a tab and it has fallen out of the history size then you can use Shift to double the size of the search history. i.e. if the configured history size is 5 then using `Alt+Shift+P` will cycle through twice as many as the default size (10 in this case). There is also a command to cycle forward through twice as many as the default size but due to a Chrome limit of a maximum of 4 preloaded shortcuts per extension you will need to set the keyboard shortcut for this yourself  (e.g. as `Alt+Shift+N`).

## Installation
Clone or download this repository to your local machine.
In Chrome, go to the Extensions page (chrome://extensions).
Enable Developer Mode (there should be a switch in the top right corner).
Click on "Load unpacked".
Browse to the directory where you downloaded or cloned this repository, and select it.
The extension should now appear in your list of extensions.

## Configuring Shortcut Keys
The default keys may not be suitable for everyone, so here's how to change them:

Go to the Chrome Extensions page (chrome://extensions).
Scroll down to the bottom and click on "Keyboard shortcuts".
Find "Tab Switcher" in the list and click on the pencil icon next to each action to set a new shortcut key.

## Configuring the Number of Tabs
To configure the number of tabs in the switching history, click on the extension's icon in the browser bar and enter the desired number in the input field. By default, it is set to 5.

We hope you find this extension useful. If you encounter any issues or have any suggestions, please feel free to create an issue in the GitHub repository.

Enjoy your browsing!
