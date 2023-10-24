build:
	cat tabHistoryManager.js main.js > background.js

test:	build
	cat tabHistoryManager.js > tabHistoryManagerTestable.js
	echo "module.exports = TabHistoryManager;" >> tabHistoryManagerTestable.js
	npm test tabHistoryManager.test.js
