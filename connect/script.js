navButton = document.getElementById("nav-button");
navbar = document.getElementById("navbar");

navButton.addEventListener("click", () => {
    toggleNavbar();
})

function toggleNavbar() {
    if(navbar.classList.contains("navbarOpen")) {
        navbar.classList.remove("navbarOpen")
        return;
    }

    navbar.classList.add("navbarOpen")
}

function openLink(link) {
    window.location.href = link;
  }