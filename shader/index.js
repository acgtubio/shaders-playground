// Create a canvas and append it to the document body
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

async function run(canvas) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	// Get WebGL rendering context
	const gl = canvas.getContext('webgl');
	if (!gl) {
		console.error('WebGL is not supported by your browser.');
		throw new Error('WebGL not supported');
	}

	// Vertex shader source code
	const vertexShaderSource = `
		attribute vec4 a_Position;
		void main() {
		    gl_Position = a_Position;
		}
	`;

	// Fragment shader source code (Cornflower Blue color)
	const fragmentShaderSource = await (await fetch('/shader/frag.glsl')).text();

	// Compile shader function
	function compileShader(type, source) {
		const shader = gl.createShader(type);
		if (!shader) {
			console.error('Unable to create shader');
			return null;
		}
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	}

	// Create shaders
	const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
	if (!vertexShader) throw new Error('Vertex shader compilation failed');

	const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
	if (!fragmentShader) throw new Error('Fragment shader compilation failed');

	// Create and link program
	const program = gl.createProgram();
	if (!program) throw new Error('Failed to create WebGL program');

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Error linking program:', gl.getProgramInfoLog(program));
		throw new Error('Program linking failed');
	}
	gl.useProgram(program);

	// Set up vertex data
	const vertices = new Float32Array([
		-1.0, -1.0, // Bottom left
		1.0, -1.0, // Bottom right
		-1.0, 1.0, // Top left
		1.0, 1.0  // Top right
	]);
	const buffer = gl.createBuffer();
	if (!buffer) throw new Error('Failed to create buffer');

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	const a_Position = gl.getAttribLocation(program, 'a_Position');
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	const u_mouse_loc = gl.getUniformLocation(program, 'u_mouse_loc');
	const u_resolution = gl.getUniformLocation(program, 'u_resolution');
	const u_time = gl.getUniformLocation(program, 'u_time');

	const screenResolution = {
		width: window.innerWidth,
		height: window.innerHeight
	};

	function updateResolutionUniform() {
		gl.uniform2f(u_resolution, screenResolution.height, screenResolution.width);
	}
	updateResolutionUniform();

	window.addEventListener('resize', (event) => {
		screenResolution.width = window.innerWidth;
		screenResolution.height = window.innerHeight;

		updateResolutionUniform();
	});

	canvas.addEventListener('mousemove', (event) => {
		const rect = canvas.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = rect.bottom - event.clientY;
		gl.uniform2f(u_mouse_loc, mouseX, mouseY);
	});

	function getNormalTime() {
		const ms = new Date().getUTCMilliseconds();

		let t = ms / (1000) * Math.PI;

		return t;
	}

	// Draw the scene
	function render() {
		// Update time
		gl.uniform1f(u_time, getNormalTime());

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		requestAnimationFrame(render);
	}

	render();
}

run(canvas);
