"use strict";
/**
 * Server events
 * @author wheatup
 */
exports.__esModule = true;
exports["default"] = {
    ACTION_MASSAGE: "$ACTION_MASSAGE",
    LOG: "$LOG",
    LOG_ERROR: '$LOG_ERROR',
    CHOOSE_FOR_EDEN: "$CHOOSE_FOR_EDEN",
    EDEN_CHOSEN: "$EDEN_CHOSEN",
    //deck signals
    DECK_ARRAGMENT: "$DECK_ARRAGMENT",
    //
    //board signals
    UPDATE_PASSIVES_OVER: "$UPDATE_PASSIVES_OVER",
    REGISTER_PASSIVE_ITEM: "$REGISTER_PASSIVE_ITEM",
    REGISTER_ONE_TURN_PASSIVE_EFFECT: "$REGISTER_ONE_TURN_PASSIVE_EFFECT",
    UPDATE_PASSIVE_DATA: "$UPDATE_PASSIVE_DATA",
    CLEAR_PASSIVE_DATA: "$CLEAR_PASSIVE_DATA",
    MONSTER_GET_DAMAGED: "$MONSTER_GET_DAMAGED",
    MONSTER_GAIN_HP: "$MONSTER_GET_DAMAGED",
    MONSTER_GAIN_DMG: "$MONSTER_GAIN_DMG",
    MONSTER_GAIN_ROLL_BONUS: "$MONSTER_GAIN_ROLL_BONUS",
    MOVE_CARD: "$MOVE_CARD",
    MOVE_CARD_END: "$MOVE_CARD_END",
    USE_ITEM: '$USE_ITEM',
    RECHARGE_ITEM: "$RECHARGE_ITEM",
    SET_TURN: "$SET_TURN",
    ASSIGN_CHAR_TO_PLAYER: "$ASSIGN_CHAR_TO_PLAYER",
    FLIP_CARD: "$FLIP_CARD",
    CARD_GET_COUNTER: "$CARD_GET_COUNTER",
    CANCEL_ATTACK: "$CANCEL_ATTACK",
    //Deck signals
    BUY_ITEM_FROM_SHOP: "$BUY_ITEM_FROM_SHOP",
    ADD_STORE_CARD: '$ADD_STORE_CARD',
    DRAW_CARD: '$DRAW_CARD',
    SET_MONEY: "$SET_MONEY",
    DECK_ADD_TO_TOP: "$DECK_ADD_TO_TOP",
    DECK_ADD_TO_BOTTOM: "$DECK_ADD_TO_BOTTOM",
    //
    //Player signals
    END_ROLL_ACTION: "$END_ROLL_ACTION",
    CHANGE_MONEY: '$CHANGE_MONEY',
    PLAYER_GAIN_HP: "$PLAYER_GAIN_HP",
    PLAYER_GET_HIT: "$PLAYER_GET_HIT",
    PLAYER_HEAL: "$PLAYER_HEAL",
    PLAYER_GAIN_DMG: "$PLAYER_GAIN_DMG",
    PLAYER_GAIN_ROLL_BONUS: "$PLAYER_GAIN_ROLL_BONUS",
    PLAYER_GAIN_ATTACK_ROLL_BONUS: "$PLAYER_GAIN_ATTACK_ROLL_BONUS",
    PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS: "$PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS",
    PLAYER_ADD_DMG_PREVENTION: "$PLAYER_ADD_DMG_PREVENTION",
    PLAYER_RECHARGE_ITEM: "$PLAYER_RECHARGE_ITEM",
    PLAYER_LOSE_LOOT: "$PLAYER_LOSE_LOOT",
    PLAYER_GET_LOOT: "$PLAYER_GET_LOOT",
    RESPOND_TO: "$RESPOND_TO",
    FINISH_DO_STACK_EFFECT: "$FINISH_DO_STACK_EFFECT",
    GIVE_PLAYER_PRIORITY: "$GIVE_PLAYER_PRIORITY",
    TURN_PLAYER_DO_STACK_EFFECT: "$TURN_PLAYER_DO_STACK_EFFECT",
    START_TURN: "$START_TURN",
    //
    //Monster Signals
    MONSTER_ADD_DMG_PREVENTION: "$MONSTER_ADD_DMG_PREVENTION",
    MONSTER_HEAL: "$MONSTER_HEAL",
    //
    //Stack Signals
    DO_STACK_EFFECT: "$DO_STACK_EFFECT",
    REPLACE_STACK: "$REPLACE_STACK",
    REMOVE_FROM_STACK: "$REMOVE_FROM_STACK",
    ADD_TO_STACK: "$ADD_TO_STACK",
    ADD_RESOLVING_STACK_EFFECT: "$ADD_RESOLVING_STACK_EFFECT",
    REMOVE_RESOLVING_STACK_EFFECT: "REMOVE_RESOLVING_STACK_EFFECT",
    UPDATE_STACK_VIS: "$UPDATE_STACK_VIS",
    NEXT_STACK_ID: "$NEXT_STACK_ID",
    //
    UPDATE_ACTIONS: "$UPDATE_ACTIONS",
    FINISH_LOAD: "$FINISH_LOAD",
    REMOVE_MONSTER: "$REMOVE_MONSTER",
    ADD_MONSTER: '$ADD_MONSTER',
    GET_SOUL: '$GET_SOUL',
    LOSE_SOUL: '$LOSE_SOUL',
    GET_NEXT_MONSTER: "$GET_NEXT_MONSTER",
    MOVE_CARD_TO_PILE: "$MOVE_CARD_TO_PILE",
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
    /**
     * @server
     * @summary Successfully logged into the server
     * @params the uuid of current player
     */
    UUID: "$UUID",
    /**
     * @server
     * @summary When someone joined the room
     * @param uuid the uuid of the player whom joined
     */
    JOIN: "$JOIN",
    /**
     * @server
     * @summary When someone left the room
     * @param uuid the uuid of the player whom left
     */
    LEAVE: "$LEAVE",
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
    MATCH: "$MATCH",
    /**
     * @server
     * @summary Game ended.
     * @param interrupted is the game got interrupted
     * @param score player scores
     */
    RESULT: "$RESULT",
    /**
     * @server
     * @summary When player got a word correctly
     * @param uuid this player id of the winner
     * @param word the word that player got
     * @param ids the ids of the hexagons
     * @param letters the new replacing letters
     */
    CORRECT: "$CORRECT",
    /**
     * @server
     * @summary When player got a word wrong
     * @param uuid who got it wrong
     * @param word the word that player got
     * @param ids the ids of the hexagons
     */
    WRONG: "$WRONG",
    /**
     * @client
     * @summray validate a word
     * @param ids the array of chain numbers
     */
    VALIDATE: "$VALIDATE"
};
