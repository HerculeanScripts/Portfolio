let numbers = [];
let target = 0;
let score = 0;
let startTime = 0;
let exampleSolution = null;

const ops = ["+", "-", "*", "/"];

function generateNumbers(count = 3) {
  numbers = [];
  for (let i = 0; i < count; i++) {
    numbers.push(Math.floor(Math.random() * 9) + 1);
  }

  const expressions = generateExpressions(numbers);
  if (expressions.length === 0) {
    // fallback if no expressions
    target = numbers[0];
    exampleSolution = `${target}`;
  } else {
    const chosen = expressions[Math.floor(Math.random() * expressions.length)];
    target = chosen.val;
    exampleSolution = chosen.expr;
  }

  document.getElementById("target-number").textContent = target;
  document.getElementById("available-numbers").textContent = numbers.join(", ");
  document.getElementById("expression-input").value = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("example-solution").textContent = "";
  startTime = Date.now();
}

function generateExpressions(nums) {
  if (nums.length === 1) {
    return [{ expr: nums[0].toString(), val: nums[0] }];
  }

  let results = [];
  for (let i = 1; i < nums.length; i++) {
    let lefts = generateExpressions(nums.slice(0, i));
    let rights = generateExpressions(nums.slice(i));
    for (let l of lefts) {
      for (let r of rights) {
        for (let op of ops) {
          try {
            // Avoid division by zero
            if (op === "/" && r.val === 0) continue;

            let expr = `(${l.expr} ${op} ${r.expr})`;
            let val = Function(`"use strict"; return (${expr})`)();

            if (Number.isFinite(val)) {
              results.push({ expr, val });
            }
          } catch {
            // ignore errors
          }
        }
      }
    }
  }
  return results;
}

function submitExpression() {
  const input = document.getElementById("expression-input").value;

  // Check if input uses available numbers exactly once each
  if (!validateNumberUsage(input, numbers)) {
    document.getElementById("feedback").textContent = "Invalid use of numbers.";
    return;
  }

  let result;
  try {
    result = Function(`"use strict"; return (${input})`)();
  } catch {
    document.getElementById("feedback").textContent = "Error in expression.";
    return;
  }

  if (!Number.isFinite(result)) {
    document.getElementById("feedback").textContent = "Invalid expression result.";
    return;
  }

  const diff = Math.abs(result - target);
  const timeTaken = (Date.now() - startTime) / 1000;

  // Score: 100 points minus difference * 10, scaled by speed
  let roundScore = Math.max(0, 100 - diff * 10) * (10 / (timeTaken + 1));
  roundScore = Math.round(roundScore);

  score += roundScore;

  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("feedback").textContent =
    `You got ${result}. Difference: ${diff}. Score this round: ${roundScore}. Time: ${timeTaken.toFixed(1)}s`;
}

function validateNumberUsage(expr, availableNumbers) {
  // Extract all numbers used in expression (digits or multi-digit)
  const usedNumbers = expr.match(/\d+/g)?.map(Number) || [];
  let availableCopy = [...availableNumbers];

  for (let num of usedNumbers) {
    const idx = availableCopy.indexOf(num);
    if (idx === -1) {
      return false; // number not available or used too many times
    }
    availableCopy.splice(idx, 1);
  }
  return true;
}

function nextRound() {
    let numberCount = Math.floor(score / 300) + 3;

  generateNumbers(numberCount);
}

function showExampleSolution() {
  if (exampleSolution) {
    document.getElementById("example-solution").textContent = `Example solution: ${exampleSolution} = ${target}`;
  } else {
    document.getElementById("example-solution").textContent = "No example solution available.";
  }
}

window.onload = () => {
  generateNumbers(3);
};
