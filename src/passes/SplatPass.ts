import * as THREE from "three";

import Pass from "./Pass";
import defaultVS from "../shaders/default.vs";
import splatFS from "../shaders/splat.fs";
import FullscreenPlane from "~/objects/FullscreenPlane";

class SplatPass extends Pass {
	public plane: FullscreenPlane;

	constructor() {
		super();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();
		this.target = null;

		this.plane = new FullscreenPlane({
			uTex: null,
			uAspect: 1,
			uCol: new THREE.Uniform(0),
			uPoint: new THREE.Uniform(0),
			uRadius: new THREE.Uniform(0),
		}, defaultVS, splatFS);

		this.scene.add(this.plane.mesh);
	}
}

export default SplatPass;
