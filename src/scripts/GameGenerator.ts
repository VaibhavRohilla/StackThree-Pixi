import { Easing, Tween } from "@tweenjs/tween.js";
import { fail, match, throws } from "assert";
import { clear } from "console";
import { cp } from "fs";
import {
    AnimatedSprite,
    BaseTexture,
    Container,
    DisplayObject,
    Graphics,
    IDestroyOptions,
    InteractionEvent,
    IPointData,
    ObservablePoint,
    Sprite,
    Texture,
} from "pixi.js";
import { stringify } from "querystring";
import { config } from "./appConfig";
import { getBalance, ScoreFunctions, updateBalance } from "./DataHandler";
import { GameRestartPopup } from "./GameRestartPopup";
import {
    CheckDropPos,
    CurrentGameData,
    GameConfig,
    GetAnimationSprites,
    GetColorCode,
    Globals,
    randomRange,
    SetGameNumber,
    weightedRand,
} from "./Globals";
import { HGraphic, HGraphicType } from "./HGraphic";
import { allQuests, checkIfClaimed } from "./quest";
import { TextLabel } from "./TextLabel";
import { fetchGlobalPosition } from "./Utilities";

export class Level extends Container {
    tileId: number = 1;
    gridLine!: Graphics;
    block!: Blocks;
    maxColorId: number = 6;
    xPos: number = 80;
    yPos: number = 300;
    xOffset: number = 165;
    yOffset: number = 165;
    currentMousPos!: IPointData;
    startGameButton!: Graphics;
    wholeStartGameButton!: Graphics;
    timertoSpawn: number = 25;
    scoreMultiplier: number = 1;
    coinMultiplier: number = 1;
    canChangeLevel: boolean = true;

    timeToSpawn: number = 25;
    movingSpeed: number = 3;
    dropPos: number = 0;
    timerGraphics!: HGraphic;
    tilesGrid: Tile[][] = [];
    colorBlocks: Blocks[] = [];
    emptyTiles: Tile[] = [];
    coloredBlockOnGrid: Blocks[] = [];
    matches: Tile[] = [];
    grabbedBlock!: Blocks;
    spawnOfGridTimeout!: NodeJS.Timeout;
    rowGlow!: Sprite;
    upArrow!: Sprite;
    columnRange: Object = { 1: 0.1, 2: 0.1, 3: 0.1, 4: 0.1, 5: 0.1 };
    highscoreText: boolean = false;
    levelText: boolean = false;
    multiplyerText: boolean = false;
    canSpawn: boolean = true;
    colorRange: any = {
        0: [3, 4, 3, 4, 3, -1, 0, 4, 0, 4, 0],
        1: [3, 4, 2, 2, 5, -1, 3, 2, 3, 3, 2],
        2: [2, 5, 3, 2, 3, -1, 2, 5, 3, 5, 5],
        3: [2, 4, 2, 2, 5, -1, 3, 5, 3, 3, 4],
        4: [2, 3, 4, 2, 3, -1, 3, 2, 2, 4, 3],
        5: [4, 5, 2, 4, 2, -1, 5, 2, 3, 5, 4],
        6: [2, 2, 4, 5, 2, -1, 5, 5, 4, 3, 5],
    };

    constructor() {
        super();
        this.interactive = true;
        this.movingSpeed = GameConfig.Speed;
        this.timeToSpawn = GameConfig.TimeToSpawn;

        this.on("pointermove", (e: InteractionEvent) => {
            this.currentMousPos = e.data.getLocalPosition(this);
        });
        this.on("pointerdown", (e: InteractionEvent) => {
            this.currentMousPos = e.data.getLocalPosition(this);
        });
        this.on("pointerup", (e: InteractionEvent) => {
            this.moveCandyOnMouseEvent();
        });
    }

