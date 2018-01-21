// Update obfuscations list in popup from storage
function updateObfuscations() {
	AppmBrowserHelper.getPersistent('appm.obfuscations', [], function(obfuscations) {
		$('#obfuscations').html("");
		for (var i = 0; i < obfuscations.length; i++) {
			var template = $('<li data-name="'+obfuscations[i].name+'"><a href="#">'+obfuscations[i].name+'</a></li>');
			if (obfuscations[i].enabled === true) {
				template.addClass("isEnabled");
			}
			$("#obfuscations").append(template);
		}

		$("ul li a").click(function() { 
			var name = $(this).parent().data('name');
			toggleObfuscationEnabled(name);
		})
	});
}

// Toggle the enable/disable state of a given obfuscation (then dispatch an update to that list)
function toggleObfuscationEnabled(name) {
	AppmBrowserHelper.getPersistent('appm.obfuscations', [], function(obfuscations) {
		var target = $.grep(obfuscations, function (o) { return o.name === name});
		if (target.length > 0) {
			target[0].enabled = !target[0].enabled;
			AppmBrowserHelper.setPersistent('appm.obfuscations', obfuscations, function () {
				obfuscationsBridge.sendGlobally(null);
				updateObfuscations();
			});
		}
	});
}

var obfuscationsBridge = new MessagingBridge("obfuscations", "popup", function () { updateObfuscations(); });

$(document).ready(function () {	
	$('.slider').addClass('notransition');

	AppmBrowserHelper.getPersistent('appm.running', false, function(isRunning) {
		$('#appmRunning').prop('checked', isRunning);
		setTimeout(function () {
			$('.slider').removeClass('notransition');
		}, 200);
	});

	updateObfuscations();

	$(document).on('change', '#appmRunning', function() {
		var runningCheckbox = this;
		AppmBrowserHelper.setPersistent('appm.running', runningCheckbox.checked, function() {
			new MessagingBridge("status").sendGlobally();
			AppmBrowserHelper.runOnAllTabs(function (tabId) {
				AppmBrowserHelper.setIcon(tabId, runningCheckbox.checked);
			});
		});
	});
});