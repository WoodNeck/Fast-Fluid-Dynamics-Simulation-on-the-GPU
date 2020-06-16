import * as THREE from "three";

import Pass from "./Pass";
import nearVS from "../shaders/near.vs";
import vorticityFS from "../shaders/vorticity.fs";
import FullscreenPlane from "~/objects/FullscreenPlane";

class VorticityPass extends Pass {
	public plane: FullscreenPlane;

	constructor(res: number) {
		super();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();
		this.target = null;

		this.plane = new FullscreenPlane({
			uTexelSize: new THREE.Uniform(new THREE.Vector2(1 / res, 1 / res)),
			uCurl: new THREE.Uniform(0),
			uDt: new THREE.Uniform(0),
			uVelocity: null,
			uCurlTex: null,
		}, nearVS, vorticityFS);

		this.scene.add(this.plane.mesh);
	}

	public update(ms: number) {
		this.plane.updateUniforms({
			uDt: ms / 1000,
		});
	}
}

export default VorticityPass;
