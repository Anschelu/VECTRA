
var slider = document.getElementById("myRange");

let animationSpeed = slider ? parseFloat(slider.value) : 0.01;

let uploadedPaths = {
  1: null,
  2: null  
};

let start = null;
let end = null;

if (slider) {
  slider.oninput = function() {
      animationSpeed = parseFloat(this.value);
  };
}

function morphingAnimation(start, end) {

const interpolator = flubber.interpolate(start, end, { maxSegmentLength: 1 });

const svg = document.querySelector("#path-01");
if (!svg) {
  console.error("SVG element with id #path-01 not found.");
  return;
}

const path = svg.querySelector("path");
if (!path) {
  console.error("No <path> found in #path-01.");
  return;
}


let time = 0;

function animate() {
  time += animationSpeed;
  const t = (Math.sin(time) + 1) / 2;
  path.setAttribute("d", interpolator(t));
  requestAnimationFrame(animate);
}
  animate();
}


//Drag and Drop function 
const dropZoneMSG = document.querySelector("#dropzone p");
const input = document.querySelector("input[type='file']");
const colorPicker = document.getElementById("colorPicker");
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
     console.log(svgContent);

     
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const importedSVG = svgDoc.documentElement;

    const newId = `path-0${id}`;
    importedSVG.setAttribute("id", newId);
    
    
    uploadedPaths[id] = importedSVG;
    
    console.log("hiii" + id);

    if (id === 1){
    svgContainer.innerHTML = "";

    const clonedSVG = document.importNode(importedSVG, true);
    svgContainer.appendChild(clonedSVG);
    start = uploadedPaths[id].querySelector('path').getAttribute('d'); 
    console.log('SVG 1 d value:', start);
  }
    else{
      end = uploadedPaths[id].querySelector('path').getAttribute('d');
      console.log('SVG 2 d value:', end);
    }

    console.log('SVG 1 d value:', start);
    console.log('SVG 2 d value:', end);

    if (uploadedPaths[1] && uploadedPaths[2]) {
      console.log(start);
      morphingAnimation(start, end);
    }

    const preview = SVG().addTo(dzContainer).size("100%", "100%");
    preview.svg(svgContent);
    };
    reader.readAsText(file);

  }

