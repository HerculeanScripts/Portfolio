function startLearningPage() {
    const numberEl = document.getElementById('center-number');
    const colors =  ["#DB1616","#DB1CDB","#0CE9DB","#FC8601","#51D31A","#4CA9FF","#914CFF","#FFE14C","#332DF8","#863919"];
    
    function randomNumber() {
      const number = Math.floor(Math.random() * 10);
      numberEl.textContent = number;
      document.body.style.backgroundColor = colors[number]; // Change background color to match number's color
    }
  
    setInterval(randomNumber, 3000); // New number every 3 seconds
  }
  
  startLearningPage();
  