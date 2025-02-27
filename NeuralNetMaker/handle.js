const e = Math.E;
const pow = Math.pow;
const print = console.log;
var network = [];
var eta = 0.01;//learning rate;
var biases = [[0.1],[0.2]];
var weights = [[[0.1]],[[0.2]]]; //[layer][neuron][previous connection]
var activationFuncs = [ReLU, ReLU, noneFunc];
var trainHandle;
var time = 100;
var activationFuncDict = {
}
activationFuncDict["ReLU"] = ReLU;
activationFuncDict["sigmoid"] = sigmoid;
activationFuncDict["noneFunc"] = noneFunc;

function ReLU(x) {
  if (x < 0) {
    x = 0;
  }
  return x;
}
function noneFunc(x) {//for last layer as escape
  return x;
}
function sigmoid(x) {
  return 1/(1+(pow(e,-1*x)));
}
function softMax(arr) {
    var s = 0;
    for (var node of arr) {
      s += pow(e,node);
    }
    for (var i = 0; i < arr.length;i ++) {
      arr[i] = pow(e,arr[i]) / s;
    }
    return arr;
}
function resetNetwork(nodesPerLayer) {//[1,2,3] = 1 input, 2 hidden, 3 out
  network = [];
  weights = [];
  biases = [];
  for (var amount of nodesPerLayer) { //setup network structure
    network.push([]);//layer
    for (var i = 0; i < amount; i++) {
      network[network.length-1].push(0);
    }
  }
  for (var n = 1; n < nodesPerLayer.length; n++) { //setup weights
    weights.push([]);//layer
    biases.push([]);
    for (var i = 0; i < nodesPerLayer[n]; i++) {
      weights[weights.length-1].push([]);//array for each neuron
      for (var x = 0; x < nodesPerLayer[n-1]; x++) {
        weights[weights.length-1][i].push(Math.random()-0.5);
      }
      biases[biases.length-1].push(Math.random()-0.5);
     }
  }
}
function derivative(func,x) {
  if (func == softMax || func == sigmoid) {
    return x * (1-x);
  }
  if (func == ReLU) {
    if (x > 0) {
      return 1;
    }
    else {
      return 0;
    }
  }
  if (func == noneFunc) {
    return 1;
  }
}
function calculateError(expected, actual) {
  var total = 0;
  for (var i = 0; i < expected.length; i++) {
    total += 0.5 *pow(actual[i] - expected[i],2) //(actual- expected)**2
  }
  return total;
}
function forward(inputs) {
  network[0] = inputs;
  for (var layer = 1; layer < network.length; layer++) {
    for (var node = 0; node < network[layer].length; node++) {
      var val = biases[layer-1][node];
      for (var previous = 0; previous < network[layer-1].length; previous++) {
        val += weights[layer-1][node][previous]*network[layer-1][previous];
      }
      val = activationFuncs[layer-1](val);
      network[layer][node] = val;
    }
  }
  var applySoftmax =  activationFuncs[activationFuncs.length-1]==softMax;
  if (applySoftmax) {network[network.length-1] = softMax(network[network.length-1]);}
  return network[network.length-1];
}
function copy(arr) {
  var newArr = [];
  for (var x of arr) {
    if (typeof(x) == "object") {
      newArr.push(copy(x));
    }
    else {
      newArr.push(x);
    }
  }
  return newArr;
}
function backward(expected) {
  var deltaMap = [[]];
  var newWeights = copy(weights);
  var newBiases = copy(biases);
 
  for (var node = 0; node < network[network.length-1].length; node++) {
    var delta = derivative(activationFuncs[activationFuncs.length-1], network[network.length-1][node]) * (network[network.length-1][node]-expected[node]);
    newBiases[network.length-2][node] -= eta*delta;
    deltaMap[0].push(delta);
    for (var p = 0; p < network[network.length-2].length; p++){
      newWeights[network.length-2][node][p] -= eta*delta * network[network.length-2][p];//delta*h  
    }
  }
  for (var layer = network.length-2; layer > 0; layer --) {
    deltaMap.push([]);
    for (var node = 0; node < network[layer].length; node++) {
    var delta = 0;//derivative(activationFuncs[activationFuncs.length-1], network[network.length-1][node]) * (network[network.length-1][node]-expected[node]);
    for (var n = 0; n < network[layer+1].length; n++) {
      delta += deltaMap[deltaMap.length-2][n] * weights[layer][n][node] * derivative(activationFuncs[layer-1], network[layer][node]);
    }
    newBiases[layer-1][node] -= eta*delta;
    deltaMap[deltaMap.length-1].push(delta);
    for (var p = 0; p < network[layer-1].length; p++){
      newWeights[layer-1][node][p] -= eta*delta * network[layer-1][p];//delta*h  
    }
  }
  }
 
  weights = newWeights;
  biases = newBiases;
}


function trainFunc(inputs) {
   return [Math.sin(inputs[0])];
}
function start() {
  print(document.getElementById("funcInput").value);
  trainFunc = new Function("inputs", document.getElementById("funcInput").value);
  print(trainFunc([1,2]))
  var inp = parseInt(document.getElementById("inputInput").value);
  var hid = parseInt(document.getElementById("hidden1Input").value);
  var out = parseInt(document.getElementById("outputInput").value);
  resetNetwork([inp, hid, out]);
  stop();
  activationFuncs = [activationFuncDict[document.getElementById("hidden1Select").value], activationFuncDict[document.getElementById("outputSelect").value]];
  trainHandle = setInterval(train, time);
}
function stop() {
  clearInterval(trainHandle);
  its = 0;
}
function etaFunc() {
  eta = parseFloat(document.getElementById("etaInput").value);
  document.getElementById("etaLabel").innerHTML = `Eta (taining rate): ${eta}`; 
}
function timeFunc() {
  time = parseFloat(document.getElementById("timeInput").value);
  document.getElementById("timeLabel").innerHTML = `Cycle time : ${time}ms`; 
}
function inputRand() {
  var inpArr = [];
  for (var i=0; i < network[0].length; i++) {
    inpArr.push(Math.random());
  }
  return inpArr;
}
var its = 0;
function train() {
  var inpArr = inputRand();
  var expect = trainFunc(inpArr);
  var actual = forward(inpArr);
  backward(expect);
  document.getElementById("errorLabel").innerHTML= `Error : ${calculateError(expect,actual)}`;
  document.getElementById("iterationLabel").innerHTML= `Iterations : ${its}`;
  if (its %100 == 0) {
  var fin = "";
  for(var c = 0; c < 10; c++) {
    var r = inputRand();  
    fin += `For input : ${r}, Model gave : ${forward(r)} Actual (trainfunc) is : ${trainFunc(r)}<br>`;
  }
  document.getElementById("testLabel").innerHTML = fin;
}
its++;
}


