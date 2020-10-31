'use strict';

let gl; 
let canvas;
var get_pixel_flag = false;
var colour_x;
var colour_y;
var chosen_fc_loc;
var box_g_loc;
var hue_g_loc;
var chosen_g_loc;
var h_loc;
var hue_deg = 0.0;
var sat_pc = 0.0;
var val_pc = 0.0;
let pa, pb, pc;
let paBuffer, pbBuffer, pcBuffer;

var data = [
	-1.0,  1.0,
	-1.0, -1.0,
	 1.0,  1.0,
	 1.0,  1.0,
	-1.0, -1.0,
	 1.0, -1.0,
];

var data_hue = [
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

var data_chosen = [
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

	// ======= Part A ======= // 
	pa = initShaders(gl, 'vertex-shader-a', 'fragment-shader-a');
	gl.useProgram(pa);
	
	paBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, paBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);

	h_loc = gl.getUniformLocation (pa, "h");
	box_g_loc = gl.getUniformLocation (pa, "g");
	gl.useProgram (pa);
	gl.uniform1f (h_loc, 0.0);
	gl.uniform1f (box_g_loc, 1.0);

	// ======= Part B ======= // 
	pb = initShaders(gl, 'vertex-shader-b', 'fragment-shader-b');
	gl.useProgram(pb);
	
	pbBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pbBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(data_hue), gl.STATIC_DRAW);

	hue_g_loc = gl.getUniformLocation (pb, "g");
	gl.useProgram (pb);
	gl.uniform1f (hue_g_loc, 1.0);
	
	// ======= Part C ======= // 
	pc = initShaders(gl, 'vertex-shader-c', 'fragment-shader-c');
	gl.useProgram(pc);

	pcBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pcBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(data_chosen), gl.STATIC_DRAW);

	chosen_fc_loc = gl.getUniformLocation (pc, "fc");
	chosen_g_loc = gl.getUniformLocation (pc, "g");
	gl.useProgram (pc);
	gl.uniform3f (chosen_fc_loc, 0.0, 0.0, 0.0);
	gl.uniform1f (chosen_g_loc, 1.0);
	
	// ======= Click Event Stuff ======= // 
	canvas.onmousedown = e => {
		get_pixel_flag = true;
		var element = canvas;
		var top = 0;
		var left = 0;
		while (element && element.tagName !== 'body') {
			top += element.offsetTop;
			left += element.offsetLeft;
			element = element.offsetParent;
		}
		left += window.pageXOffset;
		top -= window.pageYOffset;
		colour_x = e.clientX - left;
		colour_y = (e.clientY - top);

		if (colour_x >= canvas.width || colour_y >= canvas.height) {
			return;
		}
		render();
	}
	document.onmouseup = () => {
		get_pixel_flag = false;
		render();
	}
	canvas.onmousemove = e => {
		if (!get_pixel_flag) return;
		var element = canvas;
		var top = 0;
		var left = 0;
		while (element && element.tagName !== 'body') {
			top += element.offsetTop;
			left += element.offsetLeft;
			element = element.offsetParent;
		}
		left += window.pageXOffset;
		top -= window.pageYOffset;
		colour_x = e.clientX - left;
		colour_y = (e.clientY - top);
		if (colour_x >= canvas.width || colour_y >= canvas.height) {
			return;
		}
		render();
	}

	render();
}

function render() {
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

	if (get_pixel_flag) {
		// hue picker
		if (colour_x > 0.875 * canvas.width && colour_y < 0.75 * canvas.height) {
			var pixel = new Uint8Array (1 * 1 * 4); // 4 channels 1x1 size
			gl.readPixels (
				colour_x,
				canvas.height - colour_y,
				1,
				1,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				pixel
			);
			
			hue_deg = Math.floor (360 - (colour_y / (0.75 * canvas.height)) * 361);
			// hack to make to work all the way to pure red at the top without falling off
			if (hue_deg == 360) {
				hue_r = 1.0;
				hue_g = 0.0;
				hue_b = 0.0;
			}
			// hue colour affects main chooser box
			gl.useProgram (pa);
			gl.uniform1f (h_loc, hue_deg);
		}
		
		// main SV box
		if (colour_x < 0.75 * canvas.width && colour_y < 0.75 * canvas.height) {
			sat_pc = Math.floor (100 - colour_y / (canvas.height * 0.75) * 101);
			val_pc = Math.floor (colour_x / (canvas.width * 0.75) * 101);
		}
		
		var chroma = (val_pc * 0.01) * (sat_pc * 0.01);
		var hue_dash = hue_deg / 60.0;
		var x = chroma * (1.0 - Math.abs (hue_dash % 2.0 - 1.0));
		var r = 0.0;
		var g = 0.0;
		var b = 0.0;
		//console.log (hue_dash, chroma, x);
		if (hue_dash < 1.0) {
			r = chroma;
			g = x;
		} else if (hue_dash < 2.0) {
			r = x;
			g = chroma;
		} else if (hue_dash < 3.0) {
			g = chroma;
			b = x;
		} else if (hue_dash < 4.0) {
			g = x;
			b = chroma;
		} else if (hue_dash < 5.0) {
			r = x;
			b = chroma;
		} else {
			r = chroma;
			b = x;
		}
		var minv = (val_pc * 0.01) - chroma;

		r += minv;
		g += minv;
		b += minv;
		
		gl.useProgram (pc);
		gl.uniform3f (chosen_fc_loc, r, g, b);
		

		const rgb = val => Math.floor(val * 255.0);
		const getHex = d => {
			let hex = Number(d).toString(16).toUpperCase();
			while (hex.length < 2) hex = `0${hex}`;
			return hex;
		}

		document.getElementById('rgb').innerHTML = `${rgb(r)}, ${rgb(g)}, ${rgb(b)}`;
		document.getElementById ("hex").innerHTML = `#${getHex(rgb(r))}${getHex(rgb(g))}${getHex(rgb(b))}`;
	}
}