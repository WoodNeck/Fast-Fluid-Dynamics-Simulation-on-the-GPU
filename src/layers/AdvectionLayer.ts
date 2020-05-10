import * as THREE from "three";

import Layer from "./Layer";
import EffectPlane from "~/entities/EffectPlane";
import advectVS from "../shaders/advect.vs";
import advectFS from "../shaders/advect.fs";

export default class AdvectionLayer extends Layer {
	private _scene: THREE.Scene;
	private _camera: THREE.OrthographicCamera;
	private _effectPlane: EffectPlane;

	public get scene() { return this._scene; }
	public get camera() { return this._camera; }

	constructor() {
		super();

		this._scene = new THREE.Scene();

		this._camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);


		this._effectPlane = new EffectPlane({
			// TODO: Add uniforms here
		}, advectVS, advectFS);

		this._scene.add(this._effectPlane.mesh);
	}

	public updateScene(readTarget: THREE.WebGLRenderTarget) {
		// TODO: Update uniforms(if needed) here
	}

	// tslint:disable-next-line no-empty
	public resize(width: number, height: number) {}
}
