#version 300 es
precision highp float;
precision highp sampler2D;

uniform float uDt; // timestep
uniform float uAlpha;
uniform float uRBeta; // reciprocal beta
uniform float uInvGrid; // 1 / grid scale
uniform sampler2D uVelocity; // input velocity

in vec2 vUv;
out vec4 fragColor;

void main() {
	// Follow the velocity field "back in time"
	vec2 pos = vUv - uDt * uInvGrid * texture(uVelocity, vUv).xy;

	// Interpolate and write to the output fragment
	fragColor = texture(uQty, pos);
}
