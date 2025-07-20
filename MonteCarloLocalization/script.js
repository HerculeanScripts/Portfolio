// Define the SVG namespace
const svgns = "http://www.w3.org/2000/svg";

const svg = document.getElementById("svgArea");
const sensorDistance = 500;
const pi = Math.PI;
var width = 800;
var height = 800;
var sigma = document.getElementById("sigmaInput").value;
var refreshTime = document.getElementById("timeInput").value;
var lineSpace = [];
var pright = false;
var pleft = false;
var pup = false;
var pdown = false;
var jitOffset = document.getElementById("jitInput").value;
var particleNumber = document.getElementById("particleInput").value;
var movOffset = document.getElementById("movInput").value;
var injected = document.getElementById("injectedInput").value;
svg.setAttribute("width", width);
svg.setAttribute("height", height);

class LineSegment {
	constructor(x1, y1, x2, y2) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}

	intersection(other) {
		const x1 = this.x1,
			y1 = this.y1;
		const x2 = this.x2,
			y2 = this.y2;
		const x3 = other.x1,
			y3 = other.y1;
		const x4 = other.x2,
			y4 = other.y2;

		const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (denom === 0) return null; // Parallel or coincident

		const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
		const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			const ix = x1 + t * (x2 - x1);
			const iy = y1 + t * (y2 - y1);
			return {
				x: ix,
				y: iy,
				t,
				u
			};
		} // t is amount along this line, u along other.

		return null;
	}
}
// Outer borders
lineSpace.push(new LineSegment(0, 0, width, 0));
lineSpace.push(new LineSegment(0, 0, 0, height));
lineSpace.push(new LineSegment(0, height, width, height));
lineSpace.push(new LineSegment(width, 0, width, height));

// Center "Goal Platform" — 200×$-platform (approx 200×200 px if 1 inch ≈ 10 px)
const center = width / 2;
const goalSize = 200;
lineSpace.push(new LineSegment(center - goalSize/2, center - goalSize/2, center + goalSize/2, center - goalSize/2));
lineSpace.push(new LineSegment(center + goalSize/2, center - goalSize/2, center + goalSize/2, center + goalSize/2));
lineSpace.push(new LineSegment(center + goalSize/2, center + goalSize/2, center - goalSize/2, center + goalSize/2));
lineSpace.push(new LineSegment(center - goalSize/2, center + goalSize/2, center - goalSize/2, center - goalSize/2));

// Corner "Scoring Zones" — smaller 100×100 px
const zoneSize = 100;
const corners = [
  [0, 0],
  [width - zoneSize, 0],
  [0, height - zoneSize],
  [width - zoneSize, height - zoneSize]
];
for (const [x, y] of corners) {
  lineSpace.push(new LineSegment(x, y, x + zoneSize, y));
  lineSpace.push(new LineSegment(x + zoneSize, y, x + zoneSize, y + zoneSize));
  lineSpace.push(new LineSegment(x + zoneSize, y + zoneSize, x, y + zoneSize));
  lineSpace.push(new LineSegment(x, y + zoneSize, x, y));
}

// Optionally: add mid‑field divider
lineSpace.push(new LineSegment(0, center, width, center));


class Robot {
	constructor(x, y, angle) {
		this.x = x;
		this.y = y;
		this.theta = angle;

		// Create an SVG group to hold all robot parts
		this.group = document.createElementNS(svgns, "g");

		// Set transform for initial position and rotation
		this.group.setAttribute("transform", `translate(${this.x}, ${this.y}) rotate(${this.theta * 180 / Math.PI})`);
		svg.appendChild(this.group);

		// Create square body (centered at origin of group)
		const body = document.createElementNS(svgns, "rect");
		body.setAttribute("x", -20);
		body.setAttribute("y", -20);
		body.setAttribute("width", "40");
		body.setAttribute("height", "40");
		body.setAttribute("fill", "steelblue");
		this.group.appendChild(body);

		// Create triangle head (pointing forward)
		const size = 20;
		const tip = [size, 0];
		const left = [-size / 2, size];
		const right = [-size / 2, -size];
		const head = document.createElementNS(svgns, "polygon");
		head.setAttribute("points", `${tip.join(",")} ${left.join(",")} ${right.join(",")}`);
		head.setAttribute("fill", "orange");
		this.group.appendChild(head);

		// Sensor creation helper
		function createSensor(x, y, color) {
			const sensor = document.createElementNS(svgns, "circle");
			sensor.setAttribute("cx", x);
			sensor.setAttribute("cy", y);
			sensor.setAttribute("r", 5);
			sensor.setAttribute("fill", color);
			return sensor;
		}

		// Add three sensors relative to robot center
		this.group.appendChild(createSensor(0, -30, "black")); // Left
		this.group.appendChild(createSensor(0, 30, "black")); // Right
		this.group.appendChild(createSensor(-30, 0, "black")); // Back
	}

