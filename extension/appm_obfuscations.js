var possibleObfuscations = [
{
    name: "Hide User Header Tooltip",
    selectors: [{
        selector: "div.fxs-avatarmenu div[title]:not([title=\"\"])",
        callback: function(selector) { $(selector).hover(function(){ $(selector).removeAttr("title"); }); }
    }]
},
{
    name: "Hide Username",
    selectors: [{
        selector: "div.fxs-avatarmenu-username",
        callback: function(selector) { selector.text(""); }
    }]
},
{
    name: "Remove Resource IDs",
    selectors: [{
        // Handles resource ID for Azure Disks
        selector: "div.msportalfx-text-label:contains('Resource ID')",
        callback: function(selector) { selector.next().hide(); }
    }],
    labels: [{
        label: "Resource ID",
        callback: function(selector) { selector.hide(); }
    }]
},
{
    name: "Remove Subscription IDs",
    labels: [{
        label: "Subscription ID",
        callback: function(selector) { selector.hide(); }
    }]
}
];