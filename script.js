//Drag and Drop function 
const dropZoneMSG = document.querySelector("#dropzone p");
const input = document.querySelector("input[type='file']");
const colorPicker = document.getElementById("colorPicker");
const path01 = document.getElementById("path-01");
const path02 = document.getElementById("path-02");
const svgContainer = document.getElementById("svg-container");


const dropzones = document.querySelectorAll('.dropzone');
dropzones.forEach((dz, index) => setupDropzone(dz, index + 1));

function setupDropzone(dropzone, id) {

dropzone.addEventListener("click", () => {
    input.click();
    input.onchange = (e) => {
      const file = e.target.files[0];
      rightFiles(file, dropzone, id); 
      upload(file, dropzone, id);
    };
  });

dropzone.addEventListener("dragover", (e) => {
    e.preventDefault(); 
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (rightFiles(file, dropzone)) {
    upload(file, dropzone, id);
  }
});
}

function rightFiles(file, dropzone) {
  const msg = dropzone.querySelector("p");
    if (!file) {
      if (msg) msg.textContent = "Error: No file selected";
      throw new Error("No file selected");
    }
  
    if (file.type !== "image/svg+xml") {
      if (msg) msg.textContent = "Error: Not an SVG file";
      throw new Error("Not an SVG file");
    }
  }

function upload(file, dzContainer, id) {
   dzContainer.innerHTML = "";

   const reader = new FileReader();
   reader.onload = function(event) {
     const svgContent = event.target.result;
    
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const importedSVG = svgDoc.documentElement;

    const newId = `path-0${id}`;
    importedSVG.setAttribute("id", newId);

    const existing = document.querySelector(`#svg-container svg#${newId}`);
    if (existing) {
      existing.remove();
    }
    
    const clonedSVG = document.importNode(importedSVG, true);
    document.getElementById("svg-container").appendChild(clonedSVG);

      const preview = SVG().addTo(dzContainer).size("100%", "100%");
      preview.svg(svgContent);

    };
    reader.readAsText(file);
  }
