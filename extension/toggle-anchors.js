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
    'background-color: rgba(255, 255, 255, 0.9);'
    ;

function stopPropagation(event) {
    event.stopPropagation();
}

/**
 * @param {string} anchorValue is the ID or name of the anchor element.
 */
function getAnchor(anchorValue, elem) {
    var holder = baseHolder.cloneNode();
    var anchor = baseAnchor.cloneNode();
    var shadow = holder.createShadowRoot ? holder.createShadowRoot() :
                                           holder.webkitCreateShadowRoot();
    shadow.resetStyleInheritance = true;

    holder.addEventListener('transitionend', function(event) {
        if (event.propertyName !== 'z-index') {
            return;
        }
        var elapsedTime = event.elapsedTime;
        if (elapsedTime === 0.001) { // Default
            elem.removeAttribute('a-href:hover');
            anchor.style.outline = '';
        } else if (elapsedTime === 0.002) { // Parent:hover
            elem.removeAttribute('a-href:hover');
            anchor.style.outline = 'rgba(203, 145, 67, 0.90) dashed 2px';
        } else if (elapsedTime === 0.003) { // Anchor:hover
            elem.setAttribute('a-href:hover', '');
            anchor.style.outline = '';
        }
    });

    var currentStyle = getComputedStyle(elem);
    var isPositioned = currentStyle.getPropertyValue('position') !== 'static'; // Neglect "inherit"
    if (isPositioned) {
        holder.style.setProperty('top', '0', 'important');
        holder.style.setProperty('right', '0', 'important');
        shadow.appendChild(anchor);
    } else {
        var paddingTop = parseFloat(currentStyle.getPropertyValue('padding-top')) || 0;
        var paddingLeft = parseFloat(currentStyle.getPropertyValue('padding-left')) || 0;
        var borderLeft = parseFloat(currentStyle.getPropertyValue('border-left-width')) || 0;
        var wrappr = baseWrappr.cloneNode();
        wrappr.style.top = (-paddingTop) + 'px';
        wrappr.style.left = (elem.offsetWidth - paddingLeft - borderLeft) + 'px';
        wrappr.appendChild(anchor);
        shadow.appendChild(wrappr);
    }

    anchor.href = baseURI + '#' + anchorValue;
    anchor.textContent = '#' + anchorValue;
    anchor.addEventListener('click', stopPropagation);
    anchor.addEventListener('dblclick', stopPropagation);
    anchor.addEventListener('mousedown', stopPropagation);

    return holder;
}

function removeAllAnchors() {
    [].forEach.call(document.body.querySelectorAll('\\:a\\.href\\:'), function(elem) {
        elem.parentNode.removeChild(elem);
    });
}

var matchesSelector;
['webkitM', 'm'].some(function(prefix) {
    var name = prefix + 'atches';
    if (name in document.documentElement) matchesSelector = name;
    name += 'Selector';
    if (name in document.documentElement) matchesSelector = name;
    return matchesSelector; // If found, then truthy, and [].some() ends.
});

function addAllAnchors() {
    var elems = (document.body || document.documentElement).querySelectorAll('[id],[name]');
    var elem;
    var length = elems.length;
    var anchors = new Array(length);
    var parentNodes = new Array(length);
    var nextSiblings = new Array(length);
    // First generate the elements...
    for (var i = 0; i < length; ++i) {
        elem = elems[i];
        if (!elem[matchesSelector]('object *, applet *')) {
            // Ignore <param name="..." value="..."> etc.
            var anchorValue = elem.id || elem.name;
            if (anchorValue && (elem = getInsertionPoint(elem))) {
                parentNodes[i] = elem;
                nextSiblings[i] = elem.firstChild;
                anchors[i] = getAnchor(anchorValue, elem);
            }
        }
    }
    // ... then insert them the elements
    // Not doing this causes a repaint for every element
    for (i = 0; i < length; ++i) {
        if (anchors[i]) {
            parentNodes[i].insertBefore(anchors[i], nextSiblings[i]);
        }
    }
}

function getInsertionPoint(element) {
    switch (element.tagName.toUpperCase()) {
    case 'TABLE':
    case 'THEAD':
    case 'TBODY':
    case 'TFOOT':
        return element.rows[0] && element.rows[0].cells[0];
    case 'TR':
        return element.cells[0];
    case 'INPUT':
    case 'TEXTAREA':
        // TODO: Add more replaced elements?
        return null;
    default:
        return element;
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
