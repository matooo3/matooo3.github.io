let theme = "dark";

function toggleTheme() {
    const linkElement = document.getElementById("theme-style");

    if (linkElement.getAttribute("href") === "style.css") {
        applyLightTheme();
    } else {
        applyDarkTheme();
    }
}

function applyDarkTheme() {
    const linkElement = document.getElementById("theme-style");
    linkElement.setAttribute("href", "style.css");
    theme = "dark";
    saveSettings();
}

function applyLightTheme() {
    const linkElement = document.getElementById("theme-style");
    linkElement.setAttribute("href", "light-theme.css");
    theme = "light";
    saveSettings();
}

function loadTheme() {
    if(theme === "dark") {
        applyDarkTheme();
    } else {
        applyLightTheme();
    }
}