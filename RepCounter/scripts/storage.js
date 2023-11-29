loadSettings();

// Save Settings of settings.html
function saveSettings() {
    
    // Save Settings in localStorage:
    localStorage.setItem('sound', soundIsOn);
    localStorage.setItem('theme', theme);

}

function loadSettings() {
    
    soundIsOn = localStorage.getItem('sound') === 'true';
    theme = localStorage.getItem('theme');
    loadTheme();
   
}
