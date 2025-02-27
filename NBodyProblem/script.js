const svg = document.getElementById("svg");
var gravObjs = [];
var gravitationalConstant = Math.pow(10, -4);
var maxVel = 1;
var currentMass = 1000;
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
var downLoc = [];
var mouseDownToggle = false;
var pLength = 100;
var manualVelocity = true;
var connectingLine = true;
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
var ref = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
);svg.appendChild(ref);
//var ref = null;
/*var tracer = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
);*/
var tracer = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polyline",
);
var referenceArrow = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polyline",
);
var CM = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
);
CM.setAttribute("fill", "white");
CM.setAttribute("r", 3);
tracer.setAttribute("stroke", "red");
referenceArrow.setAttribute("stroke", "white");

svg.insertBefore(tracer,ref);
svg.appendChild(CM);
svg.appendChild(referenceArrow);
const print = console.log;
class gravObj {
    constructor(startingPos, startingvel = [0,0], startingMass = currentMass) {
        print(startingMass);
        this.x = startingPos[0];
        this.y = startingPos[1];
        this.previousPoints = [[this.x, this.y]];
        this.mass = startingMass;
            const circle = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle",
            );
            const path = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path",
            );
            const color = colors[Math.floor(4 * random())];
            path.setAttribute("stroke", color);
            this.p = path;
            circle.setAttribute("cx", this.x);
            circle.setAttribute("cy", this.y);
    
            circle.setAttribute("fill", color);
            this.c = circle;
            this.p = path;
            [this.velx, this.vely] = startingvel;
            if (randvel) {
                this.velx = random() * (random() < 0.5 && 1 || -1) / Math.log10(currentMass) / 2;
                this.vely = random() * (random() < 0.5 && 1 || -1) / Math.log10(currentMass) / 2;
            }
            this.radius = pow(this.mass, 1/4);
            circle.setAttribute("r", this.radius);
            svg.appendChild(circle);
            svg.insertBefore(path, ref);
            gravObjs.push(this);
        }
    move() {
        this.x += dt*this.velx;
        this.y -= dt*this.vely;
        var [x,y] = scale([this.x, this.y]);
        this.c.setAttribute("cy", y);
        this.c.setAttribute("cx", x);
        this.c.setAttribute("r", Math.max(this.radius * scaling, 0.6));
        var last = this.previousPoints[this.previousPoints.length-1];
        if (this.previousPoints.length > 0 && pow(pow(this.x-last[0], 2) + pow(this.y-last[1], 2),1/2) > 1) {
            this.previousPoints.push([this.x, this.y]);
        }
        if (this.previousPoints.length > pLength) {
            this.previousPoints.shift();
        }
        var scaledPoints = [...this.previousPoints];
        for (var i = 0; i < scaledPoints.length; i++) {
            scaledPoints[i] = scale(scaledPoints[i]);
        }
        this.p.setAttribute("d", "");
        this.p.setAttribute("d", makeStringFromCords(scaledPoints));
    }
}
function makeStringFromCords(cords) {
    var fin = `M${cords[0][0]},${cords[0][1]}`;
    for (var i = 1; i < cords.length; i++) {
        fin += ` L${cords[i][0]},${cords[i][1]}`
    }
    return fin;
}
function genObjects() {
    for (var i = 0; i < partsToSpawn; i++) {
        new gravObj(reverseScale([random()*width, random()*height]));
    }
}
function clears() {
    for (go of gravObjs) {
        svg.removeChild(go.c);
        svg.removeChild(go.p);
    }
    gravObjs = [];
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
    var nPos = [(o1.mass * o1.x + o2.mass * o2.x) / (o1.mass + o2.mass), (o1.mass * o1.y + o2.mass * o2.y) / (o1.mass + o2.mass)];
    var nVel = [(o1.mass * o1.velx + o2.mass * o2.velx) / (o1.mass + o2.mass),(o1.mass * o1.vely + o2.mass * o2.vely) / (o1.mass + o2.mass)];
    new gravObj(nPos,nVel , o1.mass + o2.mass);
    gravObjs.splice(gravObjs.indexOf(o1), 1);
    gravObjs.splice(gravObjs.indexOf(o2), 1);
    o1.c.remove();
    o1.p.remove();
    o2.p.remove();
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
function betterArcTan(x,y) {
    if (x < 0) {
        if (0 < y) {
            return Math.PI / 2 + Math.atan(Math.abs(y/x));
        }
        return -1*Math.PI / 2 - Math.atan(Math.abs(y/x));
    }
    return Math.atan(y/x);
}
/*function makeArrow(tailPoint, tipPoint) {
    var fin = ``;
    const r = 8;
    const angleB = 3*Math.PI / 4; // Adjusted angle for better positioning
    var arrowTotalAngle = Math.atan2(tipPoint[1] - tailPoint[1], tipPoint[0] - tailPoint[0]);
    
    // Calculate the two arrowhead points
    var x1 = tipPoint[0] + r * Math.cos(arrowTotalAngle + angleB);
    var y1 = tipPoint[1] + r * Math.sin(arrowTotalAngle + angleB);
    
    var x2 = tipPoint[0] + r * Math.cos(arrowTotalAngle - angleB);
    var y2 = tipPoint[1] + r * Math.sin(arrowTotalAngle - angleB);
    
    // Form the final points string
    fin += `${tailPoint[0]},${tailPoint[1]} ${tipPoint[0]},${tipPoint[1]} ${x1},${y1} ${tipPoint[0]},${tipPoint[1]} ${x2},${y2}`;
    return fin;
}*/

// Example usage:
function makeArrow(tailPoint, tipPoint) {
    var fin = ``;
    const r = 8;
    const angleB = 3*Math.PI/4;
    var arrowTotalAngle = Math.atan2(tipPoint[1] - tailPoint[1], tipPoint[0] - tailPoint[0]);
    
    var x1 = tipPoint[0] + r * Math.cos(arrowTotalAngle + angleB);
    var y1 = tipPoint[1] + r * Math.sin(arrowTotalAngle + angleB);
    
    var x2 = tipPoint[0] + r * Math.cos(arrowTotalAngle - angleB);
    var y2 = tipPoint[1] + r * Math.sin(arrowTotalAngle - angleB);
    
    fin += `${tailPoint[0]},${tailPoint[1]} ${tipPoint[0]},${tipPoint[1]} ${x1},${y1} ${tipPoint[0]},${tipPoint[1]} ${x2},${y2}`;
    return fin;
}
function makePolylineFromCords(cords) {
    var final = "";
    if (cords.length < 1) {
        return "";
    }
    for (cord of cords) {
        final += `${cord[0]},${cord[1]} `;
    }
    final += `${cords[0][0]},${cords[0][1]}`;
    return final;
}
function update() {
    for (b of gravObjs) {
        velMod(b);
    }
    for (b of gravObjs) {
        b.move();
    }
    if (connectingLine) {
        var objPoints = [];
        for (obj of gravObjs) {
            objPoints.push(scale([obj.x, obj.y]));
        }
        tracer.setAttribute("points", makePolylineFromCords(objPoints));
    }
    else {
        tracer.setAttribute("points", "");
    }
    var aX = 0;
    var aY = 0;
    var totalMass = 0;
    for (obj of gravObjs) {
        var [x,y] = scale([obj.x, obj.y]);
        aX += x*obj.mass;
        aY += y*obj.mass;
        totalMass += obj.mass;
    }
    
    if (totalMass != 0) {
        aX /= totalMass;
        aY /= totalMass;
    }
    
    CM.setAttribute("cx", aX);
    CM.setAttribute("cy", aY);
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
function manualVelocityFunc() {
    manualVelocity = !manualVelocity;
    document.getElementById("manualVelocityBtn").innerHTML = `Manual Velocity (Arrow): ${manualVelocity}`;
}
function connectingLineFunc() {
    connectingLine = !connectingLine;
    document.getElementById("connectingLineBtn").innerHTML = `Connecting Line (red) visible : ${manualVelocity}`;
}
function reverseScale(scaledPoint) {
    /*var [x,y] = scaledPoint;
    for (var i = translationMatrix.length-1; i > -1;i--) {
        transformation = translationMatrix[i];
        x = (x + (transformation[0] * transformation[1][0] - transformation[1][0])) / transformation[0];
        y = (y + (transformation[0] * transformation[1][1] - transformation[1][1])) / transformation[0];
    }*/
    return [round(1000*(scaledPoint[0] - translationx) / scaling)/1000, round(1000*(scaledPoint[1] - translationy) / scaling)/1000];
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
document.getElementById("pathLengthInput").addEventListener("input", (event) => {
    pLength = parseInt(event.target.value);
    document.getElementById("pathLengthLabel").innerHTML = `Path Length : ${pLength}`;
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
svg.addEventListener("mousedown", (event) => {
    const { clientX, clientY } = event;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const transformedPoint = point.matrixTransform(
        svg.getScreenCTM().inverse(),
    );
    transformedPoint.x = round(transformedPoint.x);
    transformedPoint.y = round(transformedPoint.y);
    mouseDownToggle = true;
    downLoc = [transformedPoint.x,transformedPoint.y];
});
svg.addEventListener("mouseup", (event) => {
    mouseDownToggle = false;
    const { clientX, clientY } = event;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const transformedPoint = point.matrixTransform(
        svg.getScreenCTM().inverse(),
    );
    transformedPoint.x = round(transformedPoint.x);
    transformedPoint.y = round(transformedPoint.y);
    referenceArrow.setAttribute("points", "");
    new gravObj(reverseScale(downLoc), [(transformedPoint.x-downLoc[0])/100,(downLoc[1]-transformedPoint.y)/100]);
});
svg.addEventListener("mousemove", (event) => {
    if (manualVelocity) {
        const { clientX, clientY } = event;
        const point = svg.createSVGPoint();
        point.x = clientX;
        point.y = clientY;
        const transformedPoint = point.matrixTransform(
            svg.getScreenCTM().inverse(),
        );
        transformedPoint.x = round(transformedPoint.x);
        transformedPoint.y = round(transformedPoint.y);
        newLoc = [transformedPoint.x,transformedPoint.y];
        if (mouseDownToggle) {
            
            referenceArrow.setAttribute("points", makeArrow(downLoc, newLoc));
        }
    }
    /*else {
        referenceArrow.setAttribute("points", "");
    }*/
});
/*svg.addEventListener("click", (event) => {
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
});*/
setInterval(update, 1);
