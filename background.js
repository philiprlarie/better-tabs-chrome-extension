/* globals chrome */

// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
chrome.commands.onCommand.addListener(function(command) {
  chrome.tabs.query({ currentWindow: true }, function(tabs) {
    // Sort tabs according to their index in the window.
    tabs.sort((a, b) => a.index - b.index);
    let activeIndex = tabs.findIndex(tab => tab.active);
    let activeTab = tabs[activeIndex];
    let activeId = activeTab.id;

    if (command === 'close-current-tab') {
      if (activeTab.pinned) {
        return;
      }

      if (tabs.length === 1) {
        chrome.tabs.remove(activeId);
      } else if (activeIndex === tabs.length - 1) {
        // active tab is right-most: remove current tab and activate tab to left
        chrome.tabs.update(tabs[activeIndex - 1].id, { active: true }, () => {
          chrome.tabs.remove(activeId);
        });
      } else {
        // remove current tab and activate tab to right
        chrome.tabs.update(tabs[activeIndex + 1].id, { active: true }, () => {
          chrome.tabs.remove(activeId);
        });
      }
    }
    if (command === 'add-a-new-tab') {
      chrome.tabs.create({ index: activeIndex + 1 });
    }
  });
});

chrome.windows.onCreated.addListener(function(window) {
  chrome.windows.getAll(function(windows) {
    if (windows.length === 1) {
      chrome.tabs.query({ windowId: window.id }, function(tabs) {
        chrome.storage.sync.get(['preferredPinnedUrl'], function({
          preferredPinnedUrl
        }) {
          if (!preferredPinnedUrl) {
            return;
          }

          const tabAlreadyPinned = tabs.some(tab => tab.pinned);

          if (!tabAlreadyPinned) {
            const urlsToPin = preferredPinnedUrl.split(',');

            urlsToPin.forEach(url => {
              chrome.tabs.create(
                {
                  windowId: window.id,
                  url,
                  pinned: true
                },
                closeAllNewTabs
              );
            });
          } else {
            closeAllNewTabs();
          }
        });
      });
    }
  });
});

function closeAllNewTabs() {
  chrome.tabs.query({}, function(tabs) {
    tabs
      .filter(tab => {
        return (
          tab.pendingUrl === 'chrome://newtab/' ||
          tab.url === 'chrome://newtab/'
        );
      })
      .forEach(newTab => {
        chrome.tabs.remove(newTab.id);
      });
  });
}
