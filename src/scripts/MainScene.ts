// import * as PIXI from "pixi.js";
import { Scene } from "./Scene";
import { Level } from "./GameGenerator";
import { Graphics, InteractionEvent, NineSlicePlane, Sprite } from "pixi.js";
import { ChangeBg, CurrentGameData, GameConfig, Globals, SetGameNumber } from "./Globals";
import { UIContainer } from "./UIContainer";
import { Easing, Tween } from "@tweenjs/tween.js";
import { GameRestartPopup } from "./GameRestartPopup";
import { getBalance, ScoreFunctions, updateBalance } from "./DataHandler";
import { addOnBallAssignCallback, addOnBallSlideOutCallback, addOnPlayCallback, showQuestPanel } from "./HtmlHandler";
import { getUnlockedQuests, RefereshAllQuests } from "./quest";
import { config } from "./appConfig";
import { Howl } from "howler";
import { TextLabel } from "./TextLabel";

let shakeDuration = 0;

export class MainScene extends Scene {
	currentLevel!: Level;
	uiContainer: UIContainer;
	canIncreaseLvl: boolean = true;
	bgMusic: Howl;
	notCalledHighScore: boolean = false;
	darkBg!: Graphics;
	constructor() {
		let textures: any = [];

		if (ScoreFunctions.getOtherScore("CurrentLevel")) {
			const currnetLvl = ScoreFunctions.getOtherScore("CurrentLevel");
			if (currnetLvl) {
				if (currnetLvl == 10) {
					CurrentGameData.CurrentLevel = 0;
				} else {
					CurrentGameData.CurrentLevel = currnetLvl;
				}
			}
		} else {
			ScoreFunctions.addOtherScore("CurrentLevel", 10);
		}

		for (let i = 0; i < 7; i++) {
			textures.push(Globals.resources[`backGroundSprite${i}`].texture);
		}
		super(textures);

		if (CurrentGameData.CurrentLevel > 2) {
			this.changeBackgroundSprite(CurrentGameData.CurrentLevel - 2);
		} else this.changeBackgroundSprite(0);

		this.bgMusic = Globals.soundResources.BgMusic;
		this.bgMusic.play();
		this.bgMusic.loop(true);
		this.bgMusic.volume(0.1);

		SetGameNumber();
		this.currentLevel = new Level();
		this.currentLevel.createBoard();
		this.mainContainer.addChild(this.currentLevel);

		this.prestartGameSetup();
		this.uiContainer = new UIContainer();
		this.addBlackOverlay();
		this.addChildToFullScene(this.uiContainer.biscuitsLabel);
		this.addChildToFullScene(this.uiContainer.biscuitSprite);

		this.mainContainer.addChild(this.uiContainer);

		if (CurrentGameData.TotalRounds > 1) {
			this.uiContainer.createStartGameButton();
		}

		addOnPlayCallback(this.restartGame.bind(this));

		addOnBallSlideOutCallback(this.ballSlideOut.bind(this));

		addOnBallAssignCallback(this.ballAssignCallback.bind(this));
	}

	onWatchAd() {
		RefereshAllQuests();
		showQuestPanel(getUnlockedQuests(), CurrentGameData.score);
	}

	ballSlideOut(questID: string, rewardID: string) { }
	ballAssignCallback(index: number) {
		Globals.soundResources.ui_click.play();
		Globals.soundResources.ui_click.volume(0.3);
	
		if (index >= 0) {
			if (index < 3) {
				CurrentGameData.CurrentLevel = index;
				this.changeBackgroundSprite(0);
			} else if (index > 2) {
				ScoreFunctions.setOtherScore("CurrentLevel", index);
				CurrentGameData.CurrentLevel = index;
				this.changeBackgroundSprite(CurrentGameData.CurrentLevel - 2);
			}
		}
		ScoreFunctions.setOtherScore("CurrentLevel", CurrentGameData.CurrentLevel);

		CurrentGameData.Biscuits = getBalance();
		updateBalance(CurrentGameData.Biscuits);
		this.uiContainer.biscuitsLabel.updateLabelText(CurrentGameData.Biscuits.toString());
	}

	tweenBiscuits(xPos: number, yPos: number) {
		const sprite = new Sprite(Globals.resources.biscuitSprite.texture);
		sprite.anchor.set(0.5);
		sprite.scale.set(0.4);
		sprite.position.set(xPos, yPos);
		this.addChildToFullScene(sprite);

		const endPos = { x: this.uiContainer.biscuitSprite.x, y: this.uiContainer.biscuitSprite.y };

		new Tween(sprite.scale)
			.to({ x: 0.7, y: 0.7 }, 500)
			.easing(Easing.Circular.InOut)
			.onComplete(() => {
				new Tween(sprite)
					.to(endPos)
					.easing(Easing.Quintic.Out)
					.onComplete(() => {
						sprite.destroy();
					})
					.yoyo(true)
					.start();
			})
			.yoyo(true)
			.repeat(1)
			.start();
	}

