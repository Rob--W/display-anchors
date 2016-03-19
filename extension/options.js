/* globals chrome */
/* jshint browser:true */
'use strict';

var useAnchorText = document.getElementById('useAnchorText');
var useCustomText = document.getElementById('useCustomText');
var customTextValue = document.getElementById('customTextValue');

var storageArea = chrome.storage.sync || chrome.storage.local;

document.getElementById('anchorTextForm').onsubmit = function(event) {
    event.preventDefault();
    storageArea.set({
        useAnchorText: useAnchorText.checked,
        customTextValue: customTextValue.value,
    });
};
customTextValue.onfocus = function() {
    useCustomText.checked = true;
};

// Keep defaults in sync with background.js and toggle-anchors.js
storageArea.get({
    useAnchorText: true,
    customTextValue: '\xb6', // paragraph symbol.
}, function(items) {
    renderPreferredAnchorText(items.useAnchorText);
    customTextValue.value = items.customTextValue;
});

chrome.storage.onChanged.addListener(function(changes) {
    // This pref can be changed via the context menu of the browser action.
    if (changes.useAnchorText) {
        renderPreferredAnchorText(changes.useAnchorText.newValue);
    }
    // This pref could be changed if the user opens another settings page.
    // (and/or if the settings get synced?)
    if (changes.customTextValue) {
        customTextValue.value = changes.customTextValue.newValue;
    }
});

function renderPreferredAnchorText(preferAnchorText) {
    if (preferAnchorText) {
        useAnchorText.checked = true;
    } else {
        useCustomText.checked = true;
    }
}
