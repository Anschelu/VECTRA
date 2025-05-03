//Drag and Drop function 
const dropZone = document.querySelector("#dropzone");
const dropZoneMSG = document.querySelector("#dropzone p");
const input = document.querySelector("input");
const colorPicker = document.getElementById("colorPicker");
const containerSVG = document.getElementById("svg-container");
const colorPickersContainer = document.getElementById("colorPickersContainer");

dropZone.addEventListener("click", () => {
    input.click();
    input.onchange = (e) => {
      const file = e.target.files[0];
      rightFiles(file); 
      upload(file);
    };
  });

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault(); 
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const filesArray = [... e.dataTransfer.files];
    rightFiles(e);
    upload(filesArray[0]);
});

function rightFiles(file) {
    if (!file) {
      dropZoneMSG.textContent = "Error: No file selected";
      throw new Error("No file selected");
    }
  
    if (file.type !== "image/svg+xml") {
      dropZoneMSG.textContent = "Error: Not an SVG file";
      throw new Error("Not an SVG file");
    }
  }

function upload(file){
    const reader = new FileReader();

    reader.onload = function(event) {
        const svgContent = event.target.result;

        containerSVG.innerHTML = svgContent;
    };
    reader.readAsText(file);
    }


