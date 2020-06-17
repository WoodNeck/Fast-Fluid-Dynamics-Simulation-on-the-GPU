#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uTex;

uniform float uEdge0;
uniform float uEdge1;
uniform float uEdge2;

uniform vec4[4] uPalette;

in vec2 vUv;
out vec4 fragColor;

void main() {
	vec4 albedo = texture(uTex, vUv);
	int edge0 = int(step(albedo.r * .5, uEdge0));
	int edge1 = int(step(albedo.r * .5, uEdge1));
	int edge2 = int(step(albedo.r * .5, uEdge2));
	int colIdx = edge0 + edge1 + edge2;

	fragColor = uPalette[colIdx];
}
