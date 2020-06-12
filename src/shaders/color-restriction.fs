#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uTex;
uniform sampler2D uPalette;

in vec2 vUv;
out vec4 fragColor;

vec2 getPaletteUV(vec4 col) {
	vec3 mappedColors = floor(col.rgb * 15.);
	float mappedI = mappedColors.r * 256. + mappedColors.g * 16. + mappedColors.b;
	return vec2(mod(mappedI, 64.), mappedI / 64.) / 64.;
	// return vec2(col.r, col.r);
}

void main() {
	vec4 albedo = texture(uTex, vUv);
  vec2 pUV = getPaletteUV(albedo);
	vec4 restricted = texture(uPalette, pUV);
	fragColor = restricted;
}
