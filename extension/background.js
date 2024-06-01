/* globals chrome, console */
'use strict';
var CONTEXTMENU_ID_USE_ANCHOR_TEXT = 'contextMenus.useAnchorText';

chrome.browserAction.onClicked.addListener(function(tab) {
    toggleAnchors(tab.id);
});
function toggleAnchors(tabId) {
    chrome.tabs.executeScript(tabId, {
        file: 'toggle-anchors.js',
        allFrames: true
    }, function(result) {
        if (chrome.runtime.lastError) {
            console.error('executeScript failed:' + chrome.runtime.lastError.message);
            chrome.notifications.create('informative-message', {
                type: 'basic',
                iconUrl: chrome.runtime.getURL('icon128.png'),
                title: 'Display #Anchors failed',
                message: 'Cannot read links in the current tab (access denied).',
            });
            return;
        }
        if (!result || result.indexOf(true) === -1) {
            return;
        }
        chrome.tabs.insertCSS(tabId, {
            file: 'toggle-anchors.css',
            allFrames: true
        });
    });
}
// contextMenus API may be unavailable, e.g. on Firefox for Android.
if (chrome.contextMenus) {
    chrome.contextMenus.onClicked.addListener(function(info) {
        if (info.menuItemId === CONTEXTMENU_ID_USE_ANCHOR_TEXT) {
            chrome.storage.sync.set({
                useAnchorText: info.checked,
            });
        }
    });
    chrome.runtime.onInstalled.addListener(getPrefsAndUpdateMenu);
    chrome.runtime.onStartup.addListener(getPrefsAndUpdateMenu);
    chrome.storage.onChanged.addListener(function(changes) {
        if (changes.useAnchorText) {
            updateMenu(changes.useAnchorText.newValue);
        }
    });
}
chrome.notifications.onClicked.addListener(function(notificationId) {
    chrome.notifications.clear(notificationId);
});

function getPrefsAndUpdateMenu() {
    // Keep defaults in sync with toggle-anchors.js and options.js
    chrome.storage.sync.get({
        useAnchorText: true,
    }, function(items) {
        updateMenu(items.useAnchorText);
    });
}

function updateMenu(useAnchorText) {
    chrome.contextMenus.create({
        id: CONTEXTMENU_ID_USE_ANCHOR_TEXT,
        type: 'checkbox',
        title: 'Show full #anchor text',
        checked: useAnchorText,
        contexts: ['browser_action'],
    }, function() {
        if (chrome.runtime.lastError) {
            // An error occurred. Menu already exists.
            chrome.contextMenus.update(CONTEXTMENU_ID_USE_ANCHOR_TEXT, {
                checked: useAnchorText,
            });
        }
    });
}
