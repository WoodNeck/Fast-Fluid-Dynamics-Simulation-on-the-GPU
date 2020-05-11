import * as THREE from "three";
import Pass from "./passes/Pass";

import * as EVENTS from "./consts/events";
import { Updateable } from "./types/common";

export default class Renderer implements Updateable {
	private _renderer: THREE.WebGLRenderer;
	private _passes: Pass[];

	public get size() { return this._renderer.getDrawingBufferSize(new THREE.Vector2(0, 0)); }

	constructor(canvasElem: HTMLCanvasElement) {
		const ctx = canvasElem.getContext("webgl2");

		this._renderer = new THREE.WebGLRenderer({
			canvas: canvasElem,
			antialias: true,
			context: ctx as WebGLRenderingContext,
		});

		this._passes = [];
	}

	public resize(width: number, height: number): void {
		const renderer = this._renderer;

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width, height);
	}

	public addPass(pass: Pass) {
		this._passes.push(pass);
	}

	public render() {
		for (const pass of this._passes) {
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
	}

	// tslint:disable-next-line no-empty
	public update(ms: number) {}
}
