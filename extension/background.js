/* globals chrome */
'use strict';
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, {
        file: 'toggle-anchors.js',
        allFrames: true
    }, function(result) {
        if (!result || result.indexOf(true) === -1) {
            return;
        }
        chrome.tabs.insertCSS(tab.id, {
            file: 'toggle-anchors.css',
            allFrames: true
        });
    });
});

