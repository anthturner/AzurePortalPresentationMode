var mutationCheckDelay = 100;
var mutationCooldown = 100;

var possibleMutations = [
{
	name: "Remove Subscription IDs",
	selectorString: "$(\"div.msportalfx-property-label-wrapper\").find(\"label:contains('Subscription ID')\").parent().next().children().first()",
	observes: {characterData:true},
	callback: function(selector) { selector.hide(); }
},
{
	name: "Remove Resource IDs",
	selectorString: "$(\"div.msportalfx-property-label-wrapper\").find(\"label:contains('Resource ID')\").parent().next().children().first()",
	observes: {characterData:true, childList:true},
	callback: function(selector) { selector.hide(); }
},
{
	name: "Hide User Header Tooltip",
	selectorString: "$('div.fxs-avatarmenu-header')",
	observes: {attributes: true},
	callback: function(selector) { selector.prop('title', ''); }
},
{
	name: "Hide Username",
	selectorString: "$('div.fxs-avatarmenu-username')",
	observes: {characterData: true},
	callback: function(selector) { selector.text(""); }
},
{
	name: "Remove Subscription IDs (VMs)",
	selectorString: "$(\"div.fxc-essentials-label-container\").find(\"label:contains('Subscription ID')\").parent().next().children().first()",
	observes: {characterData:true},
	callback: function(selector) { selector.hide(); }
}
];


// ----------------------------------------------------------------------------------------------
var mutations = [];
var canMutationCheck = true;
// Configure MutationObserver to watch the DOM for updates
$(document).ready(function () {
	MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	var observer = new MutationObserver(function(mutationsList, observer) { registerMutations(); });
	observer.observe($('body')[0], {attributes: true, childList:true, characterData:true, subtree:true});
});

// Run initial mutation registration
registerMutations();

// Listen for information from the message bus
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.isRunning !== null) {
			if (request.isRunning)
			{
				console.log("Azure Portal Presentation Mode is hiding sensitive information from your portal instance.");
				mutations = [];
				registerMutations();
			}
			
			// todo: refresh portal tabs
		}
});

function registerMutations()
{
	// Time-gate checking for mutations based on body update observations
	if (!canMutationCheck)
		return;
	canMutationCheck = false;
	setTimeout(function() { canMutationCheck = true; }, mutationCheckDelay);
	
	for (i = 0; i < possibleMutations.length; i++) { 
		registerMutation(possibleMutations[i]);
	}
}

// Check that mutation's DOM selector is still valid
function isMutationValid(mutationName)
{
	if ($.grep(mutations, function(el){
		return el.name == mutationName && el.selector.length > 0 && el.selector[0].isConnected;
	}).length === 1) {
		return true;
	}
	return false;
}

// Check if the mutation is currently in use (prevent infinite recursion on DOM watcher)
function isMutationActive(mutationName)
{
	if ($.grep(mutations, function(el){
		return el.name == mutationName && el.active;
	}).length === 1) {
		return true;
	}
	return false;
}

function registerMutation(mutation)
{
	// Check if there is an existing mutation that is still DOM-bound
	if (isMutationValid(mutation.name))
		return;
	
	// See if the selector resolves to anything
	mutation.selector = eval(mutation.selectorString);
	if (mutation.selector === undefined || mutation.selector.length === 0)
		return;
		
	// Clean up dead refs
	mutations = $.grep(mutations, function (el, i) { return el.selector.length > 0 && el.selector[0].isConnected; });
	
	mutations.push(mutation);
	
	// Create local observer based on specified parameters
	MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	var observer = new MutationObserver(function(mutationsList, observer) {
		if (!isMutationActive(mutation.name))
		{
			chrome.runtime.sendMessage({isRunning: "?"}, function(response) {
				if (response.isRunning === true) {
					mutation.active = true;
					mutation.callback(mutation.selector);
					setTimeout(function() { mutation.active = false; }, mutationCooldown);
				}
			});
		}
	});
	
	// Run a first time attempt at filtering
	chrome.runtime.sendMessage({isRunning: "?"}, function(response) {
		if (response.isRunning === true) {
			mutation.active = true;
			mutation.callback(mutation.selector);
			setTimeout(function() { mutation.active = false; }, mutationCooldown);
		}
	});
	
	// Activate observer
	observer.observe(mutation.selector[0], mutation.observes);
}
