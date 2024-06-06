chrome.runtime.onInstalled.addListener(() => {
  console.log("Auto Close Tab extension installed");
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("closeTab")) {
    const tabId = parseInt(alarm.name.split("-")[1], 10);
    chrome.tabs.remove(tabId, () => {
      notifyTabClose();
    });
  } else if (alarm.name === "closeWindow") {
    chrome.windows.getCurrent((window) => {
      chrome.windows.remove(window.id);
    });
  } else if (alarm.name.startsWith("minimizeWindow")) {
    chrome.windows.update(parseInt(alarm.name.split("-")[1], 10), {
      state: "minimized",
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("updateBadge")) {
    const [_, type, endTime] = alarm.name.split("-");
    const remainingTime = Math.max(0, parseInt(endTime, 10) - Date.now());
    if (remainingTime > 0) {
      chrome.action.setBadgeText({
        text: `${Math.ceil(remainingTime / 60000)}`,
      });
      chrome.alarms.create(alarm.name, { when: Date.now() + 60000 });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  }
});

function notifyTabClose() {
  chrome.storage.sync.get(["showCloseNotification"], (result) => {
    if (result.showCloseNotification !== false) {
      chrome.notifications.create(
        {
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "Tab Closed",
          message: "The tab was closed, so the timer was voided.",
          buttons: [{ title: "Don't remind me again" }],
        },
        (notificationId) => {
          chrome.notifications.onButtonClicked.addListener(
            (notifId, btnIdx) => {
              if (notifId === notificationId && btnIdx === 0) {
                chrome.storage.sync.set({ showCloseNotification: false });
              }
            }
          );
        }
      );
    }
  });
}
