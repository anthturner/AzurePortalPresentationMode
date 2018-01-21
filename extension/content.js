const APPM_BACKOFF_TIME = 100; // 0.1s
var possibleObfuscationObjects = [];
var bodyObserver;

function updateRunningState()
{
	AppmBrowserHelper.getPersistent('appm.running', false, function(isRunning) {
		if (isRunning === true) {
			console.log("Azure Portal Presentation Mode is hiding sensitive information from your portal instance.");
			for (var i = 0; i < possibleObfuscationObjects.length; i++) {
				possibleObfuscationObjects[i].obfuscateAll();
			}
		}
	});
}

function updateObfuscations()
{
	AppmBrowserHelper.getPersistent('appm.obfuscations', [], function(obfuscations) {
		possibleObfuscationObjects = [];

		for (var i = 0; i < obfuscations.length; i++) {
			possibleObfuscationObjects.push(new APPMObfuscation(obfuscations[i]))
		}

		updateRunningState();
	});
}

var statusBridge = new MessagingBridge("status", "tab", function () { updateRunningState() });
var obfuscationsBridge = new MessagingBridge("obfuscations", "tab", function () { updateObfuscations(); });

$(document).ready(function () {
	MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

	updateObfuscations();

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
	
	// Get current running state and run filtering if needed
	updateRunningState();
});

class APPMObfuscation {
	constructor(definition) {
		this.definition = definition;
		this.active = false;
	}

	executeLinkedCallback(targetJqElement) {
		var parent = this;
		var target = $.grep(possibleObfuscations, function(o) { return parent.definition.name === o.name; });
		if (target.length > 0) {
			target[0].callback(targetJqElement)
		}
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
		if (!this.active && this.definition.enabled === true) {
			var obfuscation = this;
			AppmBrowserHelper.getPersistent('appm.running', false, function(isRunning) {
				if (isRunning === true && obfuscation.active === false) {
					obfuscation.active = true;
					console.log("Firing update for " + obfuscation.definition.name)
					obfuscation.executeLinkedCallback(targetJqElement);
					obfuscation.active = false;
				}
			});
		}
	}
}