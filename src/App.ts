import * as THREE from "three";
import Renderer from "./Renderer";
import FBO from "./FBO";
import AdvectionPass from "./passes/AdvectionPass";
import ClearPass from "./passes/ClearPass";
import CopyPass from "./passes/CopyPass";
import SplatPass from "./passes/SplatPass";
import DivergencePass from "./passes/DivergencePass";
import CurlPass from "./passes/CurlPass";
import * as EVENTS from "./consts/events";
import VorticityPass from "./passes/VorticityPass";
import PressurePass from "./passes/PressurePass";
import GradientSubtractPass from "./passes/GradientSubtractPass";

class App {
	private _renderer: Renderer;
	private _clock: THREE.Clock;

	private _density: FBO;
	private _velocity: FBO;
	private _pressure: FBO;
	private _vorticity: FBO;
	private _curl: THREE.WebGLRenderTarget;
	private _divergence: THREE.WebGLRenderTarget;

	private _splatPass: SplatPass;
	private _inputs: THREE.Vector4[] = [];
	private _lastPos: THREE.Vector2;

	private _simRes = 128;
	private _dyeRes = 2048;

	private _curlStrength = 20;
	private _densityDissipation = 0.97;
	private _velocityDissipation = 0.98;
	private _pressureDissipation = 0.8;
	private _pressureIterations = 3;

	constructor() {
		const canvasBox = document.querySelector("#app") as HTMLCanvasElement;

		this._clock = new THREE.Clock(true);
		this._renderer = new Renderer(canvasBox);

		this._composeFBO();
		this._onResize();
		this._composePass();

		window.addEventListener("mousemove", this._onMouseMove);
		window.addEventListener("resize", this._onResize);
		requestAnimationFrame(this._render);
	}

	private _composeFBO() {
		const simRes = this._simRes;
		const dyeRes = this._dyeRes;

		this._density = new FBO(dyeRes, dyeRes, {
			type: THREE.FloatType,
			format: THREE.RGBAFormat,
			wrapS: THREE.RepeatWrapping,
			wrapT: THREE.RepeatWrapping,
		});
		this._velocity = new FBO(simRes, simRes, {
			type: THREE.FloatType,
			format: THREE.RGBAFormat,
			wrapS: THREE.RepeatWrapping,
			wrapT: THREE.RepeatWrapping,
		});
		this._pressure = new FBO(simRes, simRes, {
			type: THREE.FloatType,
			format: THREE.RGBAFormat,
			wrapS: THREE.RepeatWrapping,
			wrapT: THREE.RepeatWrapping,
		});
		this._curl = new THREE.WebGLRenderTarget(simRes, simRes, {
			type: THREE.HalfFloatType,
			format: THREE.RedFormat,
			minFilter: THREE.NearestFilter,
		});
		this._divergence = new THREE.WebGLRenderTarget(simRes, simRes, {
			type: THREE.HalfFloatType,
			format: THREE.RedFormat,
			minFilter: THREE.NearestFilter,
		});
	}

