let counter = 0;

function inc(times) {
    counter = counter + times;
    reps.innerHTML = counter; 
}

function dec(times) {

    if(counter - times > -1){
        counter = counter - times;
        
        reps.innerHTML = counter;
    }
}

function resetCounter(){
    counter = 0;
    reps.innerHTML = counter;
}

// TIMER ------

let timer; // Variable, um Timer-Interval zu speichern
let seconds = 0;
let minutes = 0;

function startTimer() {
    timer = setInterval(updateTimer, 1000); // Startet das Timer-Interval alle 1000ms (1 Sekunde)
}

function stopTimer() {
    clearInterval(timer); // Stoppt das Timer-Interval
}

function resetTimer() {
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
