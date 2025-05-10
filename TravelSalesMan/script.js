const svg = document.getElementById('svgArea');
var going = false;
var start = true;
var generationPassed = 0;
var shortpath = 10000000000;
var nodes = [];
var connections = {};
var ants = [];
var bestPath = [];
var antsPerGen = 10;
var graphics = true;
var graphicAny = true;
function reset() {
  svg.innerHTML = "";
  bestPath = [];
going = false;
start = true;
connections = [];
ants = [];
shortpath = 10000000000000;
generationPassed = 0;
document.getElementById("display").innerHTML = `Shortest Path ${shortpath}; Generation: ${generationPassed}`;
document.getElementById("instructions").innerHTML = "Right Click to Start";
nodes = [];
}
function draw() {
  for (var i = 0; i < nodes.length; i++) {
    const newCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    newCircle.setAttribute('cx', nodes[i][0]);
    newCircle.setAttribute('cy', nodes[i][1]);
    newCircle.setAttribute('fill', "blue");
    newCircle.setAttribute('r', 5);
    if (i == 0) {
      newCircle.setAttribute('fill', 'green');
    }
    else if (i== nodes.length-1) {
      newCircle.setAttribute('fill', 'red');
    }
    svg.appendChild(newCircle);
  }
  var pathstring = "M";
  for (i = 0; i < bestPath.length; i++) {
    pathstring += " " + bestPath[i][0].toString();
    pathstring += " " + bestPath[i][1].toString();
    pathstring += " L"
  }
  pathstring = pathstring.substring(0, pathstring.length-2);
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
path.setAttribute('d', pathstring);
path.setAttribute('stroke', 'black');
path.setAttribute('stroke-width', '2');
path.setAttribute('fill', 'none');
svg.appendChild(path);
if (graphics) {
  for (outer in connections) {
    for (inner in connections[outer]) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      var [x1, y1] = (outer.split(",")).map((a) => parseInt(a, 10));
      var [x2, y2] = (inner.split(",")).map((a) => parseInt(a, 10));
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("stroke", "orange");
      line.setAttribute("opacity", 0.2);
      line.setAttribute("stroke-width", Math.log(connections[outer][inner]));
      connections[outer][inner] = Math.max(connections[outer][inner]-0.25, 0);
      svg.appendChild(line);
    }
  }
}
}
function graphicToggle() {
  graphics = !graphics;
}
function auto() {
  if (going) {
    generation()
    setTimeout(auto, 25*Math.log10(antsPerGen*nodes.length*(graphics && 1000 || 1)));
  }
}
function best() {
graphicAny = false;
graphics = false;
for (var i = 0; i < 299; i++) {
generation();
}
graphicAny = true;
generation();

}
function generation() {
  antsPerGen = Math.max(document.getElementById("antsPerGenInput").value || 0,10);
  for (var i = 0; i < antsPerGen; i++) {
    var nodesTemp = nodes.slice(1,nodes.length-1) //inclusive,exclusive
    var picked = [nodes[0]];
    var originalLen = nodesTemp.length
    console.log(nodesTemp);
    for (var j = 0; j < originalLen; j++) {
      console.log(picked[picked.length-1]);
      var next = pickNextNode(nodesTemp, picked[picked.length-1])
      console.log(next);
      picked.push(next);
      nodesTemp.splice(nodesTemp.indexOf(next), 1);
    }
    picked.push(nodes[nodes.length-1]);
    ants.push(picked);
  }
  ants.sort((a,b) => calcTotalDistance(a) - calcTotalDistance(b));
  for (var x = 0; x < Math.max(Math.round(0.1*antsPerGen), 2); x++) {
    for (var i = 0; i < ants[x].length-1; i++) {
      var index=ants[x][i].toString();
      if (!connections[index][ants[x][i+1].toString()]) {
        connections[index][ants[x][i+1].toString()] = 1;
      }
      connections[index][ants[x][i+1].toString()]++;
      if (!connections[ants[x][i+1].toString()][index]) {
        connections[ants[x][i+1].toString()][index] = 1;
      }
      connections[ants[x][i+1].toString()][index]++;
    }
  }
  if (calcTotalDistance(ants[0]) < shortpath) {
    shortpath = calcTotalDistance(ants[0]);
    bestPath = ants[0];
  }
  generationPassed++;
  document.getElementById("display").innerHTML = `Shortest Path ${shortpath}; Generation: ${generationPassed}`;
  ants = [];
  if (graphicAny) {
  svg.innerHTML = "";
  draw();
  }
}
function calcTotalDistance(path) {
  var sum = 0;
  for (var x = 1; x < path.length; x++) {
    sum += distance(path[x], path[x-1]);
  }
  return sum;
}
function populate(val, times) {
  var arr = [];
  for (var x = 0; x < times; x++) {
    arr.push(val);
  }
  return arr
}

