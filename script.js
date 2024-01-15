// this ParticleGridRoom code was converted from Python and originally came from a room in the third level of https://digital-physics.itch.io/digital-physics
// let globalcounter = 0; // for debugging
// python -m http.server

class ParticleGridRoom {
  constructor(kwargs) {
      for (const [key, value] of Object.entries(kwargs)) {
          this[key] = value;
      }
  }
  
  tryReplaceParticle() {
      const [x, y] = this.pos;
      const pType = this.typeGrid[x][y];
      const adjacentCells = [];

      for (let i = Math.max(x - 2, 0); i < Math.min(x + 3, this.length); i++) {
        for (let j = Math.max(y - 2, 0); j < Math.min(y + 3, this.length); j++) {
          adjacentCells.push([i, j, this.typeGrid[i][j]]); 
        }
      }
    
      for (let cell of adjacentCells) {
        const [i, j, cellType] = cell;
        if (cellType === this.copyType[pType]) {
          if (this.copyType[pType] === 0) {
            console.log("0 should not be a copyType");
            debugger;
          }
          const replaceCandidates = [];
    
          for (let k = Math.max(x - 2, 0); k < Math.min(x + 3, this.length); k++) { 
            for (let l = Math.max(y - 2, 0); l < Math.min(y + 3, this.length); l++) {
              replaceCandidates.push([k, l, this.typeGrid[k][l]]);
            }
          }
    
          for (let candidate of replaceCandidates) {
           
            const [k, l, cellType2] = candidate;
    
            if (cellType2 === this.replaceType[pType]) {
              this.typeGrid[k][l] = this.copyType[pType];
            }
          }
        }
      }
  }

  scoreWithinRadius(backFlag = null) {
      const [x, y] = this.pos;
      const pType = this.typeGrid[x][y];
      this.bestIdx = this.pos;
      let best = -Infinity;
      let tiebreakSet = [[x, y]];

      if (backFlag) {
          let score = null;
          const adjacentCells = [];

          for (let i = Math.max(x - 1, 0); i < Math.min(x + 2, this.length); i++) {
            for (let j = Math.max(y - 1, 0); j < Math.min(y + 2, this.length); j++) {
              if (this.typeGrid[i][j] === 0) {
                adjacentCells.push([i, j]);
              }  
            }
          }

          for (let pos of adjacentCells) {
            const [i, j] = pos;
            score = this.distance[i][j];

            if (score > best) {
              best = score; 
              tiebreakSet = [[i, j]];  
            } else if (score === best) {
              tiebreakSet.push([i, j]);
            }
          }


          if (score !== null && score === 0) {
              if (x > 16) {
                if (y > 16) {
                  tiebreakSet = [[x - 1, y - 1], [x, y - 1]];
                } else {
                  tiebreakSet = [[x - 1, y + 1], [x, y + 1]];
                }
              } else {
                if (y > 16) {
                  tiebreakSet = [[x+1, y-1], [x, y-1]];
                } else {
                  tiebreakSet = [[x+1, y+1], [x, y+1]];
                }
              }

              if (this.typeGrid[tiebreakSet[0][0]][tiebreakSet[0][1]] !== 0) {
                  if (this.typeGrid[tiebreakSet[1][0]][tiebreakSet[1][1]] !== 0) {
                      tiebreakSet = [[x, y]];
                  } else {
                      tiebreakSet = [tiebreakSet[1]];
                  }
              }
          }
      } else {
          // only check cell score in adjacent cells if it's open, but then consider all cells in that cell's "radius" when determining score
          const adjacentRows = [];

          for (let i = Math.max(x - 1, 0); i < Math.min(x + 2, this.length); i++) {
            for (let j = Math.max(y - 1, 0); j < Math.min(y + 2, this.length); j++) {
              if (this.typeGrid[i][j] === 0) { 
                adjacentRows.push([i, j]);
              }
            }
          }

          for (let row of adjacentRows) {
            const [i, j] = row;

            let score = 0;
            let cellCount = 0;

            const adjacentCells = [];

            for(let k = Math.max(i - this.radius, 0); k < Math.min(i + this.radius + 1, this.length); k++) {
              for(let l = Math.max(j - this.radius, 0); l < Math.min(j + this.radius + 1, this.length); l++) {
                adjacentCells.push([k, l, this.typeGrid[k][l]]);
              }  
            }

            for (let cell of adjacentCells) {
              const [k, l, cellType] = cell;

              cellCount++;

              if (cellType !== 0) { 
                // don't add the spurious affinity data associated with open cells (type 0)
                if (this.affinity[pType][cellType] === 1) {
                  score++;
                } else {
                  score--; 
                }
              }
            }


            score = score / cellCount;

            if (score > best) {
                best = score;
                tiebreakSet = [[i, j]];
            } else if (score === best) {
                tiebreakSet.push([i, j]);
            }
        }
      }

      const bestCell = Math.floor(Math.random() * tiebreakSet.length);
      this.bestIdx = tiebreakSet[bestCell];
  }

