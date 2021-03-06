import * as THREE from "three";

import Pass from "./Pass";
import nearVS from "../shaders/near.vs";
import pressureFS from "../shaders/pressure.fs";
import FullscreenPlane from "~/objects/FullscreenPlane";

class PressurePass extends Pass {
	public plane: FullscreenPlane;

	constructor(res: number) {
		super();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();
		this.target = null;

		this.plane = new FullscreenPlane({
			uPressure: null,
			uDivergence: null,
			uTexelSize: new THREE.Uniform(new THREE.Vector2(1 / res, 1 / res)),
		}, nearVS, pressureFS);

		this.scene.add(this.plane.mesh);
	}
}

export default PressurePass;
