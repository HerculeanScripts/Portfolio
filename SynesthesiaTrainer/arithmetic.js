// ──────────────────────────────────────────────────────────
// Arithmetic Trainer Script (with live colorized input)
// ──────────────────────────────────────────────────────────

// Shared configuration
let totalQuestions = 0;
let correctAnswers = 0;
let difficulty = 0.2; // Start easy
const operations = ['+', '-', '*', '/'];
const numberColors =  ["#DB1616","#DB1CDB","#06FEEE","#FC8601","#51D31A","#4CA9FF","#914CFF","#FFE14C","#332DF8","#863919"];

// 1) Update stats & difficulty display
function updateStats() {
  const accuracy = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;
  document.getElementById('stats').textContent =
    `Correct: ${correctAnswers}/${totalQuestions} (${accuracy}%)`;
  document.getElementById('difficultyDisplay').textContent =
    `Difficulty: ${difficulty.toFixed(2)}`;
}

// 2) Colorize each digit in a string
function colorizeDigits(text) {
  return text.split('').map(char => {
    if (/\d/.test(char)) {
      const digit = parseInt(char, 10);
      const col = numberColors[digit] || 'black';
      return `<span style="color:${col}">${char}</span>`;
    }
    return char;
  }).join('');
}

// 3) Generate & render a new question
function generateArithmeticQuestion() {
  const op = operations[Math.floor(Math.random() * operations.length)];
  let num1, num2, correctAnswer;

  // Scale operands by operation + difficulty
  if (op === '+' || op === '-') {
    const max = Math.floor(100 + difficulty * 900);
    num1 = Math.floor(Math.random() * max);
    num2 = Math.floor(Math.random() * max);
  } else if (op === '*') {
    const max = Math.floor(10 + difficulty * 90);
    num1 = Math.floor(Math.random() * max);
    num2 = Math.floor(Math.random() * max);
  } else {
    // Division with integer result
    num2 = Math.floor(Math.random() * 9) + 1;
    const result = Math.floor(Math.random() * 10 + difficulty * 40);
    num1 = num2 * result;
  }

  // Compute correct answer
  switch (op) {
    case '+': correctAnswer = num1 + num2; break;
    case '-': correctAnswer = num1 - num2; break;
    case '*': correctAnswer = num1 * num2; break;
    case '/': correctAnswer = num1 / num2; break;
  }

  // Render question with colorized digits
  document.getElementById('question').innerHTML =
    `What is ${colorizeDigits(num1.toString())} ${op} ${colorizeDigits(num2.toString())}?`;

  // Reset input, colored display, and feedback
  const input = document.getElementById('answerInput');
  document.getElementById('coloredAnswer').innerHTML = '';
  document.getElementById('feedback').textContent = '';
  input.value = '';
  input.dataset.correct = correctAnswer;
}

// 4) Live-update the colored answer display as user types
document.getElementById('answerInput').addEventListener('input', e => {
  const val = e.target.value;
  document.getElementById('coloredAnswer').innerHTML = colorizeDigits(val);
});

// 5) Check answer on Enter
document.getElementById('answerInput').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const input = e.target;
  const val = parseFloat(input.value);
  const correct = parseFloat(input.dataset.correct);
  if (isNaN(val)) return;

  totalQuestions++;
  if (Math.abs(val - correct) < 1e-6) {
    correctAnswers++;
    difficulty = Math.min(0.95, difficulty + 0.05);
    document.getElementById('feedback').textContent = 'Correct!';
  } else {
    difficulty = Math.max(0.2, difficulty - 0.05);
    document.getElementById('feedback').textContent =
      `Incorrect. Answer was ${correct}.`;
  }
  updateStats();
  setTimeout(generateArithmeticQuestion, 1500);
});

// 6) Initialize
updateStats();
generateArithmeticQuestion();
