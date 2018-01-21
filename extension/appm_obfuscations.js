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