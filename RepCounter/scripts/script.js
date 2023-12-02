let counter = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadCounterData();
});

function inc(times) {
    playClickAudio();
    counter = counter + times;
    reps.innerHTML = counter;
    saveSettings();
}

function dec(times) {
    playClickAudio();
    if(counter - times > -1){
        counter = counter - times;
        
        reps.innerHTML = counter;
    }
    saveSettings();
}

function resetCounter(){
    playClickAudio();
    counter = 0;
    reps.innerHTML = counter;
    saveSettings();
}

// TIMER ------

let timer; // Variable, um Timer-Interval zu speichern
let seconds = 0;
let minutes = 0;
let timerStarted = false;

function startTimer() {
    playClickAudio();
    if (!timerStarted) {
        timer = setInterval(updateTimer, 1000); // Startet das Timer-Interval alle 1000ms (1 Sekunde)
        timerStarted = true;
    }
}

function stopTimer() {
    playClickAudio();
    clearInterval(timer); // Stoppt das Timer-Interval
    timerStarted = false;
}

function resetTimer() {
    playClickAudio();
    stopTimer(); // Stoppt den Timer, bevor er zurückgesetzt wird
    seconds = 0;
    minutes = 0;
    updateDisplay(); // Aktualisiert die Anzeige auf 00:00
}

function updateTimer() {
    seconds++;
    if (seconds === 60) {
        seconds = 0;
        minutes++;
    }

    updateDisplay(); // Aktualisiert die Anzeige bei jeder Änderung
}

function updateDisplay() {
    let text = `${padZero(minutes)} : ${padZero(seconds)}`;
    timee.innerHTML=text;
    // Hier solltest du den Code für die Anzeige in deiner Anwendung anpassen
    // Beispiel: console.log(`${padZero(minutes)} : ${padZero(seconds)}`);
}

function padZero(value) {
    // Funktion, um sicherzustellen, dass Zahlen zweistellig dargestellt werden
    return value < 10 ? `0${value}` : value;
}

// Button-Animation:
function handleClick(element, f) {
    element.classList.add("active");

    // Nach 1 Sekunde die Klasse "active" entfernen
    setTimeout(function() {
        element.classList.remove("active");
    }, 1000);
    f();
}

function multipleFunctions(functionList) {
    for (const func of functionList) {
        func();
    }
}

let soundIsOn = true;

function soundOff() {
    soundIsOn = false;
    saveSettings();
}

function soundOn() {
    soundIsOn = true;
    saveSettings();
}

function playClickAudio() {
    if(soundIsOn) {
        const click = document.getElementById("clickAudio");
        // Wiedergabe zurücksetzen, falls mehrmals button drücken
        click.currentTime = 0;
        click.play(); 
    }
    
}
