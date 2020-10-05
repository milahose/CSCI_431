//"use strict";

var canvas;
var gl;

var numVertices  = 36;

var texSize = 64;

var program;

var pointsArray = [];
var texCoordsArray = [];

var magic = false;
var count = 0;

var start = 0; // start index for six cards

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

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;
var theta = [45.0, 45.0, 45.0];

var thetaLoc;

var textures = []; // changed
var images = [];
var imageNames = ["texImage1", "texImage2", "texImage3", "texImage4", "texImage5", "texImage6",
                  "texImage7", "texImage8", "texImage9", "texImage10", "texImage11", "texImage12"];

function configureTexture( images ) {
    for(i = 0; i < 12; i++){
        var texture = gl.createTexture();
        gl.bindTexture( gl.TEXTURE_2D, texture );
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[i] );
        gl.generateMipmap( gl.TEXTURE_2D );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
        // use option LINEAR and LINEAR_MIPMAP_LINEAR to fit non power of 2
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
        textures.push(texture);
    }
}

const triple = (a, b, c) => {
	pointsArray.push(vertices[a]);  
	texCoordsArray.push(texCoord[0]);

	pointsArray.push(vertices[b]);
	texCoordsArray.push(texCoord[1]); 

	pointsArray.push(vertices[c]); 
	texCoordsArray.push(texCoord[2]); 
}

const colorPyramid = () => {  
	triple( 1, 0, 2);
  triple( 2, 3, 1);
  triple( 3, 0, 1);
  triple( 0, 2, 3);
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorPyramid();

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    for(i = 0; i < 12; i++){ // generate image arrays
        var image = document.getElementById(imageNames[i]);
        images.push(image);
    }

    configureTexture( images );

    thetaLoc = gl.getUniformLocation(program, "theta");

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("DoneButton").onclick = function(){
        magic = true;
        count = 0;
        //start = (start + 6)%12
    };
    render();

}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, flatten(theta));
    if(magic){
        theta[0] += 30;
        theta[1] += 30;
        theta[2] += 30;
        count++;
        if(count == 100)
            start = (start + 6)%12;
        if(count == 200){
            magic = false;
            axis = (axis+1)%3;
            count = 0;
        }
            
    }

    for(i = 0; i < 6; i++){ // bind different textures to draw
        gl.bindTexture( gl.TEXTURE_2D, textures[i+start] );
        gl.drawArrays( gl.TRIANGLES, 6*i, 6 ); // third argument is how many points to draw
    }
    requestAnimFrame(render);
}
