// hamburger menu
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

menuToggle.addEventListener('click', toggleMenu);
menuToggle.addEventListener('touchstart', toggleMenu);
document.addEventListener('click', closeMenu);
document.addEventListener('touchstart', closeMenu);


let currentAudio = null;
// let currentImage = 0;
let currFlickerFaceImg = 0; // flicker face
let currFlipFaceImg= 0; // face flip
var currNcaImg = 0;
var currBgImg = 139;
// var faceFlipCounter = 0;
let interval; // cycle NCA
let interval2; // cycle fully-formed face flicker
let transitionComplete = false;
let ncaComplete = false;

let persona = `
Your name is Khatchig.
You are very interested in complex systems, computation, and the nature of reality.
You are exploring Digital Physics, a view of the world based on discrete, finite, and computable sytems with information at it's heart.
You CONSTANTLY tell people to watch the film 'Digital Physics' on Amazon by clicking the 🍿.
You CONSTANTLY tell people to play the video game 'Digital Physics', the sequel and prequel to the film, on Itch by clicking the 🕹️.
You CONSTANTLY tell people to leave a comment or review on 'Digital Physics' because you read all of them.
You are ALWAYS concise, NEVER saying more than 50 words.
`;

let context = [];

const playButton = document.getElementById('play-button');
const stopButton = document.getElementById('stop-button');
var sendButton = document.getElementById("submit-button");
const input = document.getElementById('input-box');
var level = 0;

var canvas = document.getElementById('animationCanvas');
var ctx = canvas.getContext('2d');

// Functions
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

function preloadImages(callback) {
  const ncaImagesToLoad = 150;
  const faceImagesToLoad = ["./images/face0.png", "./images/face1.png", "./images/face/0.png", "./images/face/1.png", "./images/face/2.png", "./images/face/3.png"];
  const totalImagesToLoad = ncaImagesToLoad + faceImagesToLoad.length;
  let imagesLoaded = 0;

  function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImagesToLoad) {
      // All images are loaded, execute the callback
      callback();
    }
  }

  // Preload NCA images
  for (let i = 0; i < ncaImagesToLoad; i++) {
    const img = new Image();
    img.src = `./images/nca/transparent_${i}.png`;
    img.onload = checkAllImagesLoaded;
  }

  // Preload face images
  faceImagesToLoad.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.onload = checkAllImagesLoaded;
  });
}

function preloadBgImages(callback) {
  const imagesToLoad = 140;
  let imagesLoaded = 0;

  for (let i = 0; i < imagesToLoad; i++) {
    const img = new Image();
    img.src = `./images/bg${level}/${i}.png`;
    img.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === imagesToLoad) {
        // All images are loaded, execute the callback
        callback(0);
        // callback();
      }
    };
  }
}

// function cycleNcaImages(once = false, callback) {
//   return setInterval(() => {
//     document.getElementById("face").src = `./images/nca/transparent_${currentImage}.png`;
//     currentImage++;

//     if (currentImage > 149) {
//       if (once) {
//         clearInterval(interval);
//         currentImage = 0;
//         if (callback) {
//           callback(); // execute the callback if provided
//         }
//       } else {
//         currentImage = 0;
//       }
//     }
//   }, 20);
// }

function cycleNcaImages(once = false, callback) {
  return setInterval(() => {
    var ncaImg = new Image();
    ncaImg.onload = function () {
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw the background image first
      drawBgImage();
      // Then draw the NCA image on top
      ctx.drawImage(ncaImg, 0, 0, canvas.width, canvas.height);
    };
    ncaImg.src = `./images/nca/transparent_${currNcaImg}.png`;
    currNcaImg++;

    if (currNcaImg > 149) {
      if (once) {
        ncaComplete = true;
        clearInterval(interval);
        currNcaImg = 0;
        if (callback) {
          // console.log("post nca callback");
          callback(); // execute the callback if provided
        }
      } else {
        currNcaImg = 0;
        ncaComplete = true;
      }
    }
  }, 20);
}

