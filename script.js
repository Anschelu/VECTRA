var checkLoop = document.getElementById("checkLoop");
var deleteButton = document.getElementById("delete-button");
var deleteButtonDraw = document.getElementById("delete-button-draw");
var animateButton = document.getElementById("animate-button");
var pauseAnimation = document.getElementById('pauseAnimation')
var slider = document.getElementById("myRange");
let savePath = document.getElementById('savePath')
const maxVal = parseInt(document.getElementById("myRange").max);
const max = maxVal * 1.2;
let animation = null;
let animationSpeed = slider ? parseFloat(slider.value) : 0.001;
let uploadedPaths = []; //*** replace these with svgs
let uploadedSVGPaths = []; //*** replace these with svgs
let svgs = [];
let drawingArea = document.getElementById("drawingArea");
let drawWindow = document.getElementById("drawWindow");
// svgs.push({svg:svgCode, path:mPath})  // *** just save your upload/draw and a fancy js obj array..
// svgs[0].path
let svgsSelected = 0 // clickable index
let interpolator = null;
// let interP = [];
let pathSVG = null;
let maxSVG;
let currentID = 1;
// let index = 0; 
let interP = [];
let path = null;

const morphing_GUI = document.getElementById("morphing-GUI");
const drawable_GUI = document.getElementById("drawable-GUI");
const motion_GUI = document.getElementById("motion-GUI");
//Choose Mode
document.getElementById("scriptDropdown").addEventListener("change", function () {
  const selected = this.value;
  resetGUI(svgContainer);
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

function setupDrawing() {
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

}

savePath.addEventListener('click', () => {

  let myDrawing = document.querySelector("#drawingArea svg")
  let svgContent = new XMLSerializer().serializeToString(myDrawing);
  uploadAndDraw(svgContent);
});

deleteButton.addEventListener("click", () => {
  drawingArea.innerHTML = "";
  resetUploads();
  setupDrawing();
});



function resetGUI(svgContainer) {
  document.getElementById("morphing-GUI").style.display = "none";
  document.getElementById("drawable-GUI").style.display = "none";
  document.getElementById("motion-GUI").style.display = "none";
  //resetUploads(svgContainer, previewList); // **** dont reset my uploads!!
}

setupDrawing();

//debug 
function morphing() {
  currentID = 1;
}

function drawable() {
  currentID = 2;
}

function drawableAnimation() {
  const svgDraw = document.querySelector("#path-00"); // querySelectorAll([id^="#path-")[0] // *** collect all available, then filter
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
    update: function (anim) {
      const progress = anim.animations[0].currentValue / 100;
      const point = path.getPointAtLength(progress * pathLength);
      const nextPoint = path.getPointAtLength(Math.min(progress * pathLength + 1, pathLength));

      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

      car.setAttribute("transform", `translate(${point.x}, ${point.y}) rotate(${angle})`);
    }
  });
}


function motion() {
  currentID = 3;
}

function morphingAnimation() {

  if (svgs.length < 2) {
    console.error("At least 2 SVGs required for morphing.");
    return;
  }

  for (let i = 0; i < svgs.length; i++) {
    if (i === (svgs.length - 1)) {
      interP[i] = flubber.interpolate(svgs[i].path, svgs[0].path, { maxSegmentLength: 1 });
      console.log("hii I'm last :)");
    }
    else {
      interP[i] = flubber.interpolate(svgs[i].path, svgs[i + 1].path, { maxSegmentLength: 1 });
      console.log("hii I was here :)" + i);
    }
  }

  path = document.querySelector("#path-00");

  if (!path) {
    console.error("No <path> found with ID #path-00.");
    return;
  }

  animate();
}

if (checkLoop) { 
  checkLoop.addEventListener('change', function () {
    if (!svgs || svgs.length < 2) return;
    animate();
  });
}

function animate() {
  if (animation) animation.pause();

  const shouldLoop = checkLoop.checked;
  console.log("Animating with loop:", shouldLoop);

  playNext(0, shouldLoop);
}

function playNext(i, shouldLoop) {
  const currentInterpolator = interP[i];
  animation = anime({
    duration: max - animationSpeed,
    easing: 'easeOutQuad',
    loop: shouldLoop,
    direction: 'alternate',
    update: function (anim) {
      const t = anim.progress / 100;
      path.setAttribute('d', currentInterpolator(t));
    },
    complete: function () {
      i++;
      if (i < svgs.length) {
        playNext(i, shouldLoop);
      } else if (shouldLoop) {
        playNext(0, shouldLoop);
      }
    }
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

document.querySelector('#myRange').addEventListener('input', function () {
  animationSpeed = this.value;
  var speedAnimation = max - animationSpeed;
  animation.duration = speedAnimation;
});

//Drag and Drop function 
let dropzone = document.querySelector('.dropzone');
let input = document.querySelector("input[type='file']");
let colorPicker = document.getElementById("colorPicker");
let previewList = document.getElementById("svg-preview-list");
let svgContainer = document.getElementById("svg-container");



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

  modeChooser();

  //deletes first svg and then moves all the svg's to one gap before
  limitControl();


  //*** What do I need in svgs Array: PathName, svgContent, Path, 
  //*** one function for draw and upload possible? 

  const reader = new FileReader();
  reader.onload = function (event) {

    let svgContent = event.target.result;

    // const parser = new DOMParser();
    // const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    // const importedSVG = svgDoc.documentElement;

    uploadAndDraw(svgContent);
    
  };
  reader.readAsText(file);

}

function uploadAndDraw(svgContent){

  let index = svgs.length;
  
  // const pathData = importedSVG.querySelector('path')?.getAttribute('d');

  // importedSVG.setAttribute("id", newId);


  // svgs.push({svg:svgContent, path:pathData, id:newId}) 

  const newId = `path-0${index}`;

  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const pathElement = svgDoc.querySelector("path");

  pathElement.setAttribute("id", newId);

  const serializer = new XMLSerializer();
  svgContent = serializer.serializeToString(svgDoc.documentElement);


  const pathData = pathElement?.getAttribute("d");

  svgs.push({ svg: svgContent, path: pathData, id: newId });

  if (currentID === 3 && svgs[0]) {
    createTracingElement(svgs.svg);
  }

  if (index === 0) {
    svgContainer.innerHTML = "";
    let canvas = SVG().addTo(svgContainer);
    canvas.svg(svgs[index].svg);
  }
  previewSVG(index);
}

function limitControl(){
  if (svgs.length >= maxSVG) {
    svgs.shift(); 
  
    previewList.innerHTML = '';
  
    svgs.forEach((_, i) => {
      previewSVG(i);
    });
  }
}

function previewSVG(index){
  let preview = SVG().addTo(previewList).viewbox(0, 0, 400, 400);
  console.log(svgs[index].svg)
  preview.svg(svgs[index].svg);
}

animateButton.addEventListener("click", () => {
  animationChooser(currentID);
});

setupDropzone(dropzone);

function resetUploads() {
  // console.log("getting cleared now, yey");
  svgContainer.innerHTML = "";
  previewList.innerHTML = "";
  svgs.length = [];
}


function animationChooser(currentID) {
  switch (currentID) {
    case 1:
      console.log("option 1")
        morphingAnimation();
      break;
    case 2:
      console.log("option 2")
      drawableAnimation();
      break;
    case 3:
      motionPathAnimation();
      console.log("option 3")
      break;
    default:
      break;
  }
}


function createTracingElement(importedSVG) {
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

function modeChooser(){
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
}}

// starting page and overlay 
// DON'T DELETE, ACTIVATE WHEN FINISHED

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