    createBoard() {
        const gridSprite = new Sprite(Globals.resources.gridSprite.texture);
        gridSprite.anchor.set(0.5);
        gridSprite.scale.set(1.1);
        gridSprite.position.x = 550;
        gridSprite.position.y = 1050;
        this.addChild(gridSprite);

        this.upArrow = new Sprite(Globals.resources.upArrow.texture);
        this.upArrow.anchor.set(0.5);
        this.upArrow.scale.set(0.9);
        this.upArrow.x = 550;
        this.upArrow.y = 1550;
        this.upArrow.visible = false;
        this.addChild(this.upArrow);

        for (let i = 0; i <= GameConfig.Rows; i++) {
            this.tilesGrid[i] = [];
            for (let j = 0; j < GameConfig.Columns; j++) {
                this.tilesGrid[i][j] = new Tile(this.tileId, i, j, this.xPos, this.yPos);
                if (i < 7) {
                    this.addChild(this.tilesGrid[i][j]);
                }
                this.xPos = this.xPos + this.xOffset;

                this.tileId++;
            }
            this.xPos = 80;
            this.yPos = this.yPos + this.yOffset;
        }

        // this.createGridLine();

        this.rowGlow = new Sprite(Globals.resources.rowGlow.texture);
        this.rowGlow.anchor.set(0.5);
        this.rowGlow.visible = false;
        this.rowGlow.position.y = 970;
        this.rowGlow.position.x = 550;
        this.addChild(this.rowGlow);

        if (CurrentGameData.TotalRounds == 0) {
            let block = new Blocks(false, 4, 0, 0);
            block.position.set(800, 1680);
            block.scale.set(0.9);
            this.colorBlocks.push(block);
            this.addChild(block);

            const helpingHand = new Sprite(Globals.resources.hand.texture);

            let b = new Sprite(Globals.resources[`Color${CurrentGameData.CurrentLevel}4`].texture);
            b.position.set(800, 1680);
            b.scale.set(1);
            b.alpha = 0.8;
            this.addChild(b);

            helpingHand.scale.set(0.4);
            helpingHand.anchor.set(0.5);
            helpingHand.position.y = 1760;
            helpingHand.position.x = 800;
            helpingHand.rotation = 190;
            this.addChild(helpingHand);

            const handTween = new Tween(helpingHand)
                .to({ x: 540, y: 1600 }, 3000)
                .onUpdate(() => {
                    b.position.x = helpingHand.position.x - 50;
                    b.position.y = helpingHand.position.y - 150;
                    if (helpingHand.x < 560) {
                        BlockTween.start();
                    }
                })
                .easing(Easing.Quintic.Out)
                .start();

            const BlockTween = new Tween(b)
                .to({ y: this.tilesGrid[1][2].position.y + 60 }, 1500)
                .easing(Easing.Quintic.Out)
                .onComplete(() => {
                    handTween.stop();
                    handTween.start();
                });

            const blockTween = new Tween(block.scale)
                .to({ x: 1.1, y: 1.1 }, 500)
                .easing(Easing.Circular.InOut)
                .onUpdate(() => {
                    if (block.grabbed) {
                        blockTween.stop();
                        BlockTween.stop();
                        handTween.stop();
                        block.scale.set(0.9);
                        helpingHand.destroy();
                        b.destroy();
                    }
                })
                .yoyo(true)
                .repeat(Infinity)
                .start();
        }

        this.spawnBlocksOnGrid();
    }

    updateGame(dt: number) {
        if (CurrentGameData.gameStarted) {
            const delta = Globals.App?.app.ticker.deltaMS ? Globals.App?.app.ticker.deltaMS : 0;
            this.timertoSpawn += delta / 100;
                                                              
            if (this.timertoSpawn >= this.timeToSpawn && this.canSpawn) {
                this.spawnOfGrid();
                this.timertoSpawn = 0;
            }
        }
        this.fillCheck();

        for (let i = 0; i < this.colorBlocks.length; i++) {
            if (!this.colorBlocks[i].grabbed && CurrentGameData.gameStarted) {
                this.colorBlocks[i].position.x += this.movingSpeed * dt;
            }

            if (this.colorBlocks[i].position.x >= 870 && !this.colorBlocks[i].grabbed) {
                this.placeAutomaticBlocks(i, this.colorBlocks[i]);
            }
        }

        this.colorBlocks.forEach((element) => {
            if (element.grabbed && this.currentMousPos != undefined) {
                element.position.x = this.currentMousPos.x;

                if (this.currentMousPos.y > 1550 && this.currentMousPos.y < 1700) {
                    element.position.y = this.currentMousPos.y;
                }
                if (this.currentMousPos.y <= 1550) {
                    element.position.y = 1550;
                }
                if (this.currentMousPos.x < 920 && this.currentMousPos.x > 180) {
                    element.position.x = this.currentMousPos.x;
                }
                if (this.currentMousPos.x >= 920) {
                    element.position.x = 920;
                }
                if (this.currentMousPos.x <= 180) {
                    element.position.x = 180;
                }

                this.dropPos = this.currentMousPos.x;

                this.rowGlow.visible = true;
                this.upArrow.visible = true;

                this.rowGlow.tint = GetColorCode(element.colorId);

                if (this.currentMousPos.x < 100 || this.currentMousPos.x > 1000 || this.currentMousPos.y > 1810) {
                    this.moveCandyOnMouseEvent();
                }

                if (CheckDropPos(this.dropPos) == 0) {
                    this.rowGlow.position.x = 220;
                    this.upArrow.position.x = 220;
                }
                if (CheckDropPos(this.dropPos) == 1) {
                    this.rowGlow.position.x = 385;
                    this.upArrow.position.x = 385;
                }
                if (CheckDropPos(this.dropPos) == 2) {
                    this.rowGlow.position.x = 550;
                    this.upArrow.position.x = 550;
                }
                if (CheckDropPos(this.dropPos) == 3) {
                    this.rowGlow.position.x = 715;
                    this.upArrow.position.x = 715;
                }
                if (CheckDropPos(this.dropPos) == 4) {
                    this.rowGlow.position.x = 880;
                    this.upArrow.position.x = 880;
                }
            }
        });
    }

