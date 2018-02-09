var possibleObfuscationObjects = [];
var appmIsRunning = false;
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

	setInterval(function() { 
		AppmBrowserHelper.getPersistent('appm.running', false, function(isRunning) {
			appmIsRunning = isRunning;
		});
	}, 100);

	bodyObserver = new MutationObserver(function(mutationsList, observer) { 
		if (appmIsRunning) {
			for (var i = 0; i < mutationsList.length; i++) {
				for (var j = 0; j < possibleObfuscationObjects.length; j++) {
					possibleObfuscationObjects[j].tryObfuscate($(mutationsList[i].target));
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
		this.linkedParent = $.grep(possibleObfuscations, function(o) { return definition.name === o.name; })[0];
	}

	executeLinkedCallback(targetJqElement) {
		for (var i = 0; i < this.linkedParent.callbacks.length; i++) {
			this.linkedParent.callbacks[i](targetJqElement);
		}
	}

	obfuscateAll() {
		for (var i = 0; i < this.definition.selectors.length; i++)
		{
			var el = $(this.definition.selectors[i]);
			if (el !== undefined && el.length > 0 && el[0].isConnected) {
				this.obfuscate(el);
				return;
			}
		}
	}

	tryObfuscate(targetJqElement) {
		for (var i = 0; i < this.definition.selectors.length; i++)
		{
			var target = this.definition.selectors[i];
			if (targetJqElement.is(target)) {
				this.obfuscate(targetJqElement);
				return;
			}
		}
	}

	obfuscate(targetJqElement) {
		if (!this.active && this.definition.enabled === true) {
			var obfuscation = this;
			if (obfuscation.active === false) {
				obfuscation.active = true;
				obfuscation.executeLinkedCallback(targetJqElement);
				obfuscation.active = false;
			}
		}
	}
}