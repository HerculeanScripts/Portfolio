// === THREE.JS Setup ===
const canvas = document.getElementById("cubeCanvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5;

const group = new THREE.Group();

// Create 27 cubelets
let cubelets = [];
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
      const materials = [
        new THREE.MeshBasicMaterial({ color: x === 1 ? "red" : "black" }),   // right
        new THREE.MeshBasicMaterial({ color: x === -1 ? "orange" : "black" }), // left
        new THREE.MeshBasicMaterial({ color: y === 1 ? "white" : "black" }), // top
        new THREE.MeshBasicMaterial({ color: y === -1 ? "yellow" : "black" }), // bottom
        new THREE.MeshBasicMaterial({ color: z === 1 ? "green" : "black" }), // front
        new THREE.MeshBasicMaterial({ color: z === -1 ? "blue" : "black" }), // back
      ];
      const cubelet = new THREE.Mesh(geometry, materials);
      cubelet.position.set(x, y, z);
      cubelets.push(cubelet);
      group.add(cubelet);
    }
  }
}

scene.add(group);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// === ROTATION GROUPS ===

function getFace(filterFn) {
  return cubelets.filter(filterFn);
}

function rotateFace(faceCubes, axis, angle) {
  const tempGroup = new THREE.Group();
  faceCubes.forEach(c => {
    THREE.SceneUtils.attach(c, group, tempGroup);
    tempGroup.add(c);
  });

  tempGroup.rotation[axis] += angle;

  faceCubes.forEach(c => {
    THREE.SceneUtils.detach(c, tempGroup, group);
    group.add(c);
  });
}

// === MOVE LOGIC ===

function doMove(move) {
  console.log("Move:", move);

  if (move === "R") {
    const right = getFace(c => c.position.x > 0.5);
    rotateFace(right, "x", -Math.PI / 2);
  } else if (move === "R'") {
    const right = getFace(c => c.position.x > 0.5);
    rotateFace(right, "x", Math.PI / 2);
  } else if (move === "U") {
    const up = getFace(c => c.position.y > 0.5);
    rotateFace(up, "y", -Math.PI / 2);
  } else if (move === "U'") {
    const up = getFace(c => c.position.y > 0.5);
    rotateFace(up, "y", Math.PI / 2);
  }
  // Add more: F, F', L, L', D, D', B, B'
}

// === VOICE INPUT ===

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert("Web Speech API not supported in this browser.");
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.onresult = event => {
    const last = event.results[event.results.length - 1];
    const transcript = last[0].transcript.toLowerCase().trim();
    console.log("Heard:", transcript);
    parseCommand(transcript);
  };

  recognition.start();
}

function parseCommand(cmd) {
  let move = cmd.toUpperCase().replace("PRIME", "'");
  if (["R", "R'", "U", "U'"].includes(move)) {
    doMove(move);
  }
}