    placeAutomaticBlocks(index: number, blockToMove: Blocks) {
        const rand = weightedRand(this.columnRange);
        const randTile = this.emptyTiles[rand() - 1];

        this.coloredBlockOnGrid[this.tilesGrid[randTile.xIndex][randTile.yIndex].tileId] = this.colorBlocks[index];
        this.tilesGrid[randTile.xIndex][randTile.yIndex].tileColor = this.colorBlocks[index].colorId;

        this.colorBlocks.splice(index, 1);

        blockToMove.moveTile(this.tilesGrid[randTile.xIndex][randTile.yIndex].position.x, this.tilesGrid[randTile.xIndex][randTile.yIndex].position.y);
        this.coloredBlockOnGrid[this.tilesGrid[randTile.xIndex][randTile.yIndex].tileId].moveTween.onComplete(() => {
            if (this.tilesGrid[randTile.xIndex][randTile.yIndex].tileColor != 1) {
                this.matchInBoard();
            } else {
                this.bombBurst(randTile.xIndex, randTile.yIndex);
            }
        });
        Globals.soundResources.CandyMoveSound.play();
        Globals.soundResources.CandyMoveSound.fade(0.5, 0.1, 500);
    }

    fillCheck() {
        for (let i = 0; i < GameConfig.Rows; i++) {
            for (let j = 0; j < GameConfig.Columns; j++) {
                if (
                    i >= 0 &&
                    j >= 0 &&
                    i < GameConfig.Rows &&
                    j < GameConfig.Columns &&
                    this.tilesGrid[j] != undefined &&
                    this.tilesGrid[i][j] != undefined
                ) {
                    if (this.tilesGrid[i][j].tileColor > 0 && this.tilesGrid[i + 1][j].tileColor == 0) {
                        this.emptyTiles[j] = this.tilesGrid[i + 1][j];
                    }
                    if (this.tilesGrid[i][j].tileColor == 0 && this.tilesGrid[i + 1][j].tileColor > 0) {
                        if (
                            this.coloredBlockOnGrid[this.tilesGrid[i + 1][j].tileId] != undefined &&
                            this.coloredBlockOnGrid[this.tilesGrid[i][j].tileId] != undefined
                        ) {
                            this.coloredBlockOnGrid[this.tilesGrid[i][j].tileId] = this.coloredBlockOnGrid[this.tilesGrid[i + 1][j].tileId];
                            this.tilesGrid[i + 1][j].tileColor = 0;
                            this.tilesGrid[i][j].tileColor = this.coloredBlockOnGrid[this.tilesGrid[i][j].tileId].colorId;
                            this.coloredBlockOnGrid[this.tilesGrid[i][j].tileId].moveTile(this.tilesGrid[i][j].position.x, this.tilesGrid[i][j].position.y);
                            this.coloredBlockOnGrid[this.tilesGrid[i][j].tileId].moveTween.onComplete(() => {
                                this.matchInBoard();
                            });
                        }
                    }
                }
            }
        }
    }
    moveCandyOnMouseEvent() {
        for (let index = 0; index < this.colorBlocks.length; index++) {
            if (this.colorBlocks[index].grabbed) {
                let dropPositon = CheckDropPos(this.dropPos);
                this.tilesGrid[this.emptyTiles[dropPositon].xIndex][this.emptyTiles[dropPositon].yIndex].tileColor = this.colorBlocks[index].colorId;
                this.colorBlocks[index].moveTile(
                    this.tilesGrid[this.emptyTiles[dropPositon].xIndex][this.emptyTiles[dropPositon].yIndex].position.x,
                    this.tilesGrid[this.emptyTiles[dropPositon].xIndex][this.emptyTiles[dropPositon].yIndex].position.y
                );
                this.coloredBlockOnGrid[this.tilesGrid[this.emptyTiles[dropPositon].xIndex][this.emptyTiles[dropPositon].yIndex].tileId] =
                    this.colorBlocks[index];
                this.colorBlocks.splice(index, 1);

                this.coloredBlockOnGrid[this.tilesGrid[this.emptyTiles[dropPositon].xIndex][this.emptyTiles[dropPositon].yIndex].tileId].moveTween.onComplete(
                    () => {
                        if (this.tilesGrid[this.emptyTiles[dropPositon].xIndex][this.emptyTiles[dropPositon].yIndex].tileColor != 1) {
                            this.matchInBoard();
                        } else {
                            this.bombBurst(this.emptyTiles[dropPositon].xIndex, this.emptyTiles[dropPositon].yIndex);
                        }
                    }
                );
            }
        }

        if (this.rowGlow.visible) {
            Globals.soundResources.CandyMoveSound.play();
            Globals.soundResources.CandyMoveSound.fade(0.5, 0.1, 500);

            this.upArrow.visible = false;
            this.rowGlow.visible = false;
        }
        CurrentGameData.grabbed = false;
    }

