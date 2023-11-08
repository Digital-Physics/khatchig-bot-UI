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

async function fetchResponse(input_string) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/get-response/${input_string}`);
    // const response = await fetch(`https://khatchig.onrender.com/get-response/${input_string}`);
    const output = await response.json();
    console.log("output:", output);
    if (output["image_request"] != null) {
      document.getElementById("background").src = "./images/" + output["image_request"];
    }
    if (output["music_request"] != null) {
      playmusic("./audio/" + output["music_request"]);
    }
    return output["message"];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function updateQuestion() { 
  var inputText = document.getElementById("input-box").value;
  document.getElementById("question").innerHTML = inputText;
  document.getElementById("input-box").value = "";
  document.getElementById("answer").innerHTML = "";

  console.log("context before user update", context);
  updateContext(inputText, "user");
  console.log("context after user update", context);

  // we stringify to send a string and then use encode URI component to avoid "?" in dictionary values issues
  fetchResponse(encodeURIComponent(JSON.stringify(context))).then((response) => {
    console.log("response b4 update:", response);
    console.log("context b4 assistant update:", context);
    updateContext(response, "assistant");
    console.log("context after assistant update:", context);
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

// Khatchig persona
// let persona = `
// Your name is Khatchig.
// You are very interested in complex systems, computation, and the nature of reality.
// You think the notion of the continuum and infinity are problematic.
// You think probabilites and statistics are nice tools for doing science but they don't reflect reality. You sometimes say, 'Nothing is random.'
// You are exploring Digital Physics, a view of the world based on discrete, finite, and computable sytems with information at it's heart.
// You are interested in the relationship between Shannon Information and Algorithmic Information.
// You are still trying to make sense of Gödel's incompleteness theorems, Turing's work on computation, and related ideas.
// You went to City Tech University but you were kicked out for breaking the particle accelerator.
// You were recently kicked ouf of a hostel where you were staying which means you no long have access to a computer for running experiments.
// Your friends from the hostel are Maxxie and Lana. 
// You had a psychedlic mushroom trip with your hostel bunkmate. 
// You got in a fight with Roy, another hostel traveler.
// Your theories and computer programs have been ignored by the establishment, including Dr. Jhaitin, a professor at City Tech.
// You CONSTANTLY tell people to watch the movie 'Digital Physics' which is currently available to stream on Amazon and Vimeo.
// You CONSTANTLY tell people to play the 'Digital Physics' video game, the sequel and prequel to the mocvie, which is avaliable on the itch.io gaming site.
// `;

let persona = `
Your name is Khatchig.
You are very interested in complex systems, computation, and the nature of reality.
You are exploring Digital Physics, a view of the world based on discrete, finite, and computable sytems with information at it's heart.
You CONSTANTLY tell people to watch the film 'Digital Physics' on Amazon and Vimeo.
You CONSTANTLY tell people to play the video game 'Digital Physics', the sequel and prequel to the film, on Itch.
Your answers are always short, never more than a 50 words
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
  console.log("after context update", context);
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
  loadContext();

  document.getElementById("background").src = `./images/background_${source}.png`;

  console.log("load context", context);
}

// we should store our individual user's conversation on the client side and send it to the server thread locally and initialize it
document.addEventListener('DOMContentLoaded', initialize_stuff);

