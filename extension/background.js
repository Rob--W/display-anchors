'use strict';
var CONTEXTMENU_ID_USE_ANCHOR_TEXT = 'contextMenus.useAnchorText';
var CONTEXTMENU_ID_XORIGIN_FRAMES = 'contextMenus.includeCrossOriginFrames';
// activeTab enables access to same-origin frames. Need <all_urls> for more:
let permissions = {
    origins: ['<all_urls>'],
};

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
        if (info.menuItemId === CONTEXTMENU_ID_XORIGIN_FRAMES) {
            onUserToggledPermissionsInMenu(info.checked);
        }
    });
    chrome.runtime.onInstalled.addListener(getPrefsAndUpdateMenu);
    chrome.runtime.onStartup.addListener(getPrefsAndUpdateMenu);
    chrome.storage.onChanged.addListener(function(changes) {
        if (changes.useAnchorText) {
            updateMenu(changes.useAnchorText.newValue);
        }
    });
    chrome.permissions.onAdded.addListener(renderPermissions);
    chrome.permissions.onRemoved.addListener(renderPermissions);
}
chrome.notifications.onClicked.addListener(function(notificationId) {
    chrome.notifications.clear(notificationId);
});

function getPrefsAndUpdateMenu() {
    renderPermissions();
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
async function renderPermissions() {
    let checked = await chrome.permissions.contains(permissions);
    chrome.contextMenus.create({
        id: CONTEXTMENU_ID_XORIGIN_FRAMES,
        type: 'checkbox',
        title: 'Enable anchors in cross-origin frames',
        checked,
        contexts: ['action'],
    }, function() {
        if (chrome.runtime.lastError) {
            // An error occurred. Menu already exists.
            chrome.contextMenus.update(CONTEXTMENU_ID_XORIGIN_FRAMES, {
                checked,
            });
        }
    });
}
async function onUserToggledPermissionsInMenu(wantsPermission) {
    if (wantsPermission) {
        // Unchecked until granted.
        chrome.contextMenus.update(CONTEXTMENU_ID_XORIGIN_FRAMES, {
            checked: false,
        });
        await chrome.permissions.request(permissions);
        renderPermissions();
    } else {
        await chrome.permissions.remove(permissions);
    }
}
