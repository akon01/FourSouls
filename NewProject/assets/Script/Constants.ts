import { beforeInstance, beforeMethod, afterMethod } from "kaop-ts";

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
  EFFECT = 3
}

export enum ACTION_TYPE {
  PLAYERACTION = 1,
  ACTIVECARDEFFECT = 2,
  EFFECT = 3
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

export enum CHOOSE_TYPE {
  PLAYER = "player",
  PLAYERHAND = "playerHand",
  DECKS = "decks"
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
export const TIMETOREACTONACTION = 1.5;

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

  cc.log(
    "%c" + className + ":\n" + meta.key + " Signal is :" + meta.args[0],
    "color:rgb(10%, 0%, 60%)"
  );
});