function cycleFlickerImages() {
  return setInterval(() => {
    // document.getElementById("face").src = `./images/face/${currFlickerFaceImg}.png`;
    var flickerImg = new Image();
    flickerImg.onload = function () {
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw the background image first
      drawBgImage();
      // Then draw the NCA image on top
      ctx.drawImage(flickerImg, 0, 0, canvas.width, canvas.height);
    };
    // console.log(currFlickerFaceImg);
    flickerImg.src = `./images/face/${currFlickerFaceImg}.png`;
    currFlickerFaceImg++;

    if (currFlickerFaceImg > 3) {
        currFlickerFaceImg = 0;
      }
  }, 500);
}

// function runBgLoop(i) {
//   setTimeout(function () {
//       document.getElementById("background").src = `./images/bg${level}/${i}.png`;
//       i++;
//       // Check if the loop should continue
//       if (i < 140) {
//           runBgLoop(i);
//       } else {
//         transitionComplete = true;
//         // console.log("transition flipped back", transitionComplete);
//       } 
//   }, 50);
// }

function runBgLoop(i) {
  currBgImg = i;
  setTimeout(function () {
    var bgImg = new Image();
    bgImg.onload = function () {
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      // drawFaceImg();
    };
    // console.log("currBgImg", currBgImg, level);
    bgImg.src = `./images/bg${level}/${currBgImg}.png`;

    // Check if the loop should continue
    if (currBgImg < 139) {
      currBgImg++;
      runBgLoop(currBgImg);
    } else if (currBgImg === 999) {
      transitionComplete = true;
      currBgImg = 139;
    } else {
      // transitionComplete = true;
      // currBgImg = 0;
      interval = cycleNcaImages(true, () => {
        // console.log("cycle the nca now the bg has update");
        faceFlipLoop(0, () => {
          transitionComplete = true;
          interval2 = cycleFlickerImages();
        });
      });
    }
  }, 50);
}

// function runBgLoop() {
//   setInterval(function () {
//     var bgImg = new Image();
//     bgImg.onload = function () {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       // Draw the NCA image first
//       ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
//       // Then draw the background image on top
//       drawFaceImg();
//     };
//     bgImg.src = `./images/bg${level}/${currBgImg}.png`;

//     currBgImg++;

//     // Check if the loop should continue
//     if (currBgImg >= 140) {
//       // currBgImg = 0;
//       transitionComplete = true;
//     }
//   }, 50);
// }


