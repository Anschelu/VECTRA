let checkLoop = document.getElementById("checkLoop");
let deleteButton = document.getElementById("delete-button");
let deleteButtonDraw = document.getElementById("delete-button-draw");
let animateButton = document.getElementById("animate-button");
let slider = document.getElementById("myRange");
const maxVal = parseInt(document.getElementById("myRange").max);
const max = maxVal * 1.2;
let animation = null;
let animationSpeed = slider ? parseFloat(slider.value) : 0.001;
let svgs = [];
let interpolator = null;
let maxSVG;
let currentID = 1;
let interP = [];
let path = null;
const saveDraw = document.getElementById("saveDraw");
const clearDraw = document.getElementById("clearDraw");
const closeDraw = document.getElementById("closeDraw");
let isCalculating = false;
let loadingElement = null;
let bounceInterP = [];
let isAnimationReady = false;
let isAnimationRunning = false;
let currentAnimationIndex = 0;
let isAnimationPaused = false;
let animationCompleted = false;


const morphing_GUI = document.getElementById("morphing-GUI");
const drawable_GUI = document.getElementById("drawable-GUI");
const motion_GUI = document.getElementById("motion-GUI");

//Choose Mode
document.getElementById("scriptDropdown").addEventListener("change", function () {
  const selected = this.value;
  resetGUI(svgContainer);
  isAnimationReady = false;
  isAnimationRunning = false;
  updateAnimateButton();
  
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
  modeChooser();       
  limitControl(); 
  uploadAndDraw(svgContent);
  previewDrawing.points = [];
  previewDrawing.pathp.plot('');
  isAnimationReady = false;
  isAnimationRunning = false;
  updateAnimateButton();
});

deleteButton.addEventListener("click", () => {
  drawingArea.innerHTML = "";
  resetUploads();
  setupDrawing();
  isAnimationReady = false;
  isAnimationRunning = false;
  updateAnimateButton();
});

function resetGUI(svgContainer) {
  document.getElementById("morphing-GUI").style.display = "none";
  document.getElementById("drawable-GUI").style.display = "none";
  document.getElementById("motion-GUI").style.display = "none";
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
  animation = anime({
    targets: path,
    strokeDashoffset: [anime.setDashoffset, 0],
    easing: 'easeInOutQuad',
    duration: 2000,
    delay: 0,
    direction: 'alternate',
    loop: true
  });
  
  isAnimationRunning = true;
  updateAnimateButton();
}

