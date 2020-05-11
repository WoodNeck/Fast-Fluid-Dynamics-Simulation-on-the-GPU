import * as THREE from "three";
import Component from "@egjs/component";

import { Updateable } from "~/types/common";

abstract class Pass extends Component implements Updateable {
	public scene: Readonly<THREE.Scene>;
	public camera: Readonly<THREE.Camera>;
	public target: THREE.WebGLRenderTarget | null;

	public add(obj: THREE.Object3D) {
		this.scene.add(obj);
	}

	public remove(obj: THREE.Object3D) {
		this.scene.remove(obj);
	}

	/* tslint:disable no-empty */
	public resize(width: number, height: number) {}

	public update(ms: number) {}
	/* tslint:enable */
}

export default Pass;
