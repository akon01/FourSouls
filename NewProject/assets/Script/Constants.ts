import { afterMethod, beforeMethod } from "kaop-ts";
import CardManager from "./Managers/CardManager";

export const MAX_PLAYERS = 2;

export const MAX_TURNID = MAX_PLAYERS;

export const CARD_WIDTH = 200;
export const CARD_HEIGHT = 280;
export const SCREEN_WIDTH = 3840;
export const SCREEN_HEIGHT = 2160;

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

export enum STACK_EFFECT_TYPE {
  ACTIVATE_ITEM = 1,
  ATTACK_ROLL = 2,
  COMBAT_DAMAGE = 3,
  DECLARE_ATTACK = 4,
  MONSTER_DEATH = 5,
  MONSTER_END_DEATH = 6,
  MONSTER_REWARD = 7,
  PLAY_LOOT_CARD = 8,
  PURCHASE_ITEM = 9,
  REFILL_EMPTY_SLOT = 10,
  ROLL_DICE = 11,
  TAKE_DAMAGE = 12,
  START_TURN_LOOT = 13,
  ACTIVATE_PASSIVE_EFFECT = 14,
  PLAYER_DEATH = 15,
  PLAYER_DEATH_PENALTY = 16,
}

export enum ROLL_TYPE {
  ATTACK = 1,
  FIRST_ATTACK = 2,
  EFFECT = 3,
  EFFECT_ROLL = 4
}

export enum STATS {
  HP = 1,
  DMG = 2,
  ROLL_BONUS = 3,
}

export enum PASSIVE_TYPE {
  BEFORE = 1,
  AFTER = 2
}

export enum ACTION_TYPE {
  PLAYER_ACTION = 1,
  ACTIVE_CARD_EFFECT = 2,
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
  BOTH,
  TO_ADD_PASSIVE,
  PAID
}

export enum CONDITION_TYPE {
  PASSIVE,
  ACTIVE,
  BOTH
}


export enum CHOOSE_CARD_TYPE {
  ALL_PLAYERS = 1,
  MY_HAND = 2,
  DECKS = 3,
  MONSTER_PLACES = 4,
  STORE_PLACES = 5,
  MY_NON_ETERNALS = 6,
  ALL_PLAYERS_ITEMS = 7,
  ALL_PLAYERS_NON_ETERNAL_ITEMS = 17,
  MY_ITEMS = 8,
  MY_ACTIVATED_ITEMS = 9,
  MY_NON_ACTIVATED_ITEMS = 10,
  ALL_PLAYERS_ACTIVATED_ITEMS = 11,
  ALL_PLAYERS_NON_ACTIVATED_ITEMS = 12,
  PLAYERS_AND_ACTIVE_MONSTERS = 13,
  SPECIPIC_PLAYER_HAND = 14,
  MY_CURSES = 15,
  ALL_CURSES = 16,

}

export enum CARD_POOLS {

  ACTIVE_MONSTERS = 1,
  YOUR_HAND = 2,
  ALL_PLAYERS = 3,

}


export enum TARGETTYPE {

  PLAYER, MONSTER, ITEM, PILE, DECK, CARD, STACK_EFFECT
}

export enum PASSIVE_EVENTS {

  PLAYER_MISS_ATTACK,
  PLAYER_GET_HIT,
  /**
   * args = [damage taken,num of missed dice roll]
   */
  PLAYER_COMBAT_DAMAGE_TAKEN,
  PLAYER_CHANGE_MONEY,
  PLAYER_PAY_DEATH_PANELTIES,
  PLAYER_ROLL_DICE,
  PLAYER_END_TURN,
  PLAYER_BUY_ITEM,

  MONSTER_GET_HIT,
}



export enum COLORS {
  GREEN = "35%, 75%, 10%",
  RED = "50%, 10%, 10%",
  PURPLE = "60%, 10%, 60%",
  BLUE = "10%, 10%, 55%",
  LIGHTRED = "75%, 10%, 10%",
  LIGHTBLUE = "10%, 10%, 75%"
}

export const TIME_TO_DRAW = 0.7;
export const TIME_TO_BUY = 0.7;
export const BLINKING_SPEED = 1;
export const TIME_TO_PLAY_LOOT = 0.7;
export const TIME_TO_SHOW_PREVIEW = 0.5;
export const TIME_TO_HIDE_PREVIEW = 0.5;
export const TIME_TO_ROTATE_ACTIVATION = 0.5;
export const TIME_TO_REACT_ON_ACTION = 15;
export const TIME_FOR_DICE_ROLL = 0.3;
export const TIME_FOR_MONSTER_DISCARD = 1;
export const TIME_FOR_TREASURE_DISCARD = 2;

export let ServerIp = "localhost:7456/"





export const checkIfPlayerIsDead = afterMethod(async meta => {
  let player = meta.scope;
  let isDead = await player.checkIfDead();

  meta.commit();
});
