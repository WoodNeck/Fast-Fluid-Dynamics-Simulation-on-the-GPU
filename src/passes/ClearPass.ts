import * as THREE from "three";

import Pass from "./Pass";
import defaultVS from "../shaders/default.vs";
import clearFS from "../shaders/clear.fs";
import FullscreenPlane from "~/objects/FullscreenPlane";

class ClearPass extends Pass {
	public plane: FullscreenPlane;

	constructor(dissipation: number) {
		super();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();
		this.target = null;

		this.plane = new FullscreenPlane({
			uDissipation: dissipation,
			uTex: null,
		}, defaultVS, clearFS);

		this.scene.add(this.plane.mesh);
	}
}

export default ClearPass;
