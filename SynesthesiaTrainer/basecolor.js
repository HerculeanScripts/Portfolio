const baseColors =  ["#DB1616","#DB1CDB","#0CE9DB","#FC8601","#51D31A","#4CA9FF","#914CFF","#FFE14C","#332DF8","#863919"];

let baseCorrect = 0;
let baseTotal = 0;

function updateBaseColorStats() {
  const acc = baseTotal ? Math.round((baseCorrect / baseTotal) * 100) : 0;
  document.getElementById('baseColorStats').textContent = 
    `Correct: ${baseCorrect}/${baseTotal} (${acc}%)`;
}

function generateBaseColorQuestion() {
  const digit = Math.floor(Math.random() * 10);
  document.getElementById('baseDigitPrompt').textContent = digit;

  const optionsEl = document.getElementById('baseColorOptions');
  optionsEl.innerHTML = '';

  // Create an array of indexes [0–9] and shuffle it
  const shuffledIndexes = [...Array(10).keys()].sort(() => 0.5 - Math.random());

  shuffledIndexes.forEach(idx => {
    const col = baseColors[idx];
    const btn = document.createElement('button');
    btn.style.backgroundColor = col;
    btn.style.width = '50px';
    btn.style.height = '50px';
    btn.style.border = '2px solid black';
    btn.onclick = () => {
      baseTotal++;
      if (idx === digit) {
        baseCorrect++;
        document.getElementById('baseColorFeedback').textContent = "Correct!";
      } else {
        document.getElementById('baseColorFeedback').textContent =
          `Incorrect. Correct color was for ${digit}.`;
      }
      updateBaseColorStats();
      setTimeout(generateBaseColorQuestion, 1000);
    };
    optionsEl.appendChild(btn);
  });
}

// Start
updateBaseColorStats();
generateBaseColorQuestion();
