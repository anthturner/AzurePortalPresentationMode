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
	if (typeof request.running != 'undefined') {
		if (request.running == "?") {
			isAzureRunning(function (state) {
				sendResponse({running: state});
			});
		}
		else {
			setAzureRunning(request.running);
			
			sendResponse({running: request.running});
			chrome.tabs.query({}, function(tabs) {
				for (var i = 0; i < tabs.length; i++) {
					setIcon(tabs[i]);
					chrome.tabs.sendMessage(tabs[i].id, {running: request.running});
				}
				return true;
			});
		}
	}
	return true;
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
	chrome.storage.local.get('appm.running', function(items) {
		var result = items["appm.running"];
		if (result === undefined) { result = false; }
		callback(result);
		return true;
	});
}
function setAzureRunning(value)
{
	chrome.storage.local.set({'appm.running': value});
}