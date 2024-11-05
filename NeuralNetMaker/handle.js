var network = [];
var weights = [];
var biases = [];
var random = Math.random;
function createArr(fillFunction, len) {
    var a = [];
    for (var i =0; i < len; i++) {
        a.push(fillFunction(i));
    }
    return a;
}

class layer {
    constructor (length, actFunc = null, layerName="Input") {
        this.neurons = createArr(()=>[],length);
        this.activationFunction = actFunc;
        this.name = layerName;
        this.layerNumber = network.length;
        if (0 < this.layerNumber) {
            biases.push(createArr(random, length));
            weights.push(createArr(()=>createArr(random, network[this.layerNumber-1].length),length));
        }
            network.push(this);
    }
    forward(previousNeurons) {
        
    }
}
var l1 = new layer(3, layerName="Input");
var l2 = new layer(2, layerName="Hidden1");
console.log(l1)
console.log(l2);
function addLayer() {

}
function removeLayer() {

}