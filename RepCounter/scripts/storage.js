// Save Settings of settings.html
function saveSettings() {
    
    // Save Settings-Menu in localStorage:
    localStorage.setItem('sound', soundIsOn);
    localStorage.setItem('theme', theme);
    
    // #TODO (still Bugging)
    // // save timer data:
    // currentTimer = {timer: timer, seconds: seconds, minutes: minutes, timerStarted: timerStarted};
    // // because string
    // localStorage.setItem('timer', JSON.stringify(currentTimer));

    // save counter data:
    localStorage.setItem('counter', counter);

}



// main load-function:
function loadSettings() {
    // load Settings-Menu:
    soundIsOn = localStorage.getItem('sound') === 'true';
    theme = localStorage.getItem('theme');
    loadTheme();
    loadLockedButtons();
    // loadTimerData(); #TODO (still Bugging)
    loadCounterData();
}

function loadTheme() {
    if(theme === "dark") {
        applyDarkTheme();
    } else {
        applyLightTheme();
    }
}

function loadLockedButtons(){
    if(soundIsOn) {
        document.getElementById("soundOn").classList.add('locked');
    } else {
        document.getElementById("soundOff").classList.add('locked');
    }

    if(theme === "dark") {
        document.getElementById("darkTheme").classList.add('locked');
    } else {
        document.getElementById("lightTheme").classList.add('locked');
    }

}

// still BUGGING #TODO
// function loadTimerData () {
//     currentTimer = JSON.parse(localStorage.getItem('timer')); // parse to JSON from string
//     timer = parseInt(currentTimer.timer);
//     seconds = parseInt(currentTimer.seconds);
//     minutes = parseInt(currentTimer.minutes);
//     timerStarted = currentTimer.timerStarted === 'true';
// }

function loadCounterData() {
    counter = parseInt(localStorage.getItem('counter'));
    reps.innerHTML = counter; 
}