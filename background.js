var notificationID = null,
  timeIntervalMessage = {
    work: notification("Work done!", "You WORK has worked hard, now take a BREAK."),
    break: notification("Go back to WORK!", "After this little BREAK you are ready to WORK hard."),
    longBreak: notification("Go and WORK hard!", "this long break must have filled you with determination."),
    test: notification("Test Title", "Test Content"),
  };

function notification(title, content) {
  return { title, content };
}


chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {

    if (key === "state") {
      //clean last notification timeout if it exists
      if (notificationID) {
        clearTimeout(notificationID);
        notificationID = null;
      }
      //if is running set timeout to show a notification on the end of 'timeLeft'
      if (newValue.running) {
        var notificationMess = timeIntervalMessage[newValue.interval];
        notificationID = setTimeout(function () {
          //show the notification depending on the type of interval
          chrome.notifications.create({
            "type": "basic",
            "iconUrl": "img/tomato48.png",
            "title": notificationMess.title,
            "message": notificationMess.content
          });
          //stop the clock from keep running over negative time (because that makes no sense)
          newValue.running = false;
          newValue.timeLeft = 0;
          chrome.storage.local.set({ 'state': newValue }, function () {
            console.log("State is storaged as:", newValue);
          });
        }, newValue.timeLeft);
      }
    }

    //test: checking values
    //console.log(
    //`Storage key "${key}" in namespace "${namespace}" changed.`,
    //`Old value was "${oldValue}", new value is "${newValue}".`
    //);
  }
});


//browser.runtime.onInstalled.addListener(function () {
//browser.storage.local.get(["blocked", "enabled"], function (local) {
//if (!Array.isArray(local.blocked)) {
//browser.storage.local.set({ blocked: [] });
//}

//if (typeof local.enabled !== "boolean") {
//browser.storage.local.set({ enabled: false });
//}
//});
//});

//browser.tabs.onUpdated.addListener(function (tabId, changeInfo) {
//const url = changeInfo.pendingUrl || changeInfo.url;
//if (!url || !url.startsWith("http")) {
//return;
//}

//const hostname = new URL(url).hostname;

//browser.storage.local.get(["blocked", "enabled"], function (local) {
//const { blocked, enabled } = local;
//if (Array.isArray(blocked) && enabled && blocked.find(domain => hostname.includes(domain))) {
//browser.tabs.remove(tabId);
//}
//});
//});




///*
//Log that we received the message.
//Then display a notification. The notification contains the URL,
//which we read from the message.
//*/
//function notify(message) {
//console.log("background script received message");
//var title = browser.i18n.getMessage("notificationTitle");
//var content = browser.i18n.getMessage("notificationContent", message.url);
//browser.notifications.create({
//"type": "basic",
//"iconUrl": browser.extension.getURL("icons/link-48.png"),
//"title": title,
//"message": content
//});
//}

///*
//Assign `notify()` as a listener to messages from the content script.
//*/
//browser.runtime.onMessage.addListener(notify);
