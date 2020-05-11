#version 300 es
precision highp float;
precision highp sampler2D;

uniform float uDt;
uniform float uInvGrid; // 1 / grid scale
uniform sampler2D uVelocity; // input velocity
uniform sampler2D uQty; // qty to advect

in vec2 vUv;
out vec4 fragColor;

void main() {
	// u = advect(u);
	// u = diffuse(u);
	// u = addForces(u);
	// Now apply the projection operator to the result.
	// p = computePressure(u);
	// u = subtractPressureGradient(u, p);

	fragColor = vec4(vUv, 0, 1);
}
