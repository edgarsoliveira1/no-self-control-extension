var notificationID = null,
  timeIntervalMessage = {
    work: notification('Work done!', 'You WORK has worked hard, now take a BREAK.'),
    break: notification('Go back to WORK!', 'After this little BREAK you are ready to WORK hard.'),
    longBreak: notification('Go and WORK hard!', 'this long break must have filled you with determination.'),
    test: notification('Test Title', 'Test Content'),
  };

function notification(title, content) {
  return { title, content };
}

// When the state change
chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === 'state') { // on state change

      //if the current intervel is equal to 'work' enable the site block
      chrome.storage.local.set({ enabled: (newValue.interval === 'work') });

      // verify if it's running so:
      if (newValue.running) {
        var notificationMess = timeIntervalMessage[newValue.interval];
        // set timeout to  when the time is over:
        notificationID = setTimeout(function() {
          // show a notification
          chrome.notifications.create({
            'type': 'basic',
            'iconUrl': 'img/tomato48.png',
            'title': notificationMess.title,
            'message': notificationMess.content
          });
          // and stop the clock
          newValue.running = false;
          newValue.timeLeft = 0;
          chrome.storage.local.set({ 'state': newValue }, function() {
            console.log('State is storaged as:', newValue);
          });
        }, newValue.timeLeft);
      } else { // if is not running:
        // check if if there's a timeout ON and stop it
        if (notificationID) {
          clearTimeout(notificationID);
          notificationID = null;
        }
      }
    }
  }
});

// this is the part of the code that block sites
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.get(['blocked', 'enabled'], function(local) {
    if (!Array.isArray(local.blocked)) {
      chrome.storage.local.set({ blocked: [] });
    }

    if (typeof local.enabled !== 'boolean') {
      chrome.storage.local.set({ enabled: false });
    }
  });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  const url = changeInfo.pendingUrl || changeInfo.url;
  if (!url || !url.startsWith('http')) {
    return;
  }

  const hostname = new URL(url).hostname;
  console.log(hostname);

  chrome.storage.local.get(['blocked', 'enabled'], function(local) {
    const { blocked, enabled } = local;
    if (Array.isArray(blocked) && enabled && blocked.find(domain => hostname.includes(domain))) {
      chrome.tabs.update(tabId, { url: "on_block/index.html" });
    }
  });
});


/*
Log that we received the message.
Then display a notification. The notification contains the URL,
which we read from the message.
*/
function notify(message) {
  console.log('background script received message');
  var title = chrome.i18n.getMessage('notificationTitle');
  var content = chrome.i18n.getMessage('notificationContent', message.url);
  chrome.notifications.create({
    'type': 'basic',
    'iconUrl': chrome.extension.getURL('icons/link-48.png'),
    'title': title,
    'message': content
  });
}

/*
Assign `notify()` as a listener to messages from the content script.
*/
chrome.runtime.onMessage.addListener(notify);