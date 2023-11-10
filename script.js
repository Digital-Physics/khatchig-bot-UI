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

// this takes a function that it will run at the end of what it otherwise does
function preloadImages(callback) {
  const imagesToLoad = 150;
  let imagesLoaded = 0;

  for (let i = 0; i < imagesToLoad; i++) {
    const img = new Image();
    img.src = `./images/nca/transparent_${i}.png`;
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
let interval; 

// double protection
// animation_complete = false;

function cycleImages(once = false, callback) {
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

async function fetchResponse(input_string) {
  document.getElementById("face").src = "";

  // sets interval var to this function that that if it takes in nothing, just continues to run this function asynchrously with other stuff, i think
  // interval = cycleImages();
  preloadImages(() => {
    // Preloading again?
    interval = cycleImages();
  });

  try {
    // const response = await fetch(`http://127.0.0.1:8000/get-response/${input_string}`);
    const response = await fetch(`https://khatchig.onrender.com/get-response/${input_string}`);
    const output = await response.json();

    clearInterval(interval);
    currentImage = 0;
    interval = null;

    document.getElementById("face").src = "./images/face.png";

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
You CONSTANTLY tell people to watch the film 'Digital Physics' on Amazon Prime Video by clicking the 🍿.
You CONSTANTLY tell people to play the video game 'Digital Physics', the sequel and prequel to the film, on Itch by clicking the 🕹️.
You CONSTANTLY tell people to leave a comment or review on 'Digital Physics' because you read all of them.
Your answers are ALWAYS concise!
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
var source = Math.floor(Math.random()*3);

playButton.addEventListener('click', () => {
    source = (source + 1)%3;
    playmusic(`./audio/level${source}_music.ogg`);
    document.getElementById("background").src = `./images/background_${source}.png`
});

stopButton.addEventListener('click', () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  } 
});

function initialize_stuff() {
  document.getElementById("face").src = "";
  // preload images takes the function you want to run at the tail end. this one takes nothing and then cycles images
  preloadImages(() => {
    // All necessary images are preloaded, start the animation
    interval = cycleImages(true, () => {
      // This callback will be executed when the interval is stopped
      document.getElementById("face").src = "./images/face.png";
      document.getElementById("answer").innerHTML = "Welcome 🙏🧠👾☯️❤️🤖🛸✨";
    });
  });

  loadContext();
}

// we should store our individual user's conversation on the client side and send it to the server thread locally and initialize it
document.addEventListener('DOMContentLoaded', initialize_stuff);

