import * as THREE from "three";
import Pass from "./passes/Pass";

import * as EVENTS from "./consts/events";
import { Updateable } from "./types/common";

export default class Renderer implements Updateable {
	private _renderer: THREE.WebGLRenderer;
	private _passes: Pass[];

	public get renderer() { return this._renderer; }
	public get gl() { return this._renderer.getContext(); }
	public get size() { return this._renderer.getSize(new THREE.Vector2()); }
	public get aspect() {
		const size = this.size;
		return size.x / size.y;
	}

	constructor(canvasElem: HTMLCanvasElement) {
		const ctx = canvasElem.getContext("webgl2");

		this._renderer = new THREE.WebGLRenderer({
			canvas: canvasElem,
			antialias: true,
			context: ctx as WebGLRenderingContext,
		});
		this._renderer.autoClear = false;

		const lerpExtension = this.gl.getExtension("OES_texture_float_linear");
		if (!lerpExtension) {
			throw new Error("Lerp extension is not enabled.");
		}

		this._passes = [];
	}

	public resize(width: number, height: number): void {
		const renderer = this._renderer;

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width, height, false);
	}

	public addPass(pass: Pass) {
		this._passes.push(pass);
	}

	public render() {
		for (const pass of this._passes) {
			this.renderSinglePass(pass);
		}
	}

	public renderSinglePass(pass: Pass) {
		const renderer = this._renderer;

		pass.trigger(EVENTS.BEFORE_RENDER);

		if (pass.target) {
			renderer.setRenderTarget(pass.target);
			renderer.render(pass.scene, pass.camera);
			renderer.setRenderTarget(null);
		} else {
			renderer.render(pass.scene, pass.camera);
		}

		pass.trigger(EVENTS.AFTER_RENDER);
	}

	public update(ms: number) {
		this._passes.forEach(pass => pass.update(ms));
	}
}