function drawBgImage() {
  var bgImg = new Image();
  if (currBgImg == 999) {
    currBgImg = 139;
  }
  bgImg.src = `./images/bg${level}/${currBgImg}.png`;
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

// function drawFaceImg() {
//   var tmpImg = new Image();
//   if (ncaComplete){
//     tmpImg.src = `./images/face${currFlipFaceImg}.png`;
//   } else {
//     tmpImg.src = `./images/nca/transparent_${currNcaImg}.png`;
//   }
  
//   ctx.drawImage(tmpImg, 0, 0, canvas.width, canvas.height);
// }

async function fetchResponse(input_string) {
  // stop the flicker animation
  clearInterval(interval2);
  currFlickerFaceImg = 0;
  interval2 = null;

  // stop the nca animation if it is happening
  clearInterval(interval);
  currNcaImg = 0;
  interval = null;

  // if this is happening, skip to the end
  currBgImg = 999;

  ncaComplete = false;
  // sets interval var to this function that that if it takes in nothing, just continues to run this function asynchrously with other stuff, i think
  interval = cycleNcaImages();
  // preloadImages(() => {
  //   // Preloading again?
  //   interval = cycleNcaImages();
  // });

  try {
    // const response = await fetch(`http://127.0.0.1:8000/get-response/${input_string}`);
    const response = await fetch(`https://khatchig.onrender.com/get-response/${input_string}`);
    const output = await response.json();

    // now that we have a response, clear the interval animation 
    clearInterval(interval);
    currNcaImg = 0;
    interval = null;

    faceFlipLoop(4, () => {
      transitionComplete = true;
      interval2 = cycleFlickerImages();
    });

    // interval2 = cycleFlickerImages();

    // leftover code; in case we revert the image and and audio language requests
    // this code is only going to pass these conditionals if we are returning the function calling response using Instructor and getting that class objects
    if (output["image_request"] != null) {
      document.getElementById("background").src = "./images/" + output["image_request"];
    }
    if (output["music_request"] != null) {
      playmusic("./audio/" + output["music_request"]);
    }

    return output["message"];

  } catch (error) {
    console.error(error);
    clearInterval(interval);
    interval = null;
    // interval2 = cycleFlickerImages();
    throw error;
  }

}

function updateQuestion() { 
  var inputText = document.getElementById("input-box").value;
  document.getElementById("question").innerHTML = inputText;
  document.getElementById("input-box").value = "";
  document.getElementById("answer").innerHTML = "";

  // console.log("context before user update", context);
  updateContext(inputText, "user");
  // console.log("context after user update", context);

  // we stringify to send a string and then use encode URI component to avoid "?" in dictionary values issues
  fetchResponse(encodeURIComponent(JSON.stringify(context))).then((response) => {
    // console.log("response b4 update:", response);
    // console.log("context b4 assistant update:", context);
    updateContext(response, "assistant");
    // console.log("context after assistant update:", context);
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

function loadContext() {
  context.push({"role": "system", "content": persona});
}

function updateContext(message, agent) {
  // manage limited Context window size
  if (context.length > 6) {
    // FIFO removal of the oldest two elements and concatenation of the original head of the list
    context = context.slice(2);
    context = [{"role": "system", "content": persona}].concat(context);
  }
  // append a new object to the list
  context.push({"role": agent, "content": message});
  // console.log("after context update", context);
}

function faceFlipLoop(i, callback) {
  setTimeout(function () {
    var faceImg = new Image();
    faceImg.onload = function () {
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw the background image first
      drawBgImage();
      // Then draw the NCA image on top
      ctx.drawImage(faceImg, 0, 0, canvas.width, canvas.height);
    };

    currFlipFaceImg = (currFlipFaceImg + 1) % 2;
    // console.log("flip idx", currFlipFaceImg);

    faceImg.src = `./images/face${currFlipFaceImg}.png`;

    // Check if the loop should continue
    if (i < 10) {
        if (callback) {
          faceFlipLoop(i=i+1, callback);
        } else {
          faceFlipLoop(i=i+1);
        }
    } else if (callback) {
      // console.log("callback in face loop");
      callback();
    }
  }, 100); // milliseconds delay
}

function initialize_stuff() {
  // document.getElementById("face").style.display = "none";
  // preload images takes this callback function that runs at the tail end of the preloadImages process. 
  // this callback assigns a global var to the cycle image
  preloadImages(() => {
    // All necessary images are preloaded, start the animation
    interval = cycleNcaImages(true, () => {
      // This callback function (with argument 0) will be executed when the interval is stopped
      faceFlipLoop(0, () => {
        transitionComplete = true;
        interval2 = cycleFlickerImages();
      });
      // interval2 = cycleFlickerImages();
      document.getElementById("answer").innerHTML = "Welcome 🙏🧠👾☯️❤️🤖🛸✨";
    });
  });

  loadContext();
}

// Event Listeners
sendButton.addEventListener("click", sendButtonFunction);

input.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent the default action of "return" key (e.g., adding a new line)
    sendButton.click();
  } 
})

playButton.addEventListener('click', () => {
  if (transitionComplete) {
    level = (level + 1) % 3;
    playmusic(`./audio/level${level}_music.ogg`);
    transitionComplete = false;

    // need to stop this flicker animation or we'll have competing asynchronous image updates
    clearInterval(interval2);
    currFlickerFaceImg = 0;
    interval2 = null;

    preloadBgImages(runBgLoop);

    // interval = cycleNcaImages(true, () => {
    //   // This callback function (with argument 0) will be executed when the interval is stopped
    //   // faceFlipLoop(0);
    //   faceFlipLoop(0, () => {
    //     interval2 = cycleFlickerImages();
    //   });
    //   // interval2 = cycleFlickerImages();
    // });
    }    
});

stopButton.addEventListener('click', () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  } 
});

// we should store our individual user's conversation on the client side and send it to the server thread locally and initialize it
document.addEventListener('DOMContentLoaded', initialize_stuff);