    spawnBlocksOnGrid() {
        //         for(let i = 0; i<GameConfig.startingSpawnRows;i++)
        //         {
        //             for(let j = 0;j<GameConfig.columns;j++)
        //     {
        //           let color = this.randomColor(this.maxColorId);
        //           let block = new Blocks(true,color,this.tilesGrid[i][j].xIndex,this.tilesGrid[i][j].yIndex);
        //           this.addChild(block);
        //           this.coloredBlockOnGrid[this.tilesGrid[i][j].tileId] = block;
        //           this.tilesGrid[i][j].tileColor =  color;
        //           block.position.x = this.tilesGrid[i][j].position.x+140;
        //           block.position.y = this.tilesGrid[i][j].position.y+140;
        //     }
        // }
        let object: number = -1;
        if (CurrentGameData.TotalRounds == 0) {
            object = 0;
        } else {
            const lvl = randomRange(7);
            object = lvl;
        }
        let x = 0;
        let y = 0;
        let colorId: number = 0;
        for (let i = 0; i < this.colorRange[object].length; i++) {
            if (this.colorRange[object][x] == -1) {
                x = 0;
                y = 1;
                colorId++;
            }
            if (this.colorRange[object][colorId] != 0 && this.colorRange[object][x] != -1 && this.colorRange[object][colorId]) {
                let block = new Blocks(true, this.colorRange[object][colorId], this.tilesGrid[y][x].xIndex, this.tilesGrid[y][x].yIndex);
                block.position.x = this.tilesGrid[y][x].position.x + 140;
                block.position.y = this.tilesGrid[y][x].position.y + 140;
                this.addChild(block);
                this.coloredBlockOnGrid[this.tilesGrid[y][x].tileId] = block;
                this.tilesGrid[y][x].tileColor = this.colorRange[object][colorId];
                colorId++;
                x++;
            }

            if (this.colorRange[object][colorId] == 0) {
                colorId++;
                x++;
            }
        }
    }

    spawnOfGrid() {
        let color = randomRange(this.maxColorId);
//    let color = 1
        if (color == 1) {
            color = randomRange(this.maxColorId);
        }

        let block = new Blocks(false, color, 0, 0);
        this.colorBlocks.push(block);

        this.addChild(block);
    }

