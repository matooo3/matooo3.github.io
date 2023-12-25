function openNav() {
    document.querySelector(".invisible").style.display = "block"; /*Nav wird sichtbar gemacht*/
}

function closeNav() {
    document.querySelector(".invisible").style.display = "none"; /*Nav wird versteckt*/
}

const button = document.getElementById("toggle-nav");
// const closeNavButton = document.getElementById("close-nav");

let navBarIsOpen = false;

button.addEventListener("click", () => {
    openNav();
    changeToCloseButton();
})

function changeToCloseButton() {
    button.innerHTML = "△";
    button.removeEventListener("click", openNav);
    button.addEventListener("click", () => {
        closeNav();
        changeToOpenButton()
    });
}

function changeToOpenButton() {
    button.innerHTML = "▽";
    button.removeEventListener("click", closeNav);
    button.addEventListener("click", () => {
        openNav();
        changeToCloseButton();
    });
}
