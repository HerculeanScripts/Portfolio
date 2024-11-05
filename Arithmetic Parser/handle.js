function build(expression) {
  var i = 0;
  while (i < expression.length) {
    if (expression[i] === '*' || expression[i] === '/' || expression[i]==="^") {
      var res;
      if (expression[i+1] !== "(") {
        res = [expression[i - 1], expression[i], expression[i+1]];
        expr1 = expression.slice(0, i - 1).concat([res]);
      expression = expr1.concat(expression.slice(i + 2));
      }
      else {
        var count = 1;
      var x = i+1;
      while (count > 0 && x < expression.length) {
        x++;
        if (expression[x] === '(') {
          count++;
        } else if (expression[x] === ')') {
          count--;
        }
      }
        res = [expression[i - 1], expression[i], build(expression.slice(i+2, x))];
        expr1 = expression.slice(0, i - 1).concat([res]);
        expression = expr1.concat(expression.slice(x+1));
      }
      i--;
    } else if (expression[i] === '(') {
      count = 1;
      x = i;
      while (count > 0 && x < expression.length) {
        x++;
        if (expression[x] === '(') {
          count++;
        } else if (expression[x] === ')') {
          count--;
        }
      }
      expression = expression
        .slice(0, i)
        .concat([build(expression.slice(i + 1, x))])
        .concat(expression.slice(x + 1));
    }
    else if (expression[i] === "!") {
      res = [expression[i - 1], expression[i]];
        expr1 = expression.slice(0, i - 1).concat([res]);
      expression = expr1.concat(expression.slice(i + 1));
    }
    else if ("0123456789+-".indexOf(expression[i])===-1) {
      count = 1;
      x = i+1;
      while (count > 0 && x < expression.length) {
          
        x++;
        if (expression[x] === '(') {
          count++;
        } else if (expression[x] === ')') {
          count--;
        }
      }
      
      res = [expression[i], [build(expression.slice(i + 2, x))]];
        expr1 = expression.slice(0, i).concat([res]);
      expression = expr1.concat(expression.slice(x+1));
    }
    i++;
  }
  return expression;
 }
  function factorial(n) {
    if (n == 0) {
      return 1;
    }
      var s = n;
      for (var x = n-1; 0 < x; x--) {
          s*=x;
      }
      return s;
}
var functionsDict = {};
functionsDict["sqrt"] = Math.sqrt;
functionsDict["sin"] = Math.sin;
functionsDict["cos"] = Math.cos;
 function evaluate(arr) {
  var i = 0;
  while (i < arr.length) {
    if (typeof arr[i] === 'object') {
      arr[i] = evaluate(arr[i]);
    }
    i++;
  }
  i = 0;
  while (i < arr.length) {
    if (arr.indexOf('^') !== -1) {
      return arr[0] ** arr[2];
    }
    if (arr[i] in functionsDict) {
      return functionsDict[arr[i]](arr[1]);
    }
    if (arr.indexOf('!') !== -1) {
      return factorial(arr[0]);
    }
    if (arr.indexOf('*') !== -1) {
      return arr[0] * arr[2];
    }
    if (arr.indexOf('/') !== -1) {
      return arr[0] / arr[2];
    }
    if (arr[i] === '+') {
      arr[i - 1] = arr[i - 1] + arr[i + 1];
      arr = arr.slice(0, i).concat(arr.slice(i + 2));
      i--;
    }
    if (arr[i] === '-') {
      arr[i - 1] = arr[i - 1] - arr[i + 1];
      arr = arr.slice(0, i).concat(arr.slice(i + 2));
      i--;
    }
    i++;
  }
  return arr;
 }

 function parse(str) {
  var tokens = [];
  var num = '';
  var func = "";
  for (var x of str) {
    if ('-+*/'.indexOf(x) !== -1) {
      if (num !== '') {
        tokens.push(Number(num));
        num = '';
      }
      tokens.push(x);
    } else if (x === '(') {
      if (func !== '') {
        tokens.push(func);
        func = '';
      }
      tokens.push('(');
    } else if (x === ')') {
      if (num !== '') {
        tokens.push(Number(num));
        num = '';
      }
      tokens.push(')');
    }
    else if (x==="^") {
        if (num !== '') {
        tokens.push(Number(num));
        num = '';
      }
      tokens.push("^");
    }
    else if (x==="!") {
        if (num !== '') {
        tokens.push(Number(num));
        num = '';
      }
      tokens.push("!");
    }
    else if ("0123456789".indexOf(x) !== -1) {
      num += x;
    }
    else {
        func += x;
    }
  }
  if (num !== '') {
    tokens.push(Number(num));
  }
  return tokens;
 }
   
   
//console.log(build());
document.getElementById("expressionInput").addEventListener("input",() => {
    try {
        console.log(build(parse(document.getElementById("expressionInput").value)));
        document.getElementById("resultLabel").innerHTML = `Expression = ${evaluate(build(parse(document.getElementById("expressionInput").value)))}`;
    }
    catch {
        document.getElementById("resultLabel").innerHTML = `Expression = X`;
    }
});