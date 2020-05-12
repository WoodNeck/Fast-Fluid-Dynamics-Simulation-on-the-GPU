#version 300 es
precision highp float;
precision highp sampler2D;

uniform float uDt; // timestep
uniform float uGrid; // grid scale
uniform float uInvGrid; // 1 / grid scale
uniform sampler2D uVelocity; // input velocity
uniform sampler2D uQty; // qty to advect

in vec2 vUv;
out vec4 fragColor;

vec4 texBilerp(in sampler2D tex, in vec2 uv) {
	vec2 st = uv * uGrid - 0.5;
	vec2 iuv = floor(st);
	vec2 fuv = floor(st);

	vec4 xLB = texture(tex, (iuv + vec2(0.5, 0.5))) * uInvGrid;
	vec4 xRB = texture(tex, (iuv + vec2(1.5, 0.5))) * uInvGrid;
	vec4 xLT = texture(tex, (iuv + vec2(0.5, 1.5))) * uInvGrid;
	vec4 xRT = texture(tex, (iuv + vec2(1.5, 1.5))) * uInvGrid;

	return mix(mix(xLB, xRB, fuv.x), mix(xLT, xRT, fuv.x), fuv.y);
}

void main() {
	// Follow the velocity field "back in time"
	vec2 pos = vUv - uDt * uInvGrid * texBilerp(uVelocity, vUv).xy;

	// Interpolate and write to the output fragment
	fragColor = texBilerp(uQty, pos);
}
