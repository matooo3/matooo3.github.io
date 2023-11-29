function lockButton(button, otherButton) {
    if(!button.classList.contains('locked')) {
        button.classList.add('locked');
        document.getElementById(otherButton).classList.remove('locked');
    }
}