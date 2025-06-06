const reverseNumberColors = ["#DB1616","#DB1CDB","#0CE9DB","#FC8601","#51D31A","#4CA9FF","#914CFF","#FFE14C","#332DF8","#863919"];
  
  let reverseTotal = 0;
  let reverseCorrect = 0;
  
  function updateReverseStats() {
    const acc = reverseTotal ? Math.round((reverseCorrect / reverseTotal) * 100) : 0;
    document.getElementById('reverseStats').textContent = 
      `Correct: ${reverseCorrect}/${reverseTotal} (${acc}%)`;
  }
  
  function generateColorToDigit() {
    const digit = Math.floor(Math.random() * 10);
    const color = reverseNumberColors[digit];
    
    const box = document.getElementById('colorBox');
    box.style.backgroundColor = color;
  
    const opts = document.getElementById('digitOptions');
    opts.innerHTML = '';
    const shuffled = [...Array(10).keys()].sort(() => Math.random() - 0.5);
  
    shuffled.forEach(n => {
      const btn = document.createElement('button');
      btn.textContent = n;
      btn.style.margin = '5px';
      btn.className = "digit-option";
      btn.setAttribute("data-digit", n);
      btn.onclick = () => {
        reverseTotal++;
        if (n === digit) {
          reverseCorrect++;
          document.getElementById('feedback').textContent = "Correct!";
        } else {
          document.getElementById('feedback').textContent = `Incorrect. It was ${digit}.`;
        }
        updateReverseStats();
        setTimeout(generateColorToDigit, 1000);
      };
      opts.appendChild(btn);
    });
  }
  document.addEventListener("keydown", function(event) {
  // Check if a number key (0-9) is pressed
  if (event.key >= '0' && event.key <= '9') {
    const digit = event.key;

    // Find the button with the corresponding data-digit
    const button = document.querySelector(`.digit-option[data-digit="${digit}"]`);

    if (button) {
      button.click(); // Simulate a click on the button
    }
  }
});

  // Initialize
  updateReverseStats();
  generateColorToDigit();
  