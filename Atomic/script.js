const svg = document.getElementById("svg");
var particles = [];
var fieldConsant = 1;
var maxVel = 1;
var partsToSpawn = 10;
var currentCharge = 1;
var collisions = false;
var scaling = 1;
var translationx = 0;
var translationy = 0;
var randvel = false;
var bounded = false;
var dt = 1;
svg.setAttribute("width", window.screen.width - 100);
var width = svg.getAttribute("width");
var height = svg.getAttribute("height")
const chargeColors = ["blue", "gray", "red"];
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
class particle {
    constructor(startingPos) {
        this.x = startingPos[0];
        this.y = startingPos[1];
        this.charge = currentCharge;
            const circle = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle",
            );
            
            circle.setAttribute("cx", this.x);
            circle.setAttribute("cy", this.y);
            circle.setAttribute("r", 5);
            circle.setAttribute("fill", chargeColors[currentCharge+1]);
            this.c = circle;
            this.velx = 0;
            this.vely = 0;
            if (randvel) {
                this.velx = random() * (random() < 0.5 && 1 || -1);
                this.vely = random() * (random() < 0.5 && 1 || -1);
            }
            svg.appendChild(circle);
            particles.push(this);
    }
    move() {
        this.x += dt*this.velx;
        this.y -= dt*this.vely;
        var [x,y] = scale([this.x, this.y]);
        this.c.setAttribute("cx", x);
        this.c.setAttribute("cy", y);
        this.c.setAttribute("r", Math.max(5 * scaling, 0.6));
    }
}
function genParticles() {
    for (var i = 0; i < partsToSpawn; i++) {
        currentCharge = random() < 0.5 && 1 || -1;
        new particle(reverseScale([random()*width, random()*height]));
    }
}
function clears() {
    particles = [];
    svg.innerHTML = "";
}
function dist(b1, b2) {
    return sqrt(pow(b1.x - b2.x, 2) + pow(b1.y - b2.y, 2));
}
function magnitude(vx,vy) {
    return sqrt(pow(vx,2) + pow(vy,2));
}
function calcAttraction(o1, o2) {
    var x = dist(o1, o2);
    const maxAttraction = -1*fieldConsant * o1.charge * o2.charge / pow(10,2);
    if (x < 10 && x > 9.5) {
    combine(o1, o2);
    }
   if (x <= 10) {
        return (x-8) * fieldConsant;
   }    
    return -1*fieldConsant * o1.charge * o2.charge / pow(10,2);//return Math.min(Math.max(-1*fieldConsant * o1.charge * o2.charge / pow(10,2), maxAttraction), maxAttraction);
}
function combine(o1, o2) {
    var [x1,x2,y1,y2, vx1, vx2, vy1, vy2] = [o1.x, o2.x, o1.y, o2.y, o1.velx, o2.velx, o1.vely, o2.vely];
    o1.velx = (vx1 + vx2) / 2;
    o2.velx = (vx1 + vx2) / 2;
    o1.vely = (vy1 + vy2) / 2;
    o2.vely = (vy1 + vy2) / 2;
}
function velMod(target) {
    var ty = 500 - target.y;
    for (b of particles) {
        if (b !== target ){//&& dist(target, b) < 100) {
            var by = 500 - b.y;
            var angle = abs(Math.atan((target.y - b.y) / (target.x - b.x)));
            if (by > ty && b.x < target.x) {
                angle = PI - angle;
            } else if (by < ty && b.x < target.x) {
                angle += PI;
            } else if (by < ty && b.x > target.x) {
                angle = 2 * PI - angle;
            } else if (ty == by && target.x > b.x) {
                angle = PI;
            } else if (ty < by && b.x == target.x) {
                angle = PI / 2;
            } else if (ty > by && b.x == target.x) {
                angle = (3 * PI) / 2;
            }
            if (dist(target, b) < 10 && collisions) {
                combine(target,b);
                break;
            }
            var force = dt*calcAttraction(b, target);
            target.vely += sin(angle) * force;
            target.velx += cos(angle) * force;
        }
    }
}
function update() {
    for (b of particles) {
        velMod(b);
    }
    for (b of particles) {
        b.move();
    }
}
function boundedToggle() {
    bounded = !bounded;
    document.getElementById("boundedButton").innerHTML = `Bounded : ${bounded}`;
}
function toggleCollisions() {
    collisions = !collisions;
    document.getElementById("collideButton").innerHTML = `Collisions Enabled : ${collisions}`;
}
function randVel() {
    randvel = !randvel;
    document.getElementById("randvelButton").innerHTML = `Random Velocity : ${randvel}`;
}
function scale(actualPoint) {
    return [scaling * actualPoint[0] + translationx, scaling * actualPoint[1] + translationy];
}
function reverseScale(scaledPoint) {
    return [(scaledPoint[0] - translationx) / scaling, (scaledPoint[1] - translationy) / scaling];
}
document.getElementById("numInput").addEventListener("input", (event) => {
    partsToSpawn = parseInt(event.target.value);
    document.getElementById("numLabel").innerHTML = `(${partsToSpawn}) Objects to Spawn`;
});
document.getElementById("fieldInput").addEventListener("input", (event) => {
    fieldConsant = parseFloat(event.target.value);
    document.getElementById("fieldLabel").innerHTML = `
    Field Constant ${event.target.value}`;
});
document.getElementById("chargeInput").addEventListener("input", (event) => {
    currentCharge = parseFloat(event.target.value);
    document.getElementById("chargeLabel").innerHTML = `Charge to Spawn: (${currentCharge}})`;
});
document.getElementById("simInput").addEventListener("input", (event) => {
    dt = pow(10, parseFloat(event.target.value));
    document.getElementById("simLabel").innerHTML = `Simulation Speed Factor : (10^${event.target.value})`;
});
svg.addEventListener("mousemove", (event) => {
    document.body.style.setProperty('overflow', 'hidden');
});
svg.addEventListener("mouseout", (event) => {
    document.body.style.setProperty('overflow', 'visible');
});
svg.addEventListener('wheel', function(event) {
    const { clientX, clientY } = event;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const transformedPoint = point.matrixTransform(
        svg.getScreenCTM().inverse(),
    );
    var out = false;
    if (event.deltaY < 0) {
        out = true;
    }
    scaling *= out && 2 || 0.5;
    translationx = (out && 2 || 0.5) * translationx - ((out && 2 || 0.5)-1)*transformedPoint.x;
    translationy = (out && 2 || 0.5) * translationy - ((out && 2 || 0.5)-1)*transformedPoint.y;
});
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
    new particle(reverseScale([transformedPoint.x, transformedPoint.y]));
});
setInterval(update, 1);
