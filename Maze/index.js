const print = console.log;
const canvas = document.getElementById("canvasElement");
const context = canvas.getContext("2d");
const delay = ms => new Promise(res => setTimeout(res, ms));
var pixelSize = 250;
var partition = 10;
var mouseIsDown = false;
var genSpeed = 100;
canvas.width = pixelSize;
canvas.height = pixelSize;
context.fillStyle = "rgb(0, 0, 0)";
context.fillRect(0, 0, pixelSize, pixelSize);
var maze = [];
var emptyChar = false; // 0 = clear, 1 = wall
var wallChar = true;
var solved = false;
var s = (pixelSize / partition);
var gening = false;

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
    clearInterval(genInterval);
    gening = false;
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
    context.fillRect(column * s, row * s, s, s);
}
}
//interface functions
function solve() {
    if (!gening) {
        solved = true;
        fill(); //number
        var x = 0;
        var y = 0;
        context.fillStyle = "blue";
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
}
















function mG(x,y) {
    var value = -1;
    try {
      value=maze[y][x];
    }
    catch (err) {
    value = value;
    }
    if (value === undefined) {value = -1}
    return value;
    } // gets maze at loc or -1

function draw() {
    for (var i = 0; i < partition; i++) {
        for (var j = 0; j < partition; j++) {
            if (maze[i][j] == emptyChar) {
                context.fillStyle = "black";
            }
            else {
                context.fillStyle = "white";
            }
            context.fillRect(j * s, i * s, s, s);
        }  
    }
}
var done = false;
var x = 0;
var y = 0;
var genInterval;
function gen() {
    if (!done) {
        var points = [];
        var dx = x;
        var dy = y;
        if (x < maze.length - 2 && maze[y][x + 2] == wallChar) {
            points.push([x + 2, y]);
        }
        if (y < maze.length - 2 && maze[y + 2][x] == wallChar) {
            points.push([x, y + 2]);
        }
        if (x > 1 && maze[y][x - 2] == wallChar) {
            points.push([x - 2, y]);
        }
        if (y > 1 && maze[y - 2][x] == wallChar) {
            points.push([x, y - 2]);
        }
        for (var pair of points) {
            if (pair[0] == maze.length - 1 && pair[1] == maze.length - 1) {
                points = [pair];
                break;
            }
        }
        if (points.length == 0) {
            //print(maze);
            loop: for (var i = 0; i < maze.length; i++) {
                for (var j = 0; j < maze.length; j++) {
                    var vPoints = [];
                    if (maze[i][j] == wallChar) { //wallChar == true
                        if (mG(j + 1, i) && mG(j - 1, i) && mG(j, i + 1) && mG(j, i - 1)) { //walls surrounding
                            //print("past first chec point");
                            if (mG(j + 2, i) == false) {
                                vPoints.push([i, j + 2]);
                            }
                            if (mG(j - 2, i) == false) {
                                vPoints.push([i, j - 2]);
                            }
                            if (mG(j, i + 2) == false) {
                                vPoints.push([i + 2, j]);
                            }
                            if (mG(j, i - 2) == false) {
                                vPoints.push([i - 2, j]);
                            }
                            //print("the 2nd cells that were blanc ", vPoints);
                            if (vPoints.length > 0) {
                                x = j;
                                y = i;
                                var index = parseInt(Math.random() * vPoints.length);
                                var [b, a] = vPoints[index];
                                context.fillRect(x*s, y*s, s,s);
                                maze[y][x] = emptyChar;
                                dx = a - x;
                                dy = b - y;
                                var ix = x + dx / 2;
                                var iy = y + dy / 2;
                                /*print("calcs yielded : ")
                                print("x,y at start cell = ", x, y);
                                print("new cell to carve to ", a,b);
                                print("intermeiate cell to carve ", ix,iy);*/ //debugging
                                context.fillRect(ix*s, iy*s, s,s);
                                maze[iy][ix] = emptyChar;
                                break loop;
                            }
                        }
                    }
                    if (i == j && j == maze.length - 1) {
                        done = true;
                    }
                }
            }
        }
        else {
            var index = parseInt(Math.random() * points.length);
            [x, y] = points[index];
            context.fillRect(x*s, y*s, s,s);
            maze[y][x] = emptyChar;
            dx = x - dx;
            dy = y - dy;
            var ix = x - dx / 2;
            var iy = y - dy / 2;
            context.fillRect(ix*s, iy*s, s,s);
            maze[iy][ix] = emptyChar;
        }
    } else {
        clearInterval(genInterval);
        //context.fillStyle = "black";
        if (maze[maze.length - 1][maze.length - 1]) {
            maze[maze.length - 1][maze.length - 1] = emptyChar;
            //print("out");
            //context.fillRect(maze.length-1*s, maze.length-1*s, s,s);
            if (Math.random() > 0.5) {
                maze[maze.length - 1][maze.length - 2] = emptyChar;
                //context.fillRect(maze.length-2*s, maze.length-1*s, s,s);
            } else {
                maze[maze.length - 2][maze.length - 1] = emptyChar;
                //context.fillRect(maze.length-1*s, maze.length-2*s, s,s);
            }
        }
        draw();
        gening  =false;
    }
}


function generate() {
  reset();
  x = 0;
  y = 0;
  gening = true;
  context.fillStyle = "white";
    for (var i = 0; i < partition; i++) {
        for (var j = 0; j < partition; j++) {
            maze[i][j] = wallChar;
            context.fillRect(j * s, i * s, s, s);
        }  
    }
    maze[0][0] = emptyChar;
    context.fillStyle = "black";
    context.fillRect(0, 0, s, s);
    done = false;
   genInterval = setInterval(gen,genSpeed);
}
function updatePartition() {
    var v = parseInt(document.getElementById("partitionInput").value);
    document.getElementById("partitionLabel").innerHTML = `Rows / Columns : ${v}`;
    partition = v;
    temps = [];
    s = (pixelSize / partition);
    reset();
   
}
function updateDims() {
    pixelSize = parseInt(document.getElementById("dimensionInput").value);
    canvas.width = pixelSize;
    canvas.height = pixelSize;
    s = (pixelSize / partition);
    reset();
}
function updateWait() {
    genSpeed = parseInt(document.getElementById("speedInput").value);
}
function resetPath() {
    context.fillStyle = "black";
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
    if (!solved && !gening) {
        modSpot(x, y);
    }
});
