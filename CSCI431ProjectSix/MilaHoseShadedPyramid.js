'use strict'

let canvas;
let gl;

let ctm;
let diffuseColor;
let ambientColor;
let specularColor;
let modelView, projection;
let viewerPos;
let program;

let pointsArray = [];
let normalsArray = [];

let xAxis = 0;
let yAxis = 1;
let zAxis = 2;
let axis = 0;
let theta =[0, 0, 0];
let thetaLoc;

let flag = true;
let colors = [];

const vertices = [
  vec4(0.5, -0.2722, 0.2886),
  vec4(0.0, -0.2772, -0.5773),
  vec4(-0.5, -0.22772, 0.2886),
  vec4( 0.0, 0.5443, 0.0)
];

const vertexColors = [
  [ 0.0, 0.0, 0.0, 1.0 ], // black
  [ 1.0, 0.0, 0.0, 1.0 ], // red
  [ 0.0, 1.0, 0.0, 1.0 ], // green
  [ 0.0, 0.0, 1.0, 1.0 ]  // blue
];

let lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
let lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
let lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
let lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

let materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
let materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
let materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
let materialShininess = 100.0;

const triple = (a, b, c) => {
  const t1 = subtract(vertices[b], vertices[a]);
  const t2 = subtract(vertices[c], vertices[b]);
  let normal = cross(t1, t2);
  normal = vec3(normal);

  pointsArray.push(vertices[a]);
  colors.push(vertexColors[a]);
  normalsArray.push(normal);
  pointsArray.push(vertices[b]);
  colors.push(vertexColors[b]);
  normalsArray.push(normal);
  pointsArray.push(vertices[c]);
  colors.push(vertexColors[c]);
  normalsArray.push(normal);
}


const colorPyramid = () => {  
	triple( 1, 0, 2);
  triple( 2, 3, 1);
  triple( 3, 0, 1);
  triple( 0, 2, 3);
}

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
  
  colorPyramid();

	const cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  const vColor = gl.getAttribLocation(program, 'vColor');
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  const nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
  
	const vNormal = gl.getAttribLocation(program, 'vNormal');
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
  
  const vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  thetaLoc = gl.getUniformLocation(program, 'theta'); 
  viewerPos = vec3(0.0, 0.0, -20.0);
  projection = ortho(-1, 1, -1, 1, -100, 100);
  
  const ambientProduct = mult(lightAmbient, materialAmbient);
  const diffuseProduct = mult(lightDiffuse, materialDiffuse);
  const specularProduct = mult(lightSpecular, materialSpecular);

  document.getElementById('ButtonX').onclick = () => (axis = xAxis);
  document.getElementById('ButtonY').onclick = () => (axis = yAxis);
  document.getElementById('ButtonZ').onclick = () => (axis = zAxis);
  document.getElementById('ButtonT').onclick = () => (flag = !flag);

  gl.uniform4fv(gl.getUniformLocation(program, 'ambientProduct'), flatten(ambientProduct));
  gl.uniform4fv(gl.getUniformLocation(program, 'diffuseProduct'), flatten(diffuseProduct));
  gl.uniform4fv(gl.getUniformLocation(program, 'specularProduct'), flatten(specularProduct));	
  gl.uniform4fv(gl.getUniformLocation(program, 'lightPosition'), flatten(lightPosition));
  gl.uniform1f(gl.getUniformLocation(program, 'shininess'),materialShininess);
  gl.uniformMatrix4fv( gl.getUniformLocation(program, 'projectionMatrix'), false, flatten(projection));
  
  render();
}

const render = function() {          
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          
  if (flag) theta[axis] += 2.0;
          
  modelView = mat4();
  modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
  modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
  modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));
  
  gl.uniformMatrix4fv( gl.getUniformLocation(program, 'modelViewMatrix'), false, flatten(modelView));
  gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length);
          
  requestAnimFrame(render);
}