  moveParticle(backFlag = null) {
      const [x, y] = this.pos;
      const pType = this.typeGrid[x][y];

      this.scoreWithinRadius(backFlag);
      const [bestX, bestY] = this.bestIdx;

      if (x === bestX && y === bestY) {
          // The particle didn't find a better adjacent cell to move to
      } else {
          // Move particle
          this.typeGrid[bestX][bestY] = pType;
          this.typeGrid[x][y] = 0;
      }
  }

  step(clickLocationArg, clickIndexArg, backFlag = null) {
      if (clickIndexArg) {
          this.affinity[clickIndexArg + 1] = this.affinity[clickIndexArg + 1].map(element => 1 - element);
          this.copyType[clickIndexArg + 1] = getRandomChoice([...Array(this.numTypes + 1).keys()].filter(i => i !== clickIndexArg + 1 && i !== 0));
          this.replaceType[clickIndexArg + 1] = getRandomChoice([...Array(this.numTypes).keys()].filter(i => i !== clickIndexArg + 1 && i !== 0 && i !== this.copyType[clickIndexArg + 1]));
          clickIndex = null; // reset after use
      }

      let x = clickLocationArg ? clickLocationArg.x : 0;
      let y = clickLocationArg ? clickLocationArg.y : 0;
      
      x = Math.min(Math.floor(x / 6), 31);
      y = Math.min(Math.floor(y / 6), 31);

      if (!(x === 0 && y === 0)) {
          for (let rangeI = 0; rangeI < 5; rangeI++) {
              for (let rangeJ = 0; rangeJ < 5; rangeJ++) {
                  const yRow = Math.max(Math.min(rangeJ + y - 2, 31), 0);
                  const xCol = Math.min(Math.max(rangeI + x - 2, 0), 31);
                  this.typeGrid[yRow][xCol] = 0;
                  clickLocation = null; // reset after use
              }
          }
   
      }

      let resetFlag = false;

      // this.density is not used since the face2 alpha channel now dictates how many cells are on
      // for (let t = 0; t < 0.2 * this.density * (this.length ** 2); t++) {
      for (let part = 0; part < 0.5 * particleAffinity.particleCount; part++) {
          const particles = [];

          // console.log("typeGrid", this.typeGrid);

          for (let i = 0; i < this.length; i++) {
              for (let j = 0; j < this.length; j++) {
                  if (this.typeGrid[i][j] !== 0) {
                      particles.push([i, j]);
                  }
              }
          }
         
          if (particles.length > 0) {
            particleAffinity.particleCount = particles.length;
            const randParticleIdx = Math.floor(Math.random() * particles.length);
            this.pos = particles[randParticleIdx];
            this.tryReplaceParticle();
            this.moveParticle(backFlag);
          } else {
            resetFlag = true;
          }
          
      }

      if (resetFlag) {
        // console.log("reset");
        particleAffinity.reset();
        document.getElementById("question").innerHTML = "";
      }

      const mappedArray = this.typeGrid.map(row => row.map(val => this.color[val] )).flat();
      return mappedArray;
  }

  async reset(message = null) {
      const params = {
          length: 32,
          numTypes: Math.floor(Math.random() * 6) + 3,
          density: 1,
          radius: Math.random() < 0.5 ? 1 : 2,
          pos: [0, 0],
          bestIdx: [0, 0],
          colorShift: Math.random() * (0.88 - 0.33) + 0.33,
          counter: 0,
          llmMessage: message ? message : "🙏🧠👾☯️❤️🤖🛸✨",
          state: "AFTERFETCH",
      };

      const paramsDict = await dictCreator(params);
      Object.assign(this, paramsDict);
  }

  corruptibleDialogue() {
      const loss = Math.max(300 - 2 ** (this.counter * 0.06), 0);
      const flipN = [];
      const listOfTextResponse = [this.llmMessage];

      for (const line of listOfTextResponse) {
          const lengthToFlip = Math.min(loss, line.length);
          flipN.push(lengthToFlip);
      }

      const tempDialogue = [...listOfTextResponse];

      for (let i = 0; i < tempDialogue.length; i++) {
          for (let charIdx = 0; charIdx < flipN[i]; charIdx += 2) {
              tempDialogue[i] = tempDialogue[i].substring(0, charIdx) + "?" + tempDialogue[i].substring(charIdx + 1);
          }
      }

      return tempDialogue;
  }
}

