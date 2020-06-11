import * as THREE from "three";

import Pass from "./Pass";
import nearVS from "../shaders/near.vs";
import gradientSubtractFS from "../shaders/gradient-subtract.fs";
import FullscreenPlane from "~/objects/FullscreenPlane";

class GradientSubtractPass extends Pass {
	public plane: FullscreenPlane;

	constructor(res: number) {
		super();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();
		this.target = null;

		this.plane = new FullscreenPlane({
			uPressure: null,
			uVelocity: null,
			uTexelSize: new THREE.Uniform(new THREE.Vector2(1 / res, 1 / res)),
		}, nearVS, gradientSubtractFS);

		this.scene.add(this.plane.mesh);
	}
}

export default GradientSubtractPass;
