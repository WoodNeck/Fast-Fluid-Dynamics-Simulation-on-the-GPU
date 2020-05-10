#version 300 es
precision highp float;
precision highp sampler2D;

uniform float uDt;
uniform float uInvGrid; // 1 / grid scale
uniform sampler2D uVelocity; // input velocity
uniform sampler2D uQty; // qty to advect

in vec2 vUv;
out vec4 fragColor;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
	vec2 st = uv / tsize - 0.5;
	vec2 iuv = floor(st);
	vec2 fuv = fract(st);
	vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
	vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
	vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
	vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
	return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void advect(in vec2 coords, out vec4 xNew) {
	// vec2 pos = coords - uDt * rdx * f2texRECT(u, coords);

	// vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * texelSize;
	// vec4 result = texture2D(uVelocity, coord);
}

void main() {
	// u = advect(u);
	// u = diffuse(u);
	// u = addForces(u);
	// Now apply the projection operator to the result.
	// p = computePressure(u);
	// u = subtractPressureGradient(u, p);

	fragColor = vec4(vUv, 0, 1);
}
