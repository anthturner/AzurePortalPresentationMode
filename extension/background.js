// Browser state listeners
chrome.webNavigation.onCommitted.addListener(appmUpdateIcon);
chrome.webNavigation.onHistoryStateUpdated.addListener(appmUpdateIcon);
chrome.webNavigation.onBeforeNavigate.addListener(appmUpdateIcon);

// Set icons across all tabs on load
AppmBrowserHelper.getPersistent('appm.running', false, function(isRunning) {
	AppmBrowserHelper.runOnAllTabs(function(tabId) { AppmBrowserHelper.setIcon(tabId, isRunning) });
});

function appmUpdateIcon(tab) {
	AppmBrowserHelper.getPersistent('appm.running', false, function(isRunning) {
		AppmBrowserHelper.setIcon(tab.tabId, isRunning);
	});
}

AppmBrowserHelper.getPersistent('appm.obfuscations', [], function(obfuscations) {
	var newObfuscations = [];

	for (var i = 0; i < possibleObfuscations.length; i++) {
		var correlating = $.grep(obfuscations, function(o) { return possibleObfuscations[i].name === o.name; });
		if (correlating.length > 0) { possibleObfuscations[i].enabled = correlating[0].enabled; }
		else { possibleObfuscations[i].enabled = true; }
		newObfuscations.push(possibleObfuscations[i]);
	}

	AppmBrowserHelper.setPersistent('appm.obfuscations', newObfuscations, function () {
		new MessagingBridge("obfuscations").sendGlobally(null);
	});
});