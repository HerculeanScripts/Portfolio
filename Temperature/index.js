const print = console.log;
const canvas = document.getElementById("canvasElement");
const context = canvas.getContext("2d");
const maxTemp = 100;

var c = 0.01; //constant = how fast it changes
var tempConst = 2; //how much is added per 1 cycle on a direct pixel.
var pixelSize = 250;
var average = 0;
var count = -1;
var iteration = 0;
var intervalHandle;
var temps = [];
var partition = 25;
var mouseIsDown = false;
var normalAdd = true;
var pixelAddSpan = 50;
var updateFreq = 1;
var mintemp = 0;
var maxtemp = 0;

canvas.width = pixelSize;
canvas.height = pixelSize;
context.fillStyle = "blue";
context.fillRect(0, 0, pixelSize, pixelSize);




//utility functions = helpers
function sum(arr) {
    s = 0;
    for (n of arr) {
        s += n;
    }
    return s;
}


function getSumOfSurrounding(x, y) {
    var s = 0;
    var surr = 8;
    s += (y > 0 && x > 0 && temps[y - 1][x - 1]);
    s += (y > 0 && temps[y - 1][x]);
    s += (y > 0 && x < temps[0].length - 1 && temps[y - 1][x + 1]);
    s += (x > 0 && temps[y][x - 1]);
    s += (x < temps[0].length - 1 && temps[y][x + 1]);
    s += (y < temps.length - 1 && x > 0 && temps[y + 1][x - 1]);
    s += (y < temps.length - 1 && temps[y + 1][x]);
    s += (y < temps.length - 1 && x < temps[0].length - 1 && temps[y + 1][x + 1]);

    (y > 0 && x > 0) || surr--;
    (y > 0) || surr--;
    (y > 0 && x < temps[0].length - 1) || surr--;
    (x > 0) || (surr--);
    (x < temps[0].length - 1) || (surr--);
    (y < temps.length - 1 && x > 0) || (surr--);
    (y < temps.length - 1) || (surr--);
    (y < temps.length - 1 && x < temps[0].length - 1) || (surr--);
    return [s, surr];
}


function equals(a, b) {
    var r = Math.round;
    return (r(a * 1000) == r(b * 1000));
}


function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
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
//main functions


function equalize() {
    iteration += 1;
    //count = 0;

    var updated = [];
    mintemp = 100;
    maxtemp =0;

    if (temps.length < 2 && temps[0].length < 2) {
        clearInterval(intervalHandle);
    }
    for (var k = 0; k < temps.length; k++) {
        updated.push([]);
        for (var i = 0; i < temps[0].length; i++) {
            val = getSumOfSurrounding(i, k);
            val = temps[k][i] + c * (val[0] - val[1] * temps[k][i]);
            updated[k].push(val);
            //count += equals(val, average);
            if (maxtemp < val) {
              maxtemp = val;
            }
            if (val < mintemp) {
              mintemp = val;
            }
        }
    }


    /*if (count == temps.length * temps[0].length) {
        clearInterval(intervalHandle);
        draw();
    }*/
    temps = updated;
    if (iteration % updateFreq == 0) {
        draw();
    }
}


function draw() {
    context.fillStyle = "blue";
    context.fillRect(0, 0, pixelSize, pixelSize);
    for (var i = 0; i < partition; i++) {
        for (var k = 0; k < partition; k++) {
            context.fillStyle = colorFromTemp(temps[i][k]);
            var s = (pixelSize / partition);
            context.fillRect(k * s, i * s, s, s);
        }
    }
}


function addSpot(x, y) {
    var column = Math.floor(x / (pixelSize / partition));
    var row = Math.floor(y / (pixelSize / partition));
    if (normalAdd) {
        for (var i = 0; i < partition; i++) {
            for (var k = 0; k < partition; k++) {
                if (temps[i][k] < maxTemp - 2) {
                  var n=tempConst / Math.pow(2, distance(k, i, column, row));
                    temps[i][k] += n; //c/2^d 
                    average += n/partition / partition;
                    maxtemp = Math.max(maxtemp, temps[i][k]);
                }
            }
        }
    } else {
        var totalCells = pixelAddSpan / (pixelSize / partition); // how many pixels to either side
        var a = Math.floor(totalCells / 2);
        for (var i = row - a; i < row + a; i++) {
            if (i < 0 || i > partition - 1) {
                continue;
            }
            for (var k = column - a; k < column + a; k++) {
                if (k < 0 || k > partition - 1) {
                    continue;
                }
                if (temps[i][k] < maxTemp - 2) {
                    if (distance(k, i, column, row) == 0) { // to avoid 1/0
                        temps[i][k] += tempConst;
                        average += tempConst/partition / partition;
                        maxtemp = Math.max(maxtemp, temps[i][k]);
                        continue;
                    }
                    else {
                      var n= Math.log(pixelAddSpan) * tempConst / distance(k, i, column, row);
                    average += n/partition / partition;
                    temps[i][k] += n; // Math.pow(2, distance(k,i, column, row));
                    maxtemp = Math.max(maxtemp, temps[i][k]);
                    }
                }
            }
        }

    }

    draw();
}

//interface functions


function start() {
    /*for (var x of temps) {
        average += sum(x);
    }
    average /= temps.length * temps[0].length;*/
    mouseIsDown = false;
    clearInterval(intervalHandle);
    iteration = 0;
    intervalHandle = setInterval(equalize, 1);
}


function reset() {
    clearInterval(intervalHandle);
    updatePartition();
    mintemp = 0;
    maxtemp = 0;
    average = 0;
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

function addModeChange() {
    normalAdd = !document.getElementById("addModeInput").checked;
    if (normalAdd) {
        document.getElementById("addModeLabel").innerHTML = "Adding mode : Normal Decay";
    } else {
        document.getElementById("addModeLabel").innerHTML = "Adding mode : Fast Add / Slow Decay";
    }
}

function updateDims() {
    pixelSize = parseInt(document.getElementById("dimensionInput").value);


    canvas.width = pixelSize;
    canvas.height = pixelSize;
    draw();
}

function updateDrawF() {
    updateFreq = parseInt(document.getElementById("changeUpdateInput").value);
    document.getElementById("updateLabel").innerHTML = `Update Screen Every X Cycle : ${updateFreq}`;

}

function updateTempAdd() {
    tempConst = parseInt(document.getElementById("tempAddInput").value);
    document.getElementById("tempAddLabel").innerHTML = `Temp Per Click : ${tempConst}`;

}

function updateChangeConstant() {
    c = parseFloat(document.getElementById("changeConstantInput").value);
    document.getElementById("changeConstantLabel").innerHTML = `Change constant : ${c}`;

}

function updateStats() {
  document.getElementById("statsLabel").innerHTML =  `Average : ${Math.round(average*10000)/10000}; Min : ${Math.round(mintemp*10000)/10000}; Max : ${Math.round(maxtemp*10000)/10000};`;
}

//listeners
canvas.addEventListener("mousemove", (event) => {
    var ele = canvas.getBoundingClientRect();
    var x = event.x - ele.left;
    var y = event.y - ele.top;

    if (mouseIsDown) {
        addSpot(x, y);
    }
});


canvas.addEventListener("mousedown", (event) => {
    mouseIsDown = true;
});


canvas.addEventListener("mouseup", (event) => {
    mouseIsDown = false;
});

updatePartition();
setInterval(updateStats, 1);