	private _composePass() {
		const renderer = this._renderer;
		const density = this._density;
		const velocity = this._velocity;
		const pressure = this._pressure;
		const divergence = this._divergence;
		const curl = this._curl;

		const simRes = this._simRes;
		const dyeRes = this._dyeRes;

		const lerpExtension = this._renderer.gl.getExtension("OES_texture_float_linear");

		this._splatPass = new SplatPass();

		const curlPass = new CurlPass(simRes);
		curlPass.on(EVENTS.BEFORE_RENDER, () => {
			curlPass.target = curl;
			curlPass.plane.updateUniforms({
				uVelocity: velocity.readTarget.texture,
			});
		});

		const vorticityPass = new VorticityPass(simRes, this._curlStrength);
		vorticityPass.on(EVENTS.BEFORE_RENDER, () => {
			vorticityPass.target = velocity.writeTarget;
			vorticityPass.plane.updateUniforms({
				uVelocity: velocity.readTarget.texture,
				uCurlTex: curl.texture,
			});
		});
		vorticityPass.on(EVENTS.AFTER_RENDER, () => {
			velocity.swap();
		});

		const divergencePass = new DivergencePass(simRes);
		divergencePass.on(EVENTS.BEFORE_RENDER, () => {
			divergencePass.target = this._divergence;
			divergencePass.plane.updateUniforms({
				uVelocity: velocity.readTarget.texture,
			});
		});

		const clearPass = new ClearPass(this._pressureDissipation);
		clearPass.on(EVENTS.BEFORE_RENDER, () => {
			clearPass.target = pressure.writeTarget;
			clearPass.plane.updateUniforms({
				uTex: pressure.readTarget.texture,
			});
		});

		const pressurePass = new PressurePass(simRes);
		clearPass.on(EVENTS.AFTER_RENDER, () => {
			pressure.swap();
			pressurePass.plane.updateUniforms({
				uDivergence: divergence.texture,
			});

			for (let i = 0; i < this._pressureIterations; i++) {
				pressurePass.target = pressure.writeTarget;
				pressurePass.plane.updateUniforms({
					uPressure: pressure.readTarget.texture,
				});
				renderer.renderSinglePass(pressurePass);
				pressure.swap();
			}
		});

		const gradientSubtractPass = new GradientSubtractPass(simRes);
		gradientSubtractPass.on(EVENTS.BEFORE_RENDER, () => {
			gradientSubtractPass.target = velocity.writeTarget;
			gradientSubtractPass.plane.updateUniforms({
				uPressure: pressure.readTarget.texture,
				uVelocity: velocity.readTarget.texture,
			});
		});
		gradientSubtractPass.on(EVENTS.AFTER_RENDER, () => {
			velocity.swap();
		});

		const advectVelocityPass = new AdvectionPass(Boolean(lerpExtension), simRes, this._velocityDissipation);
		advectVelocityPass.on(EVENTS.BEFORE_RENDER, () => {
			advectVelocityPass.target = velocity.writeTarget;
			advectVelocityPass.plane.updateUniforms({
				uVelocity: velocity.readTarget.texture,
				uQty: velocity.readTarget.texture,
			});
		});
		advectVelocityPass.on(EVENTS.AFTER_RENDER, () => {
			velocity.swap();
		});

		const advectDensityPass = new AdvectionPass(Boolean(lerpExtension), simRes, this._densityDissipation);
		advectDensityPass.on(EVENTS.BEFORE_RENDER, () => {
			advectDensityPass.target = density.writeTarget;
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
			renderer.renderer.autoClear = true;
		});

		copyPass.on(EVENTS.AFTER_RENDER, () => {
			renderer.renderer.autoClear = false;
		});

		renderer.addPass(curlPass);
		renderer.addPass(vorticityPass);
		renderer.addPass(divergencePass);
		renderer.addPass(clearPass);
		renderer.addPass(gradientSubtractPass);
		renderer.addPass(advectVelocityPass);
		renderer.addPass(advectDensityPass);
		renderer.addPass(copyPass);
	}

	private _onMouseMove = (e: MouseEvent) => {
		const x = e.pageX;
		const y = e.pageY;

		if (!this._lastPos) {
			this._lastPos = new THREE.Vector2(x, y);
			return;
		}

		const size = this._renderer.size;
		this._inputs.push(new THREE.Vector4(
			x / size.x,
			1 - y / size.y,
			5 * (x - this._lastPos.x),
			-5 * (y - this._lastPos.y)
		));

		this._lastPos.set(x, y);
	}

	private _render = (): void => {
		const renderer = this._renderer;

		// Update renderer & scenes
		const delta = this._clock.getDelta(); // In seconds
		renderer.update(delta * 1000);

		// Apply inputs
		const splatPass = this._splatPass;
		const velocity = this._velocity;
		const density = this._density;
		this._inputs.reverse().forEach(input => {
			splatPass.target = velocity.writeTarget;
			splatPass.plane.updateUniforms({
				uTex: velocity.readTarget,
				uAspect: renderer.aspect,
				uPoint: new THREE.Vector2(input.x, input.y),
				uCol: new THREE.Vector3(input.z, input.w, 1),
				uInvRadius: 1000,
			});

			renderer.renderSinglePass(splatPass);

			splatPass.target = density.writeTarget;
			splatPass.plane.updateUniforms({
				uTex: density.readTarget,
			})

			renderer.renderSinglePass(splatPass);

			velocity.swap();
			density.swap();
		});
		this._inputs.splice(0);

		// Render each scenes
		renderer.render();

		requestAnimationFrame(this._render);
	}

	private _onResize = () => {
		const width = window.innerWidth;
		const height = window.innerHeight;

		this._renderer.resize(width, height);
	}
}

export default App;
