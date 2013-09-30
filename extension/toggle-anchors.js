(function() {
/* jshint browser:true, maxlen:100 */
'use strict';

// Prefer "#anchor", and only use /pathname?query#anchor if base-href is set.
// #anchor is preferred to deal correctly with pages that use the history API to rewrite the URL.
var baseURI = document.querySelector('base[href]') ? location.pathname + location.search : '';

// Non-standard HTML element to avoid collisions with page's scripts
// Hey, this name is so exotic that it must be unique ;)
var baseHolder = document.createElement(':a.href:');
var baseWrappr = document.createElement('span');
var baseAnchor = document.createElement('a');

baseWrappr.style.cssText =
    'position: absolute;' +
    'top: 0;';
baseAnchor.style.cssText =
    'position: absolute;' +
    'right: 0;' + // Grow element in left direction (to avoid horizontal scrollbars)
    'display: inline-block;' +
    'white-space: pre;' +
    'margin-top: -2px;' +
    'padding: 2px 4px;' +
    'background-color: rgba(255, 255, 255, 0.9);' +
    (baseAnchor.style.transform === '' ? '' : '-webkit-') + 'transform: none !important;'
    ;

function stopPropagation(event) {
    event.stopPropagation();
}

function getAnchor(elem) {
    var anchorValue = elem.id || elem.name;
    if (!anchorValue) return;

    var holder = baseHolder.cloneNode();
    var wrappr = baseWrappr.cloneNode();
    var anchor = baseAnchor.cloneNode();
    var shadow = holder.createShadowRoot ? holder.createShadowRoot() :
                                           holder.webkitCreateShadowRoot();
    shadow.resetStyleInheritance = true;

    var paddingLeft = parseFloat(getComputedStyle(elem).getPropertyValue('padding-left')) || 0;
    wrappr.style.left = (elem.offsetWidth - paddingLeft) + 'px';

    anchor.href = baseURI + '#' + anchorValue;
    anchor.textContent = '#' + anchorValue;
    anchor.addEventListener('click', stopPropagation);
    anchor.addEventListener('dblclick', stopPropagation);
    anchor.addEventListener('mousedown', stopPropagation);

    wrappr.appendChild(anchor);
    shadow.appendChild(wrappr);
    return holder;
}

function removeAllAnchors() {
    [].forEach.call(document.body.querySelectorAll('\\:a\\.href\\:'), function(elem) {
        elem.parentNode.removeChild(elem);
    });
}

function addAllAnchors() {
    var elems = document.querySelectorAll('[id],[name]');
    var length = elems.length;
    var anchors = [];
    // First generate the elements...
    for (var i = 0; i < length; ++i) {
        anchors.push(getAnchor(elems[i]));
    }
    // ... then insert them the elements
    // Not doing this causes a repaint for every element
    for (i = 0; i < length; ++i) {
        var elem = elems[i];
        elem.insertBefore(anchors[i], elem.firstChild);
    }
}


// Content script is programatically activated. So, do something (toggle):
removeAllAnchors();
if (!window.hasShown) {
    addAllAnchors();
}
window.hasShown = !window.hasShown;

// Used to communicate to the background whether the CSS file needs to be inserted.
if (window.hasrun) {
    return false;
} else {
    window.hasrun = true;
    return true;
}
})();
