#define PI 3.1415926535897932384626433832795

precision mediump float;

uniform float u_time;
uniform vec2 u_mouse_loc;
uniform vec2 u_resolution;

vec3 colorA = vec3(0.149,0.141,0.912);
vec3 colorB = vec3(1.000,0.833,0.224);

vec4 red() {
	return vec4(1.0, 0.0, 0.0, 1.0);
}

float plot(vec2 st, float pct) {
	return smoothstep(pct - 0.02, pct, st.y) -
		smoothstep(pct, pct + 0.02, st.y);
}

void oldStuff1() {
	vec2 st = gl_FragCoord.xy/u_resolution;
	// float y = smoothstep(0.1, 0.9, st.x);
	// float y = 1.0 - pow(abs(st.x), 0.5);
	float y = pow(cos(PI * st.x / 1.0), 0.5);

	vec3 color = vec3(y);

	float pct = plot(st, y);
	color = (1.0 - pct) * color + pct * vec3(0.0, 1.0, 0.0);

	gl_FragColor = vec4(color, 1.0);
}

void main() {
	vec3 color = vec3(0.0);

	float pct = abs(sin(u_time));

	color = mix(colorA, colorB, pct);

	gl_FragColor = vec4(color, 1.0);
}
