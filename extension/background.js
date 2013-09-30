/* globals chrome */
'use strict';
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.insertCSS(tab.id, {
        file: 'toggle-anchors.css',
        allFrames: true
    });
    chrome.tabs.executeScript(tab.id, {
        file: 'toggle-anchors.js',
        allFrames: true
    });
});
