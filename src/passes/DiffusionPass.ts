import * as THREE from "three";

import Pass from "./Pass";
import defaultVS from "../shaders/default.vs";
import advectFS from "../shaders/advect.fs";
import advectBilerpFS from "../shaders/advect-bilerp-manual.fs";
import FullscreenPlane from "~/objects/FullscreenPlane";

class AdvectionPass extends Pass {
	public plane: FullscreenPlane;

	constructor(extensionEnabled: boolean) {
		super();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();
		this.target = null;

		const vs = defaultVS;
		const fs = extensionEnabled
			? advectFS
			: advectBilerpFS;

		const gridScale = 256;

		this.plane = new FullscreenPlane({
			uDt: new THREE.Uniform(0),
			uGrid: new THREE.Uniform(gridScale),
			uInvGrid: new THREE.Uniform(1 / gridScale),
			uVelocity: null,
			uQty: null,
		}, vs, fs);

		this.scene.add(this.plane.mesh);
	}

	public update(ms: number) {
		this.plane.updateUniforms({
			uDt: ms,
		});
	}
}

export default AdvectionPass;
