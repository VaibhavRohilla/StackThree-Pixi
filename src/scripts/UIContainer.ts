import { Easing, Tween } from "@tweenjs/tween.js";
import { Container, Graphics, ObservablePoint, Sprite } from "pixi.js";
import { start } from "repl";
import { config } from "./appConfig";
import { getBalance, ScoreFunctions } from "./DataHandler";
import { GameRestartPopup } from "./GameRestartPopup";
import { CurrentGameData, GameConfig, Globals } from "./Globals";
import { HGraphic, HGraphicType } from "./HGraphic";
import { TextLabel } from "./TextLabel";



export class UIContainer extends Container {
    highScoreLabel: TextLabel;
    currentScoreLabel: TextLabel;
    biscuitsLabel: TextLabel;
    startGameButton!: Graphics;
    wholeStartGameButton!: Graphics;
    timerText!: TextLabel;
    timerGraphics!: Graphics;
    timer!: NodeJS.Timeout;
    biscuitSprite!: Sprite;


    constructor() {
        super();


        const highscoreCrown = new Sprite(Globals.resources.crown.texture);
        highscoreCrown.x = -110;
        highscoreCrown.anchor.set(0.5);
        highscoreCrown.scale.set(0.15);


        this.highScoreLabel = new TextLabel(550, 100, 0.5, CurrentGameData.highScore.toString(), 80, 0xFFFFFF);
        this.highScoreLabel.style.dropShadow = true;
        this.highScoreLabel.style.dropShadowDistance = 3;
        this.highScoreLabel.addChild(highscoreCrown);


        this.currentScoreLabel = new TextLabel(550, 220, 0.5, CurrentGameData.score.toString(), 130, 0xFFFFFF);
        this.currentScoreLabel.style.dropShadow = true;
        this.currentScoreLabel.style.dropShadowDistance = 3;


        CurrentGameData.Biscuits = getBalance();
        this.biscuitsLabel = new TextLabel(0, 0, 0.5, CurrentGameData.Biscuits.toString(), 35, 0xFFFFFF);
        this.biscuitsLabel.style.dropShadow = true;
        this.biscuitsLabel.anchor.y = 0.5;
        this.biscuitsLabel.style.dropShadowDistance = 2;
        this.biscuitsLabel.position.x = window.innerWidth - this.biscuitsLabel.width / 2 - 20;
        this.biscuitsLabel.position.y = window.innerHeight * 0.05;
        this.biscuitsLabel.scale.x = 2.2 * config.minScaleFactor;
        this.biscuitsLabel.scale.y = 2.2 * config.minScaleFactor;


        this.biscuitSprite = new Sprite(Globals.resources.biscuitSprite.texture);
        this.biscuitSprite.anchor.set(0.5);
        this.biscuitSprite.position.x = -this.biscuitsLabel.width / 2 + this.biscuitsLabel.position.x - config.minScaleFactor - 25;
        this.biscuitSprite.position.y = window.innerHeight * 0.05;
        this.biscuitSprite.scale.set(0.7 * config.minScaleFactor);


        this.addChild(this.highScoreLabel, this.currentScoreLabel);
        CurrentGameData.score = 0;

        this.updateUI();
    }


    resize() {

        this.biscuitsLabel.scale.set(2.2 * config.minScaleFactor);
        this.biscuitSprite.scale.set(0.7 * config.minScaleFactor);

        this.biscuitsLabel.position.x = window.innerWidth - this.biscuitsLabel.width / 2 - 20;
        this.biscuitSprite.position.x = -this.biscuitsLabel.width / 2 + this.biscuitsLabel.position.x - config.minScaleFactor - 25;

        this.biscuitsLabel.position.y = window.innerHeight * 0.05;
        this.biscuitSprite.position.y = window.innerHeight * 0.05;


    }
    createStartGameButton() {
        this.wholeStartGameButton = new Graphics();
        // this.wholeStartGameButton.beginFill(0x00000, 0.4);
        // this.wholeStartGameButton.drawRect(-1920, -700, 5000, 5000);
        // this.wholeStartGameButton.endFill();

        const buttonBackDrop = new Graphics();
        buttonBackDrop.beginFill(0xFFFFFF, 1);
        buttonBackDrop.drawRoundedRect(200, 950, 700, 250, 20);
        buttonBackDrop.endFill();
        const backDropText1 = new TextLabel(550, 1010, 0.5, "New Game ?", 45, 0x000000);
        // const backDropText2 = new TextLabel(550, 1005, 0.5, "Ready To Play?", 45, 0x606060);
        buttonBackDrop.addChild(backDropText1);

        this.startGameButton = new Graphics();
        this.startGameButton.beginFill(0xEE6427, 1);
        this.startGameButton.drawRoundedRect(200, 1070, 700, 130, 20);
        this.startGameButton.endFill();
        this.startGameButton.interactive = true;
        this.startGameButton.buttonMode = true;
        const startButtonText = new TextLabel(550, 1120, 0.5, "Let's GO", 55, 0xffffff);
        startButtonText.style.fontWeight = 'bolder'
        this.startGameButton.addChild(startButtonText);


        this.wholeStartGameButton.addChild(buttonBackDrop, this.startGameButton);
        this.addChild(this.wholeStartGameButton);

        // this.makeTimer();

        this.startGameButton.once("pointerdown", this.startButtonTweenOut.bind(this));

    }

    update() {

        // if (CurrentGameData.gameStarted) {
        //     const delta = Globals.App?.app.ticker.deltaMS ? Globals.App?.app.ticker.deltaMS : 0;

        //     if (CurrentGameData.timerLeft <= 120) {

        //         CurrentGameData.timerLeft -= delta / 1000;


        //         this.timerText.updateLabelText(Math.floor(CurrentGameData.timerLeft).toString());
        //     }

        //     if (CurrentGameData.timerLeft < 1) {
        //         this.freezeGame();
        //         return;

        //     }

        // }
    }

    startButtonTweenOut() {
        new Tween(this.wholeStartGameButton)
            .to({ y: -1500 }, 1200)
            .easing(Easing.Elastic.InOut)
            .onComplete(() => {
                this.removeChild(this.wholeStartGameButton);
                CurrentGameData.gameStarted = true;
            })
            .start();
    }

    makeTimer() {
        if (this.timerGraphics == undefined) {
            this.timerGraphics = new HGraphic(HGraphicType.CIRCLE, 0x2c2c2c, { radius: 90 }, 1);
            this.timerGraphics.y = 100;
            this.timerGraphics.x = 150;

            this.timerText = new TextLabel(0, -3.5, 0.5, CurrentGameData.timerLeft.toString(), 70, 0xffffff);
            this.timerGraphics.addChild(this.timerText);
            this.timerGraphics.zIndex = 21;
            this.addChild(this.timerGraphics);
            this.timerGraphics.visible = true;
        }


    }
    updateUI() {

        this.currentScoreLabel.updateLabelText(CurrentGameData.score.toString());
        CurrentGameData.Biscuits = getBalance();
        this.biscuitsLabel.updateLabelText(CurrentGameData.Biscuits.toString());

    }

}