function getRandomChoice(array, probabilities = null, size = null) {
  if (size !== null) {
      // If size is provided, create an object of that dimensions
      const result = Array.from({ length: size[0] }, () =>
          Array.from({ length: size[1] }, () => getRandomChoice(array, probabilities))
      );
      return result;
  }

  if (probabilities !== null) {
      // If probabilities are provided, use them for weighted random choice
      const totalProb = probabilities.reduce((acc, prob) => acc + prob, 0);
      const randomValue = Math.random() * totalProb;
      let cumulativeProb = 0;

      for (let i = 0; i < array.length; i++) {
          cumulativeProb += probabilities[i];
          if (randomValue <= cumulativeProb) {
              return array[i];
          }
      }

  }

  // If no probabilities or size provided, perform a simple random choice
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function minDistanceToZero(binaryArray) {
  const rows = binaryArray.length;
  const cols = binaryArray[0].length;
  const maxDistance = rows + cols;
  const minDistances = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => maxDistance)
  );

  // Find the positions of zero elements; iterable of {i, j}
  const zeroPositions = [];
  for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
          if (binaryArray[i][j] === 0) {
              zeroPositions.push({ i, j });
          }
      }
  }

  for (const zeroPosition of zeroPositions) {
      for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
              const distance = Math.abs(i - zeroPosition.i) + Math.abs(j - zeroPosition.j);
              minDistances[i][j] = Math.min(minDistances[i][j], distance);
          }
      }
  }

  return minDistances;
}

async function dictCreator(params) {
  let mask;
  let particleCount = 0;

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = 'images/face2.png';
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    mask = [];

    for (let j = 0; j < canvas.height; j++) {
      mask.push([]);
      for (let i = 0; i < canvas.width; i++) {
        const alpha = imageData[(j * canvas.width + i) * 4 + 3];
        mask[j].push(alpha > 127 ? 1 : 0);
      }
    }

    const typeGrid = [];
    for (let j = 0; j < params['length']; j++) {
      typeGrid[j] = [];
      for (let i = 0; i < params['length']; i++) {
        if (mask[j][i] !== 0) {
          particleCount++;
          const a = [getRandomChoice(Array.from({ length: params.numTypes }, (_, i) => i + 1), null, null), 0];
          // console.log("a", a);
          typeGrid[j][i] = getRandomChoice(a, [params.density, 1 - params.density]);
        } else {
          typeGrid[j][i] = 0;
        }
      }
    }

    const affinity = Array.from({ length: params.numTypes + 1 }, () =>
      Array.from({ length: params.numTypes + 1 }, () => getRandomChoice([0, 1], [0.35, 0.65]))
    );

    const copyType = Array.from({ length: params.numTypes + 1 }, typeIdx =>
      getRandomChoice([...Array(params.numTypes + 1).keys()].filter(i => i !== typeIdx && i !== 0))
    );

    const replaceType = Array.from({ length: params.numTypes + 1 }, typeIdx =>
      getRandomChoice([...Array(params.numTypes).keys()].filter(i => i !== typeIdx && i !== 0 && i !== copyType[typeIdx]))
    );

    const distance = minDistanceToZero(mask);

    // generate new colors dots
    colorContainer.innerHTML = ""; //?

    let colors = Array.from({ length: params.numTypes + 1 }, (_, i) => Math.floor((i / 6) * 255 * params.colorShift));
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
        
        particleAffinity.step(null, index, null);
      });

      // Append the color box to the container
      colorContainer.appendChild(colorBox);
    });

    // Return the result
    return {
      length: params.length,
      numTypes: params.numTypes,
      density: params.density,
      radius: params.radius,
      pos: params.pos,
      bestIdx: params.bestIdx,
      colorShift: params.colorShift,
      counter: params.counter,
      llmMessage: params.llmMessage,
      state: params.state,
      color: [[0,0,0,0]].concat(colorArrays),
      particleCount: particleCount,
      lastClickCounter: 0,
      typeGrid: typeGrid,
      affinity: affinity,
      copyType: copyType,
      replaceType: replaceType,
      distance: distance
    };
  } catch (error) {
    console.error('Error during asynchronous operations:', error);
    return null;
  }
}

