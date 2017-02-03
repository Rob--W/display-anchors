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
chrome.contextMenus.onClicked.addListener(function(info) {
    if (info.id === CONTEXTMENU_ID_USE_ANCHOR_TEXT) {
        chrome.storage.sync.set({
            useAnchorText: info.checked,
        });
    }
});
if (typeof browser === 'object') {
    // Firefox does not support event pages, and context menu items must be
    // registered whenever the background page loads.
    getPrefsAndUpdateMenu();
    chrome.commands.onCommand.addListener(function(command) {
        if (command === '_execute_browser_action') { // Firefox 51 and earlier.
            toggleAnchors(null);
        }
    });
} else {
    chrome.runtime.onInstalled.addListener(getPrefsAndUpdateMenu);
    chrome.runtime.onStartup.addListener(getPrefsAndUpdateMenu);
}
chrome.storage.onChanged.addListener(function(changes) {
    if (changes.useAnchorText) {
        updateMenu(changes.useAnchorText.newValue);
    }
});
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
    chrome.contextMenus.update(CONTEXTMENU_ID_USE_ANCHOR_TEXT, {
        checked: useAnchorText,
    }, function() {
        if (chrome.runtime.lastError) {
            // An error occurred. Assume that the menu does not exist.
            chrome.contextMenus.create({
                id: CONTEXTMENU_ID_USE_ANCHOR_TEXT,
                type: 'checkbox',
                title: 'Show full #anchor text',
                checked: useAnchorText,
                contexts: ['browser_action'],
            });
        }
    });
}
