import * as THREE from "three";
import Renderer from "./Renderer";
import FBO from "./FBO";
import AdvectionPass from "./passes/AdvectionPass";
import CopyPass from "./passes/CopyPass";
import * as EVENTS from "./consts/events";

class App {
	private _renderer: Renderer;
	private _clock: THREE.Clock;
	private _density: FBO;
	private _velocity: FBO;
	private _pressure: FBO;
	private _vorticity: FBO;

	constructor() {
		const canvasBox = document.querySelector("#app") as HTMLCanvasElement;

		this._clock = new THREE.Clock(true);
		this._renderer = new Renderer(canvasBox);

		this._composeFBO();
		this._onResize();
		this._composePass();

		window.addEventListener("resize", this._onResize);
		requestAnimationFrame(this._render);
	}

	private _composeFBO() {
		const width = 4096;
		const height = 4096;

		const quantity = new Float32Array(width * height);
		for (let j = 0; j < height; j++) {
			for (let i = 0; i < width; i++) {
				quantity[j * width + i] = Math.random();
			}
		}
		this._density = new FBO(0, 0, {
			type: THREE.FloatType,
			format: THREE.RedFormat,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
		});
		this._velocity = new FBO(0, 0, {
			type: THREE.FloatType,
			format: THREE.RGFormat,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
		});
	}

	private _composePass() {
		const renderer = this._renderer;
		const density = this._density;
		const velocity = this._velocity;

		const lerpExtension = this._renderer.gl.getExtension("OES_texture_float_linear");

		const advectVelocityPass = new AdvectionPass(Boolean(lerpExtension));
		advectVelocityPass.target = velocity.writeTarget;
		advectVelocityPass.on(EVENTS.BEFORE_RENDER, () => {
			advectVelocityPass.plane.updateUniforms({
				uVelocity: velocity.readTarget.texture,
				uQty: velocity.readTarget.texture,
			});
		});
		advectVelocityPass.on(EVENTS.AFTER_RENDER, () => {
			velocity.swap();
		});

		const advectDensityPass = new AdvectionPass(Boolean(lerpExtension));
		advectDensityPass.target = density.writeTarget;
		advectDensityPass.on(EVENTS.BEFORE_RENDER, () => {
			advectDensityPass.plane.updateUniforms({
				uVelocity: velocity.readTarget.texture,
				uQty: density.readTarget.texture,
			});
		});
		advectDensityPass.on(EVENTS.AFTER_RENDER, () => {
			density.swap();
		});

		const copyPass = new CopyPass();
		copyPass.on(EVENTS.BEFORE_RENDER, () => {
			copyPass.plane.updateUniforms({
				uTex: density.readTarget.texture,
			});
		});

		renderer.addPass(advectVelocityPass);
		renderer.addPass(advectDensityPass);
		renderer.addPass(copyPass);
	}

	private _render = (): void => {
		const renderer = this._renderer;

		// Update renderer & scenes
		const delta = this._clock.getDelta(); // In seconds
		renderer.update(delta * 1000);

		// Render each scenes
		renderer.render();

		requestAnimationFrame(this._render);
	}

	private _onResize = () => {
		const width = window.innerWidth;
		const height = window.innerHeight;

		this._renderer.resize(width, height);
		this._density.resize(width, height);
		this._velocity.resize(width, height);
	}
}

export default App;
