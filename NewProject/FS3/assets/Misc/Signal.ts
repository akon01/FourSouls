/**
 * Server events.
 * @author wheatup
 */
//PARTICLE EFFECTS
//
//deck signals
//
//board signals
//
//Player signals
//
//Monster Signals
//
//Stack Signals
//
/**
 * @server
 * @summary Successfully logged into the server
 * @params the uuid of current player
 */
/**
 * @server
 * @summary When someone joined the room
 * @param uuid the uuid of the player whom joined
 */
/**
 * @server
 * @summary When someone left the room
 * @param uuid the uuid of the player whom left
 */
/**
 * @server
 * @summary When the match starts
 * @param level the level of the game
 * @param text the text of the puzzle
 * @param time the time limit of the game
 *
 * @client
 * @summary Request the server to start a match
 * @param level the level requested
 */
/**
 * @server
 * @summary Game ended.
 * @param interrupted is the game got interrupted
 * @param score player scores
 */
/**
 * @server
 * @summary When player got a word correctly
 * @param uuid this player id of the winner
 * @param word the word that player got
 * @param ids the ids of the hexagons
 * @param letters the new replacing letters
 * @param score how much score player got
 */
/**
 * @server
 * @summary When player got a word wrong
 * @param uuid who got it wrong
 * @param word the word that player got
 * @param ids the ids of the hexagons
 */
/**
 * @client
 * @summray validate a word
 * @param ids the array of chain numbers
 */