	distanceRight() {
		var d1 = sensorDistance;
		var l = sensorDistance;
		var ray1 = new LineSegment(this.x, this.y, this.x + Math.cos(this.theta + pi / 2) * l, this.y + Math.sin(this.theta + pi / 2) * l);
		var shortest = 1;
		for (var lineSeg of lineSpace) {
			var x = ray1.intersection(lineSeg);
			if (x) {
				shortest = Math.min(x.t, shortest);
			}
		}
		if (shortest != 1) {
			d1 = l * shortest;
		}
		return d1;
	}
	distanceLeft() {
		var d1 = sensorDistance;
		var l = sensorDistance;
		var ray1 = new LineSegment(this.x, this.y, this.x + Math.cos(this.theta - pi / 2) * l, this.y + Math.sin(this.theta - pi / 2) * l);
		var shortest = 1;
		for (var lineSeg of lineSpace) {
			var x = ray1.intersection(lineSeg);
			if (x) {
				shortest = Math.min(x.t, shortest);
			}
		}
		if (shortest != 1) {
			d1 = l * shortest;
		}
		return d1;
	}
	distanceBack() {
		var d1 = sensorDistance;
		var l = sensorDistance;
		var ray1 = new LineSegment(this.x, this.y, this.x + Math.cos(this.theta + pi) * l, this.y + Math.sin(this.theta + pi) * l);
		var shortest = 1;
		for (var lineSeg of lineSpace) {
			var x = ray1.intersection(lineSeg);
			if (x) {
				shortest = Math.min(x.t, shortest);
			}
		}
		if (shortest != 1) {
			d1 = l * shortest;
		}
		return d1;
	}
}

class Particle {
	constructor(x, y, angle) {
		this.x = x;
		this.y = y;
		this.theta = angle;
		this.weight = 1;
	}

	distanceRight() {
		var d1 = sensorDistance;
		var l = sensorDistance;
		var ray1 = new LineSegment(this.x, this.y, this.x + Math.cos(this.theta + pi / 2) * l, this.y + Math.sin(this.theta + pi / 2) * l);
		var shortest = 1;
		for (var lineSeg of lineSpace) {
			var x = ray1.intersection(lineSeg);
			if (x) {
				shortest = Math.min(x.t, shortest);
			}
		}
		if (shortest != 1) {
			d1 = l * shortest;
		}
		return d1;
	}
	distanceLeft() {
		var d1 = sensorDistance;
		var l = sensorDistance;
		var ray1 = new LineSegment(this.x, this.y, this.x + Math.cos(this.theta - pi / 2) * l, this.y + Math.sin(this.theta - pi / 2) * l);
		var shortest = 1;
		for (var lineSeg of lineSpace) {
			var x = ray1.intersection(lineSeg);
			if (x) {
				shortest = Math.min(x.t, shortest);
			}
		}
		if (shortest != 1) {
			d1 = l * shortest;
		}
		return d1;
	}
	distanceBack() {
		var d1 = sensorDistance;
		var l = sensorDistance;
		var ray1 = new LineSegment(this.x, this.y, this.x + Math.cos(this.theta + pi) * l, this.y + Math.sin(this.theta + pi) * l);
		var shortest = 1;
		for (var lineSeg of lineSpace) {
			var x = ray1.intersection(lineSeg);
			if (x) {
				shortest = Math.min(x.t, shortest);
			}
		}
		if (shortest != 1) {
			d1 = l * shortest;
		}
		return d1;
	}
	changeWeight(aleft, aback, aright) {
		var w1 = Math.exp(-1 * (this.distanceLeft() - aleft) ** 2 / (2 * sigma * sigma));
		var w2 = Math.exp(-1 * (this.distanceBack() - aback) ** 2 / (2 * sigma * sigma));
		var w3 = Math.exp(-1 * (this.distanceRight() - aright) ** 2 / (2 * sigma * sigma));
		this.weight = Math.log(w1) + Math.log(w2) + Math.log(w3); //this.weight = w1*w2*w3;//
		return this.weight;
	}
	setWeight(value) {
		this.weight = value;
	}
}

