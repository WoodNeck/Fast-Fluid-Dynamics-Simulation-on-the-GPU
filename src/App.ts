import Renderer from "./Renderer";
import FBO from "./FBO";
import AdvectionPass from "./passes/AdvectionPass";
import CopyPass from "./passes/CopyPass";
import * as EVENTS from "./consts/events";

class App {
	private _renderer: Renderer;
	private _advection: FBO;

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
		this._advection = new FBO();
	}

	private _composePass() {
		const renderer = this._renderer;
		const advection = this._advection;

		const advectionPass = new AdvectionPass();
		advectionPass.on(EVENTS.BEFORE_RENDER, () => {
			advectionPass.target = advection.writeTarget;
		});
		advectionPass.on(EVENTS.AFTER_RENDER, () => {
			advection.swap();
		});

		const copyPass = new CopyPass();
		copyPass.on(EVENTS.BEFORE_RENDER, () => {
			copyPass.plane.updateUniforms({
				uTex: advection.readTarget.texture,
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

		this._advection.resize(width, height);
	}
}

export default App;
