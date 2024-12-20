function leadingZeros(n, len) {
  return "0".repeat(len-n.length) + n;
}
function replaceAt(s, spot, x) {
  return s.substring(0 ,spot) + x + s.substring(spot+1);
}

//remove leading 0s -> 003 -> 3
function removeLeadingZeros(s) {
  var b = false;
  b = s[0] == "-";
  
  for (var i = 0; i < s.length; i++) {
    if (s[i]!="-" && s[i] != "0") {
      if (b) {
        return "-" + s.substring(i);
      }
      else {
       return s.substring(i);
      }
    }
  }
  return ""
}

//returns a>=b
function compare(a,b) {
  a = removeLeadingZeros(a);
  b = removeLeadingZeros(b);
  if (a.length > b.length) {
    return true;
  }
  if (a.length < b.length) {
    return false;
  }
  var bool = false;
  for (var s = 0; s < a.length; s ++) {
    if (a.charAt(s) > b.charAt(s)) {
      bool = true;
    }
    else if (a.charAt(s) < b.charAt(s) && !bool) {
      return false;
    }
  }
  return true;
}

function add(n1, n2) {
  var res = "";
  var ml = Math.max(n1.length, n2.length);
  n1=leadingZeros(n1, ml);
  n2=leadingZeros(n2, ml);
  var carry = 0;
  for (var i = n1.length-1; i >= 0; i--) {
    var temp = 0;
    temp = Number(n1[i]) + Number(n2[i]) + Number(carry);
    carry = (temp-temp%10)/10;
    res = (temp%10).toString() + res;
  }
  res = (carry.toString() != "0" && carry.toString() || "") + res;
  return res;
}


//big subtract n1-n2
function subtract(n1, n2) {
  var negBool = !compare(n1, n2);
  if (negBool) {
    var t = n1;
    n1 = n2;
    n2 = t;
  }
  var res = "";
  var ml = Math.max(n1.length, n2.length);
  n1=leadingZeros(n1, ml);
  n2=leadingZeros(n2, ml);
  for (var i = n1.length-1; i >= 0; i--) {
    if (n1[i] >= n2[i]) {
      res = n1[i] - n2[i] + res;
    }
    else {
      //n1 = replaceAt(n1, i-1, n1[i-1]-1);
      var x= i-1;
      while (n1[x] =="0") {
        n1 = replaceAt(n1, x, 9);
        x--;
      }
      n1 = replaceAt(n1, x, n1[x]-1);
      res = (n1[i] - n2[i] + 10) + res;
    }
  }
  for (var i = 0; i < res.length; i++) {
      if (res[i]!="0") {
          res = res.substring(i);
          break;
      }
  }
  if (negBool && res != "0") {
    res = "-" + res;
  }
  return res;
}

function divide(a,b) {
  var dividend = "";
  var res = "";
  var negB = (a[0] == "-" || b[0] == "-") && !(a[0] == "-" && b[0] == "-");
  if (a[0] == "-") {
    a = a.substring(1);
  }
  if (b[0] == "-") {
    b = b.substring(1);
  }
  var x=a.length;
  while (x >= 0) {
    var c=0;
      while (compare(dividend, b)) {
        c++;
        dividend = subtract(dividend, b);
      }
      res +=c;
    if (a.length > 0) {
      dividend += a[0];
      a=a.substring(1);;
      //res += "0";
    }
    x--;
  }
  res = removeLeadingZeros(res);
  dividend = removeLeadingZeros(dividend);
  if (negB) {
    res = "-" + res;
  }
  return ["quotient " + (res || "0"), "remainder " + (dividend || "0")];
}

function factorial(num) {
  var res = "1";
  while (num != "0" && num!="") {
    res = multiply(num, res);
    num = subtract(num, "1");
  }
  return res;
}
//standard power calculation
function p(a,b) {
  var res = "1";
  while (b != "0") {
    res = multiply(a,res);
    b = subtract(b, "1");
  }
  return res;
}
//more efficient calculation?
var comps = {};
function power(a,b) {
  console.log(a,b);
  if (b == "1") {
    comps[a + "," + b] = a;
    return a;
  }
  if (comps[a + "," + b]) {
    return comps[a + "," + b];
  }
  var r= power(a, parseInt(b/2))
  r = multiply(r,r)
  if (b%2 == 1) {
    r = multiply(r, a);
  }
  comps[a + "," + b] = r;
  return r;
}

function multiplyTraditional(n1, n2) {
  var res = "";
  var carry = 0;
  var negB = (n1[0] == "-" || n2[0] == "-") && !(n1[0] == "-" && n2[0] == "-");
  n1 = removeLeadingZeros(n1);
  n2 = removeLeadingZeros(n2);
   if (n1[0] == "-") {
    n1 = n1.substring(1);
  }
  if (n2[0] == "-") {
    n2 = n2.substring(1);
  }
  for (var i = n1.length-1; i >= 0; i--) {
    var temp = "0".repeat(n1.length-1-i);
    carry = 0;
    for (var j = n2.length-1; j >= 0; j--) {
      var r = Number(n1[i]) * Number(n2[j]) + Number(carry);
      temp = r%10 + "" + temp;
      carry = (r-r%10)/10 + "";
    }
    temp = carry + "" + temp;
    res = add(res, temp);
  }
  if (negB) {
    res = "-" + res;
  }
  return removeLeadingZeros(res);
}
function addZeros(n, zeros) {
    return n + "0".repeat(zeros);
}
function multiply(a,b) {
  if (a.length < 10 && b.length <10) {
      return (Number(a)*Number(b)) + "";
  }
  var ml = Math.max(a.length, b.length);
  a = leadingZeros(a, ml);
  b = leadingZeros(b, ml);
  fastMult = multiply;
  var bound = Math.floor(ml/2);
  var a0 = a.substring(0,bound);
  var b0 = b.substring(0,bound);
  var a1 = a.substring(bound);
  var b1 = b.substring(bound);
  var z2 = fastMult(a0,b0);
  var z0 = fastMult(a1, b1);
  var z1 = subtract(fastMult(add(a0, a1),add(b0, b1)), add(z0,z2));
  bound = ml - bound;
  return removeLeadingZeros( add(add(addZeros(z2, bound*2), addZeros(z1, bound)), z0));
}


  function getA() {
    return document.getElementById("aInput").value;
  }
  function getB() {
    return document.getElementById("bInput").value;
  }
  //btn / input handling
  document.getElementById("add").addEventListener("click", (event) => {
    document.getElementById('output').innerHTML = add(getA(), getB());
});
document.getElementById("subtract").addEventListener("click", (event) => {
    document.getElementById('output').innerHTML = subtract(getA(), getB());
});
document.getElementById("multiply").addEventListener("click", (event) => {
    document.getElementById('output').innerHTML = multiply(getA(), getB());
});
document.getElementById("divide").addEventListener("click", (event) => {
    document.getElementById('output').innerHTML = divide(getA(), getB());
});
document.getElementById("factorial").addEventListener("click", (event) => {
  document.getElementById('output').innerHTML = factorial(getA());
});
document.getElementById("power").addEventListener("click", (event) => {
  document.getElementById('output').innerHTML = power(getA(), getB());
});