/* globals chrome */

// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
chrome.commands.onCommand.addListener(function(command) {
  chrome.tabs.query({ currentWindow: true }, function(tabs) {
    // Sort tabs according to their index in the window.
    tabs.sort((a, b) => a.index - b.index);
    let activeIndex = tabs.findIndex(tab => tab.active);
    let lastTabIndex = tabs.length - 1;
    let activeId = tabs[activeIndex].id;

    if (command === 'close-current-tab') {
      if (tabs.length === 1) {
        chrome.tabs.create({}, () => {
          chrome.tabs.remove(activeId);
        });
      } else if (activeIndex === lastTabIndex) {
        chrome.tabs.remove(activeId);
      } else {
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
