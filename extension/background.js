var activeTab = {};

// Browser state listeners
chrome.webNavigation.onCommitted.addListener(setIcon);
chrome.webNavigation.onHistoryStateUpdated.addListener(setIcon);
chrome.webNavigation.onBeforeNavigate.addListener(setIcon);
chrome.tabs.onActivated.addListener(function (info) { activeTab = info.tab; });

// Set initially active tab on load
chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) { activeTab = tabs[0]; });

// Set icons across all tabs on load
chrome.tabs.query({}, function(tabs) {
	for (var i = 0; i < tabs.length; i++) { setIcon(tabs[i]); }
});

// Message bus listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	// Command changes running state
	if (typeof request.running != 'undefined') {
		setAzureRunning(request.running);
		
		sendResponse({isRunning: request.running});
		chrome.tabs.query({}, function(tabs) {
			for (var i = 0; i < tabs.length; i++) {
				setIcon(tabs[i]);
				chrome.tabs.sendMessage(tabs[i].id, {isRunning: request.running});
			}
		});
	}
	
	// Command requests running state
	if (typeof request.isRunning != 'undefined') {
		isAzureRunning(function (state) {
			sendResponse({isRunning: state});
		});
		return true; // prevent sendResponse from becoming invalid
	}
});

// Icon management
function setIcon(tab)
{	
	isAzureRunning(function (state) {
		var iconPath = "";
		if (state) { iconPath = "icons/mask128.png"; }
		else { iconPath = "icons/cloud128.png"; }
		
		chrome.browserAction.setIcon({
			path: iconPath,
			tabId: tab.id
		});
	});
}

// Configuration accessor/mutator functions
function isAzureRunning(callback)
{
	chrome.storage.local.get('azObscure.running', function(items) {
		callback(items["azObscure.running"]);
	});
}
function setAzureRunning(value)
{
	chrome.storage.local.set({'azObscure.running': value});
}