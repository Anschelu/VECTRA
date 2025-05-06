//Animation Morphing
let uploadedPaths = {
  1: null,
  2: null  
};

let start = null;
let end = null;

function morphingAnimation(start, end) {

const interpolator1 = flubber.interpolate(start, end, { maxSegmentLength: 1 });
const interpolator2 = flubber.interpolate(start, end, { maxSegmentLength: 1 });

const svg1 = document.querySelector("#path-01");
const svg2 = document.querySelector("#path-02");

const path1 = svg1.querySelector("path");
const path2 = svg2.querySelector("path");

let time = 0;

function animate() {
    time += 0.02; 
    const t1 = (Math.sin(time) + 1) / 2;
  const t2 = (Math.sin(time + 0.5) + 1) / 2; 
  path1.setAttribute("d", interpolator1(t1));
  path2.setAttribute("d", interpolator2(t2));
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

    const existing = document.querySelector(`#svg-container svg#${newId}`);
    if (existing) {
      existing.remove();
    }
    
    const clonedSVG = document.importNode(importedSVG, true);
    document.getElementById("svg-container").appendChild(clonedSVG);
    
    console.log("hiii" + id);

    if (id === 1){
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
