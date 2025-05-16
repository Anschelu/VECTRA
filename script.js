var checkLoop= document.getElementById("checkLoop");
var deleteButton= document.getElementById("delete-button");
var deleteButtonDraw= document.getElementById("delete-button-draw");
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
let maxSVG; 
let currentID = 1;
let id = -1;

const morphing_GUI = document.getElementById("morphing-GUI");
const drawable_GUI = document.getElementById("drawable-GUI");
const motion_GUI = document.getElementById("motion-GUI");
//Choose Mode
document.getElementById("scriptDropdown").addEventListener("change", function() {
  const selected = this.value;
  resetGUI(svgContainer, previewList);

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

function setupDrawing(){
var drawingArea= document.getElementById("drawingArea");
let draw = SVG().addTo('#drawingArea').size(400, 400);
let pathp = draw.path().fill('none').stroke({ width: 20, color: '#000' });

let drawing = false;
let points = [];

draw.on('mousedown', function (e) {
  drawing = true;
  points = [];
  pathp.plot('');
});

draw.on('mousemove', function (e) {
  if (!drawing) return;
  const point = draw.point(e.clientX, e.clientY);
  points.push([point.x, point.y]);
  pathp.plot(`M ${points.map(p => p.join(',')).join(' L ')}`);
});

draw.on('mouseup', function () {
  drawing = false;
});

document.getElementById('savePath').addEventListener('click', () => {
  const d = pathp.attr('d');
  console.log("Saved path:", d);

  uploadedSVGPaths.push(d);

  id = id+1;
  console.log(id);
  const tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  tempSVG.setAttribute("id", `path-0${id}`);
  tempSVG.setAttribute("width", "100%");
  tempSVG.setAttribute("height", "100%");

  const pathnew = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathnew.setAttribute("d", d);
  pathnew.setAttribute("fill", "none");
  pathnew.setAttribute("stroke", "black");
  pathnew.setAttribute("stroke-width", "2");

  
  // tempSVG.appendChild(tempPath);
  tempSVG.appendChild(pathnew);
  svgContainer.appendChild(tempSVG);

  previewList.appendChild(tempSVG);
  console.log(tempSVG)
  console.log(pathnew)
  // uploadedPaths[id] = tempSVG;
  // uploadedSVGPaths[id] = d;
  // const serializer = new XMLSerializer();
  // const svgString = serializer.serializeToString(tempSVG);
  // const preview = SVG().addTo(previewList).size("100%", "100%");
  // preview.svg(uploadedSVGPaths);
  //   drawingArea.innerHTML="";
  //   setupDrawing();

    deleteButton.addEventListener("click", () => {
      drawingArea.innerHTML ="";
      resetUploads(svgContainer, previewList);
      setupDrawing();
    });
});}




function resetGUI(svgContainer, previewList) {
  document.getElementById("morphing-GUI").style.display = "none";
  document.getElementById("drawable-GUI").style.display = "none";
  document.getElementById("motion-GUI").style.display = "none";
  resetUploads(svgContainer, previewList);
}

setupDrawing();

//debug 
function morphing(){
  console.log("morphing")
  currentID = 1;
}

function drawable(){
  currentID = 2;
  }

  function drawableAnimation(uploadedSVGPaths){
    const svgDraw = document.querySelector("#path-00");
    path = svgDraw.querySelector("path");
    anime({
      targets: path,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutQuad',
      duration: 2000,
      delay: 0,
      direction: 'alternate',
      loop: true
    });
  }



  function motionPathAnimation() {
    const svgMotion = document.querySelector("#path-00");
    if (!svgMotion) return;
    const path = svgMotion.querySelector("path");
    const car = svgMotion.querySelector("#car");
  
    if (!path || !car) {
      console.error("Pfad oder Auto nicht gefunden.");
      return;
    }
  
    const pathLength = path.getTotalLength();

  anime({
    targets: { progress: 0 },
    progress: 100,
    duration: 4000,
    easing: 'linear',
    draw: '0 1',
    loop: true,
    direction: 'alternate',
    update: function(anim) {
      const progress = anim.animations[0].currentValue / 100;
      const point = path.getPointAtLength(progress * pathLength);
      const nextPoint = path.getPointAtLength(Math.min(progress * pathLength + 1, pathLength));

      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

      car.setAttribute("transform", `translate(${point.x}, ${point.y}) rotate(${angle})`);
    }
  });
}
  

function motion(){
  currentID = 3;
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

  const svg = document.querySelector("#path-00");
  if (!svg) {
    console.error("SVG element with id #path-00 not found.");
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
      rightFiles(file); 
      upload(file);
    };
  });

// dropzone.addEventListener("dragover", (e) => {
//     e.preventDefault(); 
// });

// dropzone.addEventListener("drop", (e) => {
//   e.preventDefault();
//   handleFile(e.dataTransfer.files[0]);
//   const file = e.dataTransfer.files[0];
//   if (rightFiles(file, dropzone)) {
//     upload(file, dropzone);
//   }
// });
}


