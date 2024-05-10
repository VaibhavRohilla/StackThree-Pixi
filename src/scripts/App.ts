import * as PIXI from "pixi.js";
import { CalculateScaleFactor } from "./appConfig";
import { Globals } from "./Globals";
import { onResizeFunction } from "./HtmlHandler";
import { Loader } from "./Loader";
import { MainScene } from "./MainScene";
import { MyEmitter } from "./MyEmitter";
import { Scene } from "./Scene";
import { SceneManager } from "./SceneManager";
// import { Loader } from "./Loader";
// import { SceneManager } from "./SceneManager";
// import { MainScene } from "./MainScene";

export class App {
	app: PIXI.Application;
	isDeviceLandscape: boolean;

	isDeviceOrientationChanged: boolean = false;

	constructor() {
		// create canvas

		PIXI.settings.RESOLUTION = window.devicePixelRatio || 1;

		this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight, antialias: true });
		// this.app = new PIXI.Application({width : window.innerWidth, height : window.innerHeight});
		// document.body.appendChild( Globals.fpsStats.dom );
		// document.body.appendChild( Globals.stats.dom );

		this.isDeviceLandscape = window.innerWidth > window.innerHeight;

		CalculateScaleFactor();

		this.app.renderer.view.style.width = `${window.innerWidth}px`;
		this.app.renderer.view.style.height = `${window.innerHeight}px`;
		this.app.renderer.resize(window.innerWidth, window.innerHeight);

		this.app.view.oncontextmenu = (e) => {
			e.preventDefault();
		};

		//Setting Up Window On Resize Callback
		window.onresize = (e) => {
			this.checkIfDeviceRotated();

			if (this.isDeviceOrientationChanged) {
				// this.isDeviceOrientationChanged = false;
				document.body.removeChild(this.app.view);
                console.log("Removed Canvas from DOM");
			}

			CalculateScaleFactor();

			this.app.renderer.view.style.width = `${window.innerWidth}px`;
			this.app.renderer.view.style.height = `${window.innerHeight}px`;
			this.app.renderer.resize(window.innerWidth, window.innerHeight);

			onResizeFunction();

			SceneManager.instance!.resize();

			if (this.isDeviceOrientationChanged) {
				document.body.append(this.app.view);
				this.isDeviceOrientationChanged = false;
                console.log("Added Canvas to DOM");
			}
		};

		//Created Emitter
		Globals.emitter = new MyEmitter();

		//Create Scene Manager
		new SceneManager();

		this.app.stage.addChild(SceneManager.instance.container);
		this.app.ticker.add((dt) => SceneManager.instance!.update(dt));

		// loader for loading data
		const loaderContainer = new PIXI.Container();
		this.app.stage.addChild(loaderContainer);

		const loader = new Loader(this.app.loader, loaderContainer);

		// loader.preload().then(() => {
		//     setTimeout(() => {
		//         loaderContainer.destroy();

		//         SceneManager.instance!.start(new MainScene());
		//     }, 1000);
		// });

		loader.preload().then(() => {
			loader.preloadSounds(() => {
				setTimeout(() => {
					loaderContainer.destroy();

					// SceneManager.instance!.start(new MainScene());
					SceneManager.instance!.start(new MainScene());
				}, 1000);
			});
		});
		this.tabChange();
		document.body.appendChild(this.app.view);
	}

	tabChange() {
		document.addEventListener("visibilitychange", (event) => {
			if (document.visibilityState === "visible") {
				Globals.emitter?.Call("resume");
			} else {
				Globals.emitter?.Call("pause");
			}
		});
	}

	checkIfDeviceRotated() {

        console.log("Device Orientation Changed");

		if (window.innerWidth > window.innerHeight) {
			if (!this.isDeviceLandscape) {
				this.isDeviceOrientationChanged = true;
			}

			//landscape
		} else {
			if (this.isDeviceLandscape) {
				this.isDeviceOrientationChanged = true;
			}
			//portrait
		}
	}
}
