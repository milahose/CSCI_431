'use strict';

let gl; 
let canvas;
let program;
let modelViewMatrix;
let projectionMatrix;
let modelViewMatrixLoc;

let points = [];
let colors = [];


window.onload = () => {
  canvas = document.getElementById('gl-canvas');
  
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) alert('WebGL is not available');

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  
  gl.enable(gl.DEPTH_TEST);

	//  Load shaders and initialize attribute buffers
	program = initShaders(gl, 'vertex-shader', 'fragment-shader');
	gl.useProgram(program);

	colorCube();

  // Create and initialize buffer objects
  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  const vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  
  const cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  const vColor = gl.getAttribLocation(program, 'vColor');
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  document.getElementById('slider1').onchange = ({ target }) => (theta[0] = target.value);
  document.getElementById('slider2').onchange = ({ target }) => (theta[1] = target.value);
  document.getElementById('slider3').onchange = ({ target }) => (theta[2] = target.value);
  document.getElementById('slider4').onchange = ({ target }) => (theta[3] = target.value);
	
	modelViewMatrixLoc = gl.getUniformLocation(program, 'modelViewMatrix');

  projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projectionMatrix'), false, flatten(projectionMatrix));

  render();
}

//----------------------------------------------------------------------------

const base = () => {
  const s = scale4(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
  const instanceMatrix = mult( translate( 2.5, 0.5 * BASE_HEIGHT, 0.0 ), s);
  const t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
  gl.drawArrays( gl.TRIANGLES, 0, NUM_VERTICES );
}

//----------------------------------------------------------------------------

const lowerArm = () => {
  const s = scale4(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
  const instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_ARM_HEIGHT, 0.0 ), s);
  const t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t));
  gl.drawArrays( gl.TRIANGLES, 0, NUM_VERTICES );
}

//----------------------------------------------------------------------------

const middleArm = () => {
  const s = scale4(MIDDLE_ARM_WIDTH, MIDDLE_ARM_HEIGHT, MIDDLE_ARM_WIDTH);
	const instanceMatrix = mult( translate( 0.0, 0.5 * MIDDLE_ARM_HEIGHT, 0.0 ), s);
	const t = mult(modelViewMatrix, instanceMatrix);
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(t));
	gl.drawArrays( gl.TRIANGLES, 0, NUM_VERTICES );
}

//----------------------------------------------------------------------------

const upperArm = () => {
  const s = scale4(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
  const instanceMatrix = mult(translate( 0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ), s);
  const t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t));
  gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTICES);
}

//----------------------------------------------------------------------------

const render = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  modelViewMatrix = rotate(theta[Base], 0, 1, 0);
  base();

  modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerArm], 0, 0, 1 ));
  lowerArm();

  modelViewMatrix = mult(modelViewMatrix, translate(0.0, LOWER_ARM_HEIGHT, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(theta[MiddleArm], 0, 0, 1) );
  middleArm();
  
  modelViewMatrix = mult(modelViewMatrix, translate(0.0, MIDDLE_ARM_HEIGHT, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1));

  upperArm();
  requestAnimFrame(render);
}