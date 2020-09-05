'use strict';

var gl;
var theta = 0.0;
var thetaLoc;
var speed = 100;
var direction = true;
var fcolorLoc;
var fcolor = vec4( 1.0, 0.0, 0.0, 1.0 ); // default to red

window.onload = function init() {
  const canvas = document.getElementById('gl-canvas');

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) alert( 'WebGL is not available' );

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //  Load shaders and initialize attribute buffers
  const program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  const vertices = [
    vec2(0, 1),
    vec2(-1,0),
    vec2(1, 0),
    vec2(0, -1)
  ];

  // Load the data into the GPU
  const bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer
  const vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  thetaLoc = gl.getUniformLocation(program, 'theta');
  fcolorLoc = gl.getUniformLocation(program, 'fcolor');

  // Initialize event handlers
  document.getElementById('slider').onchange = e => (speed = 100 - e.target.value);
  document.getElementById('Direction').onclick = () => (direction = !direction);

  document.getElementById('Controls').onclick = ({ target }) => {
    switch(target.index) {
      case 0:
        direction = !direction;
        break;
      case 1:
        speed /= 2.0;
        break;
      case 2:
        speed *= 2.0;
        break;
      case 3:
        fcolor = vec4(1.0, 0.0, 0.0, 1.0);
        break;
      case 4:
        fcolor = vec4(0.0, 1.0, 0.0, 1.0);
        break;
      case 5:
        fcolor = vec4(0.0, 0.0, 1.0, 1.0);
        break;
      case 6:
        fcolor = vec4(0.0, 0.0, 0.0, 1.0);
        break;
    }
  }

  window.onkeydown = ({ keyCode }) => {
    const key = String.fromCharCode(keyCode);
    switch(key) {
      case '1':
        direction = !direction;
        break;
      case '2':
        speed /= 2.0;
        break;
      case '3':
        speed *= 2.0;
        break;
      case '4':
        fcolor = vec4(1.0, 0.0, 0.0, 1.0);
        break;
      case '5':
        fcolor = vec4(0.0, 1.0, 0.0, 1.0);
        break;
      case '6':
        fcolor = vec4(0.0, 0.0, 1.0, 1.0);
        break;
      case '7':
        fcolor = vec4(0.0, 0.0, 0.0, 1.0);
        break;
    }
  }

  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  theta += (direction ? 0.1 : -0.1);
  gl.uniform1f(thetaLoc, theta);
  gl.uniform4f(fcolorLoc, fcolor[0], fcolor[1], fcolor[2], fcolor[3]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  setTimeout(() => requestAnimFrame(render), speed);
}
