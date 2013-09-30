/* globals chrome, alert */
'use strict';
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, {
        file: 'toggle-anchors.js',
        allFrames: true
    }, function(result) {
        if (chrome.runtime.lastError) {
            alert(chrome.runtime.lastError.message);
            return;
        }
        if (!result || result.indexOf(true) === -1) {
            return;
        }
        chrome.tabs.insertCSS(tab.id, {
            file: 'toggle-anchors.css',
            allFrames: true
        });
    });
});

