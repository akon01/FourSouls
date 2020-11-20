import { afterMethod, beforeMethod } from "kaop-ts";
import Signal from "../Misc/Signal";
import CardManager from "./Managers/CardManager";

export const MAX_PLAYERS = 2;

export const MAX_TURNID = MAX_PLAYERS;

export const CARD_WIDTH = 100;
export const CARD_HEIGHT = 140;
export const SCREEN_WIDTH = 1980;
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
  EXTRASOUL = 6,
  LOOT_PLAY = 7,
  BONUS_SOULS = 8,
  CURSE = 9,
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
  ACTIVE_AND_PASSIVE,
  TO_ADD_PASSIVE,
  PAID,
  ACTIVE_AND_PAID,
  PASSIVE_AND_PAID,
  ALL
}

export enum ARGS_TYPES {
  CARD, PLAYER, NUMBER
}

export enum PASSIVE_META_COMPONENTS {
  SCOPE = 1,
  ARGS = 2,
  RESULT = 3,
}

export enum CONDITION_TYPE {
  PASSIVE,
  ACTIVE,
  BOTH
}

export enum PLAYER_RESOURCES {
  MONEY = 1,
  LOOT = 2
}

export enum ADMIN_COMMANDS {
  LOG,
  COINS,
  HEAL,
  HP,
  DMG,
  DICE,
  SOUL,
  CHARGE,
  ROLL,
  CARD,
  RUN,
  STACKTRACE,
  STACK,
  NEXT_LOOT,
  NEXT_ITEM,
  NEXT_MONSTER,
  SET_TEST_MODE
}

export enum ADMIN_COMMANDS2 {
  LOG = "LOG",

}

export enum INPUT_TYPE {
  TEXT_INPUT,
  NUMBER_INPUT,
  NONE
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
  STORE_CARDS = 18,
  SPECIPIC_PLAYER_ITEMS = 19,
  SPECIPIC_PLAYER_ITEMS_WITHOUT_ETERNALS = 20,
  NON_ATTACKED_ACTIVE_MONSTERS = 21,
  ALL_PLAYERS_SOUL_CARDS = 22,
  PILES = 23,
  IN_TREASURE_DECK_GUPPY_ITEMS = 24,
  OTHER_PLAYERS_NON_ETERNAL_ITEMS = 25,
  MOST_SOULS_PLAYERS = 26,
  MY_SOUL_CARDS = 27
}

export enum PLAYER_FILTERS {

}

export enum SIGNS {
  EQUAL,
  NOT_EQUAL,
  GREATER_THAN,
  GREATER_EQUAL_THAN,
  SMALLER_THAN,
  SMALLER_EQUAL_THAN,
}

export enum CARD_POOLS {
  ACTIVE_MONSTERS = 1,
  YOUR_HAND = 2,
  ALL_PLAYERS = 3,
  OTHER_PLAYERS = 4,
  YOUR_CHARACTER = 5,
  PLAYERS_EXCEPT_ATTAKING = 6,
  ACTIVE_MONSTERS_NOT_ATTACKED = 7,
  STORE_CARDS = 8,
  TOP_OF_DECKS = 9,
  PLAYERS_SOULS = 10,
  DISCARD_PILES = 11,
  YOUR_ACTIVES = 12,
  YOUR_ACTIVES_AND_PAID = 13,
  YOUR_PASSIVES = 14,
  IN_DECK_GUPPY_ITEMS = 15,
  PLAYER_TO_YOUR_RIGHT = 16,
  PLAYER_TO_YOUR_LEFT = 17,
  RANDOM_OTHER_PLAYER_LOOT_NOT_BEING_PLAYED = 18
}

export enum BUTTON_STATE {
  ENABLED,
  DISABLED,
  SKIP_SKIP_RESPONSE,
  /**
   * extra - textToChangeTo:string
   */
  CHANGE_TEXT,
  PLAYER_CHOOSE_NO,
  PLAYER_CHOOSE_YES,
  PLAYER_CLICKS_NEXT,
  TOGGLE_TO_OPEN_PREVIEWS,
  TOGGLE_TO_CLOSE_PREVIEWS,
  SET_CLEAR_PREVIEWS,
  SET_CONFIRM_SELECT_IN_PREVIEWS,
  REMOVE_CONFIRM_SELECT,
  SET_NOT_YET_AVAILABLE,
  SET_AVAILABLE
}

