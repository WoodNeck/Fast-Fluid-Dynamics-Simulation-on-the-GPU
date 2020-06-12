import * as THREE from "three";

import Pass from "./Pass";
import defaultVS from "../shaders/default.vs";
import colorRestrictionFS from "../shaders/color-restriction.fs";
import FullscreenPlane from "~/objects/FullscreenPlane";
import PaletteTexture from "~/objects/PaletteTexture";
import * as COLORS from "~/consts/colors";

class ColorRestrictionPass extends Pass {
	public plane: FullscreenPlane;

	constructor() {
		super();
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();
		this.target = null;

		this.plane = new FullscreenPlane({
			uPalette: new THREE.Uniform(PaletteTexture.get(COLORS.SUPER_GAMEBOY)),
		}, defaultVS, colorRestrictionFS);

		this.scene.add(this.plane.mesh);
	}
}

export default ColorRestrictionPass;
