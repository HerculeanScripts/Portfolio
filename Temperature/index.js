



const c = 0.01;//constant = how fast it changes
const print = console.log;
const canvas = document.getElementById("canvasElement");
const context = canvas.getContext("2d");
const pixelSize = 250;
const tempConst = 2; //how much is added per 1 cycle on a direct pixel.
const maxTemp = 100;




canvas.width = pixelSize;
canvas.height = pixelSize;
context.fillStyle = "blue";
context.fillRect(0,0,pixelSize,pixelSize);




var average=0;
var count = -1;
var iteration = 0;
var intervalHandle;
var temps = [];
var partition = 25;
var mouseIsDown = false;








function sum(arr) {
    s = 0;
    for (n of arr) {
        s += n;
    }
    return s;
}








function getSumOfSurrounding(x,y) {
    var s = 0;
    var surr = 8;
    s += (y > 0 && x>0 && temps[y-1][x-1]);
    s += (y > 0 && temps[y-1][x]);
    s += (y > 0 && x < temps[0].length-1 && temps[y-1][x+1]);
    s += (x > 0 && temps[y][x-1]);
    s += (x < temps[0].length-1 && temps[y][x+1]);
    s += (y < temps.length-1 && x > 0 && temps[y+1][x-1]);
    s += (y < temps.length-1 && temps[y+1][x]);
    s += (y < temps.length-1 && x < temps[0].length-1 && temps[y+1][x+1]);
   
    (y > 0 && x > 0) || surr--;
    (y > 0)|| surr--;
    (y > 0 && x < temps[0].length-1)|| surr--;
    (x > 0)|| (surr--);
    (x < temps[0].length-1)|| (surr--);
    (y < temps.length-1 && x > 0)|| (surr-- );
    (y < temps.length-1) || (surr--);
    (y < temps.length-1 && x < temps[0].length-1)|| (surr--);
    return [s,surr];
}




function equals(a,b) {
  var r = Math.round;
  return (r(a*1000) == r(b*1000));
}




function equalize() {
    iteration += 1;
count = 0;
var updated = [];
if (temps.length < 2 && temps[0].length < 2) {
    clearInterval(intervalHandle);
}
for (var k =0; k < temps.length; k++) {
    updated.push([]);
    for (var i =0; i < temps[0].length; i++) {
        val = getSumOfSurrounding(i,k);
        val = temps[k][i] + c*(val[0] - val[1] * temps[k][i]);
        updated[k].push(val);
        count += equals(val, average);
    }
}








if (count == temps.length*temps[0].length) {
  clearInterval(intervalHandle);
}
temps = updated;
draw();
}




function start() {
    for (var x of temps) {
        average += sum(x);
    }
    average /= temps.length*temps[0].length;
    mouseIsDown = false;
    intervalHandle = setInterval(equalize, 1);
}
function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
}
function colorFromTemp(t) {
  t = t / maxTemp;
  if (t <= 0.25) {
    return `rgb(0,${255*t/0.25},255)`;
  }
  if (t <= 0.5) {
    return `rgb(0,255,${255-255*(t-0.25)/0.25})`;
  }
  if (t <= 0.75) {
    return `rgb(${255*(t-0.5)/0.25},255,0)`;
  }
  if (t <= 1) {
    return `rgb(255,${255-255*(t-0.75)/0.25},0)`;
  }
}
function draw() {
  context.fillStyle = "blue";
  context.fillRect(0,0,pixelSize, pixelSize);
  for (var i =0; i < partition; i++) {
    for (var k = 0; k < partition; k++) {
      context.fillStyle = colorFromTemp(temps[i][k]);
      var s = (pixelSize / partition);
      context.fillRect(k * s, i * s, s, s);
    }
  }
}
function addSpot(x,y) {
  var column = Math.floor(x/(pixelSize / partition));
  var row = Math.floor(y/(pixelSize / partition));
  for (var i =0; i < partition; i++) {
    for (var k = 0; k < partition; k++) {
      if (temps[i][k] < maxTemp-2) {
      temps[i][k] += tempConst / Math.pow(2, distance(k,i, column, row)); //c/2^d
    }
    }
  }
  draw();
}
canvas.addEventListener("mousemove", (event) =>{
    var ele = canvas.getBoundingClientRect();
    var x = event.x - ele.left;
    var y = event.y - ele.top;
   
    if (mouseIsDown) {
      addSpot(x,y);
    }
});
canvas.addEventListener("mousedown", (event) =>{
    mouseIsDown = true;
});
canvas.addEventListener("mouseup", (event) =>{
    mouseIsDown = false;
});

function reset() {
  clearInterval(intervalHandle);
  updatePartition();
}



function updatePartition() {
    var v = parseInt(document.getElementById("partitionInput").value);
    document.getElementById("partitionLabel").innerHTML = `Rows / Columns : ${v}`;
    partition = v;
    temps = [];
    for (var i = 0; i < partition; i++) {
        temps.push([]);
        for (var k = 0; k < partition; k++) {
            temps[i].push(0);
        }
    }
    draw();
}
updatePartition();
