export const Signal = {
  MOUSE_CURSOR_MOVE: "$MOUSE_CURSOR_MOVE",
  PLAYER_DISCONNECTED: "$PLAYER_DISCONNECTED",
  SEND_CARD_DATA: "$SEND_CARD_DATA",
  ACTION_MASSAGE_ADD: "$ACTION_MASSAGE_ADD",
  ACTION_MASSAGE_REMOVE: "$ACTION_MASSAGE_REMOVE",
  LOG: "$LOG",
  LOG_ERROR: "$LOG_ERROR",
  END_GAME: "$END_GAME",
  GAME_HAS_STARTED: "$GAME_HAS_STARTED",
  SHOW_ANNOUNCEMENT: "$SHOW_ANNOUNCEMENT",
  HIDE_ANNOUNCEMENT: "$HIDE_ANNOUNCEMENT",
  HIDE_TIMER: "$HIDE_TIMER",
  SHOW_TIMER: "$SHOW_TIMER",
  CHOOSE_FOR_EDEN: "$CHOOSE_FOR_EDEN",
  EDEN_CHOSEN: "$EDEN_CHOSEN",
  CARD_ADD_TRINKET: "$CARD_ADD_TRINKET",
  SET_MAX_ITEMS_STORE: "$SET_MAX_ITEMS_STORE",
  ACTIVATE_PARTICLE_EFFECT: "$ACTIVATE_PARTICLE_EFFECT",
  DISABLE_PARTICLE_EFFECT: "$DISABLE_PARTICLE_EFFECT",
  SHOW_REACTIONS: "$SHOW_REACTIONS",
  HIDE_REACTIONS: "$HIDE_REACTIONS",
  REACTION_TOGGLED: "$REACTION_TOGGLED",
  DECK_ARRAGMENT: "$DECK_ARRAGMENT",
  UPDATE_PASSIVES_OVER: "$UPDATE_PASSIVES_OVER",
  REGISTER_PASSIVE_ITEM: "$REGISTER_PASSIVE_ITEM",
  REMOVE_FROM_PASSIVE_MANAGER: "$REMOVE_FROM_PASSIVE_MANAGER",
  REGISTER_ONE_TURN_PASSIVE_EFFECT: "$REGISTER_ONE_TURN_PASSIVE_EFFECT",
  REMOVE_ONE_TURN_PASSIVE_EFFECT: "$REMOVE_ONE_TURN_PASSIVE_EFFECT",
  MONSTER_GET_DAMAGED: "$MONSTER_GET_DAMAGED",
  UPDATE_PASSIVE_DATA: "$UPDATE_PASSIVE_DATA",
  CLEAR_PASSIVE_DATA: "$CLEAR_PASSIVE_DATA",
  MONSTER_GAIN_HP: "$MONSTER_GET_DAMAGED",
  MONSTER_GAIN_DMG: "$MONSTER_GAIN_DMG",
  MONSTER_GAIN_ROLL_BONUS: "$MONSTER_GAIN_ROLL_BONUS",
  MOVE_CARD: "$MOVE_CARD",
  MOVE_CARD_END: "$MOVE_CARD_END",
  CARD_CHANGE_COUNTER: "$CARD_CHANGE_COUNTER",
  SOUL_CARD_MOVE_END: "$SOUL_CARD_MOVE_END",
  CARD_CHANGE_NUM_OF_SOULS: "$CARD_CHANGE_NUM_OF_SOULS",
  CARD_SET_OWNER: "$CARD_SET_OWNER",
  CHOOSE_BUTTON_DATA_COLLECTOR: "$CHOOSE_BUTTON_DATA_COLLECTOR",
  CHOOSE_BUTTON_DATA_COLLECTOR_RESPONSE: "$CHOOSE_BUTTON_DATA_COLLECTOR_RESPONSE",
  USE_ITEM: "$USE_ITEM",
  RECHARGE_ITEM: "$RECHARGE_ITEM",
  ITEM_SET_LAST_OWNER: "$ITEM_SET_LAST_OWNER",
  SET_TURN: "$SET_TURN",
  ASSIGN_CHAR_TO_PLAYER: "$ASSIGN_CHAR_TO_PLAYER",
  SET_CHAR: "$SET_CHAR",
  SET_CHAR_END: "$SET_CHAR_END",
  FLIP_CARD: "$FLIP_CARD",
  CARD_GET_COUNTER: "$CARD_GET_COUNTER",
  END_BATTLE: "$CANCEL_ATTACK",
  END_TURN: "$END_TURN",
  NEW_MONSTER_PLACE: "$NEW_MONSTER_PLACE",
  REMOVE_ITEM_FROM_SHOP: "$REMOVE_ITEM_FROM_SHOP",
  ADD_STORE_CARD: "$ADD_STORE_CARD",
  DRAW_CARD: "$DRAW_CARD",
  SET_MONEY: "$SET_MONEY",
  DECK_ADD_TO_TOP: "$DECK_ADD_TO_TOP",
  DECK_ADD_TO_BOTTOM: "$DECK_ADD_TO_BOTTOM",
  MARK_DECK_AS_DRAW_FROM_PILE_INSTED: "$MARK_DECK_AS_DRAW_FROM_PILE_INSTED",
  SHOW_DECISION: "$SHOW_DECISION",
  SET_STACK_ICON: "$SET_STACK_ICON",
  SHOW_STACK_EFFECT: "$SHOW_STACK_EFFECT",
  SHOW_DICE_ROLL: "$SHOW_DICE_ROLL",
  SHOW_EFFECT_CHOSEN: "$SHOW_EFFECT_CHOSEN",
  PLAYER_DIED: "$PLAYER_DIED",
  PLAYER_PROP_UPDATE: "$PLAYER_PROP_UPDATE",
  END_ROLL_ACTION: "$END_ROLL_ACTION",
  CHANGE_MONEY: "$CHANGE_MONEY",
  CHANGE_TURN_DRAW_PLAYS: "$CHANGE_TURN_DRAW_PLAYS",
  PLAYER_GAIN_HP: "$PLAYER_GAIN_HP",
  PLAYER_GET_HIT: "$PLAYER_GET_HIT",
  PLAYER_HEAL: "$PLAYER_HEAL",
  PLAYER_GAIN_DMG: "$PLAYER_GAIN_DMG",
  PLAYER_GAIN_ROLL_BONUS: "$PLAYER_GAIN_ROLL_BONUS",
  PLAYER_GAIN_ATTACK_ROLL_BONUS: "$PLAYER_GAIN_ATTACK_ROLL_BONUS",
  PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS: "$PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS",
  PLAYER_RECHARGE_ITEM: "$PLAYER_RECHARGE_ITEM",
  PLAYER_ADD_DMG_PREVENTION: "$PLAYER_ADD_DMG_PREVENTION",
  PLAYER_LOSE_LOOT: "$PLAYER_LOSE_LOOT",
  PLAYER_GET_LOOT: "$PLAYER_GET_LOOT",
  PLAYER_SET_RECHARGE_CHAR_AT_START_OF_TURN: "$PLAYER_SET_RECHARGE_CHAR_AT_START_OF_TURN",
  PLAYER_SET_HAND_SHOW_CARD_BACK: "$PLAYER_SET_HAND_SHOW_CARD_BACK",
  RESPOND_TO: "$RESPOND_TO",
  FINISH_DO_STACK_EFFECT: "$FINISH_DO_STACK_EFFECT",
  FIZZLE_STACK_EFFECT: "$FIZZLE_STACK_EFFECT",
  GIVE_PLAYER_PRIORITY: "$GIVE_PLAYER_PRIORITY",
  TURN_PLAYER_DO_STACK_EFFECT: "$TURN_PLAYER_DO_STACK_EFFECT",
  START_TURN: "$START_TURN",
  PLAYER_ADD_CURSE: "$PLAYER_ADD_CURSE",
  MAKE_CHOOSE_FROM: "$MAKE_CHOOSE_FROM",
  FINISH_MAKE_CHOOSE_FROM: "$FINISH_MAKE_CHOOSE_FROM",
  MONSTER_ADD_DMG_PREVENTION: "$MONSTER_ADD_DMG_PREVENTION",
  MONSTER_HEAL: "$MONSTER_HEAL",
  DO_STACK_EFFECT: "$DO_STACK_EFFECT",
  REPLACE_STACK: "$REPLACE_STACK",
  REMOVE_FROM_STACK: "$REMOVE_FROM_STACK",
  ADD_TO_STACK: "$ADD_TO_STACK",
  END_PUT_ON_STACK: "$END_PUT_ON_STACK",
  PUT_ON_STACK: "$PUT_ON_STACK",
  STACK_EMPTIED: "$STACK_EMPTIED",
  UPDATE_RESOLVING_STACK_EFFECTS: "$UPDATE_RESOLVING_STACK_EFFECTS",
  UPDATE_STACK_VIS: "$UPDATE_STACK_VIS",
  REMOVE_SE_VIS_PREV: "$REMOVE_SE_VIS_PREV",
  ADD_SE_VIS_PREV: "$ADD_SE_VIS_PREV",
  CLEAR_SE_VIS: "$CLEAR_SE_VIS",
  NEXT_STACK_ID: "$NEXT_STACK_ID",
  UPDATE_STACK_LABLE: "$UPDATE_STACK_LABLE",
  STACK_EFFECT_LABLE_CHANGE: "$STACK_EFFECT_LABLE_CHANGE",
  UPDATE_STACK_EFFECT: "$UPDATE_STACK_EFFECT",
  SET_CONCURENT_EFFECT_DATA: "$SET_CONCURENT_EFFECT_DATA",
  MARK_EFFECT_AS_RUNNING: "$MARK_EFFECT_AS_RUNNING",
  UPDATE_ACTIONS: "$UPDATE_ACTIONS",
  FINISH_LOAD: "$FINISH_LOAD",
  REMOVE_MONSTER: "$REMOVE_MONSTER",
  ADD_MONSTER: "$ADD_MONSTER",
  GET_SOUL: "$GET_SOUL",
  LOSE_SOUL: "$LOSE_SOUL",
  GET_NEXT_MONSTER: "$GET_NEXT_MONSTER",
  MOVE_CARD_TO_PILE: "$MOVE_CARD_TO_PILE",
  REMOVE_FROM_PILE: "$REMOVE_FROM_PILE",
  ROLL_DICE_ENDED: "$ROLL_DICE_ENDED",
  ROLL_DICE: "$ROLL_DICE",
  SHOW_CARD_PREVIEW: "$SHOW_CARD_PREVIEW",
  NEW_MONSTER_ON_PLACE: "$NEW_MONSTER_ON_PLACE",
  DISCARD_LOOT: "$DISCARD_LOOT",
  LOOT_PLAYED_IN_ACTION: "$LOOT_PLAYED_IN_ACTION",
  ACTIVATE_PASSIVE: "$ACTIVATE_PASSIVE",
  ACTIVATE_ITEM: "$ACTIVATE_ITEM",
  SERVER_CARD_EFFECT: "$SERVER_CARD_EFFECT",
  OTHER_PLAYER_RESOLVE_REACTION: "$OTHER_PLAYER_RESOLVE_REACTION",
  RESOLVE_ACTIONS: "$RESOLVE_ACTIONS",
  FIRST_GET_REACTION: "$FIRST_GET_REACTION",
  GET_REACTION: "$GET_REACTION",
  REACTION: "$REACTION",
  DECLARE_ATTACK: "$DECLARE_ATTACK",
  ADD_AN_ITEM: "$ADD_AN_ITEM",
  PLAY_LOOT_CARD: "$PLAY_LOOT_CARD",
  CARD_DRAWN: "$CARD_DRAWN",
  NEXT_TURN: "$NEXT_TURN",
  START_GAME: "$START_GAME",
  MOVE_TO_TABLE: "$MOVE_TO_TABLE",
  UUID: "$UUID",
  JOIN: "$JOIN",
  LEAVE: "$LEAVE",
  MATCH: "$MATCH",
  RESULT: "$RESULT",
  CORRECT: "$CORRECT",
  WRONG: "$WRONG",
  VALIDATE: "$VALIDATE"
};

