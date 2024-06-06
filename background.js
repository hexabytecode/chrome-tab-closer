chrome.runtime.onInstalled.addListener(() => {
  console.log("Auto Close Tab extension installed");
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("closeTab")) {
    const tabId = parseInt(alarm.name.split("-")[1], 10);
    chrome.tabs.remove(tabId);
  } else if (alarm.name === "closeWindow") {
    chrome.windows.getCurrent((window) => {
      chrome.windows.remove(window.id);
    });
  }
});
