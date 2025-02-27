const canvas =document.getElementById("canvasElement");
const context =canvas.getContext("2d");
const print = console.log;
var pixelSize = 1000;
canvas.width = pixelSize;
canvas.height = pixelSize;
context.fillStyle = "gray";
context.fillRect(0, 0, pixelSize, pixelSize);
var partitions=100;
var previous = [];
var current = [];
var future = [];
var speed = 1;
var cellSize = pixelSize/partitions;
var timeStep = Math.sqrt(0.5*cellSize*cellSize/speed/speed);
var int = null;
var addingWall = false;
var tiemConstant = 10;
var wallSquare = new Set();
function generateDefaultGrids() {
    previous = [];
    current = [];
    future = [];
    for (var i=0;i<partitions;i++) {
        previous.push([]);
        current.push([]);
        future.push([]);
        for (var j = 0; j < partitions;j++) {
            previous[i].push(0);
            current[i].push(0);
            future[i].push(0);
        }
    }
}
function copy(arr) {
    var fin = [];
    for (var v of arr) {
        if (typeof(v) == "object") {
            fin.push(copy(v));
        }
        else {fin.push(v);}
    }
    return fin;
}
function getPlace(x,y) {
    if (x < 0 || y < 0 || y >= partitions || x >= partitions) {
        return 0;
    }
    if (wallSquare.has(`${y},${x}`)) {
        return 0;
    }
    return current[x][y];
}
function updaste() {
    var a = speed*speed*timeStep*timeStep/(pixelSize/partitions)/(pixelSize/partitions);
    for (var i=0;i<partitions;i++) {
        for (var j = 0; j < partitions;j++) {
            var sum = getPlace(i-1, j) + getPlace(i+1, j) + getPlace(i, j-1) + getPlace(i, j+1) - 4*getPlace(i, j);
            future[i][j] = 2*current[i][j]-previous[i][j]+a*(sum);
        }
    }
    previous = copy(current);
    current =copy(future);
    display();
}
function colorize(amplitude) {
    var val = 1/(1+Math.pow(Math.E, -1*amplitude))*255;
    return `rgb(${val}, ${val}, ${val})`;
}
function display() {
    for (var i=0;i<partitions;i++) {
        for (var j = 0; j < partitions;j++) {
            context.fillStyle = colorize(current[i][j]);
            if (wallSquare.has(`${j},${i}`)) {
                context.fillStyle = "blue";
            }
            context.fillRect(j*cellSize, i*cellSize, cellSize, cellSize);
        }
    }
}
function start() {
    clearInterval(int);
    int = setInterval(updaste,timeStep*tiemConstant);
}
function addMode() {
    addingWall = !addingWall;
    if (addingWall) {
        document.getElementById("wallBtn").innerHTML = "Adding : wall";
    }
    else{
        document.getElementById("wallBtn").innerHTML = "Adding : amplitude";
    }
}
function changePartition () {
    partitions = parseInt(document.getElementById("partitionInput").value);
    document.getElementById("partitionLabel").innerHTML = `Partitions : ${partitions}`;
    cellSize = pixelSize/partitions;
    timeStep = Math.sqrt(0.5*cellSize*cellSize/speed/speed);
    reset();
}
function addSpot(x,y) {
    var key =`${Math.floor(x/cellSize)},${Math.floor(y/cellSize)}`;
    if (!addingWall) {
        current[Math.floor(y/cellSize)][Math.floor(x/cellSize)] +=1;
        current[Math.floor(y/cellSize)][Math.floor(x/cellSize)] = Math.min(current[Math.floor(y/cellSize)][Math.floor(x/cellSize)],5);
        if (wallSquare.has(key)) {
            wallSquare.delete(key);
        }
    }
    else {
        wallSquare.add(key);
        current[Math.floor(y/cellSize)][Math.floor(x/cellSize)] =0;
    }
    display();
}
function reset() {
    clearInterval(int);
    generateDefaultGrids();
    wallSquare.clear();
    display();
}
var mouseIsDown = false;
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
reset();