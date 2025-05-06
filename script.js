//Drag and Drop function 
const dropZone = document.querySelector("#dropzone");
const dropZoneMSG = document.querySelector("#dropzone p");
// const input = document.querySelector("input");
const input = document.querySelector("input[type='file']");
const colorPicker = document.getElementById("colorPicker");
const svgContainer = document.getElementById("svg-container");

dropZone.addEventListener("click", () => {
    input.click();
    input.onchange = (e) => {
      const file = e.target.files[0];
      rightFiles(file); 
      upload(file);
    };
  });

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault(); 
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const filesArray = [... e.dataTransfer.files];
    rightFiles(e);
    upload(filesArray[0]);
});

function rightFiles(file) {
    if (!file) {
      dropZoneMSG.textContent = "Error: No file selected";
      throw new Error("No file selected");
    }
  
    if (file.type !== "image/svg+xml") {
      dropZoneMSG.textContent = "Error: Not an SVG file";
      throw new Error("Not an SVG file");
    }
  }

function upload(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const svgContent = event.target.result;
  
      const draw = SVG().addTo("#svg-container").size("100%", "100%");
      const svgElement = draw.svg(svgContent);
  
      // Alle SVG-Kinder (Pfad, Rechtecke, Kreise, etc.) klickbar machen
      svgElement.each(function () {
        enableColorChangeOn(this);  // Klick-Ereignis für jedes Element aktivieren
      });
    };
    reader.readAsText(file);
  }
  
  // Funktion zum Aktivieren des Klick-Events für Farbänderung
  function enableColorChangeOn(element) {
    element.on("click", function (e) {
      e.stopPropagation();  // Verhindert, dass der Klick auch das Container-Element trifft
      const selectedElement = this;
  
      // Zeige den Farbwähler an und setze die ausgewählte Farbe auf das geklickte Element
      colorPicker.click();  // Öffne den Farbwähler
  
      colorPicker.oninput = function () {
        selectedElement.fill(colorPicker.value);  // Wende die gewählte Farbe an
      };
    });
  }