function getMoveSuggestions(robot) {
	var x = Math.cos(robot.theta) * 10;
	var y = Math.sin(robot.theta) * 10;
	var t = 3 * pi / 180;
	return [x, y, t];
}
var bot = [];
var particles = [];

function loop() {
	svg.innerHTML = "";
	drawBackground();
	var robot = new Robot(bot[0], bot[1], bot[2]);
	for (p of particles) {
		const dot = document.createElementNS(svgns, "circle");
		dot.setAttribute("cx", p.x);
		dot.setAttribute("cy", p.y);
		dot.setAttribute("r", 1);
		dot.setAttribute("fill", "blue");
		svg.appendChild(dot);
	}
	//weight
	var l = robot.distanceLeft();
	var b = robot.distanceBack();
	var r = robot.distanceRight();
	var maxLog = -1000000000000;
	var sum = 0;
	for (var p of particles) {
		var x = p.changeWeight(l, b, r);
		if (x > maxLog) {
			maxLog = x;
		}
	} //turn to logs
	for (var p of particles) {
		var v = Math.exp(p.weight - maxLog);
		sum += v;
		p.setWeight(v);
	} //turn to probs
	for (var p of particles) {
		p.setWeight(p.weight / sum);
	} //normailze

	//resample
	var resampled = [];
	var diff = 1 / particles.length;
	var current = Math.random() * diff;
	var cumSum = 0;
	for (var p of particles) {
		cumSum += p.weight;
		while (current <= cumSum) {
			resampled.push(new Particle(p.x + Math.random() * jitOffset - jitOffset/2, p.y + Math.random() * jitOffset - jitOffset/2, p.theta + Math.random() * (jitOffset*pi / 90) - jitOffset*pi / 180)); //random new pose
			current += diff;
		}
	}
	particles = resampled;
	//move
	var sugs = [0, 0, 0];
  var angle = 10 * pi * refreshTime / 180 / 100;
  var mov = 10*refreshTime / 100;
	if (pleft) {
		sugs[2] = -angle;
	}
	if (pright) {
		sugs[2] = angle;
	}
	bot[2] += sugs[2];
	if (pup) {
		sugs[0] = Math.cos(bot[2]) * mov;
		sugs[1] = Math.sin(bot[2]) * mov;
	}
	if (pdown) {
		sugs[0] = -1 * Math.cos(bot[2]) * mov;
		sugs[1] = -1 * Math.sin(bot[2]) * mov;
	}
	bot[0] += sugs[0];
	bot[1] += sugs[1];
  var midx = 0;
  var midy = 0;
	for (p of particles) {
		p.x += sugs[0] + Math.random() * movOffset - movOffset/2;
		p.y += sugs[1] + Math.random() * movOffset - movOffset/2;
		p.theta += sugs[2] + Math.random() * movOffset * pi / 90 - movOffset * pi / 180;
		if (p.x < 0 || p.x > width) {
			p.x = Math.random() * width;
			p.y = Math.random() * height;
			p.theta = Math.random() * 2 * pi;
		}
		if (p.y < 0 || p.y > height) {
			p.x = Math.random() * width;
			p.y = Math.random() * height;
			p.theta = Math.random() * 2 * pi;
		}
    midx += p.x;
    midy += p.y;
	}
    midx /= particleNumber;
    midy /= particleNumber;
    const dot = document.createElementNS(svgns, "circle");
		dot.setAttribute("cx", midx);
		dot.setAttribute("cy", midy);
		dot.setAttribute("r", 5);
		dot.setAttribute("fill", "red");
		svg.appendChild(dot);
    document.getElementById("comparisonLabel").innerHTML = `Robot position : {${Math.round(bot[0])},${Math.round(bot[1])}}; Predicted / average position : {${Math.round(midx)},${Math.round(midy)}}`
	for (var k = 0; k < injected; k++) {
		particles.pop();
	}
	for (var k = 0; k < injected; k++) {
		particles.push(new Particle(Math.random() * width, Math.random() * height, Math.random() * (2 * pi)));
	}
}
document.addEventListener("keydown", function(event) {
	if (event.key === "ArrowLeft") {
		pleft = true;
	} else if (event.key === "ArrowRight") {
		pright = true;
	} else if (event.key === "ArrowUp") {
		pup = true;
	} else if (event.key === "ArrowDown") {
		pdown = true;
	}
});
document.addEventListener("keyup", function(event) {
	if (event.key === "ArrowLeft") {
		pleft = false;
	} else if (event.key === "ArrowRight") {
		pright = false;
	} else if (event.key === "ArrowUp") {
		pup = false;
	} else if (event.key === "ArrowDown") {
		pdown = false;
	}
});

