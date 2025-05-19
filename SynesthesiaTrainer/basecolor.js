const baseColors = ["#DB1616", "#DB1CDB", "#0CE9DB", "#FC8601", "#51D31A", "#4CA9FF", "#914CFF", "#FFE14C", "#332DF8", "#863919"];

let baseCorrect = 0;
let baseTotal = 0;
let responseTimes = [];
let currentStartTime = 0;
let showStats = false;
let ignoreFirstStat = false;

document.getElementById('toggleStatsBtn').onclick = () => {
  showStats = !showStats;
  document.getElementById('toggleStatsBtn').textContent = showStats ? "Hide Stats" : "Show Stats";

  if (showStats) {
    ignoreFirstStat = true; // ignore first stat reading *after* enabling
  }

  updateBaseColorStats();
};


function updateBaseColorStats() {
  const acc = baseTotal ? Math.round((baseCorrect / baseTotal) * 100) : 0;
  let stats = `Correct: ${baseCorrect}/${baseTotal} (${acc}%)`;
  if (showStats && responseTimes.length > 1) {
    const trimmed = responseTimes.slice(1); // discard first
    const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    stats += ` | Avg Time: ${avg.toFixed(1)} ms`;
  }
  document.getElementById('baseColorStats').textContent = stats;
}

function generateBaseColorQuestion() {
  const digit = Math.floor(Math.random() * 10);
  document.getElementById('baseDigitPrompt').textContent = digit;
  const optionsEl = document.getElementById('baseColorOptions');
  optionsEl.innerHTML = '';

  const indexes = showStats ? [...Array(10).keys()] : [...Array(10).keys()].sort(() => 0.5 - Math.random());

  indexes.forEach(idx => {
    const col = baseColors[idx];
    const btn = document.createElement('button');
    btn.style.backgroundColor = col;
    btn.style.width = '50px';
    btn.style.height = '50px';
    btn.style.border = '2px solid black';
    btn.onclick = () => {
      const responseTime = Date.now() - currentStartTime;
      if (showStats) {
  if (ignoreFirstStat) {
    ignoreFirstStat = false; // skip this one
  } else {
    responseTimes.push(responseTime);
  }
}

      baseTotal++;
      if (idx === digit) {
        baseCorrect++;
        document.getElementById('baseColorFeedback').textContent = "Correct!";
      } else {
        document.getElementById('baseColorFeedback').textContent = `Incorrect. Correct color was for ${digit}.`;
      }
      updateBaseColorStats();
      setTimeout(generateBaseColorQuestion, 800);
    };
    optionsEl.appendChild(btn);
  });

  currentStartTime = Date.now();
}

updateBaseColorStats();
generateBaseColorQuestion();