    matchInBoard() {
        for (let i = 0; i < GameConfig.Rows; i++) {
            for (let j = 0; j < GameConfig.Columns; j++) {
                if (this.tilesGrid[i][j].tileColor != 0) {
                    if (this.tilesGrid[i][j].tileColor <= 1) {
                        this.bombBurst(i, j);
                    } else {
                        this.isPartOfMatch(i, j);
                    }
                }
            }
        }

        if (this.matches.length > 0) {
            if (this.scoreMultiplier >= 2) {
                this.showScoreMultiplier(`X ${this.scoreMultiplier.toString()}`, this.matches[0].tileColor, false, 150);
                this.giveCoins(false, undefined);
            }

            this.removeChildAtTile();
            this.scoreMultiplier++;
            return;
        } else {
            this.scoreMultiplier = 1;
        }
        if (this.matches.length == 0) {
            for (let j = 0; j < GameConfig.Columns; j++) {
                if (this.tilesGrid[GameConfig.Rows - 1][j].tileColor != 0) {
                    this.coloredBlockOnGrid[this.tilesGrid[GameConfig.Rows - 1][j].tileId].blinkAndRestart();
                    this.movingSpeed = 0;
                    this.interactive = false;
                    this.canSpawn = false;
                    this.colorBlocks.forEach((element) => {
                        element.visible = false;
                    });
                    setTimeout(() => {
                        // this.colorBlocks.forEach(element => { element.visible = false; });
                        Globals.emitter?.Call("RestartGame");
                    }, 2000);

                    return;
                }
            }
        }
    }

    removeChildAtTile() {
        for (let i = 0; i < this.matches.length; i++) {
            if (this.matches[i].tileColor > 1) {
                const explode = new Explode(
                    GetAnimationSprites(this.matches[i].tileColor),
                    this.tilesGrid[this.matches[i].xIndex][this.matches[i].yIndex].position.x,
                    this.tilesGrid[this.matches[i].xIndex][this.matches[i].yIndex].position.y,
                    this.matches[i].tileColor
                );
                this.addChild(explode);
            }
            if (this.matches[i].tileColor == 1) {
                Globals.soundResources.bombBurstSound1.play();
                Globals.soundResources.bombBurstSound1.fade(0.9, 0.1, 500);
                Globals.soundResources.bombBurstSound2.play();
                Globals.soundResources.bombBurstSound2.fade(1, 0.1, 500);
                Globals.soundResources.bombBurstSound3.play();
                Globals.soundResources.bombBurstSound3.fade(0.9, 0.1, 500);

                if (this.matches.length > 3) {
                    this.giveCoins(true, this.coloredBlockOnGrid[this.matches[i].tileId]);
                }

                if (this.scoreMultiplier > 0) this.scoreMultiplier--;
            }
            if (this.matches[i].tileColor > 0) {
                CurrentGameData.score += 5 * this.scoreMultiplier;
                ScoreFunctions.setScore(CurrentGameData.score);
                // console.log(this.matches[i].tileColor);
                // console.log(CurrentGameData.score);
            }

            this.removeChild(this.coloredBlockOnGrid[this.matches[i].tileId]);
            this.tilesGrid[this.matches[i].xIndex][this.matches[i].yIndex].tileColor = 0;
        }
        if (CurrentGameData.TotalRounds == 1) {
            CurrentGameData.gameStarted = true;
        }
        Globals.soundResources.burstSound.play();
        Globals.soundResources.burstSound.fade(0.2, 0.1, 500);
        this.matches.splice(0, this.matches.length);
        Globals.emitter?.Call("ScreenShake");

        this.fillCheck();
    }

    giveCoins(bombActive: boolean, object: DisplayObject | undefined) {
        let point: any;
        CurrentGameData.Biscuits += 5;
        updateBalance(CurrentGameData.Biscuits);
        if (!bombActive) {
            if (this.matches.length % 2 == 0 && this.coloredBlockOnGrid[this.matches[this.matches.length / 2].tileId]) {
                point = fetchGlobalPosition(this.coloredBlockOnGrid[this.matches[this.matches.length / 2].tileId]);
            } else {
                point = fetchGlobalPosition(this.coloredBlockOnGrid[this.matches[(this.matches.length - 1) / 2].tileId]);
            }
        }
        if (bombActive) {
            if (object) point = fetchGlobalPosition(object);
        }
        if (point) {
            Globals.emitter?.Call("GiveBiscuits", { x: point.x, y: point.y });
        }
    }

