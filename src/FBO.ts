import * as THREE from "three";

// Framebuffer Object
class FBO {
	private _readTarget: THREE.WebGLRenderTarget;
	private _writeTarget: THREE.WebGLRenderTarget;

	public get readTarget() { return this._readTarget; }
	public get writeTarget() { return this._writeTarget; }

	constructor(width: number = 0, height: number = 0, rtOptions: Partial<THREE.WebGLRenderTargetOptions> = {}) {
		const options: THREE.WebGLRenderTargetOptions = {
			...{
				magFilter: THREE.LinearFilter,
				minFilter: THREE.LinearFilter,
				generateMipmaps: false,
				depthBuffer: true,
			}, ...rtOptions
		};
		this._writeTarget = new THREE.WebGLRenderTarget(width, height, options);
		this._readTarget = new THREE.WebGLRenderTarget(width, height, options);
	}

	public resize(width: number, height: number) {
		this._readTarget.setSize(width, height);
		this._writeTarget.setSize(width, height);
	}

	public swap(): void {
		const temp = this._writeTarget;
		this._writeTarget = this._readTarget;
		this._readTarget = temp;
	}
}

export default FBO;
