class AppmBrowserHelper
{   
    static getActiveTabId(callback) {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) { callback(tabs[0].id); });
    }

    static getPersistent(name, defaultValue, callback) {
        chrome.storage.local.get(name, function(items) {
            var result = items[name];
            if (result === undefined) { result = defaultValue; }
            callback(result);
            return true;
        });
    }
    
    static setPersistent(name, value, callback) {
        var payload = {};
        payload[name] = value;
        chrome.storage.local.set(payload, callback);
    }
    
    static runOnAllTabs(callback) {
        chrome.tabs.query({}, function(tabs) {
			for (var i = 0; i < tabs.length; i++) {
                callback(tabs[i].id);
            }
        });
    }

    static setIcon(tabId, state)
    {	
		var iconPath = "";
		if (state) { iconPath = "icons/mask128.png"; }
		else { iconPath = "icons/cloud128.png"; }
		
		chrome.browserAction.setIcon({
			path: iconPath,
			tabId: tabId
		});
	}
}

class MessagingBridge
{
    constructor (topic, scopes, messageCallback) {
        if (scopes === undefined) { scopes = []; }
        else if (Array.isArray(scopes) !== true) { scopes = [scopes]; }
        scopes.push('*');
        this.scopes = scopes;
        this.topic = topic;

        if (messageCallback !== undefined) {
            chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                if (MessagingBridge.debug === true) {
                    console.log("<Listener> Sender: " + sender.url + " | Scopes: " + request.scopes + " | Topic: " + request.topic + " | Data: " + JSON.stringify(request.data));
                }
                if (request.topic == topic && request.scopes.filter(x => scopes.includes(x)).length > 0) {
                    messageCallback(request.data, sendResponse, sender);
                }
                return true;
            });
        }
    }

    static constructMessage(scopes, topic, data) {
        if (Array.isArray(scopes) !== true) { scopes = [scopes]; }
        return {
            scopes: scopes,
            topic: topic,
            data: data
        };
    }

    static sendMessageFrameRuntime(message, callback) {
        chrome.runtime.sendMessage(message, function(response) {
            if (callback !== undefined) { callback(response); }
            return true;
        });
    }

    static sendMessageFrameTabs(tabId, message, callback) {
        chrome.tabs.sendMessage(tabId, message, null, function(response) {
            if (callback !== undefined) { callback(response); }
            return true;
        });
    }

    sendGlobally(data) {
        var msg = MessagingBridge.constructMessage(
            "*",
            this.topic,
            data);
        MessagingBridge.sendMessageFrameRuntime(msg);
        AppmBrowserHelper.runOnAllTabs(function (tabId) {
            MessagingBridge.sendMessageFrameTabs(tabId, msg);
        });
    }

    sendToActiveTab(data, callback) {
        AppmBrowserHelper.getActiveTabId(function(tabId) {
            this.sendToTab(tabId, data, callback);
        });
    }

    sendToAllTabs(data) {
        var msg = MessagingBridge.constructMessage(
            "tabs",
            this.topic,
            data);
        AppmBrowserHelper.runOnAllTabs(function (tabId) {
            MessagingBridge.sendMessageFrameTabs(tabId, msg);
        });
    }

    sendToTab(tabId, data, callback) {
        MessagingBridge.sendMessageFrameTabs(tabId, 
            MessagingBridge.constructMessage(
                "tab",
                this.topic,
                data), callback);
    }

    sendToPopup(data, callback) {
        MessagingBridge.sendMessageFrameRuntime(
            MessagingBridge.constructMessage(
                "popup",
                this.topic,
                data), callback);
    }

    sendToBackground(data, callback) {
        MessagingBridge.sendMessageFrameRuntime(
            MessagingBridge.constructMessage(
                "background",
                this.topic,
                data), callback);
    }
}

// Enable to show message traffic in console log
MessagingBridge.debug = false;