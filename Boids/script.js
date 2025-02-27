const svg = document.getElementById("svg");
svg.setAttribute("width", window.screen.width - 100);
var width = svg.getAttribute("width");
var height = svg.getAttribute("height");
var partsToSpawn = 10;
var radius = 10;
var speedFactor = 1;
var [PI, sin, cos, tan, pow, sqrt, round, random, abs] = [
    Math.PI,
    Math.sin,
    Math.cos,
    Math.tan,
    Math.pow,
    Math.sqrt,
    Math.round,
    Math.random,
    Math.abs,
];
var boids = []; // list of boid objects to itereate
var movementConstant = 0.1; //multiplied by velocity to prevent excessive movement
const k = 1; //constant for velocity modificiation;
const print = console.log;
var velocityConstant = 1/10;
class boid {
  constructor (position, angle = 0) {

    //initialize velocity & position for this boid
    this.px = position[0];
    this.py = position[1]; //the position is standard "pure" cartesian orienation, so it needs to be converted back to svg
    this.theta = angle;
    
    const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
    );

    circle.setAttribute("cx", this.px);
    circle.setAttribute("cy", height - this.py); //need to convert standard y cord to svg form
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", "black");

    this.c = circle;

    svg.appendChild(circle);
    boids.push(this); //add boid object so it can be iterated on
  }
  move() {
    //update positions from velocities
    var vx = cos(this.theta) * velocityConstant;
    var vy = sin(this.theta) * velocityConstant;
    this.px += speedFactor*vx;
    this.py += speedFactor*vy;

    //visibly move the svg component
    this.c.setAttribute("cx", this.px);
    this.c.setAttribute("cy", height - this.py);

  }
}


//functio to calculkate the center of mass / midpoint of all boids;
function centerOfMass() {
    var x = 0;
    var y = 0;
    for (b of boids) {
        x += b.px;
        y += b.py;
    }
    return [x/boids.length, y/boids.length];
}

//calculate the change to the velocity for avoiding other boids
function avoidanceVelocity(Boid) {
    var velx = 0;
    var vely = 0;
    //go through & calculate avoidance from all other boids
    for (b of boids) {
        if (b !== Boid) {
            velx += -1/(b.px-Boid.px);
            vely += -1/(b.py-Boid.py);
        }
    }
    return [velx, vely];
}

//calculate the average heading velocity
function averageHeading() {
    var vx = 0;
    var vy = 0;
    for (b of boids) {
        vx += b.vx;
        vy += b.vy;
    }
    return [vx/boids.length, vy/boids.length];
}

//function to calculate new velocities for boids based on the rules;
function angleUpdate() {
  const CM = centerOfMass();
  const avgHeading = averageHeading();
  var angleTable = new Array(boids.length);

    angleTable.fill(0);

    //avoid walls
    for (var i =0; i < angleTable.length; i++) {
        var a = boids[i].theta;
        var newa = 0;
        if (a < 0) {
            if (-1 * PI/2 < a) {
                newa += 1/(boids[i].py)
                newa -= 1/(width - boids[i].px)
            }
            if (a < -1 * PI/2) {
                newa -= 1/(boids[i].py);
                newa += 1/(boids[i].px);
            }
        }
        else if (0 < a) {
            if (PI/2 < a) {
                newa += 1/(boids[i].py)
                newa -= 1/(boids[i].px);
            }
            if (a < PI/2) {
                print("before " + newa)
                newa -= 1/(height - boids[i].py)
                newa += 1/(width - boids[i].px)
                print("after " + newa)
            }
        }
        angleTable[i] = newa;
    }
    for (var i =0; i < angleTable.length; i++) {
        boids[i].theta += angleTable[i];
    }
}
//main update function which changes velocities & positions of boids
function update() {
  angleUpdate();
  
  //move the boids
  for (b of boids) {
    b.move();
  }
}

//reset screen and boids
function clears() {
    boids = [];
    svg.innerHTML = "";
}
//spawn boids
function genBoids() {
    for (var i = 0; i < partsToSpawn; i++) {
        new boid([random()*width, random()*height], random());
    }
}
//input slidder for boid spawn number
document.getElementById("numInput").addEventListener("input", (event) => {
    partsToSpawn = parseInt(event.target.value);
    document.getElementById("numLabel").innerHTML = `(${partsToSpawn}) Particles to Spawn`;
});

//simulation speed factor
document.getElementById("simSpeedInput").addEventListener("input", (event) => {
    speedFactor = pow(10, parseInt(event.target.value));
    document.getElementById("simSpeedLabel").innerHTML = `Speed Factor : 10^${event.target.value}`;
});

//when user clicks svg, add the boid
svg.addEventListener("click", (event) => {
    const { clientX, clientY } = event;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const transformedPoint = point.matrixTransform(
        svg.getScreenCTM().inverse(),
    );
    transformedPoint.x = round(transformedPoint.x);
    transformedPoint.y = round(transformedPoint.y);
    new boid([transformedPoint.x, height-transformedPoint.y], random());
});

//infintely call update every millisecond
setInterval(update, 1);
