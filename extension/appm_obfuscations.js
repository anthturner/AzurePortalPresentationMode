var possibleObfuscations = [
{
    name: "Hide User Header Tooltip",
    selectors: [ "div.fxs-avatarmenu *[title]:not([title=\"\"])" ],
    callbacks: [ function(selector) { $(selector).hover(function(){ $(selector).removeAttr("title"); }); } ]
},
{
    name: "Hide Username",
    selectors: [ "div.fxs-avatarmenu-username" ],
    callbacks: [ function(selector) { selector.text(""); } ]
},
{
    name: "Remove Resource IDs",
    selectors: [
        ".fxc-essentials-label-container label:contains(\"Resource ID\"),label:contains(\"Resource Id\"),label:contains(\"Resource id\")",
        ".msportalfx-property label:contains(\"Resource ID\"),label:contains(\"Resource Id\"),label:contains(\"Resource id\")"
    ],
    callbacks: [
        function(selector) { selector.closest('.fxc-essentials-item').children('div:not(.fxc-essentials-label-container)').hide(); },
        function(selector) { selector.closest('.msportalfx-property').children('div:not(.msportalfx-property-label-wrapper)').hide(); }
    ]
},
{
    name: "Remove Subscription IDs",
    selectors: [
        ".fxc-essentials-label-container label:contains(\"Subscription ID\"),label:contains(\"Subscription Id\"),label:contains(\"Subscription id\")",
        ".msportalfx-property label:contains(\"Subscription ID\"),label:contains(\"Subscription Id\"),label:contains(\"Subscription id\")"
    ],
    callbacks: [
        function(selector) { selector.closest('.fxc-essentials-item').children('div:not(.fxc-essentials-label-container)').hide(); },
        function(selector) { selector.closest('.msportalfx-property').children('div:not(.msportalfx-property-label-wrapper)').hide(); }
    ]
}
];