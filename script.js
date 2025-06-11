let checkLoop = document.getElementById("checkLoop");
let deleteButton = document.getElementById("delete-button");
let animateButton = document.getElementById("animate-button");
let slider = document.getElementById("myRange");
let animation = null;
let animationSpeed = slider ? parseFloat(slider.value) : 0.001;
let svgs = [];
let maxSVG = 6;
let currentID = 1;
let interP = [];
let path = null;
let isCalculating = false;
let loadingElement = null;
let isAnimationReady = false;
let isAnimationRunning = false;
let currentAnimationIndex = 0;
let isAnimationPaused = false;
let animationCompleted = false;
let transparentFill = document.getElementById("transparentFill");
let transparentStroke = document.getElementById("transparentStroke");
let exportIndexSVG = 0;
let exportIndexPNG = 0;
const drawWindow = document.getElementById("drawWindow");
const openDrawBtn = document.getElementById("drawBtn");
const timeline = document.getElementById('timeline');
let isTimelineDragging = false;
let wasAnimationRunning = false;
let dropzone = document.querySelector('.dropzone');
let input = document.querySelector("input[type='file']");
let previewList = document.getElementById("svg-preview-list");
let svgContainer = document.getElementById("svg-container");
const maxVal = parseInt(document.getElementById("myRange").max);
const max = maxVal * 1.2;
const saveDraw = document.getElementById("saveDraw");
const clearDraw = document.getElementById("clearDraw");
const closeDraw = document.getElementById("closeDraw");
let previewDrawing = {}
let currentStep = 0;
let autoAdvanceTimer;
let running = true;
const instructionText = document.getElementById("instructionText");
const main = document.getElementById("mainApp");
const nextBtn = document.getElementById("nextBtn");
const overlay = document.getElementById("welcomeOverlay");
const NORMALIZED_SIZE = 400;
const NORMALIZED_VIEWBOX = `0 0 ${NORMALIZED_SIZE} ${NORMALIZED_SIZE}`;
const PATH_PADDING = 0.8;
let timelineUpdateLock = false;


transparentFill.addEventListener('change', function () {
  let currentFillColor;

  if (transparentFill.checked) {
    currentFillColor = getCurrentFillColor() || '#000';
  } else {
    currentFillColor = 'none';
  }
  changeSVGFillColor(currentFillColor);
});

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
    const currentStrokeWidth = getCurrentStrokeWidth();
  
    previewDrawing.styleElement.words(`
      .drawing-path {
        fill: ${currentFillColor};
        stroke: ${currentStrokeColor};
        stroke-width: ${currentStrokeWidth};
      }
    `);
    const pathEl = document.querySelector("#path-00");
    if (pathEl) {
      pathEl.setAttribute("fill", currentFillColor);
      pathEl.setAttribute("stroke", currentStrokeColor);
      pathEl.setAttribute("stroke-width", currentStrokeWidth);
    }
  }
  


  updateDrawingColor();

  previewDrawing.updateColor = updateDrawingColor;

  previewDrawing.pathp = previewDrawing.draw.path().addClass('drawing-path');

  previewDrawing.drawing = false;
  previewDrawing.points = [];

  previewDrawing.draw.on('mousedown', function (e) {
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
  limitControl();
  uploadAndDraw(svgContent);
  previewDrawing.points = [];
  previewDrawing.pathp.plot('');
  isAnimationReady = false;
  isAnimationRunning = false;
  updateAnimateButton();
});

deleteButton.addEventListener("click", () => {
  if (animation) {
      animation.pause();
      animation = null;
  }
  
  timeline.value = 0;
  
  isAnimationReady = false;
  isAnimationRunning = false;
  isTimelineDragging = false;
  wasAnimationRunning = false;
  currentAnimationIndex = 0;
  
  drawingArea.innerHTML = "";
  resetUploads();
  setupDrawing();
  updateAnimateButton();
});


setupDrawing();



