#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uTex;
uniform float uAspect;
uniform vec3 uCol;
uniform vec2 uPoint;
uniform float uRadius;

in vec2 vUv;
out vec4 fragColor;

void main () {
		vec2 p = vUv - uPoint.xy;
		p.x *= uAspect;
		vec3 splat = exp(-dot(p, p) / uRadius) * uCol;
		vec3 base = texture(uTex, vUv).xyz;
		fragColor = vec4(base + splat, 1.0);
}
