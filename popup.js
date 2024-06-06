document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["timers"], (result) => {
    const timers = result.timers || {};
    const alarmNames = Object.keys(timers);
    if (alarmNames.length > 0) {
      const [alarmName, endTime] = alarmNames[0].split("-");
      updateTimerDisplay(parseInt(endTime, 10));
    }
  });
});

document.getElementById("start-timer").addEventListener("click", () => {
  const time = parseInt(document.getElementById("time").value, 10);
  if (isNaN(time) || time <= 0) {
    alert("Please enter a valid time in minutes");
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    const alarmName = `closeTab-${tabId}`;
    const endTime = Date.now() + time * 60000;
    chrome.alarms.create(alarmName, { when: endTime });
    chrome.alarms.create(`minimizeWindow-${tabId}`, {
      when: Date.now() + 5000,
    });
    chrome.alarms.create(`updateBadge-${endTime}`, {
      when: Date.now() + 60000,
    });

    updateTimerDisplay(endTime);
    storeTimer(alarmName, endTime);
    alert(`Tab will be closed in ${time} minutes.`);
  });
});

document.getElementById("stop-timer").addEventListener("click", () => {
  chrome.alarms.clearAll(() => {
    clearBadgeText();
    removeAllTimers();
    alert("Timer stopped.");
  });
});

document.getElementById("cancel-timer").addEventListener("click", () => {
  chrome.alarms.clearAll(() => {
    clearBadgeText();
    removeAllTimers();
    alert("Timer cancelled.");
  });
});

function updateTimerDisplay(endTime) {
  const timerElement = document.getElementById("timer");
  function update() {
    const remainingTime = Math.max(0, endTime - Date.now());
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    timerElement.textContent = `${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
    if (remainingTime > 0) {
      requestAnimationFrame(update);
    } else {
      timerElement.textContent = "";
    }
  }
  update();
}

function storeTimer(alarmName, endTime) {
  chrome.storage.sync.get(["timers"], (result) => {
    const timers = result.timers || {};
    timers[alarmName] = endTime;
    chrome.storage.sync.set({ timers });
  });
}

function removeAllTimers() {
  chrome.storage.sync.set({ timers: {} });
}

function clearBadgeText() {
  chrome.action.setBadgeText({ text: "" });
}
