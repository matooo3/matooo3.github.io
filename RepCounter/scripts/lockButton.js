function lockButton(button, otherButtonID) {
    // lock new button + remove lock from other:
    if(!button.classList.contains('locked')) {
        button.classList.add('locked');
        document.getElementById(otherButtonID).classList.remove('locked');
    }
}

// loadLockedButtons() moved to storage.js