	prestartGameSetup() {
		SetGameNumber();
		// CurrentGameData.timerLeft = GameConfig.Timer;
		CurrentGameData.highScore = ScoreFunctions.getHighscore();
		CurrentGameData.score = 0;
		if (this.uiContainer) {
			this.uiContainer.updateUI();
		}
		// clearTimeout(this.uiContainer?.timer);
	}

	restartGame() {
		this.darkBg.visible = false;
		this.mainContainer.removeChild(this.currentLevel, this.uiContainer);
		this.currentLevel = new Level();
		this.uiContainer.biscuitsLabel.destroy();
		this.uiContainer.biscuitSprite.destroy();

		this.prestartGameSetup();
		this.uiContainer = new UIContainer();
		this.addChildToFullScene(this.uiContainer.biscuitsLabel);
		this.addChildToFullScene(this.uiContainer.biscuitSprite);

		this.mainContainer.addChild(this.currentLevel, this.uiContainer);
		this.currentLevel.createBoard();
		this.uiContainer.createStartGameButton();
	}
	resize(): void {
		super.resize();
		this.uiContainer.resize();
	}

	update(dt: number): void {
		// throw new Error('Method not implemented.');

		this.currentLevel.updateGame(dt);
		this.uiContainer.update();

		let shakeAmount = 7;
		let decreaseFactor = 0.1;
		if (shakeDuration > 0) {
			this.mainContainer.x = config.minLeftX + (Math.random() * 2 - 1) * shakeAmount;
			this.mainContainer.y = config.minTopY + (Math.random() * 2 - 1) * shakeAmount;
			shakeDuration -= dt * decreaseFactor;
		} else {
			shakeDuration = 0;

			this.mainContainer.x = config.minLeftX;
			this.mainContainer.y = config.minTopY;
		}
	}
	recievedMessage(msgType: string, msgParams: any): void {
		// throw new Error('Method not implemented.');

		if (msgType == "RestartGame") {
			if (CurrentGameData.gameStarted) {
				CurrentGameData.gameStarted = false;
				clearTimeout(this.currentLevel.spawnOfGridTimeout);
				this.currentLevel.colorBlocks.splice(0, this.currentLevel.colorBlocks.length);
				this.currentLevel.movingSpeed = 0;
				this.notCalledHighScore = false;
				CurrentGameData.grabbed = false;
				CurrentGameData.lastScore = CurrentGameData.score;

				CurrentGameData.highScore = ScoreFunctions.getHighscore();
				this.uiContainer.highScoreLabel.updateLabelText(CurrentGameData.highScore.toString());
				this.darkBg.visible = true;
				if (CurrentGameData.score > ScoreFunctions.getHighscore()) {
					this.mainContainer.addChild(new GameRestartPopup(10, this.onWatchAd.bind(this), this.restartGame.bind(this)));
					ScoreFunctions.setHighScore(CurrentGameData.score);
					Globals.soundResources.winSound.play();
					Globals.soundResources.winSound.volume(0.5);
				} else {
					this.onWatchAd();
				}
			}
		}
		if (msgType == "GiveBiscuits") {
			this.tweenBiscuits(msgParams.x, msgParams.y);
		}
		if (msgType == "ScreenShake") {
			shakeDuration = 1;
			this.increaseScore();
			this.uiContainer.updateUI();
			this.uiContainer.resize();

			// this.cameraShake();
		}
		if (msgType == "resume") {
			if (!this.bgMusic.playing()) this.bgMusic.play();
		}
		if (msgType == "pause") {
			if (this.bgMusic.playing()) this.bgMusic.pause();
		}
		if (msgType == "GiveCoins") {
			CurrentGameData.Biscuits += msgParams;
			updateBalance(CurrentGameData.Biscuits);
			this.uiContainer.biscuitsLabel.updateLabelText(CurrentGameData.Biscuits.toString());
		}
	}
	cameraShake(): void {
		const tween = new Tween(this.mainContainer)
			.to({ x: config.minLeftX + (Math.random() * 2 - 1) * 20, y: config.minTopY + (Math.random() * 2 - 1) * 20 }, 250)
			.easing(Easing.Elastic.Out)
			.yoyo(true)
			.repeat(1)
			.start();
	}
	increaseScore() {
		this.uiContainer.updateUI();

		this.currentLevel.increaseLevl();
		if (CurrentGameData.score > ScoreFunctions.getHighscore() && !this.notCalledHighScore && CurrentGameData.TotalRounds != 1) {
			this.currentLevel.showScoreMultiplier("New HighScore !!", 15, false, 100);
			this.notCalledHighScore = true;
		}
	}
	addBlackOverlay() {
		this.darkBg = new Graphics();
		this.darkBg.beginFill(0x000000, 0.5);
		this.darkBg.drawRect(-200, -100, config.logicalWidth * 2, config.minBottomY * 2);
		this.darkBg.endFill();
		this.addChildToIndexFullScene(this.darkBg, 1);
		this.darkBg.visible = false;
	}
}
