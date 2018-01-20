/* globals chrome */

// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
chrome.commands.onCommand.addListener(function(command) {
  chrome.tabs.query({ currentWindow: true }, function(tabs) {
    // Sort tabs according to their index in the window.
    tabs.sort((a, b) => a.index - b.index);
    let activeIndex = tabs.findIndex(tab => tab.active);
    let activeId = tabs[activeIndex].id;

    if (command === 'close-current-tab') {
      if (tabs.length === 1) {
        // removing last tab, closes tab and opens newtab page so window does not close
        chrome.tabs.create({}, () => {
          chrome.tabs.remove(activeId);
        });
      } else if (activeIndex === 0) {
        // removing first tab in list is special case
        chrome.tabs.remove(activeId);
      } else {
        // default case, remove current tab and activate tab to left
        chrome.tabs.update(tabs[activeIndex - 1].id, { active: true }, () => {
          chrome.tabs.remove(activeId);
        });
      }
    }
    if (command === 'add-a-new-tab') {
      chrome.tabs.create({ index: activeIndex + 1 });
    }
  });
});