    increaseLevl() {
        if (CurrentGameData.score > 100 && CurrentGameData.score < 300 && this.canChangeLevel) {
            this.increaseLvl();
            this.timeToSpawn = 13;
            this.canChangeLevel = false;
        }

        if (CurrentGameData.score > 300 && CurrentGameData.score < 500 && !this.canChangeLevel) {
            this.increaseLvl();
            this.timeToSpawn = 11;
            this.canChangeLevel = true;
        }

        if (CurrentGameData.score > 500 && CurrentGameData.score < 900 && this.canChangeLevel) {
            this.increaseLvl();
            this.timeToSpawn = 9;
            this.canChangeLevel = false;
        }

        if (CurrentGameData.score > 900 && CurrentGameData.score < 1000 && !this.canChangeLevel) {
            this.increaseLvl();
            this.canChangeLevel = true;
        }

        if (CurrentGameData.score > 1000 && this.canChangeLevel) {
            this.increaseLvl();
            this.timeToSpawn = 8;
            this.canChangeLevel = false;
        }
    }

    increaseLvl() {
        // this.movingSpeed -= 1;
        this.maxColorId++;
        const currentLevel = this.maxColorId - 5;

        this.showScoreMultiplier(`Level ${currentLevel.toString()}`, 0, true, 150);
    }
    // returns true if the item at (row, column) is part of a match
    isPartOfMatch(row: number, column: number) {
        const isVertical = this.isPartOfVerticalMatch(row, column);
        const isHorizontal = this.isPartOfHorizontalMatch(row, column);
        const isDiagnol = this.isPartOfDiagnolMatch(row, column);

        return isVertical || isHorizontal || isDiagnol;
    }

    // returns true if the item at (row, column) is part of an horizontal match
    isPartOfHorizontalMatch(row: number, column: number) {
        return (
            this.valueAt(row, column, row, column - 1, row, column - 2) ||
            this.valueAt(row, column, row, column + 1, row, column + 2) ||
            this.valueAt(row, column, row, column - 1, row, column + 1)
        );
    }

    // returns the value of the item at (row, column), or false if it's not a valid pick
    valueAt(row1: number, column1: number, row2: number, column2: number, row3: number, column3: number) {
        return this.validPick(row1, column1, row2, column2, row3, column3);
    }

    validPick(row1: number, column1: number, row2: number, column2: number, row3: number, column3: number) {
        if (
            row1 >= 0 &&
            row1 < GameConfig.Rows &&
            column1 >= 0 &&
            column1 < GameConfig.Columns &&
            this.tilesGrid[row1] != undefined &&
            this.tilesGrid[row1][column1] != undefined &&
            row2 >= 0 &&
            row2 < GameConfig.Rows &&
            column2 >= 0 &&
            column2 < GameConfig.Columns &&
            this.tilesGrid[row2] != undefined &&
            this.tilesGrid[row2][column2] != undefined &&
            row3 >= 0 &&
            row3 < GameConfig.Rows &&
            column3 >= 0 &&
            column3 < GameConfig.Columns &&
            this.tilesGrid[row3] != undefined &&
            this.tilesGrid[row3][column3] != undefined &&
            this.tilesGrid[row1][column1].tileColor != 0 &&
            this.tilesGrid[row2][column2].tileColor != 0 &&
            this.tilesGrid[row3][column3].tileColor != 0
        ) {
            if (
                this.tilesGrid[row1][column1].tileColor === this.tilesGrid[row2][column2].tileColor &&
                this.tilesGrid[row1][column1].tileColor == this.tilesGrid[row3][column3].tileColor
            ) {
                this.matches.push(this.tilesGrid[row1][column1], this.tilesGrid[row2][column2], this.tilesGrid[row3][column3]);
                return this.tilesGrid[row1][column1], this.tilesGrid[row2][column2], this.tilesGrid[row3][column3];
            }
        }
    }
    // returns true if the item at (row, column) is part of an Vertical match
    isPartOfVerticalMatch(row: number, column: number) {
        return (
            this.valueAt(row, column, row - 1, column, row - 2, column) ||
            this.valueAt(row, column, row + 1, column, row + 2, column) ||
            this.valueAt(row, column, row - 1, column, row + 1, column)
        );
    }

    isPartOfDiagnolMatch(row: number, column: number) {
        return (
            this.valueAt(row, column, row - 1, column, row, column - 1) ||
            this.valueAt(row, column, row - 1, column, row, column + 1) ||
            this.valueAt(row, column, row + 1, column, row, column + 1) ||
            this.valueAt(row, column, row + 1, column, row, column - 1)
        );
    }