function drawBackground() {
	const rect = document.createElementNS(svgns, "rect");
	rect.setAttribute("x", "0");
	rect.setAttribute("y", "0");
	rect.setAttribute("width", width);
	rect.setAttribute("height", height);
	rect.setAttribute("fill", "rgb(240,240,240)");
	svg.appendChild(rect);
	for (var lined of lineSpace) {
		const line = document.createElementNS(svgns, "line");

		// Set line coordinates
		line.setAttribute("x1", lined.x1);
		line.setAttribute("y1", lined.y1);
		line.setAttribute("x2", lined.x2);
		line.setAttribute("y2", lined.y2);

		// Style the line
		line.setAttribute("stroke", "green");
		line.setAttribute("stroke-width", "2");

		// Add it to the SVG
		svg.appendChild(line);
	}
}
var intv = null;

function spawn() {
  reset();
  bot = [Math.random()*(width-200)+100, Math.random()*(height-200)+100, Math.random()*2*pi];
  for (var i = 0; i < particleNumber; i++) {
	particles.push(new Particle(Math.random() * width, Math.random() * height, Math.random() * (2 * pi)));
}
	intv = setInterval(loop, refreshTime);

}

function reset() {
	clearInterval(intv);
	svg.innerHTML = "";
	drawBackground();
  particles = [];
  bot = [];
}
document.getElementById("sigmaInput").addEventListener("input", () => {
    sigma = document.getElementById("sigmaInput").value;
    document.getElementById("sigmaLabel").innerHTML = sigma;
});
document.getElementById("particleInput").addEventListener("input", () => {
    particleNumber = document.getElementById("particleInput").value;
    document.getElementById("particleLabel").innerHTML = particleNumber;
});
document.getElementById("timeInput").addEventListener("input", () => {
    refreshTime = document.getElementById("timeInput").value;;
    document.getElementById("timeLabel").innerHTML = refreshTime;
});
document.getElementById("jitInput").addEventListener("input", () => {
    jitOffset = document.getElementById("jitInput").value;;
    document.getElementById("jitLabel").innerHTML = jitOffset;
});
document.getElementById("movInput").addEventListener("input", () => {
    movOffset = document.getElementById("movInput").value;;
    document.getElementById("movLabel").innerHTML = movOffset;
});
document.getElementById("injectedInput").addEventListener("input", () => {
    injected = document.getElementById("injectedInput").value;;
    document.getElementById("injectedLabel").innerHTML = injected;
});
reset()