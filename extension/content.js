const APPM_BACKOFF_TIME = 100; // 0.1s

var possibleObfuscations = [
{
	name: "Hide User Header Tooltip",
	selectorString: "div.fxs-avatarmenu *[title]:not([title=\"\"])",
	callback: function(selector) { $(selector).hover(function(){ $(selector).removeAttr("title"); }); }
},
{
	name: "Hide Username",
	selectorString: "div.fxs-avatarmenu-username",
	callback: function(selector) { selector.text(""); }
},
{
	name: "Remove Resource IDs (by fxc container)",
	selectorString: ".fxc-essentials-label-container label:contains(\"Resource ID\"),label:contains(\"Resource Id\"),label:contains(\"Resource id\")",
	callback: function(selector) { selector.closest('.fxc-essentials-item').children('div:not(.fxc-essentials-label-container)').hide(); }
},
{
	name: "Remove Resource IDs (by msportalfx-property)",
	selectorString: ".msportalfx-property label:contains(\"Resource ID\"),label:contains(\"Resource Id\"),label:contains(\"Resource id\")",
	callback: function(selector) { selector.closest('.msportalfx-property').children('div:not(.msportalfx-property-label-wrapper)').hide(); }
},
{
	name: "Remove Subscription IDs (by fxc container)",
	selectorString: ".fxc-essentials-label-container label:contains(\"Subscription ID\"),label:contains(\"Subscription Id\"),label:contains(\"Subscription id\")",
	callback: function(selector) { selector.closest('.fxc-essentials-item').children('div:not(.fxc-essentials-label-container)').hide(); }
},
{
	name: "Remove Subscription IDs (by msportalfx-property)",
	selectorString: ".msportalfx-property label:contains(\"Subscription ID\"),label:contains(\"Subscription Id\"),label:contains(\"Subscription id\")",
	callback: function(selector) { selector.closest('.msportalfx-property').children('div:not(.msportalfx-property-label-wrapper)').hide(); }
}

];

// ----------------------------------------------------------------------------------------------
var possibleObfuscationObjects = [];
var bodyObserver;

$(document).ready(function () {
	MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	
	possibleObfuscationObjects = [];
	for (var i = 0; i < possibleObfuscations.length; i++) {
		possibleObfuscationObjects.push(new APPMObfuscation(possibleObfuscations[i]));
	}

	bodyObserver = new MutationObserver(function(mutationsList, observer) { 
		for (var i = 0; i < mutationsList.length; i++) {
			for (var j = 0; j < possibleObfuscationObjects.length; j++) {
				if (possibleObfuscationObjects[j].canObfuscate($(mutationsList[i].target))) {
					possibleObfuscationObjects[j].obfuscate($(mutationsList[i].target));
				}
			}
		}
	});
	bodyObserver.observe($('body')[0], {attributes: true, childList:true, characterData:true, subtree:true});
});

class APPMObfuscation {
	constructor(definition) {
		this.definition = definition;
		this.active = false;
	}

	obfuscateAll() {
		var el = $(this.definition.selectorString)
		if (el !== undefined && el.length > 0 && el[0].isConnected) {
			this.obfuscate(el);
		}
	}

	canObfuscate(targetJqElement) {
		var target = this.definition.selectorString;
		return targetJqElement.is(target);
	}

	obfuscate(targetJqElement) {
		if (!this.active) {
			var obfuscation = this;
			chrome.runtime.sendMessage({running: "?"}, function(response) {
				if (response.running === true && !obfuscation.active) {
					obfuscation.active = true;
					console.log("Firing update for " + obfuscation.definition.name)
					obfuscation.definition.callback(targetJqElement);
					obfuscation.active = false;
				}
			});
		}
	}
}

// Listen for information from the message bus
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.running !== null) {
			if (request.running)
			{
				console.log("Azure Portal Presentation Mode is hiding sensitive information from your portal instance.");

				for (var i = 0; i < possibleObfuscationObjects.length; i++) {
					possibleObfuscationObjects[i].obfuscateAll();
				}
			}
			
			// todo: refresh portal tabs
		}
});