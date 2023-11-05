let timer;
let timeInSeconds = 300; // 5 Minuten in Sekunden

function startTimer() {
    if (!timer && timeInSeconds > 0) {
        timer = setInterval(updateTimer, 1000);
    }
}

function updateTimer() {
    if (timeInSeconds > 0) {
        timeInSeconds--;
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        document.getElementById('timer').innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        clearInterval(timer);
        timer = null;
    }
}

function resetTimer() {
    clearInterval(timer);
    timer = null;
    timeInSeconds = 300; // Zurücksetzen auf 5 Minuten
    document.getElementById('timer').innerText = '05:00';
}
