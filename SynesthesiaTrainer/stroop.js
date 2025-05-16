
// === CONFIG ===
const numberColors = ["#DB1616","#DB1CDB","#0CE9DB","#FC8601","#51D31A","#4CA9FF","#914CFF","#FFE14C","#332DF8","#863919"];


// === STATE ===
let correctDigit = 0;
let isCongruent = false;
let trialStartTime = 0;
let trials = []; // Stores all trial data

// === ELEMENTS ===
const displayEl = document.getElementById("stroop-digit");
const feedbackEl = document.getElementById("stroop-feedback");

// === MAIN ===
function startStroopTrial() {
  const randomDigit = Math.floor(Math.random() * 10);
  const congruent = Math.random() < 0.5;

  correctDigit = randomDigit;
  isCongruent = congruent;

  let color;
  if (congruent) {
    color = numberColors[randomDigit];
  } else {
    // Pick a different digit's color
    const otherDigits = [...Array(10).keys()].filter(d => d !== randomDigit);
    const otherDigit = otherDigits[Math.floor(Math.random() * otherDigits.length)];
    color = numberColors[otherDigit];
  }

  displayEl.textContent = randomDigit;
  displayEl.style.color = color;

  trialStartTime = performance.now();
}

// === RESPONSE HANDLING ===
document.addEventListener('keydown', e => {
  if (!/\d/.test(e.key)) return;

  const reactionTime = performance.now() - trialStartTime;
  const responseDigit = parseInt(e.key);
  const correct = (responseDigit === correctDigit);

  trials.push({
    congruent: isCongruent,
    correct,
    rt: reactionTime
  });

  feedbackEl.textContent = correct ? "✅ Correct" : `❌ ${correctDigit}`;

  updateStroopStats();
  setTimeout(startStroopTrial, 1000);
});

// === STATS ===
function updateStroopStats() {
  const matchTrials = trials.filter(t => t.congruent);
  const mismatchTrials = trials.filter(t => !t.congruent);

  const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : '–';

  document.getElementById('avg-time-match').textContent =
    avg(matchTrials.map(t => t.rt));
  document.getElementById('avg-time-mismatch').textContent =
    avg(mismatchTrials.map(t => t.rt));

  const acc = arr => arr.length
    ? Math.round(100 * arr.filter(t => t.correct).length / arr.length)
    : '–';

  document.getElementById('acc-match').textContent = acc(matchTrials);
  document.getElementById('acc-mismatch').textContent = acc(mismatchTrials);
}

// === INIT ===
startStroopTrial();

