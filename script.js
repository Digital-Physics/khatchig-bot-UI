const userId = crypto.randomUUID();

// hamburger menu
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

const socket = new WebSocket(`ws://127.0.0.1:8000/ws/${userId}`);
// const socket = new WebSocket(`wss://khatchig.onrender.com/ws/${userId}`);

// image canvas
const canvas2 = document.getElementById("imageCanvas");
const ctx2 = canvas2.getContext("2d");

// buttons & input
const playButton = document.getElementById('play-button');
const stopButton = document.getElementById('stop-button');
var sendButton = document.getElementById("submit-button");
const input = document.getElementById('input-box');

// initialize state
let currentAudio = null;
var level = 0;
// var currBgImg = 139;
// let transitionComplete = true;

// preload some images
const faceImg1 = new Image();
const faceImg2 = new Image();
faceImg1.src = './images/face0.png';
faceImg2.src = './images/face1.png';
let currentImage = faceImg1;
let lastChangeTime = 0;

// LLM context initialized
let context = [];

// Draw a square around the clicked location
let x = null;
let y = null;
ctx2.strokeStyle = 'red'; // Set the color of the square
ctx2.lineWidth = 2; // Set the line width of the square
let stepsTaken = 10; // Variable to track the number of steps taken

// Hamburger Functions
function toggleMenu(e) {
  e.stopPropagation();
  menu.classList.toggle('show');
}

function closeMenu(e) {
  const target = e.target;
  if (!menu.contains(target) && !menuToggle.contains(target)) {
    menu.classList.remove('show');
  }
}

// music functions
function playmusic(audioPath) {
  // Check if there is a currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // Create and play the new audio
  const audio = new Audio(audioPath);
  audio.play();
  currentAudio = audio;
}

// background image functions
// function preloadBgImages(callback) {
//   const imagesToLoad = 140;
//   let imagesLoaded = 0;

//   for (let i = 0; i < imagesToLoad; i++) {
//     const img = new Image();
//     img.src = `./images/bg${level}/${i}.png`;
//     img.onload = () => {
//       imagesLoaded++;
//       if (imagesLoaded === imagesToLoad) {
//         // All images are loaded, execute the callback
//         callback(0);
//         // callback();
//       }
//     };
//   }
// }

// function runBgLoop(i) {
//   currBgImg = i;
//   setTimeout(function () {
//     if (currBgImg < 139) {
//       currBgImg++;
//       runBgLoop(currBgImg);
//     } else {
//       transitionComplete = true;
//       currBgImg = 139;
//     }
//   }, 50);
// }

// LLM API fetch function
async function fetchResponse(input_string) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/get-response/${input_string}/${userId}`);
    // const response = await fetch(`https://khatchig.onrender.com/get-response/${input_string}/${userId}`);
    const output = await response.json();

    colorContainer.innerHTML = "";

    colorArrays = output["colors"]

    colorArrays.forEach((colorArray, index) => {
      const [red, green, blue, alpha] = colorArray;

      // Create a div element for each color
      const colorBox = document.createElement("div");
      colorBox.classList.add("color-box");
      
      // Set the background color using rgba values
      colorBox.style.backgroundColor = `rgba(${red}, ${green}, ${blue}, ${alpha/255})`;
      // console.log("colors", red, green, blue);

      colorBox.dataset.borderWidth = index % 2 == 0 ? 1: 0; 
  
      // Update styles
      if(index % 2 == 1) {
        colorBox.style.border = 'none';
      } else {
        colorBox.style.border = '1px solid white';  
      }

      // Add a click event listener to each color box
      colorBox.addEventListener("click", function() {
        // Toggle state
        let borderWidth = parseInt(this.dataset.borderWidth) ? 0 : 1; 
        this.dataset.borderWidth = borderWidth;
  
        // Update styles
        if(borderWidth === 1) {
          this.style.border = '1px solid white';
        } else {
          this.style.border = 'none';  
        }
        
        // Send image data and click location to the server
        const click_index = JSON.stringify({"click_index": index});
        socket.send(click_index);
      });

      // Append the color box to the container
      colorContainer.appendChild(colorBox);
    });

    return output["message"];

  } catch (error) {
    console.error(error);
    throw error;
  }
}

// update text function
function updateQuestion() { 
  var inputText = document.getElementById("input-box").value;
  document.getElementById("question").innerHTML = inputText;
  document.getElementById("input-box").value = "";
  document.getElementById("answer").innerHTML = "";

  updateContext(inputText, "user");

  // we stringify to send a string and then use encode URI component to avoid "?" in dictionary values issues
  fetchResponse(encodeURIComponent(JSON.stringify(context))).then((response) => {
    updateContext(response, "assistant");
    document.getElementById("answer").innerHTML = response;
    return response;
  }).catch((error) => {
    console.error(error);
  });
}

function sendButtonFunction () {
  window.scrollTo(0, 0);
  updateQuestion();
}

function updateContext(message, agent) {
  // manage limited Context window size
  if (context.length > 5) {
    // FIFO removal of the oldest element
    context = context.slice(1);
  }
  // append a new object to the LLM context window
  context.push({"role": agent, "content": message});
}

// blinking head function
function toggleImage() {
  const currentTime = Date.now();

  if (currentTime - lastChangeTime > 100) {
    lastChangeTime = currentTime;

    // Toggle between the two images
    currentImage = currentImage === faceImg1 ? faceImg2 : faceImg1;

    // Redraw the current image on the canvas
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx2.drawImage(currentImage, -8, -2, canvas2.width, canvas2.height);
  } else {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx2.drawImage(currentImage, -8, -2, canvas2.width, canvas2.height);
  }
}

