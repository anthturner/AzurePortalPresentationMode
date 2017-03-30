$(document).ready(function () {	
	$('.onoffswitch-inner').addClass('notransition');
	$('.onoffswitch-switch').addClass('notransition');

	chrome.runtime.sendMessage({isRunning:"?"}, function(response) {
		$('#azObscureRunning').prop('checked', response.isRunning);
		setTimeout(function () {
			$('.onoffswitch-inner').removeClass('notransition');
			$('.onoffswitch-switch').removeClass('notransition');
		}, 200);
	});

	$('#azObscureRunning').change(function() {
		chrome.runtime.sendMessage({running:this.checked}, function(response) {});
	})
});