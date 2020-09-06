'use strict';

var canvas;
var gl;

var NumVertices = 12;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [0, 0, 0];

var thetaLoc;

window.onload = function init() {
  canvas = document.getElementById('gl-canvas');

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) alert('WebGL is not available');

  colorCube();

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //  Load shaders and initialize attribute buffers
  const program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  const cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  const vColor = gl.getAttribLocation(program, 'vColor');
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);


  const vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  thetaLoc = gl.getUniformLocation(program, 'theta');

  // event listeners for buttons
  document.getElementById('xButton').onclick = () => (axis = xAxis);
  document.getElementById('yButton').onclick = () => (axis = yAxis);
  document.getElementById('zButton').onclick = () => (axis = zAxis);

  render();
}

function colorCube() {
  triple(1, 0, 2);
  triple(2, 3, 1);
  triple(3, 0, 1);
  triple(0, 2, 3);
}

function triple(a, b, c) {
  const vertices = [
    vec3(0.5, -0.2722,  0.2886),
    vec3(0.0,  -0.2772,  -0.5773),
    vec3(-0.5,  -0.22772,  0.2886),
    vec3(0.0, 0.5443,  0.0),
  ];

  const vertexColors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
  ];

  // vertex color assigned by the index of the vertex
  const indices = [a, b, c];
  for (let i = 0; i < indices.length; ++i) {
    points.push( vertices[indices[i]] );

    // for solid colored faces use
    colors.push(vertexColors[a]);
  }
}

function render() {
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  theta[axis] += 2.0;
  gl.uniform3fv(thetaLoc, theta);
  gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
  requestAnimFrame(render);
}
