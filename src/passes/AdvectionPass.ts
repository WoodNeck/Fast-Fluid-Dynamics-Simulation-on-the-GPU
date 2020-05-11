import * as THREE from "three";

import Pass from "./Pass";
import defaultVS from "../shaders/default.vs";
import advectFS from "../shaders/advect.fs";
import FullscreenPlane from "~/objects/FullscreenPlane";

class AdvectionPass extends Pass {
	constructor() {
		super();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();
		this.target = null;

		const plane = new FullscreenPlane({

		}, defaultVS, advectFS);

		this.scene.add(plane.mesh);
	}
}

export default AdvectionPass;
