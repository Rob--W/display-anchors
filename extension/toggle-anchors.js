"use strict";
(function() {

// Default placement:
// ------------------A <-- element with id or name attribute ("anchor")
//           #fragment <-- aligned at the right, at the same line as the anchor.
//
// When an anchor is too small (smaller than MINIMUM_REQ_WIDTH_PX), then the
// element is aligned at the left instead of at the right. This is to make sure
// that at least a part of the anchor is visible, even if the container clips
// its content using overflow:hidden.
//                  A         <!-- anchor
//                  #fragment <!-- left-aligned link.
var MINIMUM_REQ_WIDTH_PX = 16;

// For some elements, it does not make sense to add an anchor.
var SELECTOR_ELEMENTS_WITHOUT_ANCHOR =
    // Embedded content
    'audio,applet,canvas,embed,iframe,img,math,object,svg,video,' +
    // Some interactive content where <a> as a child does not make sense.
    // Although e.g. nested <a> elements are not allowed, Firefox and Chrome
    // appears to render them just fine, with the deepest <a> being clickable.
    'input,keygen,select,textarea,' +
    // Empty elements which may be used in a special way.
    'col,meta,' +
    // Elements whose content have a special meaning.
    'noframes,noscript,script,style,template';

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

function getShadowRoot(holder) {
    // attachShadow is only allowed for whitelisted elements.
    // https://github.com/w3c/webcomponents/issues/110
    var shadowHost = document.createElement('span');
    shadowHost.style.setProperty('all', 'inherit', 'important');
    holder.appendChild(shadowHost);
    return shadowHost.attachShadow({ mode: 'open' });
}

/**
 * @param {string} anchorValue is the ID or name of the anchor element.
 * @param {Element} elem - the element to which the ID or name belongs.
 * @param {object} options - user preferences.
 * @returns {HTMLElement|null}
 */
function getAnchor(anchorValue, elem, options) {
    var holder = baseHolder.cloneNode();
    var anchor = baseAnchor.cloneNode();
    var shadow = getShadowRoot(holder);

    holder.addEventListener('transitionend', function(event) {
        if (event.propertyName !== 'z-index') {
            return;
        }
        var elapsedTime = Math.round(event.elapsedTime * 1000);
        if (elapsedTime === 1) { // Default
            elem.removeAttribute('a-href:hover');
            anchor.style.setProperty('outline', '', 'important');
        } else if (elapsedTime === 2) { // Parent:hover
            elem.removeAttribute('a-href:hover');
            anchor.style.setProperty('outline', 'rgba(203, 145, 67, 0.90) dashed 2px', 'important');
        } else if (elapsedTime === 3) { // Anchor:hover
            elem.setAttribute('a-href:hover', '');
            anchor.style.setProperty('outline', '', 'important');
        }
    });

    var currentStyle = getComputedStyle(elem);
    if (!currentStyle) {
        return null;
    }
    var isPositioned = currentStyle.getPropertyValue('position') !== 'static'; // Neglect "inherit"
    if (isPositioned) {
        holder.style.setProperty('top', '0', 'important');
        if (elem.offsetLeft > MINIMUM_REQ_WIDTH_PX) {
            holder.style.setProperty('right', '0', 'important');
        } else {
            holder.style.setProperty('left', '0', 'important');
            anchor.style.setProperty('left', '0', 'important');
            anchor.style.setProperty('right', 'auto', 'important');
        }
        shadow.appendChild(anchor);
    } else {
        var paddingLeft = parseFloat(currentStyle.getPropertyValue('padding-left')) || 0;
        var borderLeft = parseFloat(currentStyle.getPropertyValue('border-left-width')) || 0;
        var visibleHorizontalSpace = elem.offsetLeft + elem.offsetWidth - paddingLeft - borderLeft;
        if (visibleHorizontalSpace < MINIMUM_REQ_WIDTH_PX) {
            anchor.style.setProperty('left', '0', 'important');
            anchor.style.setProperty('right', 'auto', 'important');
            shadow.appendChild(anchor);
        } else {
            var wrappr = baseWrappr.cloneNode();
            var paddingTop = parseFloat(currentStyle.getPropertyValue('padding-top')) || 0;
            wrappr.style.setProperty('top', (-paddingTop) + 'px', 'important');
            wrappr.style.setProperty(
                'left', (elem.offsetWidth - paddingLeft - borderLeft) + 'px', 'important');
            wrappr.appendChild(anchor);
            shadow.appendChild(wrappr);
        }
    }

    anchor.href = baseURI + '#' + anchorValue;
    anchor.textContent = options.useAnchorText ? '#' + anchorValue : options.customTextValue;
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

/**
 * @param {object} options - user preferences.
 */
function addAllAnchors(options) {
    var elems = (document.body || document.documentElement).querySelectorAll('[id],[name]');
    var elem;
    var length = elems.length;
    var anchors = new Array(length);
    var parentNodes = new Array(length);
    var nextSiblings = new Array(length);
    // First generate the elements...
    for (var i = 0; i < length; ++i) {
        elem = elems[i];
        if (!elem.closest(SELECTOR_ELEMENTS_WITHOUT_ANCHOR)) {
            // Ignore <param name="..." value="..."> etc.
            var anchorValue = elem.id || elem.name;
            if (anchorValue && (elem = getInsertionPoint(elem))) {
                parentNodes[i] = elem;
                nextSiblings[i] = elem.firstChild;
                anchors[i] = getAnchor(anchorValue, elem, options);
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
    default:
        return element;
    }
}


function showAllAnchors() {
    var defaultConfig = {
        useAnchorText: true,
        customTextValue: '\xb6', // paragraph symbol.
    };
    if (typeof chrome === 'object' && chrome && chrome.storage) {
        // storage-sync-polyfill.js is not loaded, so storage.sync may be unset,
        var storageArea = chrome.storage.sync || chrome.storage.local;
        // Keep defaults in sync with background.js and options.js
        storageArea.get(defaultConfig, function(items) {
            if (items) {
                addAllAnchors(items);
            } else {
                // Fall back from storage.sync to storage.local.
                chrome.storage.local.get(defaultConfig, function(items) {
                    addAllAnchors(items || defaultConfig);
                });
            }
        });
    } else {
        addAllAnchors(defaultConfig);
    }
}
// Content script activated programmatically. So, do something (toggle):
removeAllAnchors();
if (!window.hasShown) {
    showAllAnchors();
}
window.hasShown = !window.hasShown;
// When a frame was (re)loaded later, its state may be out of sync with the top
// frame. hide-anchors.js is then run to fix up the state, which relies on
// window.hasShown and window.removeAllAnchors().
window.removeAllAnchors = removeAllAnchors;
// When cross-origin access was temporarily revoked, the anchors toggled, then
// shown again, then the cross-origin frame may go out of sync at the next
// click. We fix that up with show-anchors.js, which calls showAllAnchors().
window.showAllAnchors = showAllAnchors;

// Used to communicate to the background whether the CSS file needs to be inserted.
if (window.hasrun) {
    return window.hasShown ? "shown" : "hidden";
} else {
    window.hasrun = true;
    return "shown1";
}
})();