async function create() {
  const params = {
    length: 32,
    numTypes: Math.floor(Math.random() * 6) + 3,
    density: 1,
    radius: Math.random() < 0.5 ? 1 : 2,
    pos: [0, 0],
    bestIdx: [0, 0],
    colorShift: Math.random() * (0.88 - 0.33) + 0.33,
    counter: 0,
    llmMessage: "",
    state: "BLINKING",
  };

  try {
    const result = await dictCreator(params);
    const particleGridRoom = new ParticleGridRoom(result);
    return particleGridRoom;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Assume clickLocation and colorIndex are initially null; click events will change this state which affects the step() method
var clickLocation = null;
var clickIndex = null;

let animationFrame;

let particleAffinity;
// const userId = crypto.randomUUID();

// hamburger menu
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

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
let lastClickLocation;

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

// LLM API fetch function
async function fetchResponse(input_string) {
  try {
    // const response = await fetch(`http://127.0.0.1:8000/get-response/${input_string}`);
    const response = await fetch(`https://khatchig.onrender.com/get-response/${input_string}`);
    const output = await response.json();
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
  particleAffinity.state = "REVERSE";

  updateContext(inputText, "user");

  // we stringify to send a string and then use encode URI component to avoid "?" in dictionary values issues
  fetchResponse(encodeURIComponent(JSON.stringify(context))).then((response) => {
    particleAffinity.reset(response);
    updateContext(response, "assistant");
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

// Infinite loop with a 10-millisecond delay between steps
function loop(particleAffinity) {
  cancelAnimationFrame(animationFrame);

  particleAffinity.counter++;
  particleAffinity.lastClickCounter++;

  // if (globalcounter > 10000) {
  //   console.log("timer");
  //   debugger;
  // }

  if (particleAffinity.state === "BLINKING") {
    if (particleAffinity.counter < 100) {
      var result = new Array(4096).fill(0);
    } else {
      particleAffinity.llmMessage = "Welcome 🙏🧠👾☯️❤️🤖🛸✨ Ask me philosophical questions by entering text below, or play with my pattern by clicking the colored dots and squares.";
      var result = particleAffinity.step(clickLocation, clickIndex);
      particleAffinity.state = "PERSISTING"; 
    }
  } else if (particleAffinity.state === "AFTERFETCH") {
    if (particleAffinity.counter < 50) {
      var result = new Array(4096).fill(0);
    } else {
      var result = particleAffinity.step(clickLocation, clickIndex);
      particleAffinity.state = "PERSISTING";
    }
  } else if (particleAffinity.state === "PERSISTING") {
    var result = particleAffinity.step(clickLocation, clickIndex);
  } else if (particleAffinity.state === "REVERSE") {
    var result = particleAffinity.step(clickLocation, clickIndex, true); 
  }

  // console.log("at corruptible", particleAffinity.llmMessage);
  if (particleAffinity.llmMessage) {
    dialogue = particleAffinity.corruptibleDialogue()
  } else {
    // console.log("stop");
    dialogue = "";
  }
  // console.log("after", dialogue);

  document.getElementById("answer").innerHTML = dialogue;

  const uint8Array = new Uint8ClampedArray(result.flat());

  // Calculate the sum of all elements in the Uint8ClampedArray; we use all 0s to be a flag
  const sum = uint8Array.reduce((acc, value) => acc + value, 0);

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

    if (particleAffinity.clickLocation) {
      console.log("last click location set to",  particleAffinity.clickLocation)
      lastClickLocation = particleAffinity.clickLocation;
    }

    // Draw a square centered around the clicked location
    if (particleAffinity.lastClickCounter < 10) {
      // console.log(lastClickLocation);
      ctx2.strokeRect((lastClickLocation[0]-6)*(500/192), (lastClickLocation[1]-6)*(500/192), 5*6, 5*6);
    }
      
  }
  // Add a 10-millisecond delay
  // setTimeout(loop, 10, particleAffinity);
  animationFrame = requestAnimationFrame(() => {
    loop(particleAffinity);
  })

}

async function start() {
  particleAffinity = await create();
  animationFrame = requestAnimationFrame(() => {
    loop(particleAffinity);
  })
  // loop(particleAffinity);
}

start();

// Event Listeners

// Handle user clicks on the canvas which updates a global variable state
canvas2.addEventListener("click", (event) => {
  clickLocation = {
      x: event.offsetX,
      y: event.offsetY
  };

  lastClickLocation = [event.offsetX, event.offsetY];

  particleAffinity.lastClickCounter = 0;
});

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
document.addEventListener('click', closeMenu);
