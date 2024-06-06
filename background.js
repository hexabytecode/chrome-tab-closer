chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ timers: {} });
  chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  const [type, id] = alarm.name.split("-");

  if (type === "closeTab") {
    chrome.tabs.remove(parseInt(id, 10), () => {
      notifyTabClose();
      clearBadgeText();
      removeTimer(alarm.name);
    });
  } else if (type === "closeWindow") {
    chrome.windows.getCurrent((window) => {
      chrome.windows.remove(window.id);
      clearBadgeText();
      removeTimer(alarm.name);
    });
  } else if (type === "updateBadge") {
    updateBadgeText(alarm.name, id);
  } else if (type === "minimizeWindow") {
    chrome.windows.update(parseInt(id, 10), { state: "minimized" });
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

function updateBadgeText(alarmName, endTime) {
  const remainingTime = Math.max(0, parseInt(endTime, 10) - Date.now());
  if (remainingTime > 0) {
    const minutes = Math.ceil(remainingTime / 60000);
    chrome.action.setBadgeText({ text: `${minutes}` });
    chrome.alarms.create(alarmName, { when: Date.now() + 60000 });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
}

function clearBadgeText() {
  chrome.action.setBadgeText({ text: "" });
}

function removeTimer(alarmName) {
  chrome.storage.sync.get(["timers"], (result) => {
    const timers = result.timers || {};
    delete timers[alarmName];
    chrome.storage.sync.set({ timers });
  });
}