function createLoadingElement() {
  if (!loadingElement) {
    loadingElement = document.createElement('div');
    document.body.appendChild(loadingElement);
  }
}

function updateAnimateButton() {
  if (isAnimationRunning) {
    animateButton.innerHTML = `
      <svg fill="#000000" width="25px" height="25px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <title>pause</title>
        <path d="M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.44 0.576t-0.576 1.44v16.16zM18.016 24.096q0 0.832 0.608 1.408t1.408 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.408 0.576t-0.608 1.44v16.16z"></path>
      </svg>
    `;
  } else {
    animateButton.innerHTML = `
      <svg width="25px" height="25px" viewBox="-1 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g transform="translate(-65, -3803)" fill="#000000">
            <g transform="translate(56, 160)">
              <path d="M18.074,3650.7335 L12.308,3654.6315 C10.903,3655.5815 9,3654.5835 9,3652.8985 L9,3645.1015 C9,3643.4155 10.903,3642.4185 12.308,3643.3685 L18.074,3647.2665 C19.306,3648.0995 19.306,3649.9005 18.074,3650.7335"></path>
            </g>
          </g>
        </g>
      </svg>
    `;
  }
}

function morphingAnimation() {
  if (isCalculating) {
    return;
  }

  if (svgs.length < 2) {
    return;
  }


  setTimeout(() => {
    try {
      interP = [];

      for (let i = 0; i < svgs.length; i++) {

        if (i === (svgs.length - 1)) {
          interP[i] = flubber.interpolate(svgs[i].path, svgs[0].path, { maxSegmentLength: 1 });
        } else {
          interP[i] = flubber.interpolate(svgs[i].path, svgs[i + 1].path, { maxSegmentLength: 1 });
        }
      }

      path = document.querySelector("#path-00");

      if (!path) {
        return;
      }
      isAnimationReady = true;
      animate();

    } catch (error) {
    }
  }, 100);
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
  animateButton.innerHTML = ""; 
  animateButton.textContent = "";



  setTimeout(() => {
    morphingAnimation();
    setTimeout(() => {
      animateButton.classList.remove('button-loading');
      animateButton.innerHTML = ""; 
      updateAnimateButton();
    }, 500);
  }, 100);
});

function normalizePathToCenter(pathData, targetSize = NORMALIZED_SIZE) {
    if (!pathData) return pathData;
    
    try {
        const bounds = getPathBounds(pathData);
        if (!bounds || bounds.width === 0 || bounds.height === 0) {
            return pathData;
        }
        
        const availableSize = targetSize * PATH_PADDING;
        const scaleX = availableSize / bounds.width;
        const scaleY = availableSize / bounds.height;
        const scale = Math.min(scaleX, scaleY);
        
        const scaledWidth = bounds.width * scale;
        const scaledHeight = bounds.height * scale;
        const translateX = (targetSize - scaledWidth) / 2 - bounds.minX * scale;
        const translateY = (targetSize - scaledHeight) / 2 - bounds.minY * scale;
        
        return transformPath(pathData, translateX, translateY, scale);
    } catch (error) {
        return pathData;
    }
}

