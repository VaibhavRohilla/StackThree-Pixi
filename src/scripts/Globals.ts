
import { Howl } from 'howler';
import * as PIXI from 'pixi.js';
import { App } from './App';
import { ScoreFunctions } from './DataHandler';
import { MyEmitter } from './MyEmitter';
import { SceneManager } from './SceneManager';

type globalDataType = {
  resources: PIXI.utils.Dict<PIXI.LoaderResource>;
  emitter: MyEmitter | undefined;
  isMobile: boolean;
  // fpsStats : Stats | undefined,
  soundResources: { [key: string]: Howl };

  App: App | undefined,
};

export const Globals: globalDataType = {
  resources: {},
  emitter: undefined,
  get isMobile() {
    //  return true;
    return PIXI.utils.isMobile.any;
  },
  // fpsStats: undefined,
  App: undefined,
  soundResources: {},

};

export const GameConfig = {
  Rows: 8,
  Columns: 5,
  StartingSpawnRows: 2,
  Timer: 120,
  Speed: 3,
  TimeToSpawn: 15,
};

export const CurrentGameData = {
  score: 0,
  highScore: 0,
  lastScore: 0,
  timerLeft: 0,
  gameStarted: false,
  TotalRounds: 0,
  CurrentLevel: 0,
  Biscuits: 0,
  grabbed: false,
};

export function SetGameNumber() {
  let RoundsPlayed = ScoreFunctions.getOtherScore("TotalRounds");
  if (RoundsPlayed != null) {
    ScoreFunctions.setOtherScore("TotalRounds", RoundsPlayed + 1);

  } else {
    ScoreFunctions.addOtherScore("TotalRounds", 1);
  }

  if (RoundsPlayed != null) {
    CurrentGameData.TotalRounds = RoundsPlayed;
  }
}

export const ChangeBg = () => {
  if (CurrentGameData.CurrentLevel <= 1) {
    return 0;
  }
  if (CurrentGameData.CurrentLevel > 1 && CurrentGameData.CurrentLevel <= 3) {
    return 1;
  }
  if (CurrentGameData.CurrentLevel == 4) {
    return 2;
  }
  if (CurrentGameData.CurrentLevel == 5) {
    return 3;
  }
  if (CurrentGameData.CurrentLevel == 6) {
    return 4;
  }
  if (CurrentGameData.CurrentLevel == 7) {
    return 5;
  }
  if (CurrentGameData.CurrentLevel == 8) {
    return 6;
  }
}
export function GetAnimationSprites(colorId: number) {

  let animatedSprite: (PIXI.Texture<PIXI.Resource> | undefined)[] = [];
  for (let i = 0; i <= 6; i++) {
    animatedSprite.push(Globals.resources[`CandyExplosion${colorId}${i}`].texture);
  }

  return animatedSprite;
}

export function weightedRand(spec: any) {
  var i, j, table: any = [];
  for (i in spec) {
    // The constant 10 below should be computed based on the
    // weights in the spec for a correct and optimal table size.
    // E.g. the spec {0:0.999, 1:0.001} will break this impl.
    for (j = 0; j < spec[i] * 10; j++) {
      table.push(i);
    }
  }
  return function () {
    return table[Math.floor(Math.random() * table.length)];
  }
}

export function randomRange(max: number): number {
  let rNumber = Math.floor(Math.random() * (max - 1)) + 1;
  return rNumber;
}
export function GetColorCode(colorId: any) {
  let colorCode = 0xFFFFFF;

  if (colorId == 1) { colorCode = 0x000000; }

  else if (colorId == 2) { colorCode = 0xea213a; }

  else if (colorId == 3) { colorCode = 0xff7400; }

  else if (colorId == 4) { colorCode = 0x23ff96; }

  else if (colorId == 5) { colorCode = 0x449cf4; }

  else if (colorId == 6) { colorCode = 0x9f78cc; }

  else if (colorId == 7) { colorCode = 0xf5d7ff; }

  else if (colorId == 8) { colorCode = 0x746a8e; }

  else if (colorId == 15) { colorCode = 0xebecf0; }

  else { colorCode = 0xFFFFFF }

  return colorCode;

}
export function CheckDropPos(dropPos: number) {
  let index = 0;
  if (dropPos < 240) {
    index = 0;
  }

  if (dropPos > 280 && dropPos < 450) {
    index = 1;

  }

  if (dropPos >= 450 && dropPos < 640) {
    index = 2;

  }

  if (dropPos >= 620 && dropPos < 790) {
    index = 3;

  }

  if (dropPos >= 790) {
    index = 4;

  }
  return index;
}