export enum GAME_EVENTS {
  DID_CHOOSE_FROM,
  EDEN_WAS_CHOSEN,
  CARD_EFFECT_ANIM_END,
  PLAYER_RESPOND,
  CHOOSE_CARD_CARD_CHOSEN,
  SELECT_LOOT_TO_PLAY_CARD_CHOSEN,
  CHOOSE_FROM_TARGET_CARD_CARD_CHOSEN,
  CHOOSE_STACK_EFFECT_CHOSEN,
  CARD_PREVIEW_HIDE_OVER,
  CARD_PREVIEW_CHOOSE_EFFECT,
  CHOOSE_NUMBER_OK,
  DICE_ROLL_OVER,
  PLAYER_CLICKED_NEXT,
  PLAYER_SELECTED_YES_NO,
  PLAYER_CARD_ACTIVATED,
  PLAYER_CARD_NOT_ACTIVATED,
  STACK_EMPTIED,
  STACK_STACK_EFFECT_RESOLVED_AT_OTHER_PLAYER,
  CARD_MANAGER_LOAD_PREFAB,
  CARD_MANAGER_MOVE_ANIM_END,
  CARD_PREV_MAN_WAIT_FOR_SELECT,
  PASSIVE_MAN_PASSIVE_PHASE_OVER,
  PLAYER_MAN_PREFAB_LOAD,
  CHECK_FOR_DEAD_ENTITIES,
  STACK_CHANGED,
  LABLE_CHANGE,
  GAME_OVER,
  SOUL_CARD_MOVE_END,
  STACK_EFFECT_CHANGE,
  ACTION_LABLE_UPDATE,
  PREVIEW_MANAGER_OPEN,
  HIDE_DECISION,
  PUT_ON_STACK_END,
  SOUND_OVER,
  END_SET_CHAR
}

export class SIGNAL_GROUPS {
  REACTION = [Signal.RESPOND_TO, Signal.GET_REACTION, Signal.GIVE_PLAYER_PRIORITY]
  STACK = [Signal.ADD_TO_STACK, Signal.REMOVE_FROM_STACK, Signal.UPDATE_STACK_LABLE, Signal.REPLACE_STACK]
  CARD_MOVEMENT = [Signal.SOUL_CARD_MOVE_END, Signal.MOVE_CARD, Signal.MOVE_CARD_END]
  PARTICLE = [Signal.ACTIVATE_PARTICLE_EFFECT, Signal.DISABLE_PARTICLE_EFFECT]
  ACTION_MESSAGE = [Signal.ACTION_MASSAGE_ADD, Signal.ACTION_MASSAGE_REMOVE];

  TESTG = [].concat(this.PARTICLE,
    this.CARD_MOVEMENT,
    this.ACTION_MESSAGE, this.STACK, this.REACTION)
  //[Signal.ADD_TO_STACK, Signal.REMOVE_FROM_STACK, Signal.RESPOND_TO, Signal.GET_REACTION, Signal.GIVE_PLAYER_PRIORITY, Signal.ACTION_MASSAGE, Signal]

  getGroup(type: string) {
    if (type == "test") { return this.TESTG }
    if (this.REACTION.includes(type)) { return this.REACTION; }
    if (this.STACK.includes(type)) { return this.STACK }
    if (this.PARTICLE.includes(type)) { return this.STACK }
  }

}

export enum PARTICLE_TYPES {

  CARD_CHOSEN, CHOOSE_CARD, OPTIONAL_CHOOSE_CARD, MONSTER_GET_HIT, PLAYER_GET_HIT, MONSTER_IN_BATTLE, ACTIVATE_EFFECT
}

export enum TARGETTYPE {

  PLAYER, MONSTER, ITEM, PILE, DECK, CARD, STACK_EFFECT
}


export enum REWARD_TYPES {
  money, loot, treasure, nothing, rollMoney, rollLoot, rollTreasure
}

export enum PASSIVE_EVENTS {
  /**
   * scope- player who got the soul
   * args - card with soul
   */
  PLAYER_GET_SOUL_CARD = "$PLAYER_GET_SOUL_CARD",
  /**
   * scope - monster who got made attackable
   * args -  monster who got made attackable
   */
  MONSTER_MADE_ATTACKABLE = "$MONSTER_MADE_ATTACKABLE",
  /**
   * scope  player who got killed
   * args [killer]
   */
  PLAYER_IS_KILLED = "PLAYER_IS_KILLED",
  /**
   * scope - player who got the loot
   * args [loot gained]
   */
  PLAYER_LOSE_LOOT = "PLAYER_LOSE_LOOT",
  /**
   * scope - player who got the loot
   * args [loot gained]
   */
  PLAYER_GAIN_LOOT = "PLAYER_GAIN_LOOT",

