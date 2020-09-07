'use strict';

let canvas;
let gl;

let eye;
let modelViewMatrix;
let projectionMatrix;
let modelViewMatrixLoc;
let projectionMatrixLoc;

let axis = 0;
let xAxis = 0;
let yAxis = 1;
let zAxis = 2;

let thetav = [0, 0, 0]; // 3 angles for rotate around x, y, and z axises.
let thetavLoc; // use to bind with thetav in vertex shader
let flag = false; // to indicate if the pyramid needs to rotate

let near = 0.3;
let far = 3.0;
let radius = 4.0;
let theta = 0.0;
let phi = 0.0;
let dr = 5.0 * Math.PI / 180.0;

let fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
let aspect = 1.0; // Viewport aspect ratio

let pointsArray = [];
let colorsArray = [];

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const vertices = [
	vec4(0.5, -0.2722,  1.2886, 1.0),
	vec4(0.0,  -0.2772,  1-0.5773, 1.0),
	vec4(-0.5,  -0.2722,  1.2886, 1.0),
	vec4(0.0, 0.5443,  1.0, 1.0)
];

const vertexColors = [
	vec4(0.0, 0.0, 0.0, 1.0), // black
	vec4(1.0, 0.0, 0.0, 1.0), // red
	vec4(0.0, 1.0, 0.0, 1.0), // green
	vec4(0.0, 0.0, 1.0, 1.0)  // blue
];

const triple = (a, b, c) => {
	pointsArray.push(vertices[a]); 
	colorsArray.push(vertexColors[a]); 
	pointsArray.push(vertices[b]); 
	colorsArray.push(vertexColors[a]); 
	pointsArray.push(vertices[c]); 
	colorsArray.push(vertexColors[a]);
}

const colorPyramid = () => {
	triple(0, 2, 1);
	triple(1, 2, 3);
	triple(2, 3, 0);
	triple(3, 0, 1);
}

window.onload = function init() {
	canvas = document.getElementById('gl-canvas');

	gl = WebGLUtils.setupWebGL( canvas );
	if (!gl) alert('WebGL is nott available');

	gl.viewport(0, 0, canvas.width, canvas.height);
	aspect = canvas.width / canvas.height;
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	//  Load shaders and initialize attribute buffers
	const program = initShaders(gl, 'vertex-shader', 'fragment-shader');
	gl.useProgram(program);

	colorPyramid();

	const cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

	const vColor = gl.getAttribLocation(program, 'vColor');
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	const vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

	const vPosition = gl.getAttribLocation(program, 'vPosition');
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	thetavLoc = gl.getUniformLocation(program, 'thetav');
	modelViewMatrixLoc = gl.getUniformLocation(program, 'modelViewMatrix');
	projectionMatrixLoc = gl.getUniformLocation(program, 'projectionMatrix');

	// sliders & buttons for viewing parameters
  document.getElementById('zFarSlider').onchange = ({ target }) => (far = target.value);
  document.getElementById('zNearSlider').onchange = ({ target }) => (near = target.value);
  document.getElementById('radiusSlider').onchange = ({ target }) => (radius = target.value);
  document.getElementById('thetaSlider').onchange = ({ target }) => (theta = target.value * Math.PI / 180.0);
  document.getElementById('phiSlider').onchange = ({ target }) => (phi = target.value * Math.PI / 180.0);
  document.getElementById('aspectSlider').onchange = ({ target }) => (aspect = target.value);
  document.getElementById('fovSlider').onchange = ({ target }) => (fovy = target.value);
	document.getElementById('xButton').onclick = () => (axis = xAxis);
	document.getElementById('yButton').onclick = () => (axis = yAxis);
	document.getElementById('zButton').onclick = () => (axis = zAxis);
	document.getElementById('ButtonT').onclick = () => (flag = !flag);

  render();
}

const render = function() {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	eye = vec3(
		radius * Math.sin(theta) * Math.cos(phi),
		radius * Math.sin(theta) * Math.sin(phi), 
		radius * Math.cos(theta)
	);

	if (flag) thetav[axis] += 2.0;
	modelViewMatrix = lookAt(eye, at , up);
	projectionMatrix = perspective(fovy, aspect, near, far);

	gl.uniform3fv(thetavLoc, thetav);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

	gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);
	requestAnimFrame(render);
}