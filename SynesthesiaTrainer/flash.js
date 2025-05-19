const flashColors = [
  "#DB1616", "#DB1CDB", "#0CE9DB", "#FC8601", "#51D31A",
  "#4CA9FF", "#914CFF", "#FFE14C", "#332DF8", "#863919"
];

let flashInterval = 1000;
let flashTimer = null;
let awaitingMatch = false;

let currentDigit = 0;
let currentBgIndex = 0;

const flashBtn = document.getElementById('flashScreen');
const feedbackEl = document.getElementById('flashFeedback');

function getRandomDigit() {
  return Math.floor(Math.random() * 10);
}

function getRandomColorIndex() {
  return Math.floor(Math.random() * 10);
}

function isMatch(digit, bgIndex) {
  return digit === bgIndex;
}

function flashNext() {
  currentDigit = getRandomDigit();
  currentBgIndex = getRandomColorIndex();

  flashBtn.style.backgroundColor = flashColors[currentBgIndex];
  flashBtn.textContent = currentDigit;
  awaitingMatch = true;
}

function handleResponse() {
  if (!awaitingMatch) return;

  const match = isMatch(currentDigit, currentBgIndex);
  if (match) {
    feedbackEl.textContent = "✅ Correct Match!";
    flashInterval = Math.max(300, flashInterval - 100);
  } else {
    feedbackEl.textContent = "❌ Incorrect or Mistimed!";
    flashInterval = Math.min(2000, flashInterval + 150);
  }

  awaitingMatch = false;
  restartFlashing();
}

function restartFlashing() {
  clearInterval(flashTimer);
  flashNext();
  flashTimer = setInterval(() => {
    flashNext();
  }, flashInterval);
}

// Start the game
restartFlashing();

// User interaction
flashBtn.onclick = handleResponse;
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    handleResponse();
  }
});
