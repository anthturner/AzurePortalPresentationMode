class AppmRuntimeHook {
    static init() {
		var isLabelUpdateBlocked = false;
        var bodyObserver;
        var statusBridge = new MessagingBridge("status", "tab", function () { AppmRuntimeHook.updateRunningState(); });
		var obfuscationsBridge = new MessagingBridge("obfuscations", "tab", function () { AppmManager.updateObfuscations(); });
		
		AppmManager.Labels = [];
		AppmManager.LabelNames = [];

        $(document).ready(function () {
            MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
            AppmManager.updateObfuscations();
        
            bodyObserver = new MutationObserver(function(mutationsList, observer) { AppmRuntimeHook.runGatedDomUpdates(); });
            bodyObserver.observe($('body')[0], {attributes: true, childList:true, characterData:true, subtree:true});
        
            // Get current running state and run filtering if needed
            AppmRuntimeHook.updateRunningState();
        });
	}

	static runGatedDomUpdates()	{
		if (AppmRuntimeHook.isRunning) {
			if (!AppmRuntimeHook.isLabelUpdateBlocked) {
				AppmRuntimeHook.isLabelUpdateBlocked = true;
				
				var labels = $('label');
				for (var i = 0; i < labels.length; i++) {
					AppmManager.updateLabels(labels[i].id, labels[i].innerText);
				}

				setTimeout(function() { AppmRuntimeHook.isLabelUpdateBlocked = false; }, 50);
			}

			// for (var i = 0; i < mutationsList.length; i++) {
			// 	AppmManager.runAllObfuscationsOn($(mutationsList[i].target));
			// }
			AppmManager.runAllObfuscations();
		}
	}

    static updateRunningState()
    {
        AppmBrowserHelper.getPersistent('appm.running', false, function(isRunning) {
            AppmRuntimeHook.isRunning = isRunning;
            if (isRunning === true) {
                console.log("Azure Portal Presentation Mode is hiding sensitive information from your portal instance.");
                AppmManager.runAllObfuscations();
            }
        });
    }
}

class AppmManager {
    static updateLabels(id, label) {
		var idx = AppmManager.LabelNames.indexOf(label.toUpperCase());
		if (idx === -1 && id.length > 0 && label.length > 0) {
            AppmManager.LabelNames.push(label.toUpperCase());
			AppmManager.Labels.push({id: id, label: label});
			console.log('added label "'+label+'" with id "'+id+'"');
		}
		else if (idx !== -1) {
			var result = $.grep(AppmManager.Labels, function (l) { if (l.label.toUpperCase() === label.toUpperCase()) { return l; } });
			result[0].id = id;
			console.log('updated label "'+label+'" with id "'+id+'"');
		}
    }

    static getFieldForLabel(label) {
		if (!$.isArray(AppmManager.Labels)) { return undefined; }
		var result = $.grep(AppmManager.Labels, function (l) { if (l.label.toUpperCase() === label.toUpperCase()) { return l; } });
		if (result !== undefined && result.length > 0) {
			return $(":not(label)[aria-labelledby^='"+result[0].id+"']");
		}
    }

    static updateObfuscations() {
        AppmBrowserHelper.getPersistent('appm.obfuscations', [], function(obfuscations) {
            AppmManager.obfuscations = [];

            for (var i = 0; i < obfuscations.length; i++) {
                AppmManager.obfuscations.push(obfuscations[i])
            }

            AppmRuntimeHook.updateRunningState();
        });
    }

    static getRelevantObfuscationsFromList(mutationsList) {
        for (var i = 0; i < mutationsList.length; i++) {
            for (var j = 0; j < AppmManager.obfuscations.length; j++) {
                AppmManager.runObfuscationStrategy(AppmManager.obfuscations[j], mutationsList[i]);
            }
        }
    }

    static runAllObfuscations() {
        for (var i = 0; i < AppmManager.obfuscations.length; i++) {
            AppmManager.runObfuscationStrategy(AppmManager.obfuscations[i]);
		}
	}
	
	static runAllObfuscationsOn(target) {
		for (var i = 0; i < AppmManager.obfuscations.length; i++) {
            AppmManager.runObfuscationStrategy(AppmManager.obfuscations[i], target);
        }
	}

    static runObfuscationStrategy(strategy, target) {
        if ($.isArray(strategy.selectors)) {
            for (var i = 0; i < strategy.selectors.length; i++) {
                var el = $(strategy.selectors[i].selector);
                if (el !== undefined && el.length > 0 && el[0].isConnected) { 
					if (target === undefined || el.is(target)) {
						var strategyTarget = $.grep(possibleObfuscations, function(o) { return strategy.name === o.name; })[0];
						strategyTarget.selectors[i].callback(el);
					}
                }
            }
		}

        if ($.isArray(strategy.labels)) {
            for (var i = 0; i < strategy.labels.length; i++) {
				var el = AppmManager.getFieldForLabel(strategy.labels[i].label);
				
                if (el !== undefined && el.length > 0 && el[0].isConnected) { 
					if (target === undefined || el.is(target)) {
						var strategyTarget = $.grep(possibleObfuscations, function(o) { return strategy.name === o.name; })[0];
						strategyTarget.labels[i].callback(el);
					}
                }
            }
        }
    }
}

AppmRuntimeHook.init();