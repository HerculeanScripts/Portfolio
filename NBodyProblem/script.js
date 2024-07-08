const svg = document.getElementById("svg");
var gravObjs = [];
var gravitationalConstant = Math.pow(10, -4);
var maxVel = 1;
var currentMass = 10;
var partsToSpawn = 10;
svg.setAttribute("width", window.screen.width - 100);
var width = svg.getAttribute("width");
var height = svg.getAttribute("height");
var collisions = false;
var scaling = 1;
var translationx = 0;
var translationy = 0;
var fixedRadius = 6;
var blackHoleMassLimit = 3000000;
var randvel = false;
var radiusToggle = false;
var dt = 1;
//var translationMatrix = [];
const colors = ["blue", "green", "yellow", "orange", "red"];
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
class gravObj {
    constructor(startingPos, startingvel = false, startingMass = false, blackHole = false) {
        this.x = startingPos[0];
        this.y = startingPos[1];
        this.mass = currentMass;
            const circle = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle",
            );
            circle.setAttribute("cx", this.x);
            circle.setAttribute("cy", this.y);
    
            circle.setAttribute("fill", colors[Math.floor(4 * random())]);
            this.c = circle;
            this.velx = 0;
            this.vely = 0;
            if (randvel) {
                this.velx = random() * (random() < 0.5 && 1 || -1) / Math.log10(currentMass) / 2;
                this.vely = random() * (random() < 0.5 && 1 || -1) / Math.log10(currentMass) / 2;
            }
            if (startingvel) {
                this.velx = startingvel[0];
                this.vely = startingvel[1];
            }
            if (startingMass) {
                this.mass = startingMass;
            }
            this.radius = pow(this.mass, 1/4);
            if (this.mass > blackHoleMassLimit) {
                circle.setAttribute("fill", "black");
                this.radius = pow(this.mass / 1000000, 1/2);
            }
            if (radiusToggle) {
                this.radius = fixedRadius;
            }
            circle.setAttribute("r", this.radius);
            svg.appendChild(circle);
            gravObjs.push(this);
    }
    move() {
        this.x += dt*this.velx;
        this.y -= dt*this.vely;
        var [x,y] = scale([this.x, this.y]);
        this.c.setAttribute("cx", x);
        this.c.setAttribute("cy", y);
        this.c.setAttribute("r", Math.max(this.radius * scaling, 0.6));
    }
}
function genObjects() {
    for (var i = 0; i < partsToSpawn; i++) {
        new gravObj(reverseScale([random()*width, random()*height]));
    }
}
function clears() {
    gravObjs = [];
    svg.innerHTML = "";
}
function dist(b1, b2) {
    return sqrt(pow(b1.x - b2.x, 2) + pow(b1.y - b2.y, 2));
}
function calcAttraction(o1, o2) {
    var x = dist(o1, o2);
    const maxAttraction = gravitationalConstant * o1.mass * o2.mass / pow(o1.radius+o2.radius,2);
    return Math.min(gravitationalConstant * o1.mass * o2.mass / pow(x,2), maxAttraction);
}
function combine(o1, o2) {
    new gravObj([(o1.mass * o1.x + o2.mass * o2.x) / (o1.mass + o2.mass), (o1.mass * o1.y + o2.mass * o2.y) / (o1.mass + o2.mass)], [(o1.mass * o1.velx + o2.mass * o2.velx) / (o1.mass + o2.mass),(o1.mass * o1.vely + o2.mass * o2.vely) / (o1.mass + o2.mass)], o1.mass + o2.mass)
    gravObjs.splice(gravObjs.indexOf(o1), 1);
    gravObjs.splice(gravObjs.indexOf(o2), 1);
    o1.c.remove();
    o2.c.remove();
}
function velMod(target) {
    var ty = 500 - target.y;
    for (b of gravObjs) {
        if (b !== target) {
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
            if ((dist(target, b) < target.radius - b.radius * 0.9 || dist(target, b) < b.radius - target.radius * 0.9) && collisions) {
                combine(target,b);
                break;
            }
            var force = dt*calcAttraction(b, target) / target.mass;
            target.vely += sin(angle) * force;
  
            target.velx += cos(angle) * force;
        }
    }
}
function update() {
    for (b of gravObjs) {
        velMod(b);
    }
    for (b of gravObjs) {
        b.move();
    }
}
function toggleCollisions() {
    collisions = !collisions;
    document.getElementById("collideButton").innerHTML = `Collisions Enabled : ${collisions}`;
}
function randVel() {
    randvel = !randvel;
    document.getElementById("randvelButton").innerHTML = `Random Velocity : ${randvel}`;
}
function fixedRadiusToggle() {
    radiusToggle = !radiusToggle;
    document.getElementById("fixedRadiusButton").innerHTML = `Fixed Radius (Spawn) : ${radiusToggle}`;
}
function scale(actualPoint) {
    //var [x,y] = actualPoint;
    //for (transformation of translationMatrix) {
    //    x = x * transformation[0] - (transformation[0] * transformation[1][0] - transformation[1][0]);
    //    y = y * transformation[0] - (transformation[0] * transformation[1][1] - transformation[1][1]);
    //}
    
    return [scaling * actualPoint[0] + translationx, scaling * actualPoint[1] + translationy];
}
function reverseScale(scaledPoint) {
    /*var [x,y] = scaledPoint;
    for (var i = translationMatrix.length-1; i > -1;i--) {
        transformation = translationMatrix[i];
        x = (x + (transformation[0] * transformation[1][0] - transformation[1][0])) / transformation[0];
        y = (y + (transformation[0] * transformation[1][1] - transformation[1][1])) / transformation[0];
    }*/
    return [(scaledPoint[0] - translationx) / scaling, (scaledPoint[1] - translationy) / scaling];
}
document.getElementById("numInput").addEventListener("input", (event) => {
    partsToSpawn = parseInt(event.target.value);
    document.getElementById("numLabel").innerHTML = `(${partsToSpawn}) Objects to Spawn`;
});
document.getElementById("fieldInput").addEventListener("input", (event) => {
    gravitationalConstant = pow(10, parseFloat(event.target.value));
    document.getElementById("fieldLabel").innerHTML = `
    Gravitational Constant G (10^${event.target.value}) `;
});
document.getElementById("massInput").addEventListener("input", (event) => {
    currentMass = pow(10, parseFloat(event.target.value));
    document.getElementById("massLabel").innerHTML = `Mass to Spawn: (${round(currentMass)})`;
});
document.getElementById("simInput").addEventListener("input", (event) => {
    dt = pow(10, parseFloat(event.target.value));
    document.getElementById("simLabel").innerHTML = `Simulation Speed Factor (10^${event.target.value})`;
});
document.getElementById("radiusInput").addEventListener("input", (event) => {
    fixedRadius = parseFloat(event.target.value);
});
document.getElementById("svgDiv").addEventListener("DOMMouseScroll", (event) => {
console.log("s");
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
    //translationMatrix.push([out && 2 || 0.5, [transformedPoint.x, transformedPoint.y]]);
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
    new gravObj(reverseScale([transformedPoint.x, transformedPoint.y]));
});
setInterval(update, 1);
