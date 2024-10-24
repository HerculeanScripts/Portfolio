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
var bounded = false;
var boundingBox = [];
const radius = 5;
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
            circle.setAttribute("r", radius);
            circle.setAttribute("fill", chargeColors[currentCharge+1]);

            this.c = circle;
            const c = document.createElementNS(svgns, "circle");
            c.setAttribute("cx",  this.x);
            c.setAttribute("cy",  this.y);
            c.setAttribute("r", 150);
            var halo = createHalo(c,chargeColors[currentCharge+1]);
            this.grad = halo[0];
            this.gradId = halo[1];
            this.velx = 0;  
            this.vely = 0;
            this.charge = currentCharge;

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
        this.grad.setAttribute("cx", x);
        this.grad.setAttribute("cy", y);
        modifyHalo(this.gradId, chargeColors[this.charge+1], 1/3*scaling/(scaling*scaling));
        this.grad.setAttribute("r",250*scaling*scaling*fieldConsant);
    }
}
const svgns = "http://www.w3.org/2000/svg";

function createHalo(circle, color) {
    const gradientId = `haloGradient${Date.now()}`;

    // Create the radial gradient element
    const radialGradient = document.createElementNS(svgns, "radialGradient");
    radialGradient.setAttribute("id", gradientId);
    radialGradient.setAttribute("cx", "50%");
    radialGradient.setAttribute("cy", "50%");
    radialGradient.setAttribute("r", "50%");
    radialGradient.setAttribute("fx", "50%");
    radialGradient.setAttribute("fy", "50%");

    // Create gradient stops
    const stop1 = document.createElementNS(svgns, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("style", `stop-color:${chargeColors[currentCharge+1]}; stop-opacity:0.3`);

    const stop2 = document.createElementNS(svgns, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("style", `stop-color:${chargeColors[currentCharge+1]}; stop-opacity:0`);

    radialGradient.appendChild(stop1);
    radialGradient.appendChild(stop2);

    // Append the gradient to the defs section
    const defs = document.createElementNS(svgns, "defs");
    defs.appendChild(radialGradient);
    svg.appendChild(defs);

    // Create the halo circle
    const halo = document.createElementNS(svgns, "circle");
    halo.setAttribute("cx", circle.getAttribute("cx"));
    halo.setAttribute("cy", circle.getAttribute("cy"));
    halo.setAttribute("r", "150");
    halo.setAttribute("fill", `url(#${gradientId})`);

    // Append the halo to the SVG
    svg.appendChild(halo);

    return [halo, gradientId];
}

function modifyHalo(gradientId, newColor, newOpacity) {
    // Select the radial gradient by its ID
    const radialGradient = document.getElementById(gradientId);

    if (radialGradient) {
        // Modify the first stop (center color)
        const stop1 = radialGradient.children[0];
        stop1.setAttribute("style", `stop-color:${newColor}; stop-opacity:${newOpacity}`);

        // Modify the second stop (edge color)
        const stop2 = radialGradient.children[1];
        stop2.setAttribute("style", `stop-color:${newColor}; stop-opacity:0`);
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
const n = radius * 2 * 0.8;
function nuclearForce(o1, o2) {
    var d = dist(o1, o2);
    const a = 6/10;
    const b = 20/10;
    const c = 80/10;
    return a * pow(Math.E, -1 * b * (d-c))*(b * (d-c)-1);
}
function calcAttraction(o1, o2) {
    var x = dist(o1, o2);
    return -1*fieldConsant * o1.charge * o2.charge / pow(x,2) + nuclearForce(o1, o2);//, 2*fieldConsant  / pow(radius*2,2);//0.99*Math.max(-2*fieldConsant / pow(radius*2,2), Math.min(-1*fieldConsant * o1.charge * o2.charge / pow(x,2) + nuclearForce(o1, o2), 2*fieldConsant  / pow(radius*2,2)));
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
        if (b !== target ){
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
            var force = 0.9*dt*calcAttraction(b, target);
            target.vely += sin(angle) * force;
            target.velx += cos(angle) * force;
            if (bounded) {
                console.log(boundingBox);
                if (target.x < 0) {
                    target.x = 0;
                    target.velx *= -1;
                }
                if (boundingBox[0] < target.x) {
                    target.x = boundingBox[0];
                    target.velx *= -1;
                }
                if (boundingBox[1] < target.y) {
                    target.y = boundingBox[1];
                    target.vely *= -1;
                }
                if (target.y < 0) {
                    target.y = 0;
                    target.vely *= -1;
                }
            }
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
    document.getElementById("bb").innerHTML = `Bounded : ${bounded}`;
    if (bounded) {
        boundingBox = [...reverseScale([width, height])];
    }
}
function toggleCollisions() {
    collisions = !collisions;
    document.getElementById("collideButton").innerHTML = `Collisions Enabled : ${collisions}`;
}
function reCenter() {
    scaling = 1;
    translationx = 0;
    translationy = 0;
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
