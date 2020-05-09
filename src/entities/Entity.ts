import * as THREE from "three";

import { Updateable } from "~/types/common";

export default interface Entity extends Updateable {
	readonly mesh: THREE.Mesh;
}
