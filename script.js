// const circles = document.querySelectorAll('.circle');

// circles.forEach(circle => {
//   circle.addEventListener('mouseenter', () => {
//     anime({
//       targets: circle,
//       translateX: 100,
//       scale: 1.2,
//       duration: 500,
//       easing: 'easeInOutQuad'
//     });
//   });

//   circle.addEventListener('mouseleave', () => {
//     anime({
//       targets: circle,
//       translateX: 0,
//       scale: 1,
//       duration: 500,
//       easing: 'easeInOutQuad'
//     });
//   });
// });


// anime('star', {
//     rotate: {
//         scale: 3.2,
//         duration: 400,
//     }
//   });

//Drag and Drop function 
const dropZone = document.querySelector("#dropzone");
const dropZoneMSG = document.querySelector("#dropzone p");
const input = document.querySelector("input");
const colorPicker = document.getElementById("colorPicker");
const containerSVG = document.getElementById("svg-container");
const colorPickersContainer = document.getElementById("colorPickersContainer");

dropZone.addEventListener("click", (e) => {
    input.click();
    input.onchange = (e) =>{
        upload(e.target.files[0]);
        rightFiles(e);
    }
    upload(filesArray[0]);
});

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault(); //prevent opening a new tab 
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    rightFiles(e);
    const filesArray = [... e.dataTransfer.files];
    upload(filesArray[0]);
    
});

function rightFiles(e){
    if (e.dataTransfer.items[0].type !== "image/svg+xml"){
        dropZoneMSG.textContent = "Error: Not a SVG";
        throw new Error("not a SVG");
    }

    //MULTIPLE??
    if (e.dataTransfer.items.length > 1){
        dropZoneMSG.textContent = "Error: Cannot upload multiple files";
        throw new Error("Multiple items");
    }
}

function upload(file){
    const reader = new FileReader();

    reader.onload = function(event) {
        const svgContent = event.target.result;

        containerSVG.innerHTML = svgContent;
        const color_filling = [];
        
        const paths = document.querySelectorAll("path");

        paths.forEach(path => {
            const fill = path.getAttribute("fill");
            if (fill && fill.toLowerCase() !== "none"){
                color_filling.push({ path: path, type: "fill", color: fill });
        }
        const stroke = path.getAttribute("stroke");
            if (stroke && stroke.toLowerCase() !== "none"){
                color_filling.push({ path: path, type: "stroke", color: stroke });
        }
    });
        colorPickersContainer.innerHTML = "";

        color_filling.forEach((color, index) => {
        const input = document.createElement("input");
        input.type = "color";
        input.value = color;
        input.style.display = "block";
        input.dataset.index = index;

        input.addEventListener("input", (e) => {
            const newColor = e.target.value;
            const i = e.target.dataset.index;
            paths[i].setAttribute("fill", newColor);
            color_filling[i] = newColor; 
        });
        colorPickersContainer.appendChild(input);
    });
        console.log(color_filling);
    };
    reader.readAsText(file);
}


