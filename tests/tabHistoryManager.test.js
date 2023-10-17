// tabHistoryManager.test.js
const TabHistoryManager = require('./../tabHistoryManager');

describe('TabHistoryManager', () => {
    let manager;

    beforeEach(() => {
        manager = new TabHistoryManager(3);
    });

    test('should add new tabs to history', () => {
        manager.activateTab('A');
        expect(manager.getHistory()).toEqual(['A']);
        
        manager.activateTab('B');
        expect(manager.getHistory()).toEqual(['A', 'B']);
    });

    test('should maintain history size', () => {
        manager.activateTab('A');
        manager.activateTab('B');
        manager.activateTab('C');
        manager.activateTab('D');
        expect(manager.getHistory()).toEqual(['B', 'C', 'D']); // Oldest (A) is removed.
    });

    test('should cycle through tabs', () => {
        manager.activateTab(1);
        manager.activateTab(2);
        manager.activateTab(3);
        expect(manager.nextTab()).toBe(1);
        expect(manager.previousTab()).toBe(3);
    });

    test('add a new tab after cycling through the tabs', () => {
        manager.activateTab(1);
        manager.activateTab(2);
        manager.activateTab(3);
        expect(manager.nextTab()).toBe(1);
        expect(manager.previousTab()).toBe(3);
        manager.activateTab(4);
        expect(manager.nextTab()).toBe(2);
        expect(manager.previousTab()).toBe(4);
    });


    test('navigate with empty history', () => {
	expect(manager.nextTab()).toBeUndefined();
	expect(manager.previousTab()).toBeUndefined();
    });

    test('activate the same tab multiple times', () => {
	manager.activateTab(1);
	manager.activateTab(1);
	expect(manager.nextTab()).toBe(1); // or toBeUndefined(), based on your implementation
	expect(manager.previousTab()).toBe(1); // or toBeUndefined()
    });

    test('maintain history size limit', () => {
	for (let i = 1; i <= 15; i++) { 
            manager.activateTab(i);
	}
	expect(manager.getHistorySize()).toBe(3);
    });

    test('boundary navigation', () => {
	['A', 'B', 'C'].forEach(id => manager.activateTab(id));
	expect(manager.nextTab()).toBe('A'); // assuming loop back to the start
	expect(manager.previousTab()).toBe('C'); // assuming loop back to the end
    });

    test('handle unexpected input', () => {
	expect(() => manager.activateTab(null)).not.toThrow();
	expect(() => manager.activateTab(undefined)).not.toThrow();
	expect(() => manager.activateTab('randomString')).not.toThrow();
	// If you have specific behavior defined for these cases, check for those instead of just 'not.toThrow()'
    });

    test('sequential tab activation and navigation', () => {
	manager.changeCycleSize(4); // Assuming you can change limit on-the-fly.
	const sequence = ['A', 'B', 'C', 'D']; // Using letters for clarity.
	
	sequence.forEach(tab => manager.activateTab(tab));
	manager.activateTab('A');
//	manager.consoleLogState("sequential tab activation and navigation: start");
	sequence.forEach((tab, index) => {
            const nextIndex = (index + 1) % sequence.length;
            const expectedNextTab = sequence[nextIndex]; // This is the tab ID we expect nextTab() to return.
	    manager.setActivateTab(sequence[index]);
//	    manager.consoleLogState("sequential tab activation and navigation: index: " + index + ' expectedNextTab: ' + expectedNextTab);
            expect(manager.nextTab()).toBe(expectedNextTab); // Compare directly with the expected tab ID.
	});
    });

    test('tab removal from history', () => {
        ['A', 'B', 'C', 'D'].forEach(id => manager.activateTab(id));
        manager.removeTab('B'); // This should remove 'B' from the history.
        expect(manager.getHistory()).not.toContain('B'); // 'B' should no longer be in the history.
    });
    
    test('should handle rapid sequential activations', () => {
	for (let i = 0; i < 1000; i++) {
            manager.activateTab(i);
	}
	// Check the state remains consistent and no errors occur.
	expect(manager.checkState()).toBeTruthy();
    });

    test('should maintain consistent state', () => {
	// Perform a series of operations
	manager.activateTab('A');
	manager.nextTab();
	manager.previousTab();
	manager.activateTab('B');

	// Check that the state is still consistent
	expect(manager.checkState()).toBeTruthy();
    });

    test('should handle all tabs being removed', () => {
	[1, 2, 3].forEach(id => manager.activateTab(id));
	[1, 2, 3].forEach(id => manager.removeTab(id)); // Assuming removeTab exists

	// Expecting either specific behavior or simply no errors
	expect(manager.nextTab()).toBeUndefined();
	expect(manager.previousTab()).toBeUndefined();
    });

    test('should handle direct history manipulation', () => {
	// This depends on whether you allow direct manipulation of history or not
	manager.tabHistory = [4, 5, 6];  // Directly setting a state, which is usually not recommended

	expect(manager.nextTab()).toBe(5);
	expect(manager.previousTab()).toBe(4);
	expect(manager.checkState()).toBeTruthy();
    });

    test('certain methods should be idempotent', () => {
	manager.activateTab(1);
	const historyAfterFirstActivation = [...manager.getHistory()];

	manager.activateTab(1);
	const historyAfterSecondActivation = [...manager.getHistory()];

	expect(historyAfterFirstActivation).toEqual(historyAfterSecondActivation);
    });

    test('should toggle between the current and last accessed tabs', () => {
        // Setup initial tabs
        [1, 2, 3].forEach(id => manager.activateTab(id));
        
        // Check if the state remains consistent
        expect(manager.checkState()).toBeTruthy();
	// console.log('Test2: Current tab history:', manager.tabHistory);
	// console.log('Test2: Current tab index:', manager.currentTabIndex);

        // The current tab should be 3; the last accessed tab should be 2.
        expect(manager.currentTabId()).toBe(3);  // Checks the current tab is as expected
        expect(manager.switchTab()).toBe(2);  // Switches to the last accessed tab (2)
        expect(manager.switchTab()).toBe(3);  // Switches back to what was the current tab (3)
    });

    test('should handle toggle with insufficient history', () => {
        manager.activateTab(1);
        // There's only one tab in the history, so it shouldn't really switch.
        expect(manager.switchTab()).toBe(1); 
    });

    test('consistent state after toggling tabs', () => {
        // This is especially important to ensure that repeated switches do not corrupt the state.
        [1, 2, 3, 4].forEach(id => manager.activateTab(id));

        // Toggle back and forth
        manager.switchTab();  // From 4 to 3
        manager.switchTab();  // From 3 back to 4
        manager.switchTab();  // From 4 to 3 again

        // Check if the state remains consistent
        expect(manager.checkState()).toBeTruthy();
    });

    test('interaction between switchTab and activateTab', () => {
	// Setup initial tabs
	['A', 'B', 'C'].forEach(id => manager.activateTab(id));

	// Switch between the current and last accessed tabs
	expect(manager.switchTab()).toBe('B'); // Current should now be B

	// Activate a new tab
	manager.activateTab('D', true);  // Current should now be 4

	// The previous tab ('B') should now be the last accessed, so switching should bring it forward
	expect(manager.switchTab(true)).toBe('B');
    });

    test('interaction between switchTab and removeTab', () => {
	// Setup initial tabs
	manager.changeCycleSize(4);
	['A', 'B', 'C', 'D'].forEach(id => manager.activateTab(id));

	// Remove the current tab; the new current should be the last accessed.
	manager.removeTab('D');  // Remove tab 4, current should be 3 now
	expect(manager.currentTabId()).toBe('C');

	// Now remove tab 3; the new current should be 2 (going back in history).
	manager.removeTab('C');
	expect(manager.currentTabId()).toBe('B');

	// Attempt to switch tabs - but we've removed recent tabs so behavour is to stay put
	expect(manager.switchTab()).toBe('B');
    });

    test('interaction between switchTab, next, and previous', () => {
	// Setup initial tabs
	manager.changeCycleSize(4);
	['A', 'B', 'C', 'D'].forEach(id => manager.activateTab(id));

	expect(manager.currentTabId()).toBe('D');
	// Navigate using previousTab (should go to 3)
	manager.previousTab();
	expect(manager.currentTabId()).toBe('C');

	// Switch tabs (should go to 4 as it was the last accessed)
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
	manager.activateTab('A');

	// Trying to switch with one tab shouldn't change the current tab
	expect(manager.switchTab()).toBe('A');
    });

    
});