/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
// /**
//  * Server events.
//  * @author wheatup
//  */
//
// export {
//
//   PLAYER_DISCONNECTED: "$PLAYER_DISCONNECTED",
//   SEND_CARD_DATA: "$SEND_CARD_DATA",
//
//   ACTION_MASSAGE_ADD: "$ACTION_MASSAGE_ADD",
//   ACTION_MASSAGE_REMOVE: "$ACTION_MASSAGE_REMOVE",
//   LOG: "$LOG",
//   LOG_ERROR: "$LOG_ERROR",
//
//   END_GAME: "$END_GAME",
//   GAME_HAS_STARTED: "$GAME_HAS_STARTED",
//
//   SHOW_ANNOUNCEMENT: "$SHOW_ANNOUNCEMENT",
//   HIDE_ANNOUNCEMENT: "$HIDE_ANNOUNCEMENT",
//   HIDE_TIMER: "$HIDE_TIMER",
//   SHOW_TIMER: "$SHOW_TIMER",
//
//   CHOOSE_FOR_EDEN: "$CHOOSE_FOR_EDEN",
//   EDEN_CHOSEN: "$EDEN_CHOSEN",
//
//   CARD_ADD_TRINKET: "$CARD_ADD_TRINKET",
//
//   SET_MAX_ITEMS_STORE: "$SET_MAX_ITEMS_STORE",
//
//   //PARTICLE EFFECTS
//   ACTIVATE_PARTICLE_EFFECT: "$ACTIVATE_PARTICLE_EFFECT",
//   DISABLE_PARTICLE_EFFECT: "$DISABLE_PARTICLE_EFFECT",
//   SHOW_REACTIONS: "$SHOW_REACTIONS",
//   HIDE_REACTIONS: "$HIDE_REACTIONS",
//   REACTION_TOGGLED: "$REACTION_TOGGLED",
//   //
//
//   //deck signals
//   DECK_ARRAGMENT: "$DECK_ARRAGMENT",
//   //
//
//   //board signals
//   UPDATE_PASSIVES_OVER: "$UPDATE_PASSIVES_OVER",
//   REGISTER_PASSIVE_ITEM: "$REGISTER_PASSIVE_ITEM",
//   REMOVE_FROM_PASSIVE_MANAGER: "$REMOVE_FROM_PASSIVE_MANAGER",
//   REGISTER_ONE_TURN_PASSIVE_EFFECT: "$REGISTER_ONE_TURN_PASSIVE_EFFECT",
//   MONSTER_GET_DAMAGED: "$MONSTER_GET_DAMAGED",
//   UPDATE_PASSIVE_DATA: "$UPDATE_PASSIVE_DATA",
//   CLEAR_PASSIVE_DATA: "$CLEAR_PASSIVE_DATA",
//   MONSTER_GAIN_HP: "$MONSTER_GET_DAMAGED",
//   MONSTER_GAIN_DMG: "$MONSTER_GAIN_DMG",
//   MONSTER_GAIN_ROLL_BONUS: "$MONSTER_GAIN_ROLL_BONUS",
//   MOVE_CARD: "$MOVE_CARD",
//   MOVE_CARD_END: "$MOVE_CARD_END",
//   SOUL_CARD_MOVE_END: "$SOUL_CARD_MOVE_END",
//   USE_ITEM: "$USE_ITEM",
//   RECHARGE_ITEM: "$RECHARGE_ITEM",
//   SET_TURN: "$SET_TURN",
//   ASSIGN_CHAR_TO_PLAYER: "$ASSIGN_CHAR_TO_PLAYER",
//   SET_CHAR: "$SET_CHAR",
//   SET_CHAR_END: "$SET_CHAR_END",
//   FLIP_CARD: "$FLIP_CARD",
//   CARD_GET_COUNTER: "$CARD_GET_COUNTER",
//   END_BATTLE: "$CANCEL_ATTACK",
//   END_TURN: "$END_TURN",
//   NEW_MONSTER_PLACE: "$NEW_MONSTER_PLACE",
//
//   REMOVE_ITEM_FROM_SHOP: "$REMOVE_ITEM_FROM_SHOP",
//   ADD_STORE_CARD: "$ADD_STORE_CARD",
//   DRAW_CARD: "$DRAW_CARD",
//   SET_MONEY: "$SET_MONEY",
//   DECK_ADD_TO_TOP: "$DECK_ADD_TO_TOP",
//   DECK_ADD_TO_BOTTOM: "$DECK_ADD_TO_BOTTOM",
//   SHOW_DECISION: "$SHOW_DECISION",
//   SET_STACK_ICON: "$SET_STACK_ICON",
//   SHOW_STACK_EFFECT: "$SHOW_STACK_EFFECT",
//   SHOW_DICE_ROLL: "$SHOW_DICE_ROLL",
//   SHOW_EFFECT_CHOSEN: "$SHOW_EFFECT_CHOSEN",
//   //
//
//   //Player signals
//   PLAYER_DIED: "$PLAYER_DIED",
//   PLAYER_PROP_UPDATE: "$PLAYER_PROP_UPDATE",
//   END_ROLL_ACTION: "$END_ROLL_ACTION",
//   CHANGE_MONEY: "$CHANGE_MONEY",
//   PLAYER_GAIN_HP: "$PLAYER_GAIN_HP",
//   PLAYER_GET_HIT: "$PLAYER_GET_HIT",
//   PLAYER_HEAL: "$PLAYER_HEAL",
//   PLAYER_GAIN_DMG: "$PLAYER_GAIN_DMG",
//   PLAYER_GAIN_ROLL_BONUS: "$PLAYER_GAIN_ROLL_BONUS",
//   PLAYER_GAIN_ATTACK_ROLL_BONUS: "$PLAYER_GAIN_ATTACK_ROLL_BONUS",
//   PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS: "$PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS",
//   PLAYER_RECHARGE_ITEM: "$PLAYER_RECHARGE_ITEM",
//   PLAYER_ADD_DMG_PREVENTION: "$PLAYER_ADD_DMG_PREVENTION",
//   PLAYER_LOSE_LOOT: "$PLAYER_LOSE_LOOT",
//   PLAYER_GET_LOOT: "$PLAYER_GET_LOOT",
//   RESPOND_TO: "$RESPOND_TO",
//   FINISH_DO_STACK_EFFECT: "$FINISH_DO_STACK_EFFECT",
//   FIZZLE_STACK_EFFECT: "$FIZZLE_STACK_EFFECT",
//   GIVE_PLAYER_PRIORITY: "$GIVE_PLAYER_PRIORITY",
//   TURN_PLAYER_DO_STACK_EFFECT: "$TURN_PLAYER_DO_STACK_EFFECT",
//   START_TURN: "$START_TURN",
//   PLAYER_ADD_CURSE: "$PLAYER_ADD_CURSE",
//   MAKE_CHOOSE_FROM: "$MAKE_CHOOSE_FROM",
//   FINISH_MAKE_CHOOSE_FROM: "$FINISH_MAKE_CHOOSE_FROM",
//   //
//
//   //Monster Signals
//   MONSTER_ADD_DMG_PREVENTION: "$MONSTER_ADD_DMG_PREVENTION",
//   MONSTER_HEAL: "$MONSTER_HEAL",
//   //
//
//   //Stack Signals
//   DO_STACK_EFFECT: "$DO_STACK_EFFECT",
//   REPLACE_STACK: "$REPLACE_STACK",
//   REMOVE_FROM_STACK: "$REMOVE_FROM_STACK",
//   ADD_TO_STACK: "$ADD_TO_STACK",
//   END_PUT_ON_STACK: "$END_PUT_ON_STACK",
//   PUT_ON_STACK: "$PUT_ON_STACK",
//   STACK_EMPTIED: "$STACK_EMPTIED",
//   UPDATE_RESOLVING_STACK_EFFECTS: "$UPDATE_RESOLVING_STACK_EFFECTS",
//   UPDATE_STACK_VIS: "$UPDATE_STACK_VIS",
//   REMOVE_SE_VIS_PREV: "$REMOVE_SE_VIS_PREV",
//   ADD_SE_VIS_PREV: "$ADD_SE_VIS_PREV",
//   CLEAR_SE_VIS: "$CLEAR_SE_VIS",
//   NEXT_STACK_ID: "$NEXT_STACK_ID",
//   UPDATE_STACK_LABLE: "$UPDATE_STACK_LABLE",
//   STACK_EFFECT_LABLE_CHANGE: "$STACK_EFFECT_LABLE_CHANGE",
//   UPDATE_STACK_EFFECT: "$UPDATE_STACK_EFFECT",
//   //
//
//   SET_CONCURENT_EFFECT_DATA: "$SET_CONCURENT_EFFECT_DATA",
//
//   UPDATE_ACTIONS: "$UPDATE_ACTIONS",
//   FINISH_LOAD: "$FINISH_LOAD",
//   REMOVE_MONSTER: "$REMOVE_MONSTER",
//   ADD_MONSTER: "$ADD_MONSTER",
//   GET_SOUL: "$GET_SOUL",
//   LOSE_SOUL: "$LOSE_SOUL",
//   GET_NEXT_MONSTER: "$GET_NEXT_MONSTER",
//   MOVE_CARD_TO_PILE: "$MOVE_CARD_TO_PILE",
//   REMOVE_FROM_PILE: "$REMOVE_FROM_PILE",
//   ROLL_DICE_ENDED: "$ROLL_DICE_ENDED",
//   ROLL_DICE: "$ROLL_DICE",
//   SHOW_CARD_PREVIEW: "$SHOW_CARD_PREVIEW",
//   NEW_MONSTER_ON_PLACE: "$NEW_MONSTER_ON_PLACE",
//   DISCARD_LOOT: "$DISCARD_LOOT",
//   LOOT_PLAYED_IN_ACTION: "$LOOT_PLAYED_IN_ACTION",
//   ACTIVATE_PASSIVE: "$ACTIVATE_PASSIVE",
//   ACTIVATE_ITEM: "$ACTIVATE_ITEM",
//   SERVER_CARD_EFFECT: "$SERVER_CARD_EFFECT",
//   OTHER_PLAYER_RESOLVE_REACTION: "$OTHER_PLAYER_RESOLVE_REACTION",
//   RESOLVE_ACTIONS: "$RESOLVE_ACTIONS",
//   FIRST_GET_REACTION: "$FIRST_GET_REACTION",
//   GET_REACTION: "$GET_REACTION",
//   REACTION: "$REACTION",
//   DECLARE_ATTACK: "$DECLARE_ATTACK",
//   ADD_AN_ITEM: "$ADD_AN_ITEM",
//   PLAY_LOOT_CARD: "$PLAY_LOOT_CARD",
//   CARD_DRAWN: "$CARD_DRAWN",
//   NEXT_TURN: "$NEXT_TURN",
//   START_GAME: "$START_GAME",
//   MOVE_TO_TABLE: "$MOVE_TO_TABLE",
//   /**
//    * @server
//    * @summary Successfully logged into the server
//    * @params the uuid of current player
//    */
//   UUID: "$UUID",
//
//   /**
//    * @server
//    * @summary When someone joined the room
//    * @param uuid the uuid of the player whom joined
//    */
//   JOIN: "$JOIN",
//
//   /**
//    * @server
//    * @summary When someone left the room
//    * @param uuid the uuid of the player whom left
//    */
//   LEAVE: "$LEAVE",
//
//   /**
//    * @server
//    * @summary When the match starts
//    * @param level the level of the game
//    * @param text the text of the puzzle
//    * @param time the time limit of the game
//    *
//    * @client
//    * @summary Request the server to start a match
//    * @param level the level requested
//    */
//   MATCH: "$MATCH",
//
//   /**
//    * @server
//    * @summary Game ended.
//    * @param interrupted is the game got interrupted
//    * @param score player scores
//    */
//   RESULT: "$RESULT",
//
//   /**
//    * @server
//    * @summary When player got a word correctly
//    * @param uuid this player id of the winner
//    * @param word the word that player got
//    * @param ids the ids of the hexagons
//    * @param letters the new replacing letters
//    * @param score how much score player got
//    */
//   CORRECT: "$CORRECT",
//
//   /**
//    * @server
//    * @summary When player got a word wrong
//    * @param uuid who got it wrong
//    * @param word the word that player got
//    * @param ids the ids of the hexagons
//    */
//   WRONG: "$WRONG",
//
//   /**
//    * @client
//    * @summray validate a word
//    * @param ids the array of chain numbers
//    */
//   VALIDATE: "$VALIDATE"
// };