function motionPathAnimation() {
  const path = document.querySelector("#path-00");
  const car = document.querySelector("#car");

  if (!path || !car) return;

  const pathLength = path.getTotalLength();

  animation = anime({
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
  
  isAnimationRunning = true;
  updateAnimateButton();
}

function motion() {
  currentID = 3;
}

function createLoadingElement() {
  if (!loadingElement) {
    loadingElement = document.createElement('div');
    document.body.appendChild(loadingElement);
  }
}

function showLoading() {
  createLoadingElement();
  loadingElement.style.display = 'block';
  loadingElement.classList.add('fade-in');
  isCalculating = true;
}

function hideLoading() {
  if (loadingElement) {
    loadingElement.classList.add('fade-out');
    setTimeout(() => {
      loadingElement.style.display = 'none';
      loadingElement.classList.remove('fade-in', 'fade-out');
    }, 300);
  }
  isCalculating = false;
}

function morphingAnimation() {
  if (isCalculating) {
    console.log("Animation is already being calculated...");
    return;
  }

  if (svgs.length < 2) {
    console.error("At least 2 SVGs required for morphing.");
    return;
  }

  showLoading();

  setTimeout(() => {
    try {
      interP = [];

      for (let i = 0; i < svgs.length; i++) {
        console.log(`Calculating interpolation ${i + 1}/${svgs.length}...`);

        if (i === (svgs.length - 1)) {
          interP[i] = flubber.interpolate(svgs[i].path, svgs[0].path, { maxSegmentLength: 1 });
          console.log("Last interpolation completed");
        } else {
          interP[i] = flubber.interpolate(svgs[i].path, svgs[i + 1].path, { maxSegmentLength: 1 });
          console.log(`Interpolation ${i} completed`);
        }
      }

      path = document.querySelector("#path-00");

      if (!path) {
        console.error("No <path> found with ID #path-00.");
        hideLoading();
        return;
      }

      console.log("All interpolations calculated, starting animation...");
      hideLoading();
      isAnimationReady = true;
      animate();

    } catch (error) {
      console.error("Error during animation calculation:", error);
      hideLoading();
      alert("Error calculating animation. Please check your SVG files.");
    }
  }, 100);
}

function updateAnimateButton() {
  if (isAnimationRunning) {
    animateButton.textContent = "Pause";
  } else {
    animateButton.textContent = "Animate";
  }
}

animateButton.addEventListener("click", () => {
  if (isCalculating) {
    return;
  }

  if (isAnimationRunning) {
    if (animation) {
      animation.pause();
      isAnimationRunning = false;
      isAnimationPaused = true;
      updateAnimateButton();
    }
    return;
  }

  if (isAnimationReady) {
    if (isAnimationPaused && !animationCompleted) {
      if (animation) {
        animation.play();
        isAnimationRunning = true;
        isAnimationPaused = false;
        updateAnimateButton();
      }
    } else {
      animate();
    }
    return;
  }

  animateButton.classList.add('button-loading');
  animateButton.textContent = "Calculating";

  setTimeout(() => {
    animationChooser(currentID);
    setTimeout(() => {
      animateButton.classList.remove('button-loading');
      updateAnimateButton();
    }, 500);
  }, 100);
});


function uploadAndDraw(svgContent) {
  const uploadIndicator = document.createElement('div');
  uploadIndicator.textContent = 'Processing SVG...';
  uploadIndicator.className = 'upload-indicator fade-in';
  document.body.appendChild(uploadIndicator);

  setTimeout(() => {
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
      svgContainer.innerHTML = svgs[index].svg;
    }
    previewSVG(index);

    uploadIndicator.classList.add('fade-out');
    setTimeout(() => {
      document.body.removeChild(uploadIndicator);
    }, 300);
  }, 50);
}

function showSimpleLoading(message = 'Loading...') {
  const existingLoader = document.querySelector('.simple-loader');
  if (existingLoader) return;

  const loader = document.createElement('div');
  loader.textContent = message;
  loader.className = 'simple-loader fade-in';
  document.body.appendChild(loader);
}

function hideSimpleLoading() {
  const loader = document.querySelector('.simple-loader');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => {
      if (loader.parentNode) {
        document.body.removeChild(loader);
      }
    }, 300);
  }
}

if (checkLoop) {
  checkLoop.addEventListener('change', function () {
    if (!svgs || svgs.length < 2) return;
    
    if (animation) {
      animation.pause();
    }
    isAnimationReady = false;
    isAnimationRunning = false;
    isAnimationPaused = false;
    animationCompleted = false;
    currentAnimationIndex = 0;
    updateAnimateButton();
    // animate();
  });
}

function animate() {
  if (animation) animation.pause();

  const shouldLoop = checkLoop.checked;
  console.log("Animating with loop:", shouldLoop);

  if (animationCompleted || (!isAnimationPaused && currentAnimationIndex === 0)) {
    currentAnimationIndex = 0;
    animationCompleted = false;
  }

  playNext(currentAnimationIndex, shouldLoop);
  isAnimationRunning = true;
  isAnimationPaused = false;
  updateAnimateButton();
}



