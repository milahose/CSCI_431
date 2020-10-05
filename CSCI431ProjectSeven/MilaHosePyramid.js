'use strict'

let canvas;
let gl;

let c;
let t1, t2;
let program;
let thetaLoc;
let modelView;
let texture1, texture2;

let flag = true;
let texSize = 256;
let numChecks = 8;

let axis = 0;
let xAxis = 0;
let yAxis = 1;
let zAxis = 2;
let theta =[0, 0, 0];

let pointsArray = [];
let colorsArray = [];
let texCoordsArray = [];

const image1 = new Uint8Array(4 * texSize * texSize);
for (let i = 0; i < texSize; i++) {
	for (let j = 0; j < texSize; j++) {
		const patchx = Math.floor(i / (texSize / numChecks));
		const patchy = Math.floor(j / (texSize / numChecks));
		c = (patchx % 2 ^ patchy % 2) ? 255 : 0;
		image1[4*i*texSize+4*j] = c;
		image1[4*i*texSize+4*j+1] = c;
		image1[4*i*texSize+4*j+2] = c;
		image1[4*i*texSize+4*j+3] = 255;
	}
}
    
const image2 = new Uint8Array(4 * texSize * texSize);
// Create a checkerboard pattern
for (let i = 0; i < texSize; i++) {
	for (let j = 0; j <texSize; j++)  {
		let idx = 4 * i * texSize + 4 * j;
		let val = 127 + 127 * Math.sin(0.1 * i * j);
		image2[idx] = val;
		image2[idx + 1] = val;
		image2[idx + 2] = val;
		image2[idx + 3] = 255;
	}
}

const texCoord = [
	vec2(0, 0),
	vec2(0, 1),
	vec2(1, 1),
	vec2(1, 0)
];

const vertices = [
  vec4(0.5, -0.2722, 0.2886),
  vec4(0.0, -0.2772, -0.5773),
  vec4(-0.5, -0.22772, 0.2886),
  vec4( 0.0, 0.5443, 0.0)
];

var vertexColors = [
	vec4( 1.0, 0.0, 0.0, 1.0 ), // red
	vec4( 1.0, 1.0, 0.0, 1.0 ), // yellow
	vec4( 0.0, 1.0, 0.0, 1.0 ), // green
	vec4( 0.0, 0.0, 1.0, 1.0 ), // blue
	vec4( 1.0, 0.0, 1.0, 1.0 ), // magenta
	vec4( 0.0, 1.0, 1.0, 1.0 ), // white
	vec4( 0.0, 1.0, 1.0, 1.0 ), // cyan
	vec4( 0.0, 0.0, 0.0, 1.0 )  // black
];    

const configureTexture = () => {
	texture1 = gl.createTexture();       
	gl.bindTexture(gl.TEXTURE_2D, texture1);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	texture2 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture2);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

const triple = (a, b, c) => {
	pointsArray.push(vertices[a]); 
	colorsArray.push(vertexColors[a]); 
	texCoordsArray.push(texCoord[0]);

	pointsArray.push(vertices[b]); 
	colorsArray.push(vertexColors[a]);
	texCoordsArray.push(texCoord[1]); 

	pointsArray.push(vertices[c]); 
	colorsArray.push(vertexColors[a]);
	texCoordsArray.push(texCoord[2]); 
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
	
	const tBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
	
	const vTexCoord = gl.getAttribLocation( program, 'vTexCoord');
	gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vTexCoord);
    
	configureTexture();
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture1);
	gl.uniform1i(gl.getUniformLocation(program, 'Tex0'), 0);
					
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, texture2);
	gl.uniform1i(gl.getUniformLocation(program, 'Tex1'), 1);

	thetaLoc = gl.getUniformLocation(program, 'theta');

	document.getElementById('ButtonX').onclick = () => (axis = xAxis);
	document.getElementById('ButtonY').onclick = () => (axis = yAxis);
	document.getElementById('ButtonZ').onclick = () => (axis = zAxis);
	document.getElementById('ButtonT').onclick = () => (flag = !flag);
                   
  render();
}

const render = function() {          
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          
  if (flag) theta[axis] += 2.0;
	
	gl.uniform3fv(thetaLoc, theta);
	gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);
	requestAnimFrame(render);
}