    showScoreMultiplier(scoreMultiplier: string, colorId: number, level: boolean, scale: number) {
        const text = new TextLabel(550, 2000, 0.5, scoreMultiplier, scale, GetColorCode(colorId));
        text.style.dropShadow = true;
        text.style.dropShadowDistance = 3;
        // text.style.fontWeight = "bold";

        text.style.lineJoin = "bevel";
        (text.style.stroke = "0xFFFFFF"), (text.style.strokeThickness = 3);

        this.addChild(text);

        new Tween(text)
            .easing(Easing.Elastic.InOut)
            .onComplete(() => {
                this.removeChild(text);
            })
            .yoyo(true)
            .start();

        if (level) {
            this.levelText = true;
            new Tween(text)
                .to({ y: 800 }, 1000)
                .easing(Easing.Elastic.InOut)
                .onComplete(() => {
                    this.removeChild(text);
                    this.levelText = false;
                })
                .yoyo(true)
                .start();
        } else if (scoreMultiplier == "New HighScore !!" && !level) {
            this.highscoreText = true;
            if (!this.levelText && !this.multiplyerText) {
                new Tween(text)
                    .to({ y: 1050 }, 1000)
                    .easing(Easing.Elastic.InOut)
                    .onComplete(() => {
                        this.removeChild(text);
                        this.highscoreText = false;
                    })
                    .yoyo(true)
                    .start();
            }
            if (this.levelText && !this.multiplyerText) {
                new Tween(text)
                    .to({ y: 1050 }, 1000)
                    .easing(Easing.Elastic.InOut)
                    .onComplete(() => {
                        this.removeChild(text);
                        this.highscoreText = false;
                    })
                    .yoyo(true)
                    .start();
            }
            if (!this.levelText && this.multiplyerText) {
                new Tween(text)
                    .to({ y: 800 }, 1000)
                    .easing(Easing.Elastic.InOut)
                    .onComplete(() => {
                        this.removeChild(text);
                        this.highscoreText = false;
                    })
                    .yoyo(true)
                    .start();
            }
            if (this.levelText && this.multiplyerText) {
                setTimeout(() => {
                    new Tween(text)
                        .to({ y: 800 }, 1000)
                        .easing(Easing.Elastic.InOut)
                        .onComplete(() => {
                            this.removeChild(text);
                            this.highscoreText = false;
                        })
                        .yoyo(true)
                        .start();
                }, 1000);
            }
        } else if (scoreMultiplier != "New HighScore !!" && !level) {
            this.multiplyerText = true;
            new Tween(text)
                .to({ y: 1050 }, 1000)
                .easing(Easing.Elastic.InOut)
                .onComplete(() => {
                    this.removeChild(text);
                    this.multiplyerText = false;
                })
                .yoyo(true)
                .start();
        }
    }
    bombBurst(x: number, y: number) {
        
        if (CurrentGameData.gameStarted) {
            this.matches.push(this.tilesGrid[x][y]);
            console.log("bomb",x,y)

            if (x - 1 >= 0 && this.tilesGrid[x - 1][y] && this.tilesGrid[x - 1][y].tileColor > 1) {
                this.matches.push(this.tilesGrid[x - 1][y]);
            }
            if (x + 1 >= 0 && this.tilesGrid[x + 1][y] != undefined && this.tilesGrid[x + 1][y].tileColor > 1) {
                this.matches.push(this.tilesGrid[x + 1][y]);
            }
            if (y - 1 >= 0 && this.tilesGrid[y][y - 1] != undefined && this.tilesGrid[x][y - 1].tileColor > 1) {
                this.matches.push(this.tilesGrid[x][y - 1]);
            }
            if (y + 1 >= 0 && this.tilesGrid[y][y + 1] != undefined && this.tilesGrid[x][y + 1].tileColor > 1) {
                this.matches.push(this.tilesGrid[x][y + 1]);
            }

            if (y - 1 >= 0 && x - 1 >= 0 && this.tilesGrid[x - 1][y - 1] != undefined && this.tilesGrid[x - 1][y - 1].tileColor > 1) {
                this.matches.push(this.tilesGrid[x - 1][y - 1]);
            }
            if (y + 1 >= 0 && x - 1 >= 0 && this.tilesGrid[x - 1][y + 1] != undefined && this.tilesGrid[x - 1][y + 1].tileColor > 1) {
                this.matches.push(this.tilesGrid[x - 1][y + 1]);
            }
            if (y - 1 >= 0 && x + 1 >= 0 && this.tilesGrid[x + 1][y - 1] != undefined && this.tilesGrid[x + 1][y - 1].tileColor > 1) {
                this.matches.push(this.tilesGrid[x + 1][y - 1]);
            }
            if (y + 1 >= 0 && x + 1 >= 0 && this.tilesGrid[x + 1][y + 1] != undefined && this.tilesGrid[x + 1][y + 1].tileColor > 1) {
                this.matches.push(this.tilesGrid[x + 1][y + 1]);
            }
            this.removeChildAtTile();
        }
    }
}