  /**
   * scope -
   */
  PLAYER_MISS_ATTACK = "PLAYER_MISS_ATTACK",
  /**
   * scope - attacking player node
   * args - [numberRolled,attackedMonster]
   */
  PLAYER_LAND_ATTACK = "PLAYER_LAND_ATTACK",
  /**
   * scope - player who got hit
   * args = damage,damageDealer,isFirstHitOfTurn
   */
  PLAYER_GET_HIT = "PLAYER_GET_HIT",
  PLAYER_ACTIVATE_ITEM = "PLAYER_ACTIVATE_ITEM",
  PLAYER_PREVENT_DAMAGE = "PLAYER_PREVENT_DAMAGE",
  /**
   * scope - player who got hit
   * args = [damage taken,num of missed dice roll,entity who dealt damage:cc.node]
   */
  PLAYER_COMBAT_DAMAGE_TAKEN = "PLAYER_COMBAT_DAMAGE_TAKEN",
  /**
   * scope: player node
   * args = [damage taken,num of missed dice roll,entity who dealt damage:cc.node,entity who took damage:cc.Node]
   */
  PLAYER_COMBAT_DAMAGE_GIVEN = "PLAYER_COMBAT_DAMAGE_GIVEN",
  /**
   * args = [number of coins]
   */
  PLAYER_CHANGE_MONEY = "PLAYER_CHANGE_MONEY",
  /**
   * scope:the player who will pay the panelties
   */
  PLAYER_PAY_DEATH_PANELTIES = "PLAYER_PAY_DEATH_PANELTIES",
  PLAYER_LOSE_ITEM = "PLAYER_LOSE_ITEM",
  /**
   * scope:the player who rolled the dice
   * args:[rollValue,AttackType(ROLL_TYPE),monsterEvasion]
   */
  PLAYER_ROLL_DICE = "PLAYER_ROLL_DICE",
  PLAYER_END_TURN = "PLAYER_END_TURN",
  PLAYER_START_TURN = "PLAYER_START_TURN",
  PLAYER_BUY_ITEM = "PLAYER_BUY_ITEM",
  /**
   * scope- attacking player
   * args:attacked monster / monster Deck
   */
  PLAYER_DECLARE_ATTACK = "PLAYER_DECLARE_ATTACK",
  PLAYER_FIRST_ATTACK_ROLL_OF_TURN = "PLAYER_FIRST_ATTACK_ROLL_OF_TURN",
  /**
   * scope: player card
   * args: [itemAdded]
   */
  PLAYER_ADD_ITEM = "PLAYER_ADD_ITEM",
  /**
   * scope -  monster who got hit
     * args = damage,damageDealer,If monster number rolled
     */
  MONSTER_GET_HIT = "MONSTER_GET_HIT",
  /**
   * scope : the monster who was killed
   * args: [numberRolled for killing the monster(0 if not available),monster killer(if available)]
   */
  MONSTER_IS_KILLED = "MONSTER_IS_KILLED",
  /**
   * args: [new Monster Card, Old Monster Card]
   */
  NEW_ACTIVE_MONSTER = "NEW_ACTIVE_MONSTER",
  MONSTER_PREVENT_DAMAGE = "MONSTER_PREVENT_DAMAGE",

  CARD_GAINS_COUNTER = "CARD_GAINS_COUNTER",
}

export enum COLORS {
  GREEN = "35%, 75%, 10%",
  RED = "50%, 10%, 10%",
  PURPLE = "60%, 10%, 60%",
  BLUE = "10%, 10%, 55%",
  LIGHTRED = "75%, 10%, 10%",
  LIGHTBLUE = "10%, 10%, 75%"
}

export enum STACK_EFFECT_VIS_TYPE {
  BASIC,
  PLAYER_ACTION,
  MONSTER_ACTION,
  BOSS_ACTION,
  MEGA_BOSS_ACTION
}

export const TIME_TO_DRAW = 0.3 / 2;
export const TIME_TO_BUY = 0.5 / 2;
export const BLINKING_SPEED = 1;
export const TIME_TO_PLAY_LOOT = 0.4 / 2;
export const TIME_TO_SHOW_PREVIEW = 0.5 / 2;
export const TIME_TO_HIDE_PREVIEW = 0.5 / 2;
export const TIME_TO_ROTATE_ACTIVATION = 0.3 / 2;
export const TIME_TO_REACT_ON_ACTION = 90;
export const TIME_FOR_DICE_ROLL = 0.3 / 2;
export const TIME_FOR_MONSTER_DISCARD = 1 / 2;
export const TIME_FOR_TREASURE_DISCARD = 2 / 2;
export const MAX_NUM_OF_HISTORY_ITEM = 50
export const PARTICLE_SYS_MAX = 40
export const EFFECT_ANIMATION_TIME = 2;
export const ANNOUNCEMENT_TIME = 2;
export const DECISION_SHOW_TIME = 3;

export let ServerIp = "localhost:7456/"

export const checkIfPlayerIsDead = afterMethod(async meta => {
  const player = meta.scope;
  const isDead = await player.checkIfDead();

  meta.commit();
});