function pickNextNode(available, current) {
  console.log(current);
  var nodeProbs = populate(1, available.length);
  for (var i = 0; i < available.length; i++) {
    if (connections[current.toString()][available[i].toString()]){
      nodeProbs[i]=connections[current.toString()][available[i].toString()];
    }
  }
  for (var i = 0; i < available.length; i++) {
    nodeProbs[i] += (100/(distance(available[i], current)));
  }
  var s = nodeProbs.reduce((a,b) => a + b)
  for (var i = 0; i < available.length; i++) {
    nodeProbs[i] = nodeProbs[i]/s;
  }
  for (var i = 1; i < available.length; i++) {
    nodeProbs[i] = nodeProbs[i-1] + nodeProbs[i];
  }
  var rchoose = Math.random();
  for (var i = 0; i < available.length; i++) {
    if (nodeProbs[i] >= rchoose) {
      return available[i];
    }
  }
}
function distance(p1, p2) {
return Math.sqrt(Math.pow((p1[0]-p2[0]), 2) + Math.pow((p1[1]-p2[1]), 2))
}
  svg.addEventListener("contextmenu", (event) => {
  if (!going) {
  const { clientX, clientY } = event;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const transformedPoint = point.matrixTransform(svg.getScreenCTM().inverse());
  const newCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  transformedPoint.x = Math.round(transformedPoint.x)
  transformedPoint.y = Math.round(transformedPoint.y)
  newCircle.setAttribute('cx', transformedPoint.x);
  newCircle.setAttribute('cy', transformedPoint.y);
  newCircle.setAttribute('fill', "blue");
  newCircle.setAttribute('r', 5);
    if (!nodes.includes([transformedPoint.x, transformedPoint.y])){
  nodes.push([transformedPoint.x, transformedPoint.y]);
}
  if (!start) {
    going = true;
    document.getElementById("instructions").innerHTML = "Click Generation Button";
    for (var i = 0; i < nodes.length; i++) {
      connections[nodes[i].toString()] = {};
    }
    newCircle.setAttribute('fill', "red");
  }
  else {
    document.getElementById("instructions").innerHTML = "Normal Click to Add Nodes";
    newCircle.setAttribute('fill', "green");
  }
  start=!start;
  event.preventDefault();
  svg.appendChild(newCircle);
}
});
svg.addEventListener('click', (event) => {
  if (!going && !start) {
  const { clientX, clientY } = event;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const transformedPoint = point.matrixTransform(svg.getScreenCTM().inverse());
  const newCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  transformedPoint.x = Math.round(transformedPoint.x)
  transformedPoint.y = Math.round(transformedPoint.y)
  newCircle.setAttribute('cx', transformedPoint.x);
  newCircle.setAttribute('cy', transformedPoint.y);
  newCircle.setAttribute('fill', "blue");
  newCircle.setAttribute('r', 5);
  svg.appendChild(newCircle);
  if (!nodes.includes([transformedPoint.x, transformedPoint.y])){
    nodes.push([transformedPoint.x, transformedPoint.y]);
  }
}
});