function rightFiles(file) {
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

function upload(file) {
  console.log("hiii hell ya");

  switch (currentID) {
    case 1:
      maxSVG = 6; 
      break;
    case 2:
      maxSVG = 1; 
      break;
    case 3:
      maxSVG = 1; 
      break;
    default:
      break;
  }

  console.log(currentID)
  console.log(maxSVG)

  if (id + 1 >= maxSVG) {
    alert(`You can only upload a maximum of ${maxSVG} SVG file${maxSVG > 1 ? 's' : ''} in this mode.`);
    return;
  }

  id = id +1;
   
   const reader = new FileReader();
   reader.onload = function(event) {

     const svgContent = event.target.result;
     console.log(svgContent);

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const importedSVG = svgDoc.documentElement;

    const newId = `path-0${id}`;
    console.log(id);
    importedSVG.setAttribute("id", newId);

    uploadedPaths[id] = importedSVG;

    deleteButton.addEventListener("click", () => {
      resetUploads(svgContainer, previewList);
    });

    const pathData = importedSVG.querySelector('path')?.getAttribute('d');

    if (currentID === 3 && id === 0) {
      createTracingElement(importedSVG);
    }
      

    if (pathData) {
      uploadedSVGPaths[id] = pathData;
    }

    if (id === 0){
      svgContainer.innerHTML = "";
      const clonedSVG = document.importNode(importedSVG, true);
      svgContainer.appendChild(clonedSVG);
    }

    console.log(uploadedSVGPaths[id] + " id: " + id);

  

    const preview = SVG().addTo(previewList).size("100%", "100%");
    preview.svg(svgContent);
    
  };
  reader.readAsText(file);
  
}

animateButton.addEventListener("click", () => {
  animationChooser(currentID);
});

setupDropzone(dropzone);

function resetUploads(svgContainer, previewList) {
  console.log("getting cleared now, yey");
  svgContainer.innerHTML = "";
  previewList.innerHTML = "";
  for (let i = 0; i <= maxSVG - 1; i++) {
    uploadedPaths[i] = null;
  }
  uploadedSVGPaths = [];
  id = -1;
}

function animationChooser(currentID){
switch (currentID) {
  case 1:
    console.log("option 1")
    if (uploadedPaths[0] === null || uploadedPaths[1] === null){
  console.log("upload at least 2 shapes")
}
else{
morphingAnimation(uploadedSVGPaths);
}
    break;
  case 2:
    console.log("option 2")
    drawableAnimation(uploadedSVGPaths);
    break;
  case 3:
    motionPathAnimation(uploadedSVGPaths);
  console.log("option 3")
    break;
  default:
    break;
}
}


function createTracingElement(importedSVG){
  const carGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      carGroup.setAttribute("id", "car");
    
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", 10);
      circle.setAttribute("fill", "red");
      circle.setAttribute("cx", "0");
      circle.setAttribute("cy", "0");
    
      carGroup.appendChild(circle);
  
      importedSVG.appendChild(carGroup);
}


//starting page and overlay 
//DON'T DELETE, ACTIVATE WHEN FINISHED

// const instructions = [
//   "",
//   "This tool lets you draw or animate SVG paths. Let's get started!",
//   "Choose a mode from the dropdown (Morphing, Drawable, Motion Path).",
//   "Upload an SVG or draw directly in Drawable mode.",
//   "Only similar SVG's are morphable",
//   "Click 'Animate' to see your path in action.",
//   "You're ready! Enjoy creating with the tool!"
// ];

// let currentStep = 0;

// const instructionText = document.getElementById("instructionText");
// const main = document.getElementById("mainApp");
// const nextBtn = document.getElementById("nextBtn");
// const overlay = document.getElementById("welcomeOverlay");
// const overlayText = document.querySelector("#welcomeOverlay h2");

// nextBtn.addEventListener("click", () => {
//   currentStep++;
//   if (currentStep < instructions.length) {
//     overlayText.style.fontSize = "48px"
//     overlay.style.display = "block";
//     main.style.display = "none";
//     instructionText.textContent = instructions[currentStep];
//     nextBtn.textContent = currentStep === instructions.length - 1 ? "Start" : "OK";
//   } else {
//     overlay.style.display = "none";
//     main.style.display = "block";
//   }
// });

