#version 300 es
precision highp float;
precision highp sampler2D;

uniform float uCurl;
uniform float uDt;
uniform sampler2D uVelocity;
uniform sampler2D uCurlTex;


in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
in vec2 vUv;
out vec4 fragColor;

void main() {
	float wL = texture(uCurlTex, vL).x;
	float wR = texture(uCurlTex, vR).x;
	float wT = texture(uCurlTex, vT).x;
	float wB = texture(uCurlTex, vB).x;
	float wC = texture(uCurlTex, vUv).x;

	vec2 force = 0.5 * vec2(abs(wT) - abs(wB), abs(wR) - abs(wL));
	force /= length(force) + 0.0001;
	force *= uCurl * wC;
	force.y *= -1.0;

	vec2 vel = texture(uVelocity, vUv).xy;
	fragColor = vec4(vel + force * uDt, 0.0, 1.0);
}
