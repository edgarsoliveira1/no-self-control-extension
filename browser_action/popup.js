var title = document.getElementById('title'),
  timer = document.getElementById('timer'),
  resquestID = null,
  startButton = document.getElementById('start'),
  resetButton = document.getElementById('reset'),
  blockedSitesButton = document.getElementById('blocked_sites'),
  blockSiteButton = document.getElementById('block_site'),
  intervelButtons = {
    work: document.getElementById('work'),
    break: document.getElementById('break'),
    long: document.getElementById('long'),
  },
  timeInterval = {
    work: 1000 * 60 * 25, // 25 mins
    break: 1000 * 60 * 5, // 5 mins
    long: 1000 * 60 * 15, // 15 mins
    //test: 1000 * 60 * 1, // 1 mins
  },
  worksForALongBreak = 2,
  state = {
    workCounter: 0,
    running: false,
    interval: 'work',
    timeLeft: 0,
    deadLine: 0
  };
state.timeLeft = timeInterval[state.interval];

//Everytime that the popup starts:
//----
chrome.storage.local.get(['state'], function(result) {
  state = result.state || state;
  //console.log("State setted to:", state);
  updateTimerDisplay(state.timeLeft);
  if (state.running) {
    startClock();
  }
  //if the interval is over
  if (state.timeLeft <= 0) {
    setNextInterval(state.interval);
    resetButton.onclick();
  }
});
//----

window.onblur = function() {
  saveState();
}

startButton.onclick = function() {
  //check it's running
  if (state.running) {
    stopClock();
    saveState();
    return;
  }
  //or is not running show this visually  
  startClock();
  saveState();
};

resetButton.onclick = function() {
  stopClock();
  //console.log(state.interval);
  state.timeLeft = timeInterval[state.interval];
  updateTimerDisplay(state.timeLeft);
};

blockedSitesButton.onclick = function() {
  chrome.tabs.create({ url: '/options_ui/options.html' });
}

blockSiteButton.onclick = function() {
  chrome.tabs.query({ 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
    function(tabs) {
      //get just the hostname
      var hostname = new URL(tabs[0].url).hostname;
      //check if valid
      if (!hostname)
        return;
      //add the hostname as a blocked site
      chrome.storage.local.get(['blocked'], function(result) {
        var blocked = result.blocked;
        if (Array.isArray(blocked)) {
          blocked.push(hostname);
          chrome.storage.local.set({ blocked: blocked });
        }
      });
    }
  );
}

Object.keys(intervelButtons).forEach(function(intervalKey) {
  intervelButtons[intervalKey].onclick = function() {
    state.interval = intervalKey;
    resetButton.onclick();
  }
})

function startClock() {
  startButton.innerHTML = "Stop";
  if (!state.running) {
    state.deadLine = Date.now() + state.timeLeft;
  }

  //Start Update Display Loop
  state.running = true;

  function updateTimeLeftandDisplay() {
    if (!state.running) {
      return;
    }

    state.timeLeft = state.deadLine - Date.now();
    if (state.timeLeft <= 0) {
      state.running = false;
      state.timeLeft = 0;
      setNextInterval(state.interval);
      resetButton.onclick();
      return;
    }
    updateTimerDisplay(state.timeLeft);

    requestAnimationFrame(updateTimeLeftandDisplay);
  }
  requestAnimationFrame(updateTimeLeftandDisplay);
}

function stopClock() {
  //Stop update display 
  state.running = false;
  //Change the visual
  startButton.innerHTML = "Start";
}

function msTodividedTime(ms) {
  return {
    day: Math.floor(ms / (1000 * 60 * 60 * 24)),
    hour: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minute: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
    second: Math.floor((ms % (1000 * 60)) / 1000)
  };
};

function timeToString(n) {
  if (n < 10) {
    return '0' + n;
  }
  return '' + n;
};

function updateTimerDisplay(timeLeft) {
  var time = msTodividedTime(timeLeft);
  timer.textContent = timeToString(time.minute) + ":" + timeToString(time.second);
};

function saveState() {
  chrome.storage.local.set({ 'state': state }, function() {
    //console.log("State is storaged as:", state);
  });
}

/**
 * Set the state.interval to the next interval
 * @param {String} currInterval 
 */
function setNextInterval(currInterval) {
  switch (currInterval) {
    case 'work':
      state.workCounter += 1;
      if (state.workCounter >= worksForALongBreak) {
        state.workCounter = 0;
        state.interval = 'long';
        break;
      }
      state.interval = 'break';
      break;
    case 'break':
      state.interval = 'work';
    case 'long':
      state.interval = 'work';
    default:
      state.interval = 'work';
      break;
  }
}