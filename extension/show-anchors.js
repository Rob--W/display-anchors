"use strict";

// hasShown, removeAllAnchors, showAllAnchors are defined by toggle-anchors.js.
if (window.hasShown === false) {
    window.removeAllAnchors();
    window.showAllAnchors();
    window.hasShown = true;
}
