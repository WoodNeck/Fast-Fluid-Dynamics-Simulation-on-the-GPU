import * as THREE from "three";
import Renderer from "./Renderer";
import FBO from "./FBO";
import AdvectionPass from "./passes/AdvectionPass";
import CopyPass from "./passes/CopyPass";
import * as EVENTS from "./consts/events";

class App {
	private _renderer: Renderer;
	private _velocity: FBO;
	private _pressure: FBO;
	private _vorticity: FBO;

	constructor() {
		const canvasBox = document.querySelector("#app") as HTMLCanvasElement;

		this._renderer = new Renderer(canvasBox);

		this._composeFBO();
		this._composePass();
		this._onResize();

		window.addEventListener("resize", this._onResize);
		requestAnimationFrame(this._render);
	}

	private _composeFBO() {
		this._velocity = new FBO(0, 0, {
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
		});
	}

	private _composePass() {
		const renderer = this._renderer;
		const velocity = this._velocity;

		const advectionPass = new AdvectionPass();
		advectionPass.on(EVENTS.BEFORE_RENDER, () => {
			advectionPass.target = velocity.writeTarget;
		});
		advectionPass.on(EVENTS.AFTER_RENDER, () => {
			velocity.swap();
		});

		const copyPass = new CopyPass();
		copyPass.on(EVENTS.BEFORE_RENDER, () => {
			copyPass.plane.updateUniforms({
				uTex: velocity.readTarget.texture,
			});
		});

		renderer.addPass(advectionPass);
		renderer.addPass(copyPass);
	}

	private _render = (t: number): void => {
		const renderer = this._renderer;

		// Update renderer & scenes
		renderer.update(t);

		// Render each scenes
		renderer.render();

		requestAnimationFrame(this._render);
	}

	private _onResize = () => {
		const width = window.innerWidth;
		const height = window.innerHeight;

		this._renderer.resize(width, height);

		this._velocity.resize(width, height);
	}
}

export default App;
