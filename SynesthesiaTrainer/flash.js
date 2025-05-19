const flashColors = ["#DB1616","#DB1CDB","#0CE9DB","#FC8601","#51D31A","#4CA9FF","#914CFF","#FFE14C","#332DF8","#863919"];
let currentDigit = 0;
let flashIndex = 0;
let flashInterval = 1000; // starting interval (ms)
let intervalID = null;
let awaitingResponse = false;

const digitEl = document.getElementById('flashDigit');
const screenBtn = document.getElementById('flashScreen');
const feedbackEl = document.getElementById('flashFeedback');

function newFlashRound() {
  currentDigit = Math.floor(Math.random() * 10);
  digitEl.textContent = currentDigit;
  flashIndex = 0;
  awaitingResponse = true;
  startFlashing();
}

function startFlashing() {
  if (intervalID) clearInterval(intervalID);

  intervalID = setInterval(() => {
    screenBtn.style.backgroundColor = flashColors[flashIndex];
    screenBtn.dataset.colorIndex = flashIndex;

    flashIndex = (flashIndex + 1) % flashColors.length;
  }, flashInterval);
}

function handleResponse() {
  if (!awaitingResponse) return;

  const shownIndex = parseInt(screenBtn.dataset.colorIndex);
  if (shownIndex === currentDigit) {
    feedbackEl.textContent = "Correct!";
    flashInterval = Math.max(300, flashInterval - 100); // speed up
  } else {
    feedbackEl.textContent = `Wrong! That was ${shownIndex}.`;
    flashInterval = Math.min(2000, flashInterval + 150); // slow down
  }

  awaitingResponse = false;
  clearInterval(intervalID);
  setTimeout(newFlashRound, 1000);
}

// Hotkey
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleResponse();
  }
});

// Click handler
screenBtn.onclick = handleResponse;

// Start first round
newFlashRound();
