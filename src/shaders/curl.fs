#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uVelocity;

in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;

void main() {
	float wL = texture(uVelocity, vL).y;
	float wR = texture(uVelocity, vR).y;
	float wT = texture(uVelocity, vT).x;
	float wB = texture(uVelocity, vB).x;

	fragColor = vec4(0.5 * ((wR - wL) - (wT - wB)), 0, 0, 1.0);
}
