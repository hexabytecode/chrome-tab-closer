document.getElementById("close-tab").addEventListener("click", () => {
  const time = parseInt(document.getElementById("time").value, 10);
  if (isNaN(time) || time <= 0) {
    alert("Please enter a valid time in minutes");
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.alarms.create(`closeTab-${tabId}`, { delayInMinutes: time });
    alert(`Tab will be closed in ${time} minutes.`);
  });
});

document.getElementById("close-window").addEventListener("click", () => {
  const time = parseInt(document.getElementById("time").value, 10);
  if (isNaN(time) || time <= 0) {
    alert("Please enter a valid time in minutes");
    return;
  }

  chrome.alarms.create("closeWindow", { delayInMinutes: time });
  alert(`Window will be closed in ${time} minutes.`);
});
