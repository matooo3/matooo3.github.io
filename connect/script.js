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

navbarVisivility = false;

function toggleVisibility() {
    if(navbarVisivility) {
        deleteVisibility();
    } else {
        addVisibility();
    }
}

function addVisibility() {
    const navElements = document.querySelectorAll('.invisible');

    navElements.forEach((el) => {
        el.classList.add('visible')
    })
    navElements.forEach((el) => {
        el.classList.remove('invisible')
    })

    navbarVisivility = true;
}

function deleteVisibility() {
    const navElements = document.querySelectorAll('.visible');

    navElements.forEach((el) => {
        el.classList.add('invisible')
    })
    navElements.forEach((el) => {
        el.classList.remove('visible')
    })

    navbarVisivility = false;
}

//  BUTTON ------------------------------
var btns = document.querySelectorAll('.btn');
var paginationWrapper = document.querySelector('.pagination-wrapper');
var bigDotContainer = document.querySelector('.big-dot-container');
var littleDot = document.querySelector('.little-dot');

for(var i = 0; i < btns.length; i++) {
    btns[i].addEventListener('click', btnClick);
  }
  
  function btnClick() {
    if(this.classList.contains('btn--prev')) {
      paginationWrapper.classList.add('transition-prev');
    } else {
      paginationWrapper.classList.add('transition-next');  
    }
    
    var timeout = setTimeout(cleanClasses, 500);
  }
  
  function cleanClasses() {
    if(paginationWrapper.classList.contains('transition-next')) {
      paginationWrapper.classList.remove('transition-next')
    } else if(paginationWrapper.classList.contains('transition-prev')) {
      paginationWrapper.classList.remove('transition-prev')
    }
  }