export class Tile extends Graphics {
    tileId!: number;
    tileColor: number = 0;
    xIndex!: number;
    yIndex!: number;

    constructor(id: number, xIndex: number, yIndex: number, x: number, y: number) {
        super();

        this.tileId = id;
        this.xIndex = xIndex;
        this.yIndex = yIndex;
        // this.beginFill(0x000000, 0.4);
        // this.drawRoundedRect(0, 0, 155, 155, 16);
        this.x = x;
        this.y = y;
        // this.endFill();
        this.zIndex = 1;
        this.interactive = false;
    }
}

export class Blocks extends Sprite {
    colorId: number;
    grabbed: boolean = false;
    mouseCol: any;
    Offset: number = 140;

    moveTween!: Tween<this>;
    burstTween!: Tween<ObservablePoint>;

    constructor(onGrid: boolean, colorId: number, posX: number, posY: number) {
        let Color = `Color${CurrentGameData.CurrentLevel}${colorId}`;
        if (colorId === 1) {
            Color = `Color${colorId}`;
        }

        super(Globals.resources[Color].texture);

        this.colorId = colorId;
        this.scale.set(0);
        this.interactive = false;
        this.anchor.set(0.5);

        new Tween(this.scale)
            .to({ x: 0.9, y: 0.9 }, 500)
            .easing(Easing.Exponential.InOut)
            .onComplete(() => {
                this.interactive = true;
            })
            .yoyo(true)
            .start();

        if (onGrid) {
            this.x = posX + this.Offset;
            this.y = posY + this.Offset;
        }
        if (!onGrid) {
            this.x = 140;
            this.y = 1680;
        }

        this.on("pointerdown", () => {
            if (!CurrentGameData.grabbed) {
                this.grabbed = true;
                CurrentGameData.grabbed = true;
            }
        });
    }
    moveTile(xPos: number, yPos: number) {
        this.moveTween = new Tween(this)
            .to({ x: xPos + 140, y: yPos + 140 }, 850)
            .easing(Easing.Back.Out)
            .start();

        setTimeout(() => {
            this.anchor.set(0.5, 0);
            new Tween(this.scale)
                .to({ x: 1.1, y: 0.5 }, 200)
                .easing(Easing.Back.InOut)
                .repeat(1)
                .yoyo(true)
                .onComplete(() => {
                    this.scale.set(0.9);
                })
                .start();
            this.anchor.set(0.5);
        }, 350);
    }

    blinkAndRestart() {
        new Tween(this).to({ alpha: 0.3 }, 500).easing(Easing.Circular.InOut).yoyo(true).repeat(4).start();
    }

    burst() {
        this.burstTween = new Tween(this.scale).to({ x: 3, y: 3 }, 850).easing(Easing.Exponential.Out).start();
    }
}
export class Explode extends Container {
    anim!: AnimatedSprite;
    aura!: Sprite;
    constructor(sprites: any[], xPos: number, yPos: number, colorId: number) {
        super();

        this.tweenAura(colorId, xPos, yPos);
        this.anim = new AnimatedSprite(sprites);

        // configure + start animation:
        this.anim.animationSpeed = 0.5;
        this.anim.loop = false; // 6 fps
        this.anim.position.set(xPos, yPos); // almost bottom-left corner of the canvas
        this.addChild(this.anim);
        this.anim.play();
    }
    tweenAura(colorId: number, xPos: number, yPos: number) {
        this.aura = new Sprite(Globals.resources[`CandyAura${colorId}`].texture);
        this.aura.scale.set(0);
        this.addChild(this.aura);
        this.aura.anchor.set(0.5);
        this.aura.position._x = xPos + 140;
        this.aura.position._y = yPos + 140;

        new Tween(this.aura.scale)
            .to({ x: 1.2, y: 1.2 }, 200)
            .easing(Easing.Circular.Out)
            .onComplete(() => {
                this.destroy();
            })
            .yoyo(true)
            .start();
    }
}
