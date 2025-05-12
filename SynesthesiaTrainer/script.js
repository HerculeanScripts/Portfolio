const numberColors = {
    0: { hex: "#DB1616", name: "red" },
    1: { hex: "#DB1CDB", name: "pink" },
    2: { hex: "#0CE9DB", name: "aqua" },
    3: { hex: "#FC8601", name: "orange" },
    4: { hex: "#51D31A", name: "green" },
    5: { hex: "#4CA9FF", name: "light-blue" },
    6: { hex: "#914CFF", name: "purple" },
    7: { hex: "#FFE14C", name: "yellow" },
    8: { hex: "#332DF8", name: "blue" },
    9: { hex: "#863919", name: "brown" }
  };
 // ["#DB1616","#DB1CDB","#0CE9DB","#FC8601","#51D31A","#4CA9FF","#914CFF","#FFE14C","#332DF8","#863919"];
  const perDigitAccuracy = Array.from({ length: 10 }, () => 0.1); // starting neutral
  const alpha = 0.2; // smoothing factor
  
  function updateAccuracy(digit, correct) {
    perDigitAccuracy[digit] = alpha * (correct ? 1 : 0) + (1 - alpha) * perDigitAccuracy[digit];
  }
  
  function getDifficulty(digit) {
    const raw = perDigitAccuracy[digit];
    return Math.max(0.1, Math.min(0.9, raw)); // clamp to prevent extremes
  }
  function speak(text) {
    const msg = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(msg);
  }
  
  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [bigint >> 16 & 255, bigint >> 8 & 255, bigint & 255];
  }
  
  function colorDistance(c1, c2) {
    const [r1, g1, b1] = hexToRgb(c1);
    const [r2, g2, b2] = hexToRgb(c2);
    return Math.sqrt((r1 - r2)**2 + (g1 - g2)**2 + (b1 - b2)**2);
  }
  
  function generateSimilarColors(baseHex, n, difficulty) {
    const [r, g, b] = hexToRgb(baseHex);
    const colors = [];
    for (let i = 0; i < n; i++) {
        const factor = Math.pow(1 - difficulty, 1.5) * 220 + 30;
      var a = 0.5;
      const dr = Math.floor((Math.random() - a) * factor);
      const dg = Math.floor((Math.random() - a) * factor);
      const db = Math.floor((Math.random() - a) * factor);
      const color = `rgb(${Math.min(255, Math.max(0, r + dr))}, ${Math.min(255, Math.max(0, g + dg))}, ${Math.min(255, Math.max(0, b + db))})`;
      colors.push(color);
    }
    return colors;
  }
  
  // ------------------------ ACTIVITY 1 -------------------------
  let totalQuestions = 0;
  let correctAnswers = 0;
  function updateDifficultyDisplay() {
    const container = document.querySelector("#difficultyDisplay > div");
    container.innerHTML = ""; // clear old bars
  
    for (let digit = 0; digit < 10; digit++) {
      const diff = getDifficulty(digit); // 0.1 to 0.9
      const color = `hsl(${(1 - diff) * 120}, 100%, 50%)`; // green → yellow → red
  
      const bar = document.createElement("div");
      bar.style.width = "20px";
      bar.style.height = `${diff * 60 + 10}px`; // taller = more difficult
      bar.style.background = color;
      bar.title = `#${digit}: difficulty ${Math.round(diff * 100)}%`;
  
      container.appendChild(bar);
    }
  }
  
  if (location.pathname.includes("activity1")) {
    const questionEl = document.getElementById("question");
    const choicesEl = document.getElementById("choices");
    const feedbackEl = document.getElementById("feedback");
    const statsEl = document.getElementById("stats");
  
    function updateStats() {
      const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      statsEl.textContent = `Correct: ${correctAnswers}/${totalQuestions} (${accuracy}%)`;
    }
  
    function newQuestion() {
      const number = Math.floor(Math.random() * 10);
      const { hex: correctHex, name: colorName } = numberColors[number];
  
      questionEl.textContent = `What color is ${number}?`;
      feedbackEl.textContent = "";
  
      const difficulty = getDifficulty(number);
  
      const distractors = generateSimilarColors(correctHex, 5 + Math.floor(difficulty * 3), difficulty);
      const options = [...distractors, correctHex].sort(() => 0.5 - Math.random());
  
      choicesEl.innerHTML = "";
      for (const color of options) {
        const btn = document.createElement("button");
        btn.classList.add("color-option");
        btn.dataset.color = color.toLowerCase();
        btn.style.background = color;
        btn.style.width = "50px";
        btn.style.height = "50px";
        btn.style.margin = "6px";
        btn.style.border = "2px solid black";
        btn.onclick = () => {
            totalQuestions++;
            const isCorrect = color.toLowerCase() === correctHex.toLowerCase();
            if (isCorrect) correctAnswers++;
            updateAccuracy(number, isCorrect);
            updateStats();
          
            const buttons = document.querySelectorAll(".color-option");
            buttons.forEach(b => {
              const isThisCorrect = b.dataset.color === correctHex.toLowerCase();
              if (!isThisCorrect) {
                b.style.opacity = "0.25";
              } else {
                b.style.outline = "3px solid lime";
              }
              b.disabled = true;
            });
          
            feedbackEl.textContent = isCorrect
              ? "Correct!"
              : `Incorrect. It was the ${colorName} square.`;
            speak(`${number} is ${colorName}`);
            setTimeout(newQuestion, 1800);
          };
          
        choicesEl.appendChild(btn);
      }
      updateDifficultyDisplay();

    }
    
    newQuestion();
  }
  
  // ------------------------ ACTIVITY 2 -------------------------
  if (location.pathname.includes("activity2")) {
    const numberEl = document.getElementById("numberDisplay");
    const feedbackEl = document.getElementById("pickerFeedback");
    const colorSwatch = document.getElementById("colorSwatch");
    const colorBar = document.getElementById("colorBar");
    let currentNumber = 0;
    let picker;
  
    function rgbDistance(hex1, hex2) {
      const [r1, g1, b1] = hexToRgb(hex1);
      const [r2, g2, b2] = hexToRgb(hex2);
      return Math.round(Math.sqrt((r1 - r2)**2 + (g1 - g2)**2 + (b1 - b2)**2));
    }
  
    function newPickerQuestion() {
      feedbackEl.textContent = "";
      colorSwatch.innerHTML = "";
      colorBar.style.width = "0";
      currentNumber = Math.floor(Math.random() * 10);
      numberEl.textContent = currentNumber;
    }
  
    window.submitColorGuess = () => {
      const guessedColor = picker.color.hexString;
      const { hex: correctColor, name: colorName } = numberColors[currentNumber];
      const dist = rgbDistance(guessedColor, correctColor);
      const similarity = Math.max(0, 1 - dist / 441); // 441 = max possible distance in RGB
  
      feedbackEl.textContent = `${currentNumber} is ${colorName}. Your guess was ${dist} units away.`;
      speak(`${currentNumber} is ${colorName}`);
  
      // Show swatches
      colorSwatch.innerHTML = `
        <div style="display:flex; gap:10px; margin-top:10px;">
          <div>
            <div style="width:40px; height:40px; background:${correctColor}; border:1px solid black;"></div>
            <div style="font-size:12px; text-align:center;">Correct</div>
          </div>
          <div>
            <div style="width:40px; height:40px; background:${guessedColor}; border:1px solid black;"></div>
            <div style="font-size:12px; text-align:center;">Your Guess</div>
          </div>
        </div>
      `;
  
      // Show similarity bar
      colorBar.style.width = `${similarity * 100}%`;
      colorBar.style.background = `hsl(${similarity * 120}, 100%, 50%)`; // green to red
  
      setTimeout(newPickerQuestion, 3000);
    };
  
    window.onload = () => {
      picker = new iro.ColorPicker("#colorPicker", {
        width: 200,
        color: "#f00"
      });
      newPickerQuestion();
    };
  }
  