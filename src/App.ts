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
import ColorRestrictionPass from "./passes/ColorRestrictionPass";

class App {
	public curlStrength = 60;
	public radius = -3;
	public densityDissipation = 0.97;
	public velocityDissipation = 0.98;
	public pressureDissipation = 0.8;

	private _renderer: Renderer;
	private _clock: THREE.Clock;

	private _density: FBO;
	private _velocity: FBO;
	private _pressure: FBO;
	private _pixelated: FBO;
	private _curl: THREE.WebGLRenderTarget;
	private _divergence: THREE.WebGLRenderTarget;

	private _splatPass: SplatPass;
	private _inputs: THREE.Vector4[] = [];
	private _lastPos: THREE.Vector2;

	private _simRes = 128;
	private _dyeRes = 512;

	private _pressureIterations = 3;

	constructor() {
		const canvasBox = document.querySelector("#app") as HTMLCanvasElement;

		this._clock = new THREE.Clock(true);
		this._renderer = new Renderer(canvasBox);

		this._composeFBO();
		this._onResize();
		this._composePass();
		this._setupControls();

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
		this._pixelated = new FBO(1, 1, {
			type: THREE.FloatType,
			format: THREE.RGBAFormat,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
		});
	}

	private _composePass() {
		const renderer = this._renderer;
		const density = this._density;
		const velocity = this._velocity;
		const pressure = this._pressure;
		const divergence = this._divergence;
		const curl = this._curl;
		const pixelated = this._pixelated;

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

		const vorticityPass = new VorticityPass(simRes);
		vorticityPass.on(EVENTS.BEFORE_RENDER, () => {
			vorticityPass.target = velocity.writeTarget;
			vorticityPass.plane.updateUniforms({
				uVelocity: velocity.readTarget.texture,
				uCurl: this.curlStrength,
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

		const clearPass = new ClearPass(this.pressureDissipation);
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

		const advectVelocityPass = new AdvectionPass(Boolean(lerpExtension), simRes);
		advectVelocityPass.on(EVENTS.BEFORE_RENDER, () => {
			advectVelocityPass.target = velocity.writeTarget;
			advectVelocityPass.plane.updateUniforms({
				uVelocity: velocity.readTarget.texture,
				uQty: velocity.readTarget.texture,
				uDissipation: this.velocityDissipation,
			});
		});
		advectVelocityPass.on(EVENTS.AFTER_RENDER, () => {
			velocity.swap();
		});

		const advectDensityPass = new AdvectionPass(Boolean(lerpExtension), simRes);
		advectDensityPass.on(EVENTS.BEFORE_RENDER, () => {
			advectDensityPass.target = density.writeTarget;
			advectDensityPass.plane.updateUniforms({
				uVelocity: velocity.readTarget.texture,
				uQty: density.readTarget.texture,
				uDissipation: this.densityDissipation,
			});
		});
		advectDensityPass.on(EVENTS.AFTER_RENDER, () => {
			density.swap();
		});

		const pixelatePass = new CopyPass();
		pixelatePass.on(EVENTS.BEFORE_RENDER, () => {
			pixelatePass.target = pixelated.writeTarget;
			pixelatePass.plane.updateUniforms({
				uTex: density.readTarget.texture,
			});
		});
		pixelatePass.on(EVENTS.AFTER_RENDER, () => {
			pixelated.swap();
		});

		const colorResPass = new ColorRestrictionPass();
		colorResPass.on(EVENTS.BEFORE_RENDER, () => {
			colorResPass.target = pixelated.writeTarget;
			colorResPass.plane.updateUniforms({
				uTex: pixelated.readTarget.texture,
			});
		});
		colorResPass.on(EVENTS.AFTER_RENDER, () => {
			pixelated.swap();
		});

		const copyPass = new CopyPass();
		copyPass.on(EVENTS.BEFORE_RENDER, () => {
			copyPass.plane.updateUniforms({
				uTex: pixelated.readTarget.texture,
			});
		});

		renderer.addPass(curlPass);
		renderer.addPass(vorticityPass);
		renderer.addPass(divergencePass);
		renderer.addPass(clearPass);
		renderer.addPass(gradientSubtractPass);
		renderer.addPass(advectVelocityPass);
		renderer.addPass(advectDensityPass);
		renderer.addPass(pixelatePass);
		renderer.addPass(colorResPass);
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
				uInvRadius: 1 / Math.pow(10, this.radius),
			});

			renderer.renderSinglePass(splatPass);

			splatPass.target = density.writeTarget;
			splatPass.plane.updateUniforms({
				uTex: density.readTarget,
				uCol: new THREE.Vector3().setScalar(10),
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
		this._pixelated.resize(width / 8, height / 8);
		// this._pixelated.resize(width, height);
	}

	private _setupControls() {
		// @ts-ignore
		const gui = new dat.GUI();

		gui.add(this, "curlStrength", 0, 100);
		gui.add(this, "radius", -5, 0);
		gui.add(this, "densityDissipation", 0, 1);
		gui.add(this, "velocityDissipation", 0, 1);
		gui.add(this, "pressureDissipation", 0, 1);
	}
}

export default App;