function getPathBounds(pathData) {
    const commands = parsePathData(pathData);
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    let currentX = 0, currentY = 0;
    let startX = 0, startY = 0;

    for (const cmd of commands) {
        const { type, values } = cmd;
        const isRelative = type.toLowerCase() === type;
        
        switch (type.toLowerCase()) {
            case 'm':
                currentX = isRelative ? currentX + values[0] : values[0];
                currentY = isRelative ? currentY + values[1] : values[1];
                startX = currentX;
                startY = currentY;
                updateBounds(currentX, currentY);
                break;
                
            case 'l':
                currentX = isRelative ? currentX + values[0] : values[0];
                currentY = isRelative ? currentY + values[1] : values[1];
                updateBounds(currentX, currentY);
                break;
                
            case 'h':
                currentX = isRelative ? currentX + values[0] : values[0];
                updateBounds(currentX, currentY);
                break;
                
            case 'v':
                currentY = isRelative ? currentY + values[0] : values[0];
                updateBounds(currentX, currentY);
                break;
                
            case 'c':
                for (let i = 0; i < values.length; i += 6) {
                    const x1 = isRelative ? currentX + values[i] : values[i];
                    const y1 = isRelative ? currentY + values[i + 1] : values[i + 1];
                    const x2 = isRelative ? currentX + values[i + 2] : values[i + 2];
                    const y2 = isRelative ? currentY + values[i + 3] : values[i + 3];
                    const x = isRelative ? currentX + values[i + 4] : values[i + 4];
                    const y = isRelative ? currentY + values[i + 5] : values[i + 5];
                    
                    updateBounds(x1, y1);
                    updateBounds(x2, y2);
                    updateBounds(x, y);
                    
                    currentX = x;
                    currentY = y;
                }
                break;
                
            case 'q':
                for (let i = 0; i < values.length; i += 4) {
                    const x1 = isRelative ? currentX + values[i] : values[i];
                    const y1 = isRelative ? currentY + values[i + 1] : values[i + 1];
                    const x = isRelative ? currentX + values[i + 2] : values[i + 2];
                    const y = isRelative ? currentY + values[i + 3] : values[i + 3];
                    
                    updateBounds(x1, y1);
                    updateBounds(x, y);
                    
                    currentX = x;
                    currentY = y;
                }
                break;
                
            case 'a':
                for (let i = 0; i < values.length; i += 7) {
                    const x = isRelative ? currentX + values[i + 5] : values[i + 5];
                    const y = isRelative ? currentY + values[i + 6] : values[i + 6];
                    updateBounds(x, y);
                    currentX = x;
                    currentY = y;
                }
                break;
                
            case 'z':
                currentX = startX;
                currentY = startY;
                break;
        }
    }
    
    function updateBounds(x, y) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    }
    
    return {
        minX,
        minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

function parsePathData(pathData) {
    const commands = [];
    const commandRegex = /([MmLlHhVvCcSsQqTtAaZz])[^MmLlHhVvCcSsQqTtAaZz]*/g;
    let match;
    
    while ((match = commandRegex.exec(pathData)) !== null) {
        const commandStr = match[0];
        const type = commandStr[0];
        const valueStr = commandStr.slice(1).trim();
        const values = valueStr.match(/-?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
        commands.push({
            type,
            values: values.map(Number)
        });
    }
    
    return commands;
}

function transformPath(pathData, translateX, translateY, scale) {
    const commands = parsePathData(pathData);
    let result = '';
    
    for (const cmd of commands) {
        const { type, values } = cmd;
        const isRelative = type.toLowerCase() === type;
        result += type;
        
        switch (type.toLowerCase()) {
            case 'm':
            case 'l':
                for (let i = 0; i < values.length; i += 2) {
                    const x = values[i] * scale + (isRelative ? 0 : translateX);
                    const y = values[i + 1] * scale + (isRelative ? 0 : translateY);
                    result += `${x.toFixed(2)},${y.toFixed(2)} `;
                }
                break;
                
            case 'h':
                for (let i = 0; i < values.length; i++) {
                    const x = values[i] * scale + (isRelative ? 0 : translateX);
                    result += `${x.toFixed(2)} `;
                }
                break;
                
            case 'v':
                for (let i = 0; i < values.length; i++) {
                    const y = values[i] * scale + (isRelative ? 0 : translateY);
                    result += `${y.toFixed(2)} `;
                }
                break;
                
            case 'c':
                for (let i = 0; i < values.length; i += 6) {
                    const x1 = values[i] * scale + (isRelative ? 0 : translateX);
                    const y1 = values[i + 1] * scale + (isRelative ? 0 : translateY);
                    const x2 = values[i + 2] * scale + (isRelative ? 0 : translateX);
                    const y2 = values[i + 3] * scale + (isRelative ? 0 : translateY);
                    const x = values[i + 4] * scale + (isRelative ? 0 : translateX);
                    const y = values[i + 5] * scale + (isRelative ? 0 : translateY);
                    result += `${x1.toFixed(2)},${y1.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)} ${x.toFixed(2)},${y.toFixed(2)} `;
                }
                break;
                
            case 'q':
                for (let i = 0; i < values.length; i += 4) {
                    const x1 = values[i] * scale + (isRelative ? 0 : translateX);
                    const y1 = values[i + 1] * scale + (isRelative ? 0 : translateY);
                    const x = values[i + 2] * scale + (isRelative ? 0 : translateX);
                    const y = values[i + 3] * scale + (isRelative ? 0 : translateY);
                    result += `${x1.toFixed(2)},${y1.toFixed(2)} ${x.toFixed(2)},${y.toFixed(2)} `;
                }
                break;
                
            case 'a':
                for (let i = 0; i < values.length; i += 7) {
                    const rx = values[i] * scale;
                    const ry = values[i + 1] * scale;
                    const rotation = values[i + 2];
                    const largeArc = values[i + 3];
                    const sweep = values[i + 4];
                    const x = values[i + 5] * scale + (isRelative ? 0 : translateX);
                    const y = values[i + 6] * scale + (isRelative ? 0 : translateY);
                    result += `${rx.toFixed(2)},${ry.toFixed(2)} ${rotation} ${largeArc},${sweep} ${x.toFixed(2)},${y.toFixed(2)} `;
                }
                break;
                
            case 's':
                for (let i = 0; i < values.length; i += 4) {
                    const x2 = values[i] * scale + (isRelative ? 0 : translateX);
                    const y2 = values[i + 1] * scale + (isRelative ? 0 : translateY);
                    const x = values[i + 2] * scale + (isRelative ? 0 : translateX);
                    const y = values[i + 3] * scale + (isRelative ? 0 : translateY);
                    result += `${x2.toFixed(2)},${y2.toFixed(2)} ${x.toFixed(2)},${y.toFixed(2)} `;
                }
                break;
                
            case 't':
                for (let i = 0; i < values.length; i += 2) {
                    const x = values[i] * scale + (isRelative ? 0 : translateX);
                    const y = values[i + 1] * scale + (isRelative ? 0 : translateY);
                    result += `${x.toFixed(2)},${y.toFixed(2)} `;
                }
                break;
                
            case 'z':
                break;
        }
    }
    
    return result.trim();
}

function keepOnlyFirstPath(svgContent) {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");

  
  const pathElements = svgDoc.querySelectorAll("path");
  
  if (pathElements.length <= 1) {
      return svgContent;
  }

  for (let i = 1; i < pathElements.length; i++) {
      pathElements[i].remove();
  }
  
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgDoc);
}

function createNormalizedSVG(svgContent) {

  const singlePathSVG = keepOnlyFirstPath(svgContent);
  
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(singlePathSVG, "image/svg+xml");
  
  
  const svgElement = svgDoc.documentElement;
  const pathElement = svgDoc.querySelector("path");
  
  svgElement.setAttribute('viewBox', NORMALIZED_VIEWBOX);
  svgElement.setAttribute('width', NORMALIZED_SIZE);
  svgElement.setAttribute('height', NORMALIZED_SIZE);
  svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  
  if (pathElement) {
      const originalPath = pathElement.getAttribute("d");
      const normalizedPath = normalizePathToCenter(originalPath);
      pathElement.setAttribute("d", normalizedPath);
  }
  
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgDoc);
}

