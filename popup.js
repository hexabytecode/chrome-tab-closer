document.getElementById("close-tab").addEventListener("click", () => {
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
    chrome.alarms.create(`updateBadge-closeTab-${endTime}`, {
      when: Date.now() + 60000,
    });

    updateTimerDisplay(endTime);
    alert(`Tab will be closed in ${time} minutes.`);
  });
});

document.getElementById("close-window").addEventListener("click", () => {
  const time = parseInt(document.getElementById("time").value, 10);
  if (isNaN(time) || time <= 0) {
    alert("Please enter a valid time in minutes");
    return;
  }

  const endTime = Date.now() + time * 60000;
  chrome.alarms.create("closeWindow", { when: endTime });
  chrome.alarms.create("minimizeWindow-window", { when: Date.now() + 5000 });
  chrome.alarms.create(`updateBadge-closeWindow-${endTime}`, {
    when: Date.now() + 60000,
  });

  updateTimerDisplay(endTime);
  alert(`Window will be closed in ${time} minutes.`);
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
