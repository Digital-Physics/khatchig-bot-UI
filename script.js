// hamburger menu
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

menuToggle.addEventListener('click', toggleMenu);
menuToggle.addEventListener('touchstart', toggleMenu);
document.addEventListener('click', closeMenu);
document.addEventListener('touchstart', closeMenu);

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

let currentAudio = null;

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

// // this takes a function that it will run at the end of what it otherwise does
// function preloadImages(callback) {
//   const imagesToLoad = 150;
//   let imagesLoaded = 0;

//   for (let i = 0; i < imagesToLoad; i++) {
//     const img = new Image();
//     img.src = `./images/nca/transparent_${i}.png`;
//     img.onload = () => {
//       imagesLoaded++;
//       if (imagesLoaded === imagesToLoad) {
//         // All images are loaded, execute the callback
//         callback();
//       }
//     };
//   }
// }

// function preloadFaceImages(callback) {
//   const img1 = new Image();
//   img1.src = "./images/face.png";

//   const img2 = new Image();
//   img2.src = "./images/face2.png";

//   // Using the onload event for each image to track when they are both loaded
//   let loadedImages = 0;

//   img1.onload = img2.onload = () => {
//     loadedImages++;

//     if (loadedImages === 2) {
//       // Both images are loaded, execute the callback
//       callback();
//     }
//   };
// }

function preloadImages(callback) {
  const ncaImagesToLoad = 150;
  const faceImageSources = ["./images/face.png", "./images/face2.png", "./images/face/0.png", "./images/face/1.png", "./images/face/2.png", "./images/face/3.png"];
  const totalImagesToLoad = ncaImagesToLoad + faceImageSources.length;
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
  faceImageSources.forEach((src) => {
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
    img.src = `./images/bg${source}/${i}.png`;
    img.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === imagesToLoad) {
        // All images are loaded, execute the callback
        callback();
      }
    };
  }
}

let currentImage = 0;
let currentFaceImage = 0;
let interval; 
let interval2;

// double protection
// animation_complete = false;

function cycleNcaImages(once = false, callback) {
  return setInterval(() => {
    document.getElementById("face").src = `./images/nca/transparent_${currentImage}.png`;
    currentImage++;

    if (currentImage > 149) {
      if (once) {
        clearInterval(interval);
        currentImage = 0;
        if (callback) {
          callback(); // execute the callback if provided
        }
      } else {
        currentImage = 0;
      }
    }
  }, 20);
}

function cycleFaceImages() {
  return setInterval(() => {
    document.getElementById("face").src = `./images/face/${currentFaceImage}.png`;
    currentFaceImage++;

    if (currentFaceImage > 3) {
        currentFaceImage = 0;
      }
  }, 500);
}

// let currentBgImage = 0;
// let direction = true;

// cycleBackground = setInterval(() => {
//   document.getElementById("background").src = `./images/bg${source}/${currentBgImage}.png`;
//   if (direction) {
//     currentBgImage++;
//   } else {
//     currentBgImage--;
//   }

//   if (currentBgImage < 1 || currentBgImage > 138) {
//     direction = !direction;
//   }
// }, 100);

function runBgLoop(i) {
  setTimeout(function () {
      document.getElementById("background").src = `./images/bg${source}/${i}.png`;
      i++;
      // Check if the loop should continue
      if (i < 139) {
          runBgLoop(i);
      }
  }, 50);
}

async function fetchResponse(input_string) {
  // document.getElementById("face").style.display = "none";
  clearInterval(interval2);
  currentFaceImage = 0;
  interval2 = null;

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

    clearInterval(interval);
    currentImage = 0;
    interval = null;

    runLoop(4);

    // document.getElementById("face").src = "./images/face.png";
    interval2 = cycleFaceImages();

    // console.log("output:", output);
    // non-functioning code while json response is null on these fields
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
    // document.getElementById("face").style.display = "block";
    document.getElementById("face").src = "./images/face.png";
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

var sendButton = document.getElementById("submit-button");
sendButton.addEventListener("click", sendButtonFunction);

const input = document.getElementById('input-box');

input.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent the default action of "return" key (e.g., adding a new line)
    sendButton.click();
  } 
})

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

const playButton = document.getElementById('play-button');
const stopButton = document.getElementById('stop-button');
// var source = Math.floor(Math.random()*3);
var source = 0;

playButton.addEventListener('click', () => {
    source = (source + 1)%3;
    playmusic(`./audio/level${source}_music.ogg`);
    preloadBgImages(runBgLoop(0));
    // document.getElementById("background").src = `./images/background_${source}.png`
});

stopButton.addEventListener('click', () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  } 
});

function runLoop(i) {
  setTimeout(function () {
      if (i % 2 == 0) {
          document.getElementById("face").src = "./images/face2.png";
      } else {
          document.getElementById("face").src = "./images/face.png";
      }

      // Continue the loop
      i++;

      // Check if the loop should continue
      if (i < 10) {
          runLoop(i);
      }
  }, 100); // 20 milliseconds delay
}

function initialize_stuff() {
  // document.getElementById("face").style.display = "none";
  // preload images takes the function you want to run at the tail end. this one takes nothing and then cycles images
  preloadImages(() => {
    // All necessary images are preloaded, start the animation
    interval = cycleNcaImages(true, () => {
      // This callback will be executed when the interval is stopped
      // document.getElementById("face").style.display = "block";
      // preloadFaceImages(runLoop(0));
      runLoop(0);
      
      // document.getElementById("face").src = "./images/face.png";
      interval2 = cycleFaceImages();
      document.getElementById("answer").innerHTML = "Welcome 🙏🧠👾☯️❤️🤖🛸✨";
    });
  });

  loadContext();
}

// we should store our individual user's conversation on the client side and send it to the server thread locally and initialize it
document.addEventListener('DOMContentLoaded', initialize_stuff);

