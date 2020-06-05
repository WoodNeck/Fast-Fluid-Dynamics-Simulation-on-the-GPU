import * as THREE from "three";

import Pass from "./Pass";
import nearVS from "../shaders/near.vs";
import divergenceFS from "../shaders/divergence.fs";
import FullscreenPlane from "~/objects/FullscreenPlane";

class DivergencePass extends Pass {
	public plane: FullscreenPlane;

	constructor(res: number) {
		super();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();
		this.target = null;

		this.plane = new FullscreenPlane({
			uTexelSize: new THREE.Uniform(new THREE.Vector2(1 / res, 1 / res)),
			uVelocity: null,
		}, nearVS, divergenceFS);

		this.scene.add(this.plane.mesh);
	}
}

export default DivergencePass;
