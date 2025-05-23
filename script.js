var checkLoop = document.getElementById("checkLoop");
var deleteButton = document.getElementById("delete-button");
var deleteButtonDraw = document.getElementById("delete-button-draw");
var animateButton = document.getElementById("animate-button");
var pauseAnimation = document.getElementById('pauseAnimation')
var slider = document.getElementById("myRange");
// let savePath = document.getElementById('savePath')
const maxVal = parseInt(document.getElementById("myRange").max);
const max = maxVal * 1.2;
let animation = null;
let animationSpeed = slider ? parseFloat(slider.value) : 0.001;
let uploadedPaths = []; //*** replace these with svgs
let uploadedSVGPaths = []; //*** replace these with svgs
let svgs = [];
let svgsSelected = 0 // clickable index
let interpolator = null;
let pathSVG = null;
let maxSVG;
let currentID = 1;
let interP = [];
let path = null;
const saveDraw = document.getElementById("saveDraw");
const clearDraw = document.getElementById("clearDraw");
const closeDraw = document.getElementById("closeDraw");

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

var previewDrawing = {}
function setupDrawing() {
  previewDrawing.draw = SVG().addTo('#drawingArea').size(400, 400);
  previewDrawing.pathp = previewDrawing.draw.path().fill('none').stroke({ width: 20, color: '#000' });

  previewDrawing.drawing = false;
  previewDrawing.points = [];

  previewDrawing.draw.on('mousedown', function (e) {
    console.log(e)
    previewDrawing.drawing = true;
    previewDrawing.points = [];
    previewDrawing.pathp.plot('');
  });

  previewDrawing.draw.on('mousemove', function (e) {
    if (!previewDrawing.drawing) return;
    const point = previewDrawing.draw.point(e.clientX, e.clientY);
    previewDrawing.points.push([point.x, point.y]);
    previewDrawing.pathp.plot(`M ${previewDrawing.points.map(p => p.join(',')).join(' L ')}`);
  });

  previewDrawing.draw.on('mouseup', function () {
    previewDrawing.drawing = false;
  });

}

saveDraw.addEventListener('click', () => {

  let myDrawing = document.querySelector("#drawingArea svg")
  let svgContent = new XMLSerializer().serializeToString(myDrawing);
  uploadAndDraw(svgContent);
    previewDrawing.points = [];
    previewDrawing.pathp.plot('');
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
  path = document.querySelector("#path-00");

  if (!path) {
    console.error("No <path> found with ID #path-00.");
    return;
  }
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
  const path = document.querySelector("#path-00");
  const car = document.querySelector("#car");

  if (!path || !car) return;

  const pathLength = path.getTotalLength();

  anime({
    targets: { progress: 0 },
    progress: 100,
    duration: 4000,
    easing: 'linear',
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

function setupDropzone(dropzone) {
  dropzone.addEventListener("click", () => {
    input.click();
    input.onchange = (e) => {
      const files = Array.from(e.target.files); // Convert FileList to Array
      files.forEach(file => {
        rightFiles(file);
        upload(file);
      });
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

    uploadAndDraw(svgContent);
    
  };
  reader.readAsText(file);

}

function uploadAndDraw(svgContent){

  let index = svgs.length;

  const newId = `path-0${index}`;

  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const pathElement = svgDoc.querySelector("path");

  pathElement.setAttribute("id", newId);

  const serializer = new XMLSerializer();
  svgContent = serializer.serializeToString(svgDoc.documentElement);


  const pathData = pathElement?.getAttribute("d");

  svgs.push({ svg: svgContent, path: pathData, id: newId });

  if (currentID === 3) {
    createTracingElement();
  }

  if (index === 0) {
    // svgContainer.innerHTML = "";
    // let canvas = SVG().addTo(svgContainer);
    // canvas.svg(svgs[index].path);

    svgContainer.innerHTML = svgs[index].svg
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

// function previewSVG(index){
//   let preview = SVG().addTo(previewList).viewbox(0, 0, 400, 400);
//   console.log(svgs[index].svg)
//   preview.svg(svgs[index].svg);
// }

function previewSVG(index) {
  const wrapper = document.createElement("div");
  wrapper.dataset.index = index;
  wrapper.style.display = "inline-block";
  wrapper.style.margin = "10px";

  let preview = SVG().addTo(wrapper).viewbox(0, 0, 400, 400);
  preview.svg(svgs[index].svg);

  previewList.appendChild(wrapper);
}

animateButton.addEventListener("click", () => {
  animationChooser(currentID);
});

setupDropzone(dropzone);

Sortable.create(previewList, {
  animation: 150,
  ghostClass: 'sortable-ghost',
  onEnd: function (evt) {
    const newOrder = Array.from(previewList.children).map(el => parseInt(el.dataset.index));
    svgs = newOrder.map(i => svgs[i]);

    const parser = new DOMParser();
    const serializer = new XMLSerializer();

    svgs.forEach((svgObj, index) => {
      const newId = `path-0${index}`;
      const svgDoc = parser.parseFromString(svgObj.svg, "image/svg+xml");
      const pathElement = svgDoc.querySelector("path");

      if (pathElement) {
        pathElement.setAttribute("id", newId);
        svgObj.id = newId;
        svgObj.svg = serializer.serializeToString(svgDoc.documentElement);
      }
    });
    previewList.innerHTML = '';
    svgs.forEach((_, index) => previewSVG(index));
    svgContainer.innerHTML = svgs[0].svg;
  }
});


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


function createTracingElement() {
  const svg = svgContainer.querySelector("svg");
  const carGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  carGroup.setAttribute("id", "car");

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("r", 10);
  circle.setAttribute("fill", "red");
  circle.setAttribute("cx", "0");
  circle.setAttribute("cy", "0");

    console.log(svg)
  carGroup.appendChild(circle);
  svgContainer.appendChild(carGroup); // Append into the loaded SVG
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

const drawWindow = document.getElementById("drawWindow");
const openDrawBtn = document.createElement('button');
openDrawBtn.textContent = "Open Drawing Tool";
document.querySelector(".gui-container").appendChild(openDrawBtn);

openDrawBtn.addEventListener("click", () => {
  drawWindow.style.display = "flex";
});

closeDraw.addEventListener("click", () => {
  drawWindow.style.display = "none";
});

clearDraw.addEventListener("click", () => {
  previewDrawing.points = [];
  previewDrawing.pathp.plot('');
});

// saveDraw.addEventListener("click", () => {
//   let myDrawing = document.querySelector("#drawingArea svg");
//   let svgContent = new XMLSerializer().serializeToString(myDrawing);
//   uploadAndDraw(svgContent);
//   previewDrawing.points = [];
//   previewDrawing.pathp.plot('');
//   drawWindow.style.display = "none"; // optionally close after saving
// });


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