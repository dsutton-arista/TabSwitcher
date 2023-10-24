// tabHistoryManager.test.js
const TabHistoryManager = require('./../tabHistoryManagerTestable');

describe('TabHistoryManager', () => {
    let manager;

    beforeEach(() => {
        manager = new TabHistoryManager(3);
    });

    test('should add new tabs to history', () => {
        manager.tabToActivate('A');
        expect(manager.getHistory()).toEqual(['A']);
        
        manager.tabToActivate('B');
        expect(manager.getHistory()).toEqual(['A', 'B']);
    });

    test('should maintain history size', () => {
	manager.changeHistorySize(3);
        manager.tabToActivate('A');
        manager.tabToActivate('B');
        manager.tabToActivate('C');
        manager.tabToActivate('D');
        expect(manager.getHistory()).toEqual(['B', 'C', 'D']); // Oldest (A) is removed.
    });

    test('should cycle through tabs', () => {
        manager.tabToActivate(1);
        manager.tabToActivate(2);
        manager.tabToActivate(3);
        expect(manager.nextTab()).toBe(1);
        expect(manager.previousTab()).toBe(3);
    });

    test('add a new tab after cycling through the tabs', () => {
	manager.changeHistorySize(3);
        manager.tabToActivate('A');
        manager.tabToActivate('B');
        manager.tabToActivate('C'); // 'A B C'
	// manager.consoleLogState('A B C');
        expect(manager.nextTab()).toBe('A'); // 'B C A'
	// manager.consoleLogState('B C A');
        expect(manager.previousTab()).toBe('C'); // 'B A C'
	// manager.consoleLogState('A B C');
        manager.tabToActivate('D'); // 'A C D'
	// manager.consoleLogState('B C D');
        expect(manager.nextTab()).toBe('B'); // 'C D A'
	// manager.consoleLogState('C D B');
        expect(manager.previousTab()).toBe('D');
    });

    test('surprising behaviour of switch', () => {
	manager.changeHistorySize(5);
	manager.changeCycleSize(4);
        manager.tabToActivate('A');
        manager.tabToActivate('B');
        manager.tabToActivate('C');
        manager.tabToActivate('D');
        expect(manager.nextTab()).toBe('A');
	manager.tabToActivate('A'); // This simulates the event being called in the browser
        expect(manager.nextTab()).toBe('B');
	manager.tabToActivate('B'); // This simulates the event being called in the browser
        expect(manager.nextTab()).toBe('C');
	manager.tabToActivate('C'); // This simulates the event being called in the browser
        expect(manager.nextTab()).toBe('D');
	manager.tabToActivate('D'); // This simulates the event being called in the browser
        expect(manager.previousTab()).toBe('C');
	manager.tabToActivate('C'); // This simulates the event being called in the browser
        expect(manager.previousTab()).toBe('B');
	manager.tabToActivate('B'); // This simulates the event being called in the browser
        expect(manager.previousTab()).toBe('A');
	manager.tabToActivate('A'); // This simulates the event being called in the browser
        expect(manager.previousTab()).toBe('D');
	manager.tabToActivate('D'); // This simulates the event being called in the browser
//	manager.setLogLevel(2);
        expect(manager.switchTab()).toBe('A');
	manager.tabToActivate('A'); // This simulates the event being called in the browser
    });

    test('add a new tab after cycling through the tabs', () => {
	manager.changeHistorySize(3);
        manager.tabToActivate('A');
        manager.tabToActivate('B');
        manager.tabToActivate('C');
	// manager.consoleLogState('A B C');
        expect(manager.nextTab()).toBe('A');
	// manager.consoleLogState('B C A');
        expect(manager.previousTab()).toBe('C');
	// manager.consoleLogState('A B C');
        expect(manager.previousTab()).toBe('B');
	// manager.consoleLogState('C A B');
        expect(manager.nextTab()).toBe('C');
	// manager.consoleLogState('A B C');
        expect(manager.nextTab()).toBe('A');
	// manager.consoleLogState('B C A');
        expect(manager.nextTab()).toBe('B');
	// manager.consoleLogState('C A B');
    });

    test('navigate with empty history', () => {
	expect(manager.nextTab()).toBeUndefined();
	expect(manager.previousTab()).toBeUndefined();
    });

    test('activate the same tab multiple times', () => {
	manager.changeHistorySize(3);
	manager.tabToActivate('A');
	manager.tabToActivate('A');
	expect(manager.nextTab()).toBe('A');
	expect(manager.previousTab()).toBe('A');
    });

    test('maintain history size limit', () => {
	manager.changeHistorySize(3);
	for (let i = 1; i <= 15; i++) { 
            manager.tabToActivate(i);
	}
	expect(manager.getHistorySize()).toBe(3);
    });

    test('boundary navigation', () => {
	['A', 'B', 'C'].forEach(id => manager.tabToActivate(id));
	expect(manager.nextTab()).toBe('A'); // assuming loop back to the start
	expect(manager.previousTab()).toBe('C'); // assuming loop back to the end
    });

    test('handle unexpected input', () => {
	expect(() => manager.tabToActivate(null)).not.toThrow();
	expect(() => manager.tabToActivate(undefined)).not.toThrow();
	expect(() => manager.tabToActivate('randomString')).not.toThrow();
	// If you have specific behavior defined for these cases, check for those instead of just 'not.toThrow()'
    });

    test('sequential tab activation and navigation', () => {
	manager.changeCycleSize(4); // Assuming you can change limit on-the-fly.
	const sequence = ['A', 'B', 'C', 'D']; // Using letters for clarity.
	
	sequence.forEach(tab => manager.tabToActivate(tab));
	manager.tabToActivate('A');
//	manager.consoleLogState("sequential tab activation and navigation: start");
	sequence.forEach((tab, index) => {
            const nextIndex = (index + 1) % sequence.length;
            const expectedNextTab = sequence[nextIndex]; // This is the tab ID we expect nextTab() to return.
	    manager.tabToActivate(sequence[index]);
//	    manager.consoleLogState("sequential tab activation and navigation: index: " + index + ' expectedNextTab: ' + expectedNextTab);
            expect(manager.nextTab()).toBe(expectedNextTab); // Compare directly with the expected tab ID.
	});
    });

    test('tab removal from history', () => {
        ['A', 'B', 'C', 'D'].forEach(id => manager.tabToActivate(id));
        manager.removeTab('B'); // This should remove 'B' from the history.
        expect(manager.getHistory()).not.toContain('B'); // 'B' should no longer be in the history.
    });
    
    test('should handle rapid sequential activations', () => {
	for (let i = 0; i < 1000; i++) {
            manager.tabToActivate(i);
	}
	// Check the state remains consistent and no errors occur.
	expect(manager.checkState()).toBeTruthy();
    });

    test('should maintain consistent state', () => {
	// Perform a series of operations
	manager.tabToActivate('A');
	manager.nextTab();
	manager.previousTab();
	manager.tabToActivate('B');

	// Check that the state is still consistent
	expect(manager.checkState()).toBeTruthy();
    });

    test('should handle all tabs being removed', () => {
	[1, 2, 3].forEach(id => manager.tabToActivate(id));
	[1, 2, 3].forEach(id => manager.removeTab(id)); // Assuming removeTab exists

	// Expecting either specific behavior or simply no errors
	expect(manager.nextTab()).toBeUndefined();
	expect(manager.previousTab()).toBeUndefined();
    });

    test('should handle direct history manipulation', () => {
	// This depends on whether you allow direct manipulation of history or not
	manager.tabHistory = [4, 5, 6];  // Directly setting a state, which is usually not recommended

	expect(manager.nextTab()).toBe(4);
	expect(manager.previousTab()).toBe(6);
	expect(manager.checkState()).toBeTruthy();
    });

    test('certain methods should be idempotent', () => {
	manager.tabToActivate(1);
	const historyAfterFirstActivation = [...manager.getHistory()];
	// manager.consoleLogState("historyafterfirstactivation");

	manager.tabToActivate(1);
	const historyAfterSecondActivation = [...manager.getHistory()];
	// manager.consoleLogState("historyaftersecondactivation");

	expect(historyAfterFirstActivation).toEqual(historyAfterSecondActivation);
    });

    test('should toggle between the current and last accessed tabs', () => {
        // Setup initial tabs
        ['A', 'B', 'C'].forEach(id => manager.tabToActivate(id));
        
        // Check if the state remains consistent
        expect(manager.checkState()).toBeTruthy();

        // The current tab should be 'C'; the last accessed tab should be 'B'.
	// manager.consoleLogState("A B C");
        expect(manager.currentTabId()).toBe('C');  // Checks the current tab is as expected
        expect(manager.switchTab()).toBe('B');  // Switches to the last accessed tab (2)
	// manager.consoleLogState("C A B");
        expect(manager.switchTab()).toBe('C');  // Switches back to what was the current tab (3)
	// manager.consoleLogState("A B C");
        expect(manager.switchTab()).toBe('B');  // Switches to the last accessed tab (2)
	// manager.consoleLogState("C A B");
	// manager.consoleLogState("C A B");
        expect(manager.switchTab()).toBe('C');  // Switches back to what was the current tab (3)
    });

    test('should handle toggle with insufficient history', () => {
        manager.tabToActivate('A');
        // There's only one tab in the history, so it shouldn't really switch.
        expect(manager.switchTab()).toBe('A');
    });

    test('consistent state after toggling tabs', () => {
        // This is especially important to ensure that repeated switches do not corrupt the state.
        [1, 2, 3, 4].forEach(id => manager.tabToActivate(id));

        // Toggle back and forth
        manager.switchTab();  // From 4 to 3
        manager.switchTab();  // From 3 back to 4
        manager.switchTab();  // From 4 to 3 again

        // Check if the state remains consistent
        expect(manager.checkState()).toBeTruthy();
    });

    test('interaction between switchTab and tabToActivate', () => {
	// Setup initial tabs
	['A', 'B', 'C'].forEach(id => manager.tabToActivate(id));

	// Switch between the current and last accessed tabs
	expect(manager.switchTab()).toBe('B'); // Current should now be B
	// manager.consoleLogState("C A B");
	// Activate a new tab
	manager.tabToActivate('D');  // Current should now be 4
	// manager.consoleLogState("C A B D");

	// The previous tab ('B') should now be the last accessed, so switching should bring it forward
	expect(manager.switchTab()).toBe('B');
    });

    test('interaction between switchTab and removeTab', () => {
	// Setup initial tabs
	manager.changeCycleSize(4);
	['A', 'B', 'C', 'D'].forEach(id => manager.tabToActivate(id));

	// Remove the current tab; the new current should be the last accessed.
	manager.removeTab('D');  // Remove tab 4, current should be 3 now
	expect(manager.currentTabId()).toBe('C');

	// Now remove tab C; the new current should be B (going back in history).
	manager.removeTab('C');
	expect(manager.currentTabId()).toBe('B');

	// Now remove tab B; the new current should be A (going back in history).
	manager.removeTab('B');
	expect(manager.currentTabId()).toBe('A');

	// Attempt to switch tabs - but we've removed recent tabs so behavour is to stay put
	expect(manager.switchTab()).toBe('A');
    });

    test('interaction between switchTab, next, and previous', () => {
	// Setup initial tabs
	manager.changeCycleSize(4);
	['A', 'B', 'C', 'D'].forEach(id => manager.tabToActivate(id));

	expect(manager.currentTabId()).toBe('D');
	// Navigate using previousTab (should go to C)
	manager.previousTab();
	expect(manager.currentTabId()).toBe('C');

	// Switch tabs (should go to D as it was the last accessed)
	// manager.consoleLogState("1 interaction between switchTab, next and previous");
	manager.switchTab();
	expect(manager.currentTabId()).toBe('D');

	// Use 'next', which should wrap back to the start
	manager.nextTab();
	expect(manager.currentTabId()).toBe('A');

	// manager.consoleLogState("2 interaction between switchTab, next and previous");
	// Use 'previousTab', should go back to 4 maintaining the history integrity
	manager.previousTab();
	expect(manager.currentTabId()).toBe('D');
    });

    test('switchTab behavior with minimal history', () => {
	// Trying to switch with no tabs shouldn't alter the state and possibly return 'undefined'
	expect(manager.switchTab()).toBeUndefined();

	// Add a single tab and test behavior
	manager.tabToActivate('A');

	// Trying to switch with one tab shouldn't change the current tab
	expect(manager.switchTab()).toBe('A');
    });

    test('increasing cycle size retains existing history', () => {
	// Setup initial tabs
	['A', 'B'].forEach(id => manager.tabToActivate(id));
	expect(manager.getHistory()).toEqual(['A', 'B']);

	// Expand cycle size and verify the same history
	manager.changeCycleSize(4);
	expect(manager.getHistory()).toEqual(['A', 'B']);

	// New tabs should also be added now that there's space
	['C', 'D'].forEach(id => manager.tabToActivate(id));
	expect(manager.getHistory()).toEqual(['A', 'B', 'C', 'D']);
    });

    test('switchTab operates correctly after cycle size change', () => {
	// Initialize with some tabs
	['A', 'B', 'C'].forEach(id => manager.tabToActivate(id));

	// Change the cycle size (reduce)
	manager.changeCycleSize(2);

	// next tabs and ensure it's still operating under the new constraints
	expect(manager.nextTab()).toBe('B');
    });

    test('maintains consistent state during rapid cycle size changes', () => {
	// Perform operations and check for consistency
	['A', 'B', 'C', 'D', 'E'].forEach(id => manager.tabToActivate(id));

	// Rapid changes in cycle size
	manager.changeCycleSize(5);
	manager.changeCycleSize(2);
	manager.changeCycleSize(4);

	// next tabs and check if the behavior is as expected with the final cycle size
	expect(manager.nextTab()).toBe('B');
    });

    test('handles cycle size of one', () => {
	// Set the cycle size to one
	manager.changeCycleSize(1);

	// Try adding tabs and verify that history is not kept
	['A', 'B', 'C'].forEach(id => manager.tabToActivate(id));

	// switchTab ignore cycle size since it assumes a hardcoded cycle size of 2
	expect(manager.switchTab()).toBe('B');

	// nextTab should be no op
	expect(manager.nextTab()).toBe('B');

	// previousTab should be no op too
	expect(manager.previousTab()).toBe('B');

    });

    
});
