const canvaScreen = document.getElementById("canvasElement");
const context = canvaScreen.getContext("2d");
var width = window.innerWidth;
var height = window.innerHeight;
canvaScreen.width = width;
canvaScreen.height = height;
var generationSpeed = 1000;
var generationInterval = null;
var cells = [];
var numberRows = 100;
var numberColumns = 100;
var filler = "black";
function init() {
    clearInterval(generationInterval);
    generationInterval = setInterval(generation, generationSpeed);
}
function generation() {
    for (var x = 0; x < numberRows; x++) {
        for (var i = 0; i < numberColumns; i++) {
            const numNeighbor = getNumberOfAliveNeighbors(x,i);
            if (numNeighbor < 2 || 3 < numNeighbor) {
                cells[x][i][1] = false;
            }
            if (numNeighbor == 3 || numNeighbor == 2 && cells[x][i][0]) {
                cells[x][i][1] = true;
            }
        }
    }
    for (var x = 0; x < numberRows; x++) {
        for (var i = 0; i < numberColumns; i++) {
            cells[x][i][0] = cells[x][i][1];
            if (cells[x][i][0]) {
                filler = "white";
            }
            else {
                filler = "black"
            }
            context.fillStyle = filler;
            context.fillRect(i*(width/numberColumns), x*(height/numberRows), width/numberColumns, height/numberRows);
        }
    }
}

function getNumberOfAliveNeighbors(row, column) {
    var c = 0;
    c += 0 < column && 0 < row ? +cells[row-1][column-1][0] : 0;
    c += 0 < row ? +cells[row-1][column][0] : 0;
    c += column < numberColumns - 1 && 0 < row ? +cells[row-1][column+1][0] : 0;
    c += 0 < column ? +cells[row][column-1][0] : 0;
    c += column < numberColumns -1 ? +cells[row][column+1][0] : 0;
    c += 0 < column && row < numberRows - 1 ? +cells[row+1][column-1][0] : 0;
    c += row < numberRows - 1 ? +cells[row+1][column][0] : 0;
    c += column < numberColumns-1 && row < numberRows - 1 ? +cells[row+1][column+1][0] : 0;
    return c;
}
function reset() {
    cells = [];
    for (var x = 0; x < numberRows; x++) {
        cells.push([]);
        for (var i = 0; i < numberColumns; i++) {
            cells[cells.length-1].push([false, false]);
        }
    }
    clearInterval(generationInterval);
    filler = "black";
    context.fillStyle = filler;
    context.fillRect(0, 0, width, height);
}
function getCellFromCord(x,y) {
    return [Math.floor(y/(height/numberRows)),Math.floor(x/(width/numberColumns))];
}

document.getElementById("genInput").addEventListener("input", (event) => {
generationSpeed = Math.pow(10,parseFloat(event.target.value));
clearInterval(generationInterval);
generationInterval = setInterval(generation, generationSpeed);
});

canvaScreen.addEventListener("click", (event) => {
    const rect = canvaScreen.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    var [i,j] = getCellFromCord(x,y);
    cells[i][j][0] = !cells[i][j][0];
    if (cells[i][j][0]) {
        filler = "white";
    }
    else {
        filler = "black";
    }
    context.fillStyle = filler;
    context.fillRect(j*(width/numberColumns), i*(height/numberRows), width/numberColumns, height/numberRows);

});
    
reset();