function playNext(i, shouldLoop) {
  if (i >= interP.length) {
    return; 
  }

  currentAnimationIndex = i;
  const currentInterpolator = interP[i];
  
  animation = anime({
    duration: max - animationSpeed,
    easing: 'easeOutQuad',
    loop: false,
    direction: 'alternate',
    update: function (anim) {
      const t = anim.progress / 100;
      path.setAttribute('d', currentInterpolator(t));
    },
    complete: function () {
      if (i + 1 < interP.length) {
        playNext(i + 1, shouldLoop); 
      } else if (shouldLoop) {
        currentAnimationIndex = 0; 
        playNext(0, shouldLoop); 
      } else {
        isAnimationRunning = false;
        animationCompleted = true;
        currentAnimationIndex = 0; 
        updateAnimateButton();
      }
    }
  });
}

document.querySelector('#myRange').addEventListener('input', function () {
  animationSpeed = this.value;
  var speedAnimation = max - animationSpeed;
  if (animation) {
    animation.duration = speedAnimation;
  }
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
      const files = Array.from(e.target.files); 
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
  limitControl();

  const reader = new FileReader();
  reader.onload = function (event) {
    let svgContent = event.target.result;
    uploadAndDraw(svgContent);
    
    isAnimationReady = false;
    isAnimationRunning = false;
    updateAnimateButton();
  };
  reader.readAsText(file);
}

function limitControl() {
  if (svgs.length >= maxSVG) {
    svgs.shift();

    previewList.innerHTML = '';

    svgs.forEach((_, i) => {
      previewSVG(i);
    });

    if (svgs.length > 0) {
      svgContainer.innerHTML = svgs[0].svg;
    }
  }
}

function previewSVG(index) {
  const wrapper = document.createElement("div");
  wrapper.dataset.index = index;
  wrapper.style.display = "inline-block";
  wrapper.style.margin = "10px";

  let preview = SVG().addTo(wrapper).viewbox(0, 0, 400, 400);
  preview.svg(svgs[index].svg);

  previewList.appendChild(wrapper);
}

setupDropzone(dropzone);

Sortable.create(document.getElementById("trash-area"), {
  group: 'shared', 
  animation: 150,
  onAdd: function (evt) {
    const item = evt.item;
    const index = parseInt(item.dataset.index);

    if (!isNaN(index)) {
      svgs.splice(index, 1);
    }

    item.remove(); 

    previewList.innerHTML = '';
    svgs.forEach((_, i) => previewSVG(i));
    
    svgContainer.innerHTML = svgs.length > 0 ? svgs[0].svg : '';
    
    isAnimationReady = false;
    isAnimationRunning = false;
    updateAnimateButton();
  }
});

function resetUploads() {
  svgContainer.innerHTML = "";
  previewList.innerHTML = "";
  svgs.length = 0;
  
  isAnimationReady = false;
  isAnimationRunning = false;
  updateAnimateButton();
}

Sortable.create(previewList, {
  group: 'shared', 
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
    svgContainer.innerHTML = svgs.length > 0 ? svgs[0].svg : '';
    
    isAnimationReady = false;
    isAnimationRunning = false;
    updateAnimateButton();
  }
});

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
  svgContainer.appendChild(carGroup);
}

function modeChooser() {
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
}

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

const instructions = [
  "Upload an SVG or use the draw function",
  "Choose your own settings and see your path in action.",
  "Be aware that only similar SVG's are morphable",
  "Export your own creation as Video, Path or Path Animation!"
];

let currentStep = 0;
let autoAdvanceTimer;
let running = true;

const instructionText = document.getElementById("instructionText");
const main = document.getElementById("mainApp");
const nextBtn = document.getElementById("nextBtn");
const overlay = document.getElementById("welcomeOverlay");
const overlayText = document.querySelector("#welcomeOverlay h2");

function loopInstructions() {
  if (!running) return;

  instructionText.textContent = instructions[currentStep];

  currentStep = (currentStep + 1) % instructions.length;

  autoAdvanceTimer = setTimeout(loopInstructions, 2000);
}

nextBtn.addEventListener("click", () => {
  running = false;
  clearTimeout(autoAdvanceTimer);
  overlay.style.display = "none";
  main.style.display = "block";
});

loopInstructions();