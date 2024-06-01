# Display #Anchors

**Display #Anchors** is a browser extension with a single purpose: It offers an easy way to see
all (invisible) anchors in a page, to make it easier to link to a specific part of a webpage.

- Chrome Web store: https://chromewebstore.google.com/detail/display-anchors/poahndpaaanbpbeafbkploiobpiiieko
- Firefox: https://addons.mozilla.org/firefox/addon/display-_anchors

## Features

- Finds all anchors in a page and shows a marker next to it.
- Does not alter the layout; so no jumpy pages or expensive repaints.
- The anchored content is highlighted on Hover over the marker.
- The marker is highlighted on hover over the anchored content.
- Click on the toolbar button to remove all markers.
- The extension consumes no memory until it's actually used (using an event page).

## Customization

### Shortcut

1. Visit `chrome://extensions/configureCommands`
2. Click on the input field at "Display #Anchors" (by default, it is "Alt + Shift + A").
3. Press the keys for the desired shortcut (e.g. Ctrl + Shift + L).
4. From now on, you can use the chosen shortcut to toggle anchors.

In Firefox, step 1 is: visit `about:addons`, click on Gears icon, then "Manage Extension Shortcuts".

### Custom anchor text
By default, the anchor is used as a label for the link. You may also opt in for a fixed value, as follows:

1. Right-click on the "#" button in the toolbar.
2. Toggle the "Show full #anchor text" menu item.
3. If the menu item is unchecked, then a paragraph symbol ("¶") is used.

If you prefer a different label, visit the options page, set a different value and save the changes.

### Cross-origin frames
Some websites may embed external content within the document, in a "cross-origin" frame. By default,
the browser allows the extension to access the top-level document and "same-origin" frames. Access
to cross-origin frames is restricted by default. If you would like to see anchors in cross-origin
frames:

1. Right-click on the "#" button in the toolbar.
2. Check the "Enable anchors in cross-origin frames" menu item.
3. In the permission prompt, grant the request for access to all websites.

This option is also available at the options page.


## History
Before creating this extension, I've been using the "Display Anchors" feature of Chris Pederick's
["Web Developer" extension for Chrome](https://chrome.google.com/webstore/detail/bfbameneiokkgbdmiekhjnmfkcnldhhm).
An unfortunate "feature" of this implementation is that the markers cause changes to the layout, resulting in some
loss of time to find the position of the page before activating the anchors (and a broken layout looks ugly).
Besides that, the extension had too much overhead (it activates on every page, and consumes memory even when I did
not use it). This encouraged me to develop a new extension that offers the desired feature in an optimal way.


## Copyright

(c) 2013 - 2024 Rob Wu <rob@robwu.nl> (https://robwu.nl/)
