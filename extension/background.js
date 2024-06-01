'use strict';
var CONTEXTMENU_ID_USE_ANCHOR_TEXT = 'contextMenus.useAnchorText';

chrome.action.onClicked.addListener(function(tab) {
    toggleAnchors(tab.id);
});
async function toggleAnchors(tabId) {
    var target = {
        tabId,
        allFrames: true,
    };
    let results;
    try {
        results = await chrome.scripting.executeScript({
            target,
            files: ['toggle-anchors.js'],
        });
    } catch (e) {
        console.error('executeScript failed:' + e.message);
        await chrome.notifications.create('informative-message', {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icon128.png'),
            title: 'Display #Anchors failed',
            message: 'Cannot read links in the current tab (access denied).',
        });
        return;
    }
    if (results.some(r => r.result === true)) {
        await chrome.scripting.insertCSS({
            target,
            files: ['toggle-anchors.css'],
        });
    }
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
        contexts: ['action'],
    }, function() {
        if (chrome.runtime.lastError) {
            // An error occurred. Menu already exists.
            chrome.contextMenus.update(CONTEXTMENU_ID_USE_ANCHOR_TEXT, {
                checked: useAnchorText,
            });
        }
    });
}
