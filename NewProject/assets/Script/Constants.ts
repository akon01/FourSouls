import { beforeInstance, beforeMethod, afterMethod } from "kaop-ts";
import Signal from "../Misc/Signal";
import PlayerManager from "./Managers/PlayerManager";

export const MAX_PLAYERS = 2;

export const MAX_TURNID = MAX_PLAYERS;

export const CARD_WIDTH = 50;
export const CARD_HEIGHT = 70;
export const SCREEN_WIDTH = 1920;
export const SCREEN_HEIGHT = 1080;

export enum HAND_POSITIONS {
  FIRST_X = SCREEN_WIDTH / 2,
  FIRST_Y = CARD_HEIGHT / 2,
  SECOND_X = SCREEN_WIDTH / 2,
  SECOND_Y = SCREEN_HEIGHT - CARD_HEIGHT / 2
}

export enum DESK_POSITIONS {
  FIRST_X = SCREEN_WIDTH * (3 / 4) + 67,
  FIRST_Y = CARD_HEIGHT / 2 + 120,
  SECOND_X = SCREEN_WIDTH * (3 / 4) + 67,
  SECOND_Y = SCREEN_HEIGHT - CARD_HEIGHT / 2 - 120
}

export enum CARD_TYPE {
  LOOT = 1,
  MONSTER = 2,
  CHAR = 3,
  CHARITEM = 4,
  TREASURE = 5,
  EXTRASOUL = 6
}

export enum ROLL_TYPE {
  ATTACK = 1,
  FIRSTATTACK = 2,
  EFFECT = 3,
  EFFECTROLL = 4
}

export enum STATS {
  HP = 1,
  DMG = 2,
  ROLLBONUS = 3,
}

export enum PASSIVE_TYPE {
  BEFORE = 1,
  AFTER = 2
}

export enum ACTION_TYPE {
  PLAYERACTION = 1,
  ACTIVECARDEFFECT = 2,
  EFFECT = 3,
  ROLL = 4
}

export enum COLLECTORTYPE {
  PLAYERS = 1,
  AUTO = 2,
  EFFECT = 3
}

export enum ITEM_TYPE {
  PASSIVE,
  ACTIVE,
  BOTH
}

export enum CONDITION_TYPE {
  PASSIVE,
  ACTIVE,
  BOTH
}

export enum CHOOSE_TYPE {
  PLAYER = "player",
  PLAYERHAND = "playerHand",
  DECKS = "decks",
  MONSTERPLACES = "monsterplaces",
  STOREPLACES = "storeplaces",
  PLAYERNONETERNALS = "playernoneternals"
}

export enum COLORS {
  GREEN = "35%, 75%, 10%",
  RED = "50%, 10%, 10%",
  PURPLE = "60%, 10%, 60%",
  BLUE = "10%, 10%, 55%",
  LIGHTRED = "75%, 10%, 10%",
  LIGHTBLUE = "10%, 10%, 75%"
}

export const TIMETODRAW = 0.7;
export const TIMETOBUY = 0.7;
export const BLINKINGSPEED = 1;
export const TIMETOPLAYLOOT = 0.7;
export const TIMETOSHOWPREVIEW = 0.5;
export const TIMETOHIDEPREVIEW = 0.5;
export const TIMETOROTATEACTIVATION = 0.5;
export const TIMETOREACTONACTION = 5;
export const TIMEFORDICEROLL = 0.3;
export const TIMEFORMONSTERDISCARD = 1;
export const TIMEFORTREASUREDISCARD = 2;

export let ServerIp = "localhost:7456/"

export const printMethodStarted = (color: COLORS) =>
  beforeMethod(meta => {
    let className;
    let classDesc = meta.target.toString().split(" ");
    let argsString = "";

    if (meta.target instanceof cc.Component) {
      className = "Component";
    } else {
      className = classDesc[1];
    }
    cc.log(
      "%c" + className + ": " + meta.key + " started: " + argsString,
      "color:rgb(" + color.toString() + ")",
      meta.args
    );
  });

export const printMethodEnded = (color: COLORS) =>
  afterMethod(meta => {
    let classDesc = meta.target.toString().split(" ");
    let className = classDesc[1];
    cc.log(
      "%c" + className + ": " + meta.key + " ended:",
      "color:rgb(" + color.toString() + ")"
    );
  });

export const printMethodSignal = beforeMethod(meta => {
  let classDesc = meta.target.toString().split(" ");
  let className = classDesc[1];

  // if(meta.args[0] == Signal.GETREACTION){
  //   //cc.log(
  //     "%c" +
  //     " Signal :" +
  //     meta.args[0] +
  //     "\n" +
  //     " Data :" +
  //     meta.args[1],
  //     "color:rgb(10%, 0%, 60%)"
  //   );
  // }

  cc.log(
    "%c" + " Signal :" + meta.args[0],
    "color:rgb(10%, 0%, 60%)"
  );
  cc.log(
    meta.args[1],
  );
});

export const checkIfPlayerIsDead = afterMethod(async meta => {
  let player = meta.scope;
  let isDead = await player.checkIfDead();

  meta.commit();
});
