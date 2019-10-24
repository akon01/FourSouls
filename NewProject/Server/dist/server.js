"use strict";
/**
 * Server
 * @author wheatup
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var ws_1 = require("ws");
var player_1 = require("./entities/player");
var whevent = require("whevent");
var fs = require("fs");
var signal_1 = require("./enums/signal");
var match_1 = require("./entities/match");
var Logger_1 = require("./utils/Logger");
var Server = /** @class */ (function () {
    function Server() {
        this.wss = null;
        this.config = null;
        this.words = [];
        this.logger = null;
        Server.$ = this;
    }
    Server.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("Loading config...");
                        _a = this;
                        return [4 /*yield*/, this.loadConfig()];
                    case 1:
                        _a.config = _b.sent();
                        console.log("Setting up server...");
                        this.setupWebSocket();
                        this.bindEvents();
                        this.logger = new Logger_1.Logger();
                        return [2 /*return*/];
                }
            });
        });
    };
    Server.prototype.bindEvents = function () {
        whevent.on(signal_1["default"].LOG, this.logFromPlayer, this);
        whevent.on(signal_1["default"].LOG_ERROR, this.logErrorFromPlayer, this);
        whevent.on(signal_1["default"].MATCH, this.onRequestMatch, this);
        whevent.on(signal_1["default"].MOVE_TO_TABLE, this.moveToTable, this);
        whevent.on(signal_1["default"].NEXT_TURN, this.nextTurn, this);
        whevent.on(signal_1["default"].START_GAME, this.onStartGame, this);
        whevent.on(signal_1["default"].FINISH_LOAD, this.onFinishLoad, this);
        whevent.on(signal_1["default"].UPDATE_ACTIONS, this.onUpdateActions, this);
        whevent.on(signal_1["default"].VALIDATE, this.onValidate, this);
        whevent.on(signal_1["default"].CARD_DRAWN, this.onCardDrawed, this);
        whevent.on(signal_1["default"].ADD_AN_ITEM, this.onAddItem, this);
        whevent.on(signal_1["default"].DECLARE_ATTACK, this.onDeclareAttack, this);
        whevent.on(signal_1["default"].GET_REACTION, this.onGetReaction, this);
        // whevent.on(signal.FIRSTGETREACTION, this.onGetReaction, this);
        whevent.on(signal_1["default"].RESOLVE_ACTIONS, this.onResolveActions, this);
        whevent.on(signal_1["default"].DISCARD_LOOT, this.onDiscardLoot, this);
        whevent.on(signal_1["default"].ACTIVATE_ITEM, this.onActivateItem, this);
        whevent.on(signal_1["default"].NEW_MONSTER_ON_PLACE, this.onNewActiveMonster, this);
        whevent.on(signal_1["default"].SHOW_CARD_PREVIEW, this.onShowCardPreview, this);
        whevent.on(signal_1["default"].ROLL_DICE, this.onRollDice, this);
        whevent.on(signal_1["default"].ROLL_DICE_ENDED, this.onRollDiceEnded, this);
        whevent.on(signal_1["default"].GET_NEXT_MONSTER, this.onGetNextMonster, this);
        whevent.on(signal_1["default"].MOVE_CARD_TO_PILE, this.onMoveCardToPile, this);
        whevent.on(signal_1["default"].GET_SOUL, this.onGetSoul, this);
        whevent.on(signal_1["default"].LOSE_SOUL, this.onLoseSoul, this);
        whevent.on(signal_1["default"].ADD_MONSTER, this.onAddMonster, this);
        //BOARD SIGANL
        whevent.on(signal_1["default"].REMOVE_MONSTER, this.onRemoveMonster, this);
        whevent.on(signal_1["default"].DRAW_CARD, this.onDrawCard, this);
        whevent.on(signal_1["default"].DECK_ADD_TO_TOP, this.onDeckAddToTop, this);
        whevent.on(signal_1["default"].DECK_ADD_TO_BOTTOM, this.onDeckAddToBottom, this);
        whevent.on(signal_1["default"].RECHARGE_ITEM, this.onRechargeItem, this);
        whevent.on(signal_1["default"].USE_ITEM, this.onRotateItem, this);
        whevent.on(signal_1["default"].SET_TURN, this.onSetTurn, this);
        whevent.on(signal_1["default"].ASSIGN_CHAR_TO_PLAYER, this.onAssignChar, this);
        whevent.on(signal_1["default"].FLIP_CARD, this.onFlipCard, this);
        whevent.on(signal_1["default"].BUY_ITEM_FROM_SHOP, this.onBuyItemFromShop, this);
        whevent.on(signal_1["default"].UPDATE_PASSIVE_DATA, this.onUpdatePassiveData, this);
        whevent.on(signal_1["default"].CARD_GET_COUNTER, this.onCardGetCounter, this);
        whevent.on(signal_1["default"].CANCEL_ATTACK, this.onCancelAttack, this);
        whevent.on(signal_1["default"].NEW_MONSTER_PLACE, this.onNewMonsterPlace, this);
        whevent.on(signal_1["default"].CHANGE_MONEY, this.onChangeMoney, this);
        whevent.on(signal_1["default"].ADD_STORE_CARD, this.onAddToStoreCard, this);
        whevent.on(signal_1["default"].REGISTER_PASSIVE_ITEM, this.onRegisterPassive, this);
        whevent.on(signal_1["default"].UPDATE_PASSIVES_OVER, this.onUpdatePassiveOver, this);
        whevent.on(signal_1["default"].REGISTER_ONE_TURN_PASSIVE_EFFECT, this.onRegisterOneTurnPassive, this);
        whevent.on(signal_1["default"].END_ROLL_ACTION, this.onEndRollAction, this);
        //stack events:
        whevent.on(signal_1["default"].REPLACE_STACK, this.onReplaceStack, this);
        whevent.on(signal_1["default"].REMOVE_FROM_STACK, this.onRemoveFromStack, this);
        whevent.on(signal_1["default"].ADD_TO_STACK, this.onAddToStack, this);
        whevent.on(signal_1["default"].ADD_RESOLVING_STACK_EFFECT, this.onAddToResolvingStack, this);
        whevent.on(signal_1["default"].REMOVE_RESOLVING_STACK_EFFECT, this.onRemoveFromResolvingStack, this);
        whevent.on(signal_1["default"].UPDATE_STACK_VIS, this.onUpdateStackVis, this);
        whevent.on(signal_1["default"].NEXT_STACK_ID, this.onNextStackId, this);
        whevent.on(signal_1["default"].GIVE_PLAYER_PRIORITY, this.onGivePlayerPriority, this);
        //player events
        whevent.on(signal_1["default"].SET_MONEY, this.onSetMoney, this);
        whevent.on(signal_1["default"].PLAYER_GAIN_ATTACK_ROLL_BONUS, this.onPlayerGainAttackRollBonus, this);
        whevent.on(signal_1["default"].PLAYER_GAIN_DMG, this.onPlayerGainDMG, this);
        whevent.on(signal_1["default"].PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS, this.onPlayerGainFirstAttackRollBonus, this);
        whevent.on(signal_1["default"].PLAYER_GAIN_HP, this.onPlayerGainHp, this);
        whevent.on(signal_1["default"].PLAYER_GAIN_ROLL_BONUS, this.onPlayerGainRollBonus, this);
        whevent.on(signal_1["default"].PLAYER_GET_HIT, this.onPlayerGetHit, this);
        whevent.on(signal_1["default"].PLAYER_RECHARGE_ITEM, this.onPlayerRechargeItem, this);
        whevent.on(signal_1["default"].PLAY_LOOT_CARD, this.onLootCardPlayed, this);
        whevent.on(signal_1["default"].PLAYER_GET_LOOT, this.onPlayerGainLoot, this);
        whevent.on(signal_1["default"].PLAYER_LOSE_LOOT, this.onPlayerLoseCard, this);
        whevent.on(signal_1["default"].PLAYER_HEAL, this.onPlayerHeal, this);
        //
        //monster events
        whevent.on(signal_1["default"].MONSTER_GAIN_DMG, this.onMonsterGainDMG, this);
        whevent.on(signal_1["default"].MONSTER_GAIN_HP, this.onMonsterGainHp, this);
        whevent.on(signal_1["default"].MONSTER_GAIN_ROLL_BONUS, this.onMonsterGainRollBonus, this);
        whevent.on(signal_1["default"].MONSTER_GET_DAMAGED, this.onMonsterGetDamaged, this);
        whevent.on(signal_1["default"].MONSTER_HEAL, this.onMonsterHeal, this);
        //
        whevent.on(signal_1["default"].RESPOND_TO, this.onRespondTo, this);
        whevent.on(signal_1["default"].FINISH_DO_STACK_EFFECT, this.onFinishDoStackEffect, this);
        whevent.on(signal_1["default"].DO_STACK_EFFECT, this.onDoStackEffect, this);
        whevent.on(signal_1["default"].TURN_PLAYER_DO_STACK_EFFECT, this.onTurnPlayerDoStackEffect, this);
        whevent.on(signal_1["default"].START_TURN, this.onStartTurn, this);
        whevent.on(signal_1["default"].DECK_ARRAGMENT, this.onDeckArrangement, this);
        whevent.on(signal_1["default"].MOVE_CARD, this.onCardMove, this);
        whevent.on(signal_1["default"].MOVE_CARD_END, this.onCardMoveEnd, this);
        //eden events
        whevent.on(signal_1["default"].EDEN_CHOSEN, this.onEdenChosen, this);
        whevent.on(signal_1["default"].CHOOSE_FOR_EDEN, this.onChooseForEden, this);
        //Action Lable
        whevent.on(signal_1["default"].ACTION_MASSAGE, this.onActionMassage, this);
    };
    Server.prototype.logFromPlayer = function (_a) {
        var player = _a.player, data = _a.data;
        this.logger.logFromPlayer(player.uuid, data);
    };
    Server.prototype.logErrorFromPlayer = function (_a) {
        var player = _a.player, data = _a.data;
        this.logger.logErrorFromPlayer(player.uuid, data);
    };
    Server.prototype.onRequestMatch = function (_a) {
        var player = _a.player, data = _a.data;
        if (player_1["default"].players.length >= 2) {
            var match = match_1["default"].getMatch();
            match.join(player);
            this.logger.addAPlayerToMatch(player.uuid);
        }
    };
    Server.prototype.onStartGame = function (_a) {
        var player = _a.player, data = _a.data;
        if (player_1["default"].players.length >= 2) {
            console.log("Starting match with " + player.match.players.length + " Players");
            player.match.start();
        }
    };
    Server.prototype.onFinishLoad = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.loadedPlayers += 1;
        player.match.firstPlayerId = data.data.turnPlayerId;
        if (player.match.loadedPlayers == player.match.players.length) {
            console.log('on finish load');
            player.match.broadcast(signal_1["default"].FINISH_LOAD, { id: player.match.firstPlayerId });
        }
    };
    Server.prototype.onUpdateActions = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].UPDATE_ACTIONS);
    };
    Server.prototype.moveToTable = function (_a) {
        var player = _a.player, data = _a.data;
        console.log("Move to table request from players");
        player.send(signal_1["default"].MOVE_TO_TABLE, {
            playerID: player.uuid,
            numOfPlayers: player_1["default"].players.length
        });
    };
    Server.prototype.onEdenChosen = function (_a) {
        var player = _a.player, data = _a.data;
        var playerToSendToId = data.data.sendToPlayerId;
        console.log(playerToSendToId);
        player.match.broadcastToPlayer(playerToSendToId, signal_1["default"].EDEN_CHOSEN, data);
    };
    Server.prototype.onChooseForEden = function (_a) {
        var player = _a.player, data = _a.data;
        var playerToSendToId = data.data.playerId;
        console.log(playerToSendToId);
        player.match.broadcastToPlayer(playerToSendToId, signal_1["default"].CHOOSE_FOR_EDEN, data);
    };
    Server.prototype.onTurnPlayerDoStackEffect = function (_a) {
        var player = _a.player, data = _a.data;
        var playerToSendToId = data.data.playerId;
        player.match.broadcastToPlayer(playerToSendToId, signal_1["default"].TURN_PLAYER_DO_STACK_EFFECT, data);
    };
    Server.prototype.onStartTurn = function (_a) {
        var player = _a.player, data = _a.data;
        var playerToSendToId = data.data.playerId;
        player.match.broadcastToPlayer(playerToSendToId, signal_1["default"].START_TURN, data);
    };
    Server.prototype.onActionMassage = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].ACTION_MASSAGE, data);
    };
    //Stack events
    Server.prototype.onGetReaction = function (_a) {
        var player = _a.player, data = _a.data;
        var playerToSendToId = data.data.nextPlayerId;
        console.log(playerToSendToId);
        player.match.broadcastToPlayer(playerToSendToId, signal_1["default"].GET_REACTION, data);
    };
    Server.prototype.onFinishDoStackEffect = function (_a) {
        var player = _a.player, data = _a.data;
        var playerToSendToId = data.data.playerId;
        player.match.broadcastToPlayer(playerToSendToId, signal_1["default"].FINISH_DO_STACK_EFFECT, data);
    };
    Server.prototype.onDoStackEffect = function (_a) {
        var player = _a.player, data = _a.data;
        var playerToSendToId = data.data.playerId;
        player.match.broadcastToPlayer(playerToSendToId, signal_1["default"].DO_STACK_EFFECT, data);
    };
    Server.prototype.onUpdateStackVis = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].UPDATE_STACK_VIS, data);
    };
    Server.prototype.onNextStackId = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].NEXT_STACK_ID, data);
    };
    Server.prototype.onRespondTo = function (_a) {
        var player = _a.player, data = _a.data;
        var playerToSendToId = data.data.playerId;
        player.match.broadcastToPlayer(playerToSendToId, signal_1["default"].RESPOND_TO, data);
    };
    Server.prototype.onReplaceStack = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].REPLACE_STACK, data);
    };
    Server.prototype.onRemoveFromStack = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].REMOVE_FROM_STACK, data);
    };
    Server.prototype.onAddToStack = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].ADD_TO_STACK, data);
    };
    Server.prototype.onAddToResolvingStack = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].ADD_RESOLVING_STACK_EFFECT, data);
    };
    Server.prototype.onRemoveFromResolvingStack = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].REMOVE_RESOLVING_STACK_EFFECT, data);
    };
    Server.prototype.onGivePlayerPriority = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].GIVE_PLAYER_PRIORITY, data);
    };
    //END
    Server.prototype.onSetMoney = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].SET_MONEY, data);
    };
    Server.prototype.onResolveActions = function (_a) {
        var player = _a.player, data = _a.data;
        var firstPlayer = player.match.getPlayerById(data.data.originalPlayer);
        firstPlayer.send(signal_1["default"].RESOLVE_ACTIONS, data);
        player.match.broadcastExept(firstPlayer, signal_1["default"].OTHER_PLAYER_RESOLVE_REACTION, data);
        //add broadcast to other players with diffrent signal to exceute "other side action stack"
    };
    Server.prototype.onCardDrawed = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].CARD_DRAWN, data);
    };
    Server.prototype.onRegisterPassive = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].REGISTER_PASSIVE_ITEM, data);
    };
    Server.prototype.onUpdatePassiveOver = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].UPDATE_PASSIVES_OVER, data);
    };
    //board events
    Server.prototype.onAssignChar = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].ASSIGN_CHAR_TO_PLAYER, data);
    };
    Server.prototype.onNewMonsterPlace = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].NEW_MONSTER_PLACE, data);
    };
    Server.prototype.onSetTurn = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].SET_TURN, data);
    };
    Server.prototype.onCancelAttack = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].CANCEL_ATTACK, data);
    };
    Server.prototype.onCardGetCounter = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].CARD_GET_COUNTER, data);
    };
    Server.prototype.onEndRollAction = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].END_ROLL_ACTION, data);
    };
    Server.prototype.onCardMove = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].MOVE_CARD, data);
    };
    Server.prototype.onCardMoveEnd = function (_a) {
        var player = _a.player, data = _a.data;
        var playerToSendToId = data.data.playerId;
        player.match.broadcastToPlayer(playerToSendToId, signal_1["default"].MOVE_CARD_END, data);
    };
    Server.prototype.onRechargeItem = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].RECHARGE_ITEM, data);
    };
    Server.prototype.onRotateItem = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].USE_ITEM, data);
    };
    Server.prototype.onFlipCard = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].FLIP_CARD, data);
    };
    Server.prototype.onBuyItemFromShop = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].BUY_ITEM_FROM_SHOP, data);
    };
    Server.prototype.onUpdatePassiveData = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].UPDATE_PASSIVE_DATA, data);
    };
    //
    //monster events
    Server.prototype.onMonsterGainDMG = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].MONSTER_GAIN_DMG, data);
    };
    Server.prototype.onMonsterGainHp = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].MONSTER_GAIN_HP, data);
    };
    Server.prototype.onMonsterGainRollBonus = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].MONSTER_GAIN_ROLL_BONUS, data);
    };
    Server.prototype.onMonsterGetDamaged = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].MONSTER_GET_DAMAGED, data);
    };
    Server.prototype.onMonsterHeal = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].MONSTER_HEAL, data);
    };
    //monster events end
    //player events
    Server.prototype.onPlayerHeal = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].PLAYER_HEAL, data);
    };
    Server.prototype.onPlayerGainLoot = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].PLAYER_GET_LOOT, data);
    };
    Server.prototype.onPlayerGainAttackRollBonus = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].PLAYER_GAIN_ATTACK_ROLL_BONUS, data);
    };
    Server.prototype.onPlayerGainDMG = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].PLAYER_GAIN_DMG, data);
    };
    Server.prototype.onPlayerGainFirstAttackRollBonus = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS, data);
    };
    Server.prototype.onPlayerGainHp = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].PLAYER_GAIN_HP, data);
    };
    Server.prototype.onPlayerGainRollBonus = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].PLAYER_GAIN_ROLL_BONUS, data);
    };
    Server.prototype.onPlayerGetHit = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].PLAYER_GET_HIT, data);
    };
    Server.prototype.onPlayerRechargeItem = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].PLAYER_RECHARGE_ITEM, data);
    };
    Server.prototype.onPlayerLoseCard = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].PLAYER_LOSE_LOOT, data);
    };
    //player events end
    //deck events start
    Server.prototype.onAddToStoreCard = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].ADD_STORE_CARD, data);
    };
    Server.prototype.onRegisterOneTurnPassive = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].REGISTER_ONE_TURN_PASSIVE_EFFECT, data);
    };
    Server.prototype.onDeckAddToTop = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].DECK_ADD_TO_TOP, data);
    };
    Server.prototype.onDeckAddToBottom = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].DECK_ADD_TO_BOTTOM, data);
    };
    Server.prototype.onDeckArrangement = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].DECK_ARRAGMENT, data);
    };
    //
    Server.prototype.onChangeMoney = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].CHANGE_MONEY, data);
    };
    Server.prototype.onDrawCard = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].DRAW_CARD, data);
    };
    Server.prototype.onGetSoul = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].GET_SOUL, data);
    };
    Server.prototype.onLoseSoul = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].LOSE_SOUL, data);
    };
    Server.prototype.onRemoveMonster = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].REMOVE_MONSTER, data);
    };
    Server.prototype.onAddMonster = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].ADD_MONSTER, data);
    };
    Server.prototype.onRollDiceEnded = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].ROLL_DICE_ENDED, data);
    };
    Server.prototype.onGetNextMonster = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].GET_NEXT_MONSTER, data);
    };
    Server.prototype.onMoveCardToPile = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].MOVE_CARD_TO_PILE, data);
    };
    Server.prototype.onRollDice = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].ROLL_DICE, data);
    };
    Server.prototype.onShowCardPreview = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].SHOW_CARD_PREVIEW, data);
    };
    Server.prototype.onNewActiveMonster = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].NEW_MONSTER_ON_PLACE, data);
    };
    Server.prototype.onActivateItem = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].ACTIVATE_ITEM, data);
    };
    Server.prototype.onDeclareAttack = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].DECLARE_ATTACK, data);
    };
    Server.prototype.onLootCardPlayed = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].PLAY_LOOT_CARD, data);
    };
    Server.prototype.onDiscardLoot = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].DISCARD_LOOT, data);
    };
    Server.prototype.onAddItem = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].ADD_AN_ITEM, data);
    };
    Server.prototype.nextTurn = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_1["default"].NEXT_TURN, data);
    };
    Server.prototype.onValidate = function (_a) {
        var player = _a.player, data = _a.data;
        var match = player.match;
        if (match && match.running) {
            match.validate(player, data.data);
        }
    };
    Server.prototype.setupWebSocket = function () {
        var _this = this;
        //@ts-ignore
        this.wss = new ws_1.Server({ port: this.config.port }, function () {
            console.log("\x1b[33m%s\x1b[0m", "Websocket server listening on port " + _this.config.port + "...");
            _this.wss.on("connection", function (ws) {
                var player = player_1["default"].getPlayer(ws);
                _this.onConnection(player);
                ws.on("message", function (message) {
                    _this.onMessage(player, message);
                });
                ws.on("close", function (ws) {
                    _this.onClose(player);
                });
            });
        });
    };
    Server.prototype.loadConfig = function () {
        return new Promise(function (resolve, reject) {
            fs.readFile("./resources/config.json", function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(JSON.parse(data.toString()));
                }
            });
        });
    };
    Server.prototype.loadWords = function () {
        return new Promise(function (resolve, reject) {
            fs.readFile("./resources/words.json", function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(JSON.parse(data.toString()));
                }
            });
        });
    };
    Server.prototype.onConnection = function (player) {
        console.log("Player " + player.uuid + " has connected!");
        player.send(signal_1["default"].UUID, player.uuid);
    };
    Server.prototype.onClose = function (player) {
        player.remove();
        console.log("Player " + player.uuid + " has disconnected!");
    };
    Server.prototype.onError = function (player, err) {
        console.log("Player " + player.uuid + " has encountered an error!", err);
    };
    Server.prototype.onMessage = function (player, message) {
        try {
            var data = JSON.parse(Buffer.from(message, "base64").toString());
            console.log("Player " + player.uuid + ": ", data);
            var id = player.uuid;
            this.logger.logFromServer(id, data);
            whevent.emit(data.signal, { player: player, data: data });
        }
        catch (ex) {
            console.error(ex);
            console.error("Player " + player.uuid + " unknown package: ", message);
        }
    };
    Server.prototype.send = function (player, signal, message) {
        player.send(signal, message);
    };
    Server.$ = null;
    return Server;
}());
exports["default"] = Server;
