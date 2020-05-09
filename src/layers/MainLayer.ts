import * as THREE from "three";

import Layer from "./Layer";
import EffectPlane from "~/entities/EffectPlane";
import mainVS from "../shaders/main.vs";
import mainFS from "../shaders/main.fs";

export default class ForegroundLayer extends Layer {
	private _scene: THREE.Scene;
	private _camera: THREE.OrthographicCamera;
	private _effectPlane: EffectPlane;

	public get scene() { return this._scene; }
	public get camera() { return this._camera; }

	constructor() {
		super();

		this._scene = new THREE.Scene();

		this._camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
		this._camera.position.z = 5;
		this._camera.updateProjectionMatrix();

		this._effectPlane = new EffectPlane({
			// TODO: Add uniforms here
		}, mainVS, mainFS);

		this._scene.add(this._effectPlane.mesh);
	}

	public updateScene(readTarget: THREE.WebGLRenderTarget) {
		// TODO: Update uniforms(if needed) here
	}

	// tslint:disable-next-line no-empty
	public resize(width: number, height: number) {}
}
