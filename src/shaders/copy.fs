#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uTex;

in vec2 vUv;
out vec4 fragColor;

void main() {
	fragColor = texture(uTex, vUv);
}
