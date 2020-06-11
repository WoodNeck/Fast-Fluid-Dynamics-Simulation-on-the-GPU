#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uPressure;
uniform sampler2D uDivergence;

in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
in vec2 vUv;
out vec4 fragColor;

void main() {
	float wL = texture(uPressure, vL).x;
	float wR = texture(uPressure, vR).x;
	float wT = texture(uPressure, vT).x;
	float wB = texture(uPressure, vB).x;
	float wC = texture(uPressure, vUv).x;

	float divergence = texture(uDivergence, vUv).x;
	float pressure = 0.25 * (wL + wR + wT + wB - divergence);
	fragColor = vec4(pressure, 0, 0, 1);
}
