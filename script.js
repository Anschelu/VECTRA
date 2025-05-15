var checkLoop= document.getElementById("checkLoop");
var deleteButton= document.getElementById("delete-button");
var animateButton= document.getElementById("animate-button");
var pauseAnimation = document.getElementById('pauseAnimation')
var slider = document.getElementById("myRange");
const maxVal = parseInt(document.getElementById("myRange").max);
const max = maxVal*1.2;
let animation = null;
let animationSpeed = slider ? parseFloat(slider.value) : 0.001;
let uploadedPaths =[];
let uploadedSVGPaths =[];
let interpolator = null;
let interP = [];
let path = null;
let start = null;
let end = null;
const maxSVG = 6; 
let time = 0; 
let currentID = 0;

//Choose Mode
document.getElementById("scriptDropdown").addEventListener("change", function() {
  const selected = this.value;
  const morphing_GUI = document.getElementById("morphing-GUI");
  const drawable_GUI = document.getElementById("drawable-GUI");
  const motion_GUI = document.getElementById("motion-GUI");
  morphing_GUI.style.display = "none";
  drawable_GUI.style.display = "none";
  motion_GUI.style.display = "none";

  switch (selected) {
    case "morphing":
      morphing_GUI.style.display = "block";
      morphing();
      break;
    case "drawable":
      drawable_GUI.style.display = "block";
      drawable();
      break;
    case "motionPath":
      motion_GUI.style.display = "block";
      motion();
      break;
    default:
      break;
  }
});

//debug 
function morphing(){
  console.log("morphing")
}

function drawable(){
  console.log("drawable")
}

function motion(){
  console.log("motionPath")
}

function animate(pathsArray) {
  if (animation) animation.pause();

  const shouldLoop = checkLoop.checked;
  console.log("Animating with loop:", shouldLoop);

  playNext(0, shouldLoop, pathsArray);
}

function playNext(index, shouldLoop, pathsArray) {
  const currentInterpolator = interP[index];
  animation = anime({
    targets: {},
    duration: max - animationSpeed,
    easing: 'easeOutQuad',
    loop: shouldLoop,
    direction: 'alternate',
    update: function(anim) {
      const t = anim.progress / 100;
      path.setAttribute('d', currentInterpolator(t));
    },
    complete: function() {
      index++;
      if (index < pathsArray.length) {
        playNext(index, shouldLoop, pathsArray);
      } else if (shouldLoop) {
        playNext(0, shouldLoop, pathsArray);
      }
    }
  });
}



//pass array of paths 
function morphingAnimation(uploadedSVGPaths) {

  //go through array and set more animations

  for (let i = 0; i < uploadedSVGPaths.length; i++){
    console.log("hii I reached this function :)");
  // interpolator = flubber.interpolate(start, end, { maxSegmentLength: 1 });
  if (i === (uploadedSVGPaths.length-1)){
    interP[i]= flubber.interpolate(uploadedSVGPaths[i], uploadedSVGPaths[0], { maxSegmentLength: 1 });
    console.log("hii I'm last :)");
  }
  else{
  interP[i]= flubber.interpolate(uploadedSVGPaths[i], uploadedSVGPaths[i+1], { maxSegmentLength: 1 });
  console.log("hii I was here :)" + i);
}
}

  const svg = document.querySelector("#path-01");
  if (!svg) {
    console.error("SVG element with id #path-01 not found.");
    return;
  }

  path = svg.querySelector("path");
  if (!path) {
    console.error("No <path> found in #path-01.");
    return;
  }
  console.log("hii I'm animating now:)");
  animate(uploadedSVGPaths); 
}

if (checkLoop) {
  checkLoop.addEventListener('change', function () {
    if (!uploadedSVGPaths || uploadedSVGPaths.length < 2) return;
    animate(uploadedSVGPaths);
  });
}

pauseAnimation.addEventListener('change', () => {
  if (pauseAnimation.checked) {
    animation.pause();
    console.log("animation paused")
  } else {
    animation.play();
    console.log("animation started")
  }
});

document.querySelector('#myRange').addEventListener('input', function() {
  animationSpeed = this.value;
  var speedAnimation = max - animationSpeed;
    animation.duration = speedAnimation;
});

//Drag and Drop function 
const dropzone = document.querySelector('.dropzone');
const input = document.querySelector("input[type='file']");
const colorPicker = document.getElementById("colorPicker");
const previewList = document.getElementById("svg-preview-list"); 
const svgContainer = document.getElementById("svg-container");



//add dropzone when one is added?

function setupDropzone(dropzone) {

dropzone.addEventListener("click", () => {
    input.click();
    input.onchange = (e) => {
      const file = e.target.files[0];
      rightFiles(file, dropzone, currentID); 
      upload(file, dropzone, currentID);
    };
  });
  dropzone.addEventListener("click", () => {
    input.click();
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (rightFiles(file, dropzone)) {
        upload(file, dropzone, currentID);
        currentID++;
      }
    };
  });

dropzone.addEventListener("dragover", (e) => {
    e.preventDefault(); 
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  handleFile(e.dataTransfer.files[0]);
  const file = e.dataTransfer.files[0];
  if (rightFiles(file, dropzone, currentID)) {
    upload(file, dropzone, currentID);
  }
});
}


function rightFiles(file, dropzone, currentID) {
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

// function rightFiles(file, dropzone) {
//   const msg = dropzone.querySelector("p");
//   if (!file) {
//     if (msg) msg.textContent = "Error: No file selected";
//     console.error("No file selected");
//     return false;
//   }

//   if (file.type !== "image/svg+xml") {
//     if (msg) msg.textContent = "Error: Not an SVG file";
//     console.error("Not an SVG file");
//     return false;
//   }

//   return true;
// }

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

    deleteButton.addEventListener("click", () => {
      dzContainer.innerHTML = "";
      svgContainer.innerHTML = "";
      for (let i = 1; i <= maxSVG; i++) {
        uploadedPaths[i] = null;
      }
      uploadedSVGPaths = [];
    currentID = 1;
    });


    if (id === 1){
      svgContainer.innerHTML = "";
      const clonedSVG = document.importNode(importedSVG, true);
      svgContainer.appendChild(clonedSVG);
      uploadedSVGPaths[id-1] = uploadedPaths[id].querySelector('path').getAttribute('d'); 
    }
    else if (id < maxSVG){
      uploadedSVGPaths[id-1] = uploadedPaths[id].querySelector('path').getAttribute('d');
    }

    console.log(uploadedSVGPaths[id-1] + " id: " + id);
    
    const preview = SVG().addTo(previewList).size("100%", "100%");
    preview.svg(svgContent);
    
  };
  reader.readAsText(file);
  
}

animateButton.addEventListener("click", () => {
if (uploadedPaths[1] === null || uploadedPaths[2] === null){
  console.log("upload at least 2 shapes")
}
else{
morphingAnimation(uploadedSVGPaths);
}
});

setupDropzone(dropzone);
