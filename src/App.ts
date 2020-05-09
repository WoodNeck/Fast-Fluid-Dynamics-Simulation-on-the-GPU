import Renderer from "./Renderer";
import RenderPass from "./passes/RenderPass";
import Layer from "./layers/Layer";
import MainLayer from "./layers/MainLayer";
import Pass from "./passes/Pass";

class App {
	private _renderer: Renderer;
	private _layers: Map<string, Layer>;
	private _passes: Map<string, Pass>;

	constructor() {
		const canvasBox = document.querySelector("#app") as HTMLCanvasElement;

		this._renderer = new Renderer(canvasBox);

		this._createLayers();
		this._composePass();
		this._onResize();

		window.addEventListener("resize", this._onResize);
		requestAnimationFrame(this._render);
	}

	private _createLayers() {
		this._layers = new Map();

		// TODO: Create your own layers
		this._layers.set("main", new MainLayer());
	}

	private _composePass() {
		const renderer = this._renderer;
		this._passes = new Map();

		// TODO: Compose your own pass
		const mainLayer = this._layers.get("main")!;
		const renderPass = new RenderPass(mainLayer);

		this._passes.set("render", renderPass);

		renderer.addPass(renderPass);
	}

	private _render = (t: number): void => {
		const renderer = this._renderer;

		// Update renderer & scenes
		this._layers.forEach(layer => layer.update(t));
		renderer.update(t);

		// Render each scenes
		renderer.render();

		requestAnimationFrame(this._render);
	}

	private _onResize = () => {
		const width = window.innerWidth;
		const height = window.innerHeight;

		this._renderer.resize(width, height);
		this._layers.forEach(layer => layer.resize(width, height));
	}
}

export default App;
