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
let transparentFill = document.getElementById("transparentFill");
let transparentStroke = document.getElementById("transparentStroke");
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


//transparent Filling
transparentFill.addEventListener('change', function () {
  let currentFillColor;
  
  if (transparentFill.checked) {
    currentFillColor = getCurrentFillColor() || '#000';
  } else {
    currentFillColor = 'none';

  }
  changeSVGFillColor(currentFillColor);
});

//transparent Stroke
transparentStroke.addEventListener('change', function () {
  let currentStrokeColor;
  
  if (transparentStroke.checked) {
    currentStrokeColor = getCurrentStrokeColor() || '#000';
  } else {

    currentStrokeColor = 'none';
  }

  changeSVGStrokeColor(currentStrokeColor);
});

function setupDrawing() {
  previewDrawing.draw = SVG().addTo('#drawingArea').size(400, 400);

  const defs = previewDrawing.draw.defs();
  previewDrawing.styleElement = defs.element('style');


  function updateDrawingColor() {
    const currentFillColor = getCurrentFillColor(); 
    const currentStrokeColor = getCurrentStrokeColor(); 
    const currentStrokeWidth = getCurrentStrokeWidth();; 
  
    previewDrawing.styleElement.words(`
      .drawing-path {
        fill: ${currentFillColor};
        stroke: ${currentStrokeColor};
        stroke-width: ${currentStrokeWidth};
      }
    `);
  
    if (previewDrawing.pathp) {
      previewDrawing.pathp.stroke({ color: currentStrokeColor, width: currentStrokeWidth });
      previewDrawing.pathp.fill(currentFillColor);
    }
  }
  
  updateDrawingColor();
  
  previewDrawing.updateColor = updateDrawingColor;

  previewDrawing.pathp = previewDrawing.draw.path().addClass('drawing-path');

  previewDrawing.drawing = false;
  previewDrawing.points = [];

  previewDrawing.draw.on('mousedown', function (e) {
    console.log(e);
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
  path = document.querySelector("#path-00"); // 

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
    direction: 'normal',
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

//hieeer
function uploadAndDraw(svgContent) {
  setTimeout(() => {
    console.log(svgs.length);

    const currentFillColor = getCurrentFillColor();
    const currentStrokeColor = getCurrentStrokeColor();
    const currentStrokeWidth = getCurrentStrokeWidth();

    if (currentFillColor) {
      svgContent = applySingleSVGColor(svgContent, currentFillColor, 1);
    }

    if (currentStrokeColor) {
      svgContent = applySingleSVGColor(svgContent, currentStrokeColor, 2);
    }

    if (currentStrokeWidth) {
      svgContent = applySingleSVGColor(svgContent, getCurrentStrokeWidth(), 3);
    }

  
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const pathElement = svgDoc.querySelector("path");

    let index = svgs.length;
    const newId = `path-0${index}`;

    if (pathElement) {
      pathElement.setAttribute("id", newId);
    }
  
    const serializer = new XMLSerializer();
    svgContent = serializer.serializeToString(svgDoc.documentElement);

    let style = svgDoc.querySelector('style')?.textContent;

    console.log(style);
    
    const pathData = pathElement?.getAttribute("d");
  
    svgs.push({ svg: svgContent, path: pathData, id: newId, style: style});
    limitControl();
    
    if (currentID === 3) {
      createTracingElement();
    }

    if (index === 0) {
      svgContainer.innerHTML = svgs[index].svg;
    }

    if(index < maxSVG){
      previewSVG(index); 
    }
    
    setTimeout(() => {
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
  });
}
const timeline = document.getElementById('timeline');
let isTimelineDragging = false;
let wasAnimationRunning = false;
timeline.addEventListener('input', function() {
    if (!isTimelineDragging) {
        isTimelineDragging = true;
        wasAnimationRunning = isAnimationRunning;
        if (animation) {
            animation.pause();
        }
    }
    updateAnimationFromTimeline(this.value);
});

timeline.addEventListener('change', function() {
    isTimelineDragging = false;
    if (wasAnimationRunning) {
        resumeAnimationFromTimeline(this.value);
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        toggleAnimation();
    }
});

function updateAnimationFromTimeline(timelineValue) {
  const progress = parseFloat(timelineValue);
  
  const totalAnimations = interP.length;
  const progressPerAnimation = 100 / totalAnimations;
  
  const animationIndex = Math.floor(progress / progressPerAnimation);
  const localProgress = (progress % progressPerAnimation) / progressPerAnimation;
  
  const safeIndex = Math.min(animationIndex, interP.length - 1);
  const safeProgress = Math.max(0, Math.min(1, localProgress));
  
  if (interP[safeIndex]) {
      const selectedEasing = document.getElementById('easingSelect').value;
      const easingFunction = easingFunctions[selectedEasing] || (t => t);
      const easedProgress = easingFunction(safeProgress);
      
      path.setAttribute('d', interP[safeIndex](easedProgress));
      currentAnimationIndex = safeIndex;
  }
}

function onParameterChange() {
  if (isTimelineDragging) {
      updateAnimationFromTimeline(timeline.value);
  } else if (isAnimationRunning) {
      const currentProgress = timeline.value;
      if (animation) {
          animation.pause();
      }
      resumeAnimationFromTimeline(currentProgress);
  }
}

function resumeAnimationFromTimeline(timelineValue) {
  const progress = parseFloat(timelineValue);
  const totalAnimations = interP.length;
  const progressPerAnimation = 100 / totalAnimations;
  
  const animationIndex = Math.floor(progress / progressPerAnimation);
  const localProgress = (progress % progressPerAnimation) / progressPerAnimation;
  
  currentAnimationIndex = Math.min(animationIndex, interP.length - 1);
  
  playNextFromProgress(currentAnimationIndex, localProgress * 100, checkLoop.checked);
}


function toggleAnimation() {
  if (isAnimationRunning) {
      pauseAnimation();
  } else {
      resumeAnimation();
  }
}

function pauseAnimation() {
  if (animation) {
      animation.pause();
  }
  isAnimationRunning = false;
  isAnimationPaused = true;
  updateAnimateButton();
}

function resumeAnimation() {
  if (animation && isAnimationPaused) {
      animation.play();
      isAnimationRunning = true;
      isAnimationPaused = false;
  } else {
      const currentProgress = parseFloat(timeline.value);
      if (currentProgress >= 100) {
          timeline.value = 0;
          animate();
      } else {
          resumeAnimationFromTimeline(currentProgress);
      }
  }
  updateAnimateButton();
}


function animate() {
  if (animation) animation.pause();
  
  const shouldLoop = checkLoop.checked;
  console.log("Animating with loop:", shouldLoop);
  
  if (animationCompleted || (!isAnimationPaused && currentAnimationIndex === 0)) {
      currentAnimationIndex = 0;
      animationCompleted = false;
      if (!timelineUpdateLock) {
          timeline.value = 0;
      }
  }
  
  playNext(currentAnimationIndex, shouldLoop);
  isAnimationRunning = true;
  isAnimationPaused = false;
  updateAnimateButton();
}

const easingFunctions = {
  easeOutQuad: t => t * (2 - t),
  linear: t => t,
  easeInQuad: t => t * t,
  easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
};


function handleParameterChange() {
  if (isAnimationRunning) {
      timelineUpdateLock = true;
      const currentProgress = parseFloat(timeline.value);
      updateAnimationFromTimeline(currentProgress);
      timelineUpdateLock = false;
  }
}

let timelineUpdateLock = false;

timeline.addEventListener('mousedown', function() {
    isTimelineDragging = true;
    wasAnimationRunning = isAnimationRunning;
    if (animation) {
        animation.pause();
    }
    timelineUpdateLock = true;
});

timeline.addEventListener('mouseup', function() {
    isTimelineDragging = false;
    timelineUpdateLock = false;
    if (wasAnimationRunning) {
        resumeAnimationFromTimeline(this.value);
    }
});

timeline.addEventListener('input', function() {
    updateAnimationFromTimeline(this.value);
});

animateButton.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        toggleAnimation();
    }
});

timeline.addEventListener('click', function(event) {
    if (!isTimelineDragging) {
        const rect = timeline.getBoundingClientRect();
        const clickPosition = (event.clientX - rect.left) / rect.width;
        const newValue = clickPosition * 100;
        
        timeline.value = newValue;
        updateAnimationFromTimeline(newValue);
        if (isAnimationRunning) {
            resumeAnimationFromTimeline(newValue);
        }
    }
});

function playNextFromProgress(i, startProgress, shouldLoop) {
  if (i >= interP.length) return;
  
  // Stoppe vorherige Animation
  if (animation) animation.pause();
  
  currentAnimationIndex = i;
  const currentInterpolator = interP[i];
  const selectedEasing = document.getElementById('easingSelect').value;
  const easingFunction = easingFunctions[selectedEasing] || (t => t);
  
  // Berechne verbleibende Duration basierend auf startProgress
  const remainingProgress = 100 - startProgress;
  const remainingDuration = (max - animationSpeed) * (remainingProgress / 100);
  
  animation = anime({
      duration: remainingDuration,
      easing: 'linear',
      loop: false,
      direction: 'alternate',
      update: function(anim) {
          const currentProgress = startProgress + (anim.progress * remainingProgress / 100);
          const t = currentProgress / 100;
          const easedT = easingFunction(t);
          
          path.setAttribute('d', currentInterpolator(easedT));
          
          // Aktualisiere Timeline (nur wenn nicht manuell gesteuert)
          if (!timelineUpdateLock && !isTimelineDragging) {
              const totalAnimations = interP.length;
              const progressPerAnimation = 100 / totalAnimations;
              const globalProgress = (i * progressPerAnimation) + (currentProgress * progressPerAnimation / 100);
              timeline.value = Math.min(100, globalProgress);
          }
      },
      complete: function() {
          if (i + 1 < interP.length) {
              playNext(i + 1, shouldLoop);
          } else if (shouldLoop) {
              currentAnimationIndex = 0;
              if (!timelineUpdateLock) {
                  timeline.value = 0;
              }
              playNext(0, shouldLoop);
          } else {
              isAnimationRunning = false;
              animationCompleted = true;
              currentAnimationIndex = 0;
              if (!timelineUpdateLock) {
                  timeline.value = 100;
              }
              updateAnimateButton();
          }
      }
  });
  
  isAnimationRunning = true;
  isAnimationPaused = false;
  updateAnimateButton();
}

function playNext(i, shouldLoop) {
  if (i >= interP.length) return;
  
  // Stoppe vorherige Animation
  if (animation) animation.pause();
  
  currentAnimationIndex = i;
  const currentInterpolator = interP[i];
  const selectedEasing = document.getElementById('easingSelect').value;
  const easingFunction = easingFunctions[selectedEasing] || (t => t);
  
  animation = anime({
      duration: max - animationSpeed,
      easing: 'linear',
      loop: false,
      direction: 'alternate',
      update: function(anim) {
          const t = anim.progress / 100;
          const easedT = easingFunction(t);
          
          path.setAttribute('d', currentInterpolator(easedT));
          if (!timelineUpdateLock && !isTimelineDragging) {
              const totalAnimations = interP.length;
              const progressPerAnimation = 100 / totalAnimations;
              const globalProgress = (i * progressPerAnimation) + (anim.progress * progressPerAnimation / 100);
              timeline.value = Math.min(100, globalProgress);
          }
      },
      complete: function() {
          if (i + 1 < interP.length) {
              playNext(i + 1, shouldLoop);
          } else if (shouldLoop) {
              currentAnimationIndex = 0;
              if (!timelineUpdateLock) {
                  timeline.value = 0;
              }
              playNext(0, shouldLoop);
          } else {
              isAnimationRunning = false;
              animationCompleted = true;
              currentAnimationIndex = 0;
              if (!timelineUpdateLock) {
                  timeline.value = 100;
              }
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
let previewList = document.getElementById("svg-preview-list");
let svgContainer = document.getElementById("svg-container");

function setupDropzone(dropzone) {
  dropzone.addEventListener("click", () => {
    input.click();
    input.onchange = (e) => {
      let files = Array.from(e.target.files); 
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
  if (svgs.length > maxSVG) {
    svgs.shift();

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
const openDrawBtn = document.getElementById("drawBtn");

openDrawBtn.addEventListener("click", () => {
  drawWindow.style.display = "flex";
  updateDrawingAreaOnOpen();
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

function changeSVGFillColor(newColor) {
  if (!svgs || svgs.length === 0) {
    console.log("No SVGs uploaded yet");
    return;
  }

  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  svgs.forEach((svgObj, index) => {
    const svgDoc = parser.parseFromString(svgObj.svg, "image/svg+xml");
    
    const elementsWithFill = svgDoc.querySelectorAll('[fill]');
    const pathElements = svgDoc.querySelectorAll('path');
    const allShapes = svgDoc.querySelectorAll('circle, rect, ellipse, polygon, polyline, line');
    
    elementsWithFill.forEach(element => {
      element.setAttribute('fill', newColor);
      
    });
  
    pathElements.forEach(element => {
      element.setAttribute('fill', newColor);
    });
    
    allShapes.forEach(element => {
      element.setAttribute('fill', newColor);
    });
    
    const styleElements = svgDoc.querySelectorAll('style');
    styleElements.forEach(styleEl => {
      let cssText = styleEl.textContent;
      cssText = cssText.replace(/fill\s*:\s*[^;]+/g, `fill: ${newColor}`);
      styleEl.textContent = cssText;
    });
    
    svgObj.svg = serializer.serializeToString(svgDoc.documentElement);
    svgObj.style = svgDoc.querySelector('style')?.textContent || svgObj.style;
  });
  
  if (previewDrawing && previewDrawing.updateColor) {
    previewDrawing.updateColor();
  }
  
  if (svgs.length > 0) {
    svgContainer.innerHTML = svgs[0].svg;
  }
  
  previewList.innerHTML = '';
  svgs.forEach((_, index) => previewSVG(index));
  isAnimationReady = false;
  isAnimationRunning = false;
  updateAnimateButton();
  
  console.log(`Changed fill color to ${newColor} for ${svgs.length} SVG(s)`);
}

function changeSVGStrokeColor(newColor) {
  if (!svgs || svgs.length === 0) {
    console.log("No SVGs uploaded yet");
    return;
  }

  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  svgs.forEach((svgObj, index) => {
    const svgDoc = parser.parseFromString(svgObj.svg, "image/svg+xml");
    
    const elementsWithFill = svgDoc.querySelectorAll('[stroke]');
    const pathElements = svgDoc.querySelectorAll('path');
    const allShapes = svgDoc.querySelectorAll('circle, rect, ellipse, polygon, polyline, line');
    
    elementsWithFill.forEach(element => {
      element.setAttribute('stroke', newColor);
      
    });
  
    pathElements.forEach(element => {
      element.setAttribute('stroke', newColor);
    });
    
    allShapes.forEach(element => {
      element.setAttribute('stroke', newColor);
    });
    
    const styleElements = svgDoc.querySelectorAll('style');
    styleElements.forEach(styleEl => {
      let cssText = styleEl.textContent;
      cssText = cssText.replace(/stroke\s*:\s*[^;]+/g, `stroke: ${newColor}`);
      styleEl.textContent = cssText;
    });
    
    svgObj.svg = serializer.serializeToString(svgDoc.documentElement);
    svgObj.style = svgDoc.querySelector('style')?.textContent || svgObj.style;
  });
  
  if (previewDrawing && previewDrawing.updateColor) {
    previewDrawing.updateColor();
  }
  
  if (svgs.length > 0) {
    svgContainer.innerHTML = svgs[0].svg;
  }
  
  previewList.innerHTML = '';
  svgs.forEach((_, index) => previewSVG(index));
  isAnimationReady = false;
  isAnimationRunning = false;
  updateAnimateButton();
  
  console.log(`Changed stroke color to ${newColor} for ${svgs.length} SVG(s)`);
}

function setupFillColorChanger() {
  const colorPickerFill = document.getElementById('fillColorPicker');
  const transparentFill = document.getElementById('transparentFill');

  if (colorPickerFill) {
    colorPickerFill.addEventListener('input', (e) => {
      if (transparentFill && transparentFill.checked) {
        changeSVGFillColor(e.target.value);
      }
    });
  }
  
  if (transparentFill) {
    transparentFill.addEventListener('change', function () {
      const currentFillColor = getCurrentFillColor();
      changeSVGFillColor(currentFillColor);
    });
  }
}

function setupStrokeColorChanger() {
  const colorPickerStroke = document.getElementById('strokeColorPicker');
  const transparentStroke = document.getElementById('transparentStroke');

  if (colorPickerStroke) {
    colorPickerStroke.addEventListener('input', (e) => {
      if (transparentStroke && transparentStroke.checked) {
        changeSVGStrokeColor(e.target.value);
      
      }
    });
  }
  
  if (transparentStroke) {
    transparentStroke.addEventListener('change', function () {
      const currentStrokeColor = getCurrentStrokeColor();
      changeSVGStrokeColor(currentStrokeColor);
    });
  }
}

setupFillColorChanger();
setupStrokeColorChanger();



function getCurrentFillColor() {
  const colorPickerFill = document.getElementById('fillColorPicker');
  const transparentFill = document.getElementById('transparentFill');
  
  if (!transparentFill || !transparentFill.checked) {
    return 'none';
  }
  
  return colorPickerFill ? colorPickerFill.value : '#000';
}

function getCurrentStrokeColor() {
  const colorPickerStroke = document.getElementById('strokeColorPicker');
  const transparentStroke = document.getElementById('transparentStroke');
  
  if (!transparentStroke || !transparentStroke.checked) {
    return 'none';
  }
  
  return colorPickerStroke ? colorPickerStroke.value : '#000';
}

function getCurrentStrokeWidth() {
  const strokeWidthSlider = document.getElementById('strokeWidthSlider');
  return strokeWidthSlider ? strokeWidthSlider.value || '1' : '1';
}


function applySingleSVGColor(svgContent, color, number) {
  if (!color) return svgContent;
  
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  
  const elementsWithFill = svgDoc.querySelectorAll('[fill]');
  const elementsWithStroke = svgDoc.querySelectorAll('[stroke]');
  const pathElements = svgDoc.querySelectorAll('path');
  const allShapes = svgDoc.querySelectorAll('circle, rect, ellipse, polygon, polyline, line');
  

  if (number == 1){
  elementsWithFill.forEach(element => {
    element.setAttribute('fill', color);
  });

  pathElements.forEach(element => {
    element.setAttribute('fill', color);
  });
  
  allShapes.forEach(element => {
    element.setAttribute('fill', color);
  });
  
  const styleElements = svgDoc.querySelectorAll('style');
  styleElements.forEach(styleEl => {
    let cssText = styleEl.textContent;
    cssText = cssText.replace(/fill\s*:\s*[^;]+/g, `fill: ${color}`);
    styleEl.textContent = cssText;
  });
}

if (number == 2){
  elementsWithFill.forEach(element => {
    element.setAttribute('stroke', color);
  });

  pathElements.forEach(element => {
    element.setAttribute('stroke', color);
  });
  
  allShapes.forEach(element => {
    element.setAttribute('stroke', color);
  });
  
  const styleElements = svgDoc.querySelectorAll('style');
  styleElements.forEach(styleEl => {
    let cssText = styleEl.textContent;
    cssText = cssText.replace(/stroke\s*:\s*[^;]+/g, `stroke: ${color}`);
    styleEl.textContent = cssText;
  });
}

if (number == 3){
  pathElements.forEach(el => el.setAttribute('stroke-width', color));
  allShapes.forEach(el => el.setAttribute('stroke-width', color));
  const styleElements = svgDoc.querySelectorAll('style');
  styleElements.forEach(styleEl => {
    styleEl.textContent = styleEl.textContent.replace(/stroke-width\s*:\s*[^;]+/g, `stroke-width: ${color}`);
  });
}

  
  return serializer.serializeToString(svgDoc.documentElement);
}

function updateDrawingAreaOnOpen() {
  if (previewDrawing && previewDrawing.updateColor) {
    previewDrawing.updateColor();
  }
}


function changeSVGStrokeWidth(newWidth) {
  if (!svgs || svgs.length === 0) {
    console.log("No SVGs uploaded yet");
    return;
  }

  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  svgs.forEach((svgObj, index) => {
    const svgDoc = parser.parseFromString(svgObj.svg, "image/svg+xml");
    
    const elementsWithStroke = svgDoc.querySelectorAll('[stroke]');
    const pathElements = svgDoc.querySelectorAll('path');
    const allShapes = svgDoc.querySelectorAll('circle, rect, ellipse, polygon, polyline, line');
    
    elementsWithStroke.forEach(element => {
      element.setAttribute('stroke-width', newWidth);
    });
  
    pathElements.forEach(element => {
      element.setAttribute('stroke-width', newWidth);
    });
    
    allShapes.forEach(element => {
      element.setAttribute('stroke-width', newWidth);
    });
    
    const styleElements = svgDoc.querySelectorAll('style');
    styleElements.forEach(styleEl => {
      let cssText = styleEl.textContent;
      cssText = cssText.replace(/stroke-width\s*:\s*[^;]+/g, `stroke-width: ${newWidth}`);
      styleEl.textContent = cssText;
    });
    
    svgObj.svg = serializer.serializeToString(svgDoc.documentElement);
    svgObj.style = svgDoc.querySelector('style')?.textContent || svgObj.style;
  });
  
  if (svgs.length > 0) {
    svgContainer.innerHTML = svgs[0].svg;
  }
  
  previewList.innerHTML = '';
  svgs.forEach((_, index) => previewSVG(index));
  
  console.log(`Changed stroke width to ${newWidth} for ${svgs.length} SVG(s)`);
}

function setupStrokeWidthControl() {
  const strokeWidthSlider = document.getElementById('strokeWidthSlider');

  if (strokeWidthSlider) {
    strokeWidthSlider.addEventListener('input', (e) => {
      const width = e.target.value;
      changeSVGStrokeWidth(width);
      if (previewDrawing && previewDrawing.updateColor) {
        previewDrawing.updateColor();
      }
    });
  }
}

setupStrokeWidthControl();


let exportIndexSVG = 0;
let exportIndexPNG = 0;
let exportIndexMP4 = 0;

//SVG EXPORT
function exportSVGContainer() {
  const svgElement = document.querySelector("#svg-container svg");
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  return { svgElement, url };
}

document.getElementById("export-btn-svg").addEventListener("click", () => {
  const { url } = exportSVGContainer();
  const a = document.createElement("a");
  a.href = url;
  a.download = `vectra${exportIndexSVG++}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

//PNG EXPORT
document.getElementById("export-btn-png").addEventListener("click", () => {
  const { svgElement, url } = exportSVGContainer();
  const svgWidth = svgElement.getAttribute('width') || svgElement.viewBox.baseVal.width || 1920;
  const svgHeight = svgElement.getAttribute('height') || svgElement.viewBox.baseVal.height || 1080;

  const canvas = document.createElement("canvas");
  canvas.width = svgWidth;
  canvas.height = svgHeight;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
    canvas.toBlob((blob) => {
      const pngUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `vectra${exportIndexPNG++}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(pngUrl);
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  img.onerror = () => console.error("Failed to load SVG for PNG export.");
  img.src = url;
});

// VIDEO EXPORT