const colorContainer = document.getElementById("color-container");
// any future initializition stuff can be put in here, although a lot is handled outside
function initialize_stuff() {
  // in python: [int((i / 6) * 255 * 0.5) for i in range(7)]
  let colors = Array.from({ length: 7 }, (_, i) => Math.floor((i / 6) * 255 * 0.5));
  /// create rgba color from a single number
  let colorArrays = colors.slice(1).map(val => [val % 256, (2 * val + 100) % 256, (3 * val + 200) % 256, 255]);

  colorArrays.forEach((colorArray, index) => {
    const [red, green, blue, alpha] = colorArray;

    // Create a div element for each color
    const colorBox = document.createElement("div");
    colorBox.classList.add("color-box");
    
    // Set the background color using rgba values
    colorBox.style.backgroundColor = `rgba(${red}, ${green}, ${blue}, ${alpha/255})`;

    colorBox.dataset.borderWidth = index % 2 == 0 ? 1: 0; 
    // console.log(index, index % 2, index % 2 == 0);
    // console.log(colorBox.dataset.borderWidth, typeof(colorBox.dataset.borderWidth));

    // Update styles
    if(index % 2 == 1) {
      colorBox.style.border = 'none';
    } else {
      colorBox.style.border = '1px solid white';  
    }

    // Add a click event listener to each color box
    colorBox.addEventListener("click", function() {
      // Toggle state
      let borderWidth = parseInt(this.dataset.borderWidth) ? 0 : 1; 
      this.dataset.borderWidth = borderWidth;

      // Update styles
      if(borderWidth === 1) {
        this.style.border = '1px solid white';
      } else {
        this.style.border = 'none';  
      }
      
      // Send image data and click location to the server
      const click_index = JSON.stringify({"click_index": index});
      socket.send(click_index);
    });

    // Append the color box to the container
    colorContainer.appendChild(colorBox);
    // console.log(colorBox);
  });
  
}

// Event Listeners

// Handle user clicks on the canvas and sends click position through the websocket to the server
canvas2.addEventListener("click", (event) => {
  const clickLocation = {
      x: event.offsetX,
      y: event.offsetY
  };

  x = event.offsetX;
  y = event.offsetY;

  if (x != 0 && y != 0) {
    stepsTaken = 0;
  }

  // Send image data and click location to the server
  const message = JSON.stringify({
      click_location: clickLocation
  });

  // Draw a square around the clicked location
  ctx2.strokeStyle = 'red'; // Set the color of the square
  ctx2.lineWidth = 2; // Set the line width of the square

  // ctx2.strokeRect(event.offsetX * 6, event.offsetY * 6, 5 * 6, 5 * 6);

  socket.send(message);
});

// when the socket is opened, we print a notice
// socket.onopen = (event) => {
//   console.log("WebSocket connection opened:", event);
// };

// EventHandler is called when the client gets a message through the websocket from the server, which is very often
socket.onmessage = (event) => {
  const result = JSON.parse(event.data);

  document.getElementById("answer").innerHTML = result["dialogue"];

  const uint8Array = new Uint8ClampedArray(result["image"]);
  // console.log("length of flattened", uint8Array.length);

  // Calculate the sum of all elements in the Uint8ClampedArray; we use all 0s to be a flag
  const sum = uint8Array.reduce((acc, value) => acc + value, 0);

  // var bgImg2 = new Image();
  // bgImg2.src = `./images/bg${level}/${currBgImg}.png`;
  // ctx2.drawImage(bgImg2, 0, 0, canvas2.width, canvas2.height);

  if (sum === 0) {
    toggleImage();
  } else {  
    // Create a new canvas element to store the scaled image
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = 192;
    scaledCanvas.height = 192;
    const scaledCtx = scaledCanvas.getContext('2d');

    // Use nearest-neighbor interpolation for pixelation
    scaledCtx.imageSmoothingEnabled = false;
    // Put your original 32x32 image data onto the scaled canvas
    scaledCtx.putImageData(new ImageData(uint8Array, 32, 32), 0, 0);

    ctx2.imageSmoothingEnabled = false;

    // Draw the scaled image onto the main canvas using drawImage
    // ctx2.drawImage(scaledCanvas, 0, 0, 192, 192);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx2.drawImage(
      scaledCanvas,
      0, 0, scaledCanvas.width, scaledCanvas.height,  // Source rectangle (entire scaled canvas)
      0, 0, canvas2.width*6, canvas2.height*6  // Destination rectangle 
    );

    // Draw a square centered around the clicked location
    stepsTaken = Math.min(stepsTaken + 1, 100);
    if (stepsTaken < 6) {
      ctx2.strokeRect((x-6)*(500/192), (y-6)*(500/192), 5*6, 5*6);
    }  
  }
};

sendButton.addEventListener("click", sendButtonFunction);

input.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent the default action of "return" key (e.g., adding a new line)
    sendButton.click();
  } 
})

playButton.addEventListener('click', () => {
  level = (level + 1) % 3;
  playmusic(`./audio/level${level}_music.ogg`);
});

stopButton.addEventListener('click', () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  } 
});

menuToggle.addEventListener('click', toggleMenu);
// menuToggle.addEventListener('touchstart', toggleMenu);
document.addEventListener('click', closeMenu);
// document.addEventListener('touchstart', closeMenu);

// we should store our individual user's conversation on the client side and send it to the server thread locally and initialize it
document.addEventListener('DOMContentLoaded', initialize_stuff);