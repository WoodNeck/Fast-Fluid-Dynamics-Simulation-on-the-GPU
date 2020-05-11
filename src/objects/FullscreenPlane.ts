import * as THREE from "three";

class FullscreenPlane {
	private _material: THREE.RawShaderMaterial;
	private _mesh: THREE.Mesh;

	public get material() { return this._material; }
	public get mesh() { return this._mesh; }

	constructor(uniforms: {[key: string]: any}, vs: string, fs: string) {
		const material = new THREE.RawShaderMaterial({
			uniforms,
			vertexShader: vs,
			fragmentShader: fs,
		});
		const geometry = new THREE.PlaneGeometry(2, 2);

		this._mesh = new THREE.Mesh(geometry, material);
		this._material = material;
	}

	public updateUniforms(uniforms: {[key: string]: any}) {
		const material = this._material;

		Object.keys(uniforms).forEach(uniform => {
			material.uniforms[uniform] = new THREE.Uniform(uniforms[uniform]);
		});
		material.uniformsNeedUpdate = true;
	}
}

export default FullscreenPlane;
