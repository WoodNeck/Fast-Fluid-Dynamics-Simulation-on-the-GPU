import * as THREE from "three";

import EntityManager from "~/EntityManager";
import Entity from "~/entities/Entity";
import { Updateable } from "~/types/common";

// Layer that contains scene & camera
export default abstract class Layer implements Updateable {
	public abstract get scene(): Readonly<THREE.Scene>;
	public abstract get camera(): Readonly<THREE.OrthographicCamera>;

	protected entityMananger: EntityManager;

	constructor() {
		this.entityMananger = new EntityManager();
	}

	public add(entity: Entity) {
		this.scene.add(entity.mesh);
		this.entityMananger.add(entity);
	}

	public remove(entity: Entity) {
		this.scene.remove(entity.mesh);
		this.entityMananger.remove(entity);
	}

	public update(ms: number): void {
		for (const entity of this.entityMananger.values) {
			entity.update(ms);
		}
	}

	public abstract resize(width: number, height: number): void;

	public abstract updateScene(readTarget: THREE.WebGLRenderTarget): void;
}
