'use strict';

let color = {};
let pa, pb, pc;
let flag = false;
let gl, canvas, choice;
let bgLoc, hgLoc, cgLoc, hueLoc;
let paBuffer, pbBuffer, pcBuffer;
let hue = 0.0, sat = 0.0, val = 0.0;

const pointsa = [
	-1.0,  1.0,
	-1.0, -1.0,
	 1.0,  1.0,
	 1.0,  1.0,
	-1.0, -1.0,
	 1.0, -1.0,
];

const pointsb = [
	1.0,  1.0, 1.0, 0.0, 0.0,
	-1.0,  1.0, 1.0, 0.0, 0.0,
	1.0,  0.667, 1.0, 0.0, 1.0,
	-1.0,  0.667, 1.0, 0.0, 1.0,
	1.0,  0.333, 0.0, 0.0, 1.0,
	-1.0,  0.333, 0.0, 0.0, 1.0,
	1.0,  0.0, 0.0, 1.0, 1.0,
	-1.0,  0.0, 0.0, 1.0, 1.0,
	1.0, -0.333, 0.0, 1.0, 0.0,
	-1.0, -0.333, 0.0, 1.0, 0.0,
	1.0, -0.667, 1.0, 1.0, 0.0,
	-1.0, -0.667, 1.0, 1.0, 0.0,
	1.0, -1.0, 1.0, 0.0, 0.0,
	-1.0, -1.0, 1.0, 0.0, 0.0
];

const pointsc = [
	-1.0,  1.0,
	-1.0, -1.0,
	 1.0,  1.0,
	 1.0,  1.0,
	-1.0, -1.0,
	 1.0, -1.0
];

window.onload = () => {
  canvas = document.getElementById('gl-canvas');
  
  gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) alert('WebGL is not available');

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.2, 0.2, 0.2, 0.0);

	gl.enable(gl.DEPTH_TEST);

	// ============= Part A ========== // 
	pa = initShaders(gl, 'vertex-shader-a', 'fragment-shader-a');
	gl.useProgram(pa);
	
	paBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, paBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsa), gl.STATIC_DRAW);

	hueLoc = gl.getUniformLocation(pa, 'h');
	bgLoc = gl.getUniformLocation(pa, 'g');
	gl.useProgram(pa);
	gl.uniform1f(hueLoc, 0.0);
	gl.uniform1f(bgLoc, 1.0);

	// ========== Part B ========== // 
	pb = initShaders(gl, 'vertex-shader-b', 'fragment-shader-b');
	gl.useProgram(pb);
	
	pbBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pbBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsb), gl.STATIC_DRAW);

	hgLoc = gl.getUniformLocation(pb, 'g');
	gl.useProgram(pb);
	gl.uniform1f(hgLoc, 1.0);
	
	// ========== Part C ========== // 
	pc = initShaders(gl, 'vertex-shader-c', 'fragment-shader-c');
	gl.useProgram(pc);

	pcBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pcBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsc), gl.STATIC_DRAW);

	choice = gl.getUniformLocation(pc, 'fc');
	cgLoc = gl.getUniformLocation(pc, 'g');
	gl.useProgram(pc);
	gl.uniform3f(choice, 0.0, 0.0, 0.0);
	gl.uniform1f(cgLoc, 1.0);
	
	// ========== Event Handlers ========== // 
	canvas.onmousedown = e => setScene(e);
	canvas.onmousemove = e => setScene(e);
	document.onmouseup = () => {
		flag = false;
		render();
	}

	render();
}

const render = () => {
	buildProgram();
	if (flag) {
		if (color.x > 0.875 * canvas.width && color.y < 0.75 * canvas.height) {
			gl.readPixels(color.x, canvas.height - color.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(1 * 1 * 4));
			hue = Math.floor(360 - (color.y / (0.75 * canvas.height)) * 361);

			if (hue === 360) {
				hue_r = 1.0;
				hue_g = 0.0;
				hue_b = 0.0;
			}

			gl.useProgram(pa);
			gl.uniform1f(hueLoc, hue);
		}
		
		if (color.x < 0.75 * canvas.width && color.y < 0.75 * canvas.height) {
			sat = Math.floor(100 - color.y / (canvas.height * 0.75) * 101);
			val = Math.floor(color.x / (canvas.width * 0.75) * 101);
		}
		
		let r = 0.0, g = 0.0, b = 0.0;
		const saturation = (val * 0.01) * (sat * 0.01);
		const scale = hue / 60.0;
		const x = saturation * (1.0 - Math.abs (scale % 2.0 - 1.0));

		if (scale < 1.0) {
			r = saturation;
			g = x;
		} else if (scale < 2.0) {
			r = x;
			g = saturation;
		} else if (scale < 3.0) {
			g = saturation;
			b = x;
		} else if (scale < 4.0) {
			g = x;
			b = saturation;
		} else if (scale < 5.0) {
			r = x;
			b = saturation;
		} else {
			r = saturation;
			b = x;
		}

		r += (val * 0.01) - saturation;
		g += (val * 0.01) - saturation;
		b += (val * 0.01) - saturation;
		
		gl.useProgram(pc);
		gl.uniform3f(choice, r, g, b);

		const rgb = val => Math.floor(val * 255.0);
		const getHex = d => {
			let hex = Number(d).toString(16).toUpperCase();
			while (hex.length < 2) hex = `0${hex}`;
			return hex;
		}

		document.getElementById('rgb').innerHTML = `${rgb(r)}, ${rgb(g)}, ${rgb(b)}`;
		document.getElementById('hex').innerHTML = `#${getHex(rgb(r))}${getHex(rgb(g))}${getHex(rgb(b))}`;
	}
}

const setScene = e => {
	flag = e.type === 'mousedown' ? true : (e.type === 'mouseup' ? false : flag);
	let currCanvas = canvas;
	let top = 0, left = 0;

	while (currCanvas && currCanvas.tagName !== 'body') {
		top += currCanvas.offsetTop;
		left += currCanvas.offsetLeft;
		currCanvas = currCanvas.offsetParent;
	}
	
	left += window.pageXOffset;
	top -= window.pageYOffset;
	color.x = e.clientX - left;
	color.y = (e.clientY - top);
	render();
}

const buildProgram = () => {
	gl.useProgram(pa);
	gl.bindBuffer(gl.ARRAY_BUFFER, paBuffer);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
	gl.enableVertexAttribArray(0);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	gl.disableVertexAttribArray(0);
	
	gl.useProgram(pb);
	gl.bindBuffer(gl.ARRAY_BUFFER, pbBuffer);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 20, 0);
	gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 20, 8);
	gl.enableVertexAttribArray(0);
	gl.enableVertexAttribArray(1);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 14);
	gl.disableVertexAttribArray(0);
	gl.disableVertexAttribArray(1);
	
	gl.useProgram(pc);
	gl.bindBuffer(gl.ARRAY_BUFFER, pcBuffer);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
	gl.enableVertexAttribArray(0);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	gl.disableVertexAttribArray(0);
}