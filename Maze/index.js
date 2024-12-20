const print = console.log;
const canvas = document.getElementById("canvasElement");
const context = canvas.getContext("2d");

var pixelSize = 250;
var partition = 10;
var mouseIsDown = false;

canvas.width = pixelSize;
canvas.height = pixelSize;
context.fillStyle = "rgb(0, 0, 0)";
context.fillRect(0, 0, pixelSize, pixelSize);
var maze = [];
var emptyChar = false; // 0 = clear, 1 = wall
var wallChar = true;
var solved = false;

    function fill() {
      var i = 0;
      var currentVal = 0;
      var generation = [[maze.length-1, maze.length-1]];

      while (generation.length > 0) {
        i = 0;
        while (i < generation.length) {
          var [x,y] = generation[i];
          if (maze[y][x] == emptyChar && typeof(maze[y][x]) == "boolean") {
            maze[y][x] = currentVal;
            i += 1;
            continue;
          }
          generation.splice(i,1);
        }
        i = 0;
        var ol = generation.length;
        while (i < ol) {
          var [x,y] = generation[i];
          if (x > 0) {generation.push([x-1, y]);}
          if (y > 0) {generation.push([x, y-1]);}
          if (x < maze.length-1) {generation.push([x+1, y]);}
          if (y < maze.length-1) {generation.push([x, y+1]);}
          i += 1;
        }
        currentVal += 1;
      }
    }

function reset() {
    maze = [];
    for (var i = 0; i < partition; i++) {
        maze.push([]);
        for (var j = 0; j < partition; j++) {
            maze[i].push(emptyChar);
        }   
    }
    context.fillStyle = "black";
    context.fillRect(0, 0, pixelSize, pixelSize);
    solved = false;
    document.getElementById("statsLabel").innerHTML = `Maze Solvable in X moves`;
}

function modSpot(x, y) {
    var column = Math.floor(x / (pixelSize / partition));
    var row = Math.floor(y / (pixelSize / partition));
    if ((column != maze.length-1 || row != maze.length-1) && (column != 0 || row != 0)) {
    maze[row][column] = !maze[row][column];
    if (maze[row][column]) {
        context.fillStyle = "white";
    }
    else {
        context.fillStyle = "black"
    }
    var s = (pixelSize / partition);
    context.fillRect(column * s, row * s, s, s);
}
}

//interface functions
function solve() {
    solved = true;
    fill(); //number
    var x = 0;
    var y = 0;
    context.fillStyle = "blue";
    var s = (pixelSize / partition);
    context.fillRect(0, 0, s, s);
    if (maze[0][0] != false) {
        document.getElementById("statsLabel").innerHTML = `Maze Solvable in ${maze[0][0]} moves`;
    }
    else {
        document.getElementById("statsLabel").innerHTML = `Maze is not solvable!`;
        return;
    }
    while (x != maze.length - 1 || y != maze.length - 1) {
        var c = maze[y][x]; // current vla
        if (x < maze.length - 1 && typeof(maze[y][x+1]) != "boolean" && maze[y][x+1] < c) {
            x += 1;
        }
        else if (y < maze.length - 1 && typeof(maze[y+1][x]) != "boolean" && maze[y+1][x] < c) {
            y += 1;
        }
        else if (x > 0 && typeof(maze[y][x-1]) != "boolean" && maze[y][x-1] < c) {
            x -= 1;
        }
        else if (y > 0 && typeof(maze[y-1][x]) != "boolean" && maze[y-1][x] < c) {
            y -= 1;
        }
        context.fillRect(x * s, y * s, s, s);
    }
}

function updatePartition() {
    var v = parseInt(document.getElementById("partitionInput").value);
    document.getElementById("partitionLabel").innerHTML = `Rows / Columns : ${v}`;
    partition = v;
    temps = [];
    reset();
    
}

function updateDims() {
    pixelSize = parseInt(document.getElementById("dimensionInput").value);

    canvas.width = pixelSize;
    canvas.height = pixelSize;
    reset();
}
function resetPath() {
    context.fillStyle = "black";
    var s = (pixelSize / partition);
    for (var i = 0; i < partition; i++) {
        for (var j = 0; j < partition; j++) {
            if (typeof(maze[i][j])!="boolean") {
                maze[i][j] = emptyChar;
                context.fillRect(j * s, i * s, s, s);
            }
        }   
    }
    solved = false;
    document.getElementById("statsLabel").innerHTML = `Maze Solvable in X moves`;
}
//listeners
canvas.addEventListener("mousedown", (event) => {
    var ele = canvas.getBoundingClientRect();
    var x = event.x - ele.left;
    var y = event.y - ele.top;
    if (!solved) {
        modSpot(x, y);
    }
});

reset();