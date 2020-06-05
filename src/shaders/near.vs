#version 300 es
precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec2 uTexelSize;

in vec3 position;
in vec2 uv;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;

void main() {
	vUv = uv;
	vL = vUv - vec2(uTexelSize.x, 0.0);
	vR = vUv + vec2(uTexelSize.x, 0.0);
	vT = vUv + vec2(0.0, uTexelSize.y);
	vB = vUv - vec2(0.0, uTexelSize.y);

	gl_Position = vec4(position, 1.0);
}
