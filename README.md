# Azure Portal Presentation Mode
APPM is a Chrome extension that strips sensitive information from the new Microsoft Azure portal (https://portal.azure.com). This is most useful for individuals doing public presentations or videos on material associated with the portal who do not wish to disclose private details about their subscription or resources.

The following data is intended to be stripped from the portal as of 1/20/2018:
- Subscription IDs from resource pages
- Resource IDs from resource pages
- Tooltip in user header that discloses Directory ID
- Username from user header

Additional data can be stripped by adding a mutation to appm_obfuscations.js in the following style:

```javascript
{
	name: "Some Descriptive Name of What This Does",
	selectors: [
		"string representing a jquery selector pointing to the element that is watched for changes and subsequently passed into the callback",
		"another string selector that will also activate the callback series"
	],
	callbacks: [ 
		function(selector) { selector.hide(); }, // Perform mutation here, the selector will be the element that was returned from the selector that activated this callback, above
		function(selector) { } // another callback to be executed
	]
},
```

If you add additional data and create a PR, please include the new functionality in this README.