function testNormalization(pathData) {
    const normalized = normalizePathToCenter(pathData);
    return normalized;
}


function uploadAndDraw(svgContent) {
    setTimeout(() => {
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
        
        const normalizedSVG = createNormalizedSVG(svgContent);
        
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(normalizedSVG, "image/svg+xml");
        const pathElement = svgDoc.querySelector("path");
        const svgElement = svgDoc.documentElement;
        
        let index = svgs.length;
        const newId = `path-0${index}`;
        
        if (pathElement) {
            pathElement.setAttribute("id", newId);
        }
        
        const serializer = new XMLSerializer();
        const finalSVGContent = serializer.serializeToString(svgDoc);
        
        let style = svgDoc.querySelector('style')?.textContent;
        
        const pathData = pathElement?.getAttribute("d");
        
        svgs.push({ 
            svg: finalSVGContent, 
            path: pathData,
            id: newId, 
            style: style 
        });
        
        limitControl();
        
        if (index === 0) {
            svgContainer.innerHTML = svgs[index].svg;
            setupMorphingContainer();
        }
        
        if (index < maxSVG) {
            previewSVG(index);
        }
        
        setTimeout(() => {

        }, 300);
    }, 50);
}

function setupMorphingContainer() {
    if (svgContainer) {
        const containerSvg = svgContainer.querySelector('svg');
        if (containerSvg) {
            containerSvg.setAttribute('viewBox', NORMALIZED_VIEWBOX);
            containerSvg.setAttribute('width', NORMALIZED_SIZE);
            containerSvg.setAttribute('height', NORMALIZED_SIZE);
            containerSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        }
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

timeline.addEventListener('input', function () {
  if (!isTimelineDragging) {
    isTimelineDragging = true;
    wasAnimationRunning = isAnimationRunning;
    if (animation) {
      animation.pause();
    }
  }
  updateAnimationFromTimeline(this.value);
});

timeline.addEventListener('change', function () {
  isTimelineDragging = false;
  if (wasAnimationRunning) {
    resumeAnimationFromTimeline(this.value);
  }
});

document.addEventListener('keydown', function (event) {
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

timeline.addEventListener('mousedown', function () {
  isTimelineDragging = true;
  wasAnimationRunning = isAnimationRunning;
  if (animation) {
    animation.pause();
  }
  timelineUpdateLock = true;
});

timeline.addEventListener('mouseup', function () {
  isTimelineDragging = false;
  timelineUpdateLock = false;
  if (wasAnimationRunning) {
    resumeAnimationFromTimeline(this.value);
  }
});

timeline.addEventListener('input', function () {
  updateAnimationFromTimeline(this.value);
});

animateButton.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    toggleAnimation();
  }
});

timeline.addEventListener('click', function (event) {
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

  if (animation) animation.pause();

  currentAnimationIndex = i;
  const currentInterpolator = interP[i];
  const selectedEasing = document.getElementById('easingSelect').value;
  const easingFunction = easingFunctions[selectedEasing] || (t => t);

  const remainingProgress = 100 - startProgress;
  const remainingDuration = (max - animationSpeed) * (remainingProgress / 100);

  animation = anime({
    duration: remainingDuration,
    easing: 'linear',
    loop: false,
    direction: 'alternate',
    update: function (anim) {
      const currentProgress = startProgress + (anim.progress * remainingProgress / 100);
      const t = currentProgress / 100;
      const easedT = easingFunction(t);

      path.setAttribute('d', currentInterpolator(easedT));

      if (!timelineUpdateLock && !isTimelineDragging) {
        const totalAnimations = interP.length;
        const progressPerAnimation = 100 / totalAnimations;
        const globalProgress = (i * progressPerAnimation) + (currentProgress * progressPerAnimation / 100);
        timeline.value = Math.min(100, globalProgress);
      }
    },
    complete: function () {
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
    update: function (anim) {
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
    complete: function () {
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
  let speedAnimation = max - animationSpeed;
  if (animation) {
    animation.duration = speedAnimation;
  }
});


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
  "Upload an SVG or use the brush to draw your own SVG",
  "Choose your own settings and see your path in action.",
  "Be aware that only similar SVG's are morphable",
  "Export your own creation as Video, Path or Path Animation!"
];

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
}

function changeSVGStrokeColor(newColor) {
  if (!svgs || svgs.length === 0) {
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


  if (number == 1) {
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

  if (number == 2) {
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

  if (number == 3) {
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
  img.src = url;
});
