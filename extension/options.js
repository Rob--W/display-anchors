'use strict';

var useAnchorText = document.getElementById('useAnchorText');
var useCustomText = document.getElementById('useCustomText');
var customTextValue = document.getElementById('customTextValue');

function onChangeAnchorTextChoice() {
    chrome.storage.sync.set({
        useAnchorText: useAnchorText.checked,
    });
}
function onChangeCustomTextValue() {
    chrome.storage.sync.set({
        customTextValue: customTextValue.value,
    });
}
useAnchorText.onchange = useCustomText.onchange = onChangeAnchorTextChoice;
customTextValue.onfocus = function() {
    useCustomText.checked = true;
    onChangeAnchorTextChoice();
};
customTextValue.oninput = onChangeCustomTextValue;

// Keep defaults in sync with background.js and toggle-anchors.js
chrome.storage.sync.get({
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
