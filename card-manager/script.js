// global variable, to tell if addNewSection is allowed or if it is avtive already.
active = false;

// clear LS
function clearLS() {
    localStorage.clear();
}

function addNewSection() {
    if (active) {
        alert("Please first enter some data");
        return;
    }
    active = true; // function active => waits for Save-Button Event

    const cardList = document.getElementById("card-list");
    const sectionId = "temp-sectionId"; // is changed later to user-input

    addNewLiDivElement(cardList, sectionId);
    const sectionDiv = document.getElementById(sectionId);
    
    addInputsToSection(sectionDiv);
    

    // insert image here
    // sectionDiv.innerHTML += "<ol><li>a</li><li>d</li></ol>";
}

function addNewLiDivElement (cardList, sectionId) {
    // create <li> El. + new <div> El. with id=sectionId
    const listItem = document.createElement("li");
    const sectionDiv = document.createElement("div");
    sectionDiv.id = sectionId;
    sectionDiv.className = sectionDiv;
    sectionDiv.classList.add("sectionDiv"); // for .css

    listItem.appendChild(sectionDiv);

    // Add <li> El. to "card-list"
    cardList.appendChild(listItem);
}

function addInputsToSection(sectionDiv) {
    addInputSectionId(sectionDiv)
    addInputImage(sectionDiv)
    addSaveButton(sectionDiv)
}

function addInputSectionId(sectionDiv) {
    // Create Input for the sectionId
    const sectionIdInput = document.createElement("input");
    sectionIdInput.type = "text";
    sectionIdInput.placeholder = "Enter section ID";
    sectionDiv.appendChild(sectionIdInput);
}

function addInputImage(sectionDiv) {
    // Create Input for the sectionId
    const imageInput = document.createElement("input");
    imageInput.id = "imageInput";
    imageInput.type = "file";
    imageInput.accept = "image/*"; // support all img-formats
    sectionDiv.appendChild(imageInput);
}

function addSaveButton(sectionDiv) {
    const saveButton = document.createElement("button");
    saveButton.innerHTML = "Save";
    saveButton.id = "saveButton";
    saveButton.addEventListener("click", function() {
        saveSection(sectionDiv);
        addDeleteButton(sectionDiv);
        // addEditButton();
        saveData();
    })
    sectionDiv.appendChild(saveButton)
}

function addDeleteButton(sectionDiv) {
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = "delete";
    deleteButton.className = "deleteButton";
    addDeleteButtonListener(sectionDiv, deleteButton);
    sectionDiv.appendChild(deleteButton);
}

function addDeleteButtonListener(sectionDiv, deleteButton) {
    deleteButton.addEventListener("click", function() {
        deleteSectionFromLS(sectionDiv);
        sectionDiv.remove();
        saveData();
    })
}

function deleteSectionFromLS(sectionDiv) {
    localStorage.removeItem("src:"+sectionDiv.id);
    localStorage.removeItem("name:"+sectionDiv.id);
}

function saveSection(sectionDiv) {
    active = false; // done => allow addNewSection
    // sectionDiv.innerHTML = ''; //clear
    saveSectionName(sectionDiv);
    saveSectionImages(sectionDiv);

    deleteInputSectionId(sectionDiv);
    deleteSaveButton(sectionDiv);

    loadSectionNameFromLS(sectionDiv);
    loadSectionImagesFromLS(sectionDiv);
    scaleImg(sectionDiv);
}

function saveSectionName(sectionDiv) {
    const sectionDivInput = sectionDiv.querySelector('input[type="text"]'); // take text input
    sectionDiv.id = sectionDivInput.value; // take user input
    localStorage.setItem("name:"+sectionDiv.id, sectionDiv.id);
    // sectionDiv.innerHTML = sectionDiv.id; // Change name of section to sectionId
}

function saveSectionImages(sectionDiv) {
    const sectionDivInput = sectionDiv.querySelector('input[type="file"]')
    const imageInput = document.getElementById("imageInput");
    // Check if a file is selected:
    if(imageInput == null) {
        return;
    }
    if(imageInput.files.length > 0){ // check if input empty
        const file = imageInput.files[0];
        // Check if the file is an image:
        if(file.type.startsWith('image/')) {

            // // 1.Create URL link ! (with Data-URL)
            // const reader = new FileReader();

            // reader.onload = function(e) { // asynchron => erst wenn Read is done
            //     const imgSrc = e.target.result;
            //     // URL to storage
            //     localStorage.setItem("src:"+sectionDiv.id, imgSrc);
            // }
            // reader.readAsDataURL(file);
            const imgSrc = URL.createObjectURL(file);
            localStorage.setItem("src:"+sectionDiv.id, imgSrc);    
            

        } else {
            console.error("Selected file is not an image.")
        }
    } else {
        console.warn("No file selected.")
    }
}

function loadSectionNameFromLS(sectionDiv) {
    let name = localStorage.getItem("name:"+sectionDiv.id);
    nameDiv = document.createElement("div");
    nameDiv.innerHTML = name;
    sectionDiv.appendChild(nameDiv);
}

function loadSectionImagesFromLS(sectionDiv) {
    imgSrc = localStorage.getItem("src:"+sectionDiv.id);
    img = document.createElement("img");
    img.src = imgSrc;
    img.id = "img:"+sectionDiv.id;
    sectionDiv.appendChild(img);
}

function saveData() {
    const data = document.getElementById("card-list").outerHTML;
    localStorage.setItem("userData", data);
}

function loadData() {
    const data = localStorage.getItem("userData");
    if (data) {
        document.getElementById("card-list").outerHTML = data;
    }
    addEventListenerToAllDeleteButtons();
}

// this is needed, because if you load the code data of LocalStorage
// then the event listener is gone! #TODO maybe there is a better way
function addEventListenerToAllDeleteButtons() {
    var sectionDivs = document.querySelectorAll(".sectionDiv");

    sectionDivs.forEach(function(sectionDiv) {
        const deleteButton = sectionDiv.querySelector(".deleteButton");
        addDeleteButtonListener(sectionDiv, deleteButton);
    })
}


// function deleteSectionId(sectionDiv) {
//     // Remove the whole section with the given ID
    
//     if (sectionDiv) {
//         sectionDiv.remove();
//     }
// }


function deleteInputSectionId(sectionDiv) {
    // Select all Input-El. in sectionDiv 
    const inputElements = sectionDiv.querySelectorAll('input');

    // delete all Input-El.
    inputElements.forEach(input => {
        input.remove();
    });
}

function deleteSaveButton(sectionDiv) {
    const saveButton = document.getElementById("saveButton");
    if(saveButton) {
        saveButton.remove();
    }
}

function scaleImg(sectionDiv) {
    const img = document.getElementById("img:"+sectionDiv.id);
    img.width = 256;
}
