import * as THREE from "three";

import Pass from "./Pass";
import defaultVS from "../shaders/default.vs";
import copyFS from "../shaders/copy.fs";
import FullscreenPlane from "~/objects/FullscreenPlane";

class CopyPass extends Pass {
	public plane: FullscreenPlane;

	constructor() {
		super();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();
		this.target = null;

		this.plane = new FullscreenPlane({
			uTex: null,
		}, defaultVS, copyFS);

		this.scene.add(this.plane.mesh);
	}
}

export default CopyPass;
