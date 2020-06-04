#version 300 es
precision highp float;
precision highp sampler2D;

uniform float uDt; // timestep
uniform float uGrid; // grid scale
uniform float uInvGrid; // 1 / grid scale
uniform float uDissipation; // dissipation
uniform sampler2D uVelocity; // input velocity
uniform sampler2D uQty; // qty to advect

in vec2 vUv;
out vec4 fragColor;

void main() {
	// Follow the velocity field "back in time"
	vec2 pos = vUv - uDt * uInvGrid * texture(uVelocity, vUv).xy;

	// Interpolate and write to the output fragment
	fragColor = uDissipation * texture(uQty, pos);
	fragColor.a = 1.0;
}
