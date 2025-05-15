var checkLoop= document.getElementById("checkLoop");
var deleteButton= document.getElementById("delete-button");
var pauseAnimation = document.getElementById('pauseAnimation')
var slider = document.getElementById("myRange");
const maxVal = parseInt(document.getElementById("myRange").max);
const max = maxVal*1.2;
let animation = null;
let animationSpeed = slider ? parseFloat(slider.value) : 0.001;
let uploadedPaths = {
  1: null,
  2: null  
};
let interpolator = null;
let path = null;
let start = null;
let end = null;

function animate() {
  if (animation) animation.pause();

  const shouldLoop = checkLoop.checked;
  console.log("Animating with loop:", shouldLoop);

  animation = anime({
    targets: {},
    duration: max - animationSpeed,
    easing: 'easeOutQuad',
    loop: shouldLoop,
    direction: 'alternate',
    update: function(anim) {
      const t = anim.progress / 100;
      if (path && interpolator) {
        path.setAttribute('d', interpolator(t));
      }
    }
  });
}

function morphingAnimation(start, end) {
  interpolator = flubber.interpolate(start, end, { maxSegmentLength: 1 });

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

  animate(); 
}

if (checkLoop) {
  checkLoop.addEventListener('change', function () {
    if (uploadedPaths[1] && uploadedPaths[2]) {
      animate();
    } else {
      window.loopPreference = this.checked;
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

document.querySelector('#myRange').addEventListener('input', function() {
  animationSpeed = this.value;
  var speedAnimation = max - animationSpeed;
    animation.duration = speedAnimation;
});

//Drag and Drop function 
const dropZoneMSG = document.querySelector("#dropzone h4");
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
    
    if (id === 1){
      svgContainer.innerHTML = "";

      const clonedSVG = document.importNode(importedSVG, true);
      svgContainer.appendChild(clonedSVG);
      start = uploadedPaths[id].querySelector('path').getAttribute('d'); 
      console.log('SVG 1 d value:', start);
      Draggable.create("#path-01", {
        onClick: function () {
          const selectedColor = colorPicker.value;
        svgContainer.querySelector('path').style.fill = selectedColor;
        }
       });
    }
    else{
      end = uploadedPaths[id].querySelector('path').getAttribute('d');
    }

    deleteButton.addEventListener("click", () => {
      dzContainer.innerHTML = "";
      svgContainer.innerHTML = "";
      uploadedPaths[1] = null;
      uploadedPaths[2] = null;
  });

    if (uploadedPaths[1] && uploadedPaths[2]) {
      console.log(start);
      morphingAnimation(start, end);
    }

    const preview = SVG().addTo(dzContainer).size("100%", "100%");
    preview.svg(svgContent);

    };
    reader.readAsText(file);

  }
