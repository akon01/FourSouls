"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
/**
 * Server
 * @author wheatup
 */
//@ts-nocheck
var ws_1 = require("ws");
var ServerPlayer_1 = require("./entities/ServerPlayer");
var fs = require("fs");
var whevent = require("whevent");
var match_1 = require("./entities/match");
var signal_1 = require("./enums/signal");
var ServerCard_1 = require("./entities/ServerCard");
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
                        return [2 /*return*/];
                }
            });
        });
    };
    Server.prototype.test = function (dirName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                //const fs = require("fs")
                // const readline = require('readline');
                // const readinterface = readline.createInterface({
                //   input: fs.createReadStream('/MainGame.fire'),
                //   output: process.stdout,
                //   console: false
                // })
                // let lines = []
                // readinterface.on('line', (line) => {
                //   lines.push(line)
                // })
                // console.log(lines.length);
                // let lines = []
                // await fs.readFile('D:/Coding/CocosProjects/NewProject/assets/resources/Prefabs/CharacterCards/CharItemCards/Forever Alone.prefab', 'utf8', async (err, data: string) => {
                //   if (err) {
                //     console.log(`err`);
                //   }
                //   console.log(`end of read file`);
                //   //  console.log(data);
                //   // fs.appendFileSync('/test3.txt', "start", (err2) => {
                //   //   if (err2) throw err2;
                //   // })
                //   whevent.emit(1000, { lines: data, fileName: `Forever Alone.prefab`, dirName: "D:/Coding/CocosProjects/NewProject/assets/resources/Prefabs/CharacterCards/CharItemCards" })
                // })
                // dirName = "D:/Coding/CocosProjects/NewProject/assets/resources/Prefabs/CharacterCards/CharCardsPrefabs"
                fs.readdir(dirName, function (err, filenames) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    filenames.forEach(function (file) {
                        if (!file.endsWith(".meta")) {
                            fs.readFile(dirName + "/" + file, "utf8", function (err, content) {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                whevent.emit(1000, { lines: content, fileName: file, dirName: dirName });
                            });
                        }
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    Server.prototype.doIt = function (data) {
        // const fs = require("fs")
        var regexp = new RegExp('"width": (\\d+.+\\d+|\\d+)', "g");
        var regexp2 = new RegExp('"height": (\\d+.+\\d+|\\d+)', "g");
        var regexp3 = new RegExp('"array": \\[\\n *\\d*,\\n *([\\s\\S]+?),', "g");
        var newText = data.lines.replace(regexp3, function (subString, args) {
            var number = Number.parseFloat(args);
            var newString = subString.replace(args, (number / 2).toFixed(2));
            return newString;
        });
        newText = newText.replace(regexp, function (subString, args) {
            var number = Number.parseFloat(args);
            return subString.replace(args, (number / 2).toFixed(2));
        });
        newText = newText.replace(regexp2, function (subString, args) {
            var number = Number.parseFloat(args);
            return subString.replace(args, (number / 2).toFixed(2));
        });
        //const fileName = data.fileName.replace(new RegExp(`\\.prefab`), ` test.prefab`)
        fs.unlink(data.dirName + "/" + data.fileName, function () {
            fs.appendFileSync(data.dirName + "/" + data.fileName, newText, function (err2) {
                if (err2) {
                    throw err2;
                }
            });
        });
        // for (let i = 0; i < data.lines.length; i++) {
        //   const line = data.lines[i];
        //   let newLine = line
        //   let regexFound = line.match(regexp)
        //   if (regexFound != null) {
        //     newLine = this.checkRegex(regexFound, newLine, `width`);
        //   } else {
        //     regexFound = line.match(regexp2)
        //     if (regexFound != null) {
        //       newLine = this.checkRegex(regexFound, newLine, `height`)
        //     } else {
        //       regexFound = line.match(regexp3)
        //       if (regexFound != null) {
        //         newLine = this.checkRegex(regexFound, newLine, `array`)
        //       }
        //     }
        //   }
        //   switch (i) {
        //     case data.lines.length * 0.25:
        //       console.log(`finished 25% of ${data.fileName}`);
        //       break;
        //     case data.lines.length * 0.50:
        //       console.log(`finished 50% of ${data.fileName}`);
        //       break;
        //     case data.lines.length * 0.75:
        //       console.log(`finished 75% of ${data.fileName}`);
        //       break;
        //     default:
        //       break;
        //   }
        //   newLine = newLine + '\n'
        //   fs.appendFileSync(data.dirName + '/' + data.fileName + ' test', newLine, (err2) => {
        //     if (err2) throw err2;
        //   })
        // }
        console.log("finished");
    };
    Server.prototype.checkRegex = function (regexFound, newLine, word) {
        console.log("check regex");
        if (regexFound.length > 0) {
            var oldLine = newLine;
            var number = Number.parseFloat(regexFound[1]);
            if (number != 0) {
                console.log("number is not 0");
                number = number / 2;
                if (word != "array") {
                    newLine = "\"" + word + "\": " + number.toFixed(2);
                }
                else {
                    newLine = "\"" + word + "\": " + number.toFixed(2);
                }
                console.log(oldLine.endsWith(","));
                if (oldLine.endsWith(",")) {
                    newLine = newLine + ",";
                }
                console.log(" line changed : " + oldLine + "  to " + newLine + " ");
            }
            else {
                console.log("number is 0");
            }
        }
        return newLine;
    };
    Server.prototype.bindEvents = function () {
        whevent.on(signal_1["default"].SET_MAX_ITEMS_STORE, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].SEND_CARD_DATA, this.getCardData, this);
        whevent.on(signal_1["default"].LOG, this.logFromPlayer, this);
        whevent.on(signal_1["default"].LOG_ERROR, this.logErrorFromPlayer, this);
        whevent.on(signal_1["default"].MATCH, this.onRequestMatch, this);
        whevent.on(signal_1["default"].MOVE_TO_TABLE, this.moveToTable, this);
        whevent.on(signal_1["default"].NEXT_TURN, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].START_GAME, this.onStartGame, this);
        whevent.on(signal_1["default"].END_GAME, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].GAME_HAS_STARTED, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].FINISH_LOAD, this.onFinishLoad, this);
        whevent.on(signal_1["default"].UPDATE_ACTIONS, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].VALIDATE, this.onValidate, this);
        whevent.on(signal_1["default"].CARD_DRAWN, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].ADD_AN_ITEM, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].DECLARE_ATTACK, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].GET_REACTION, this.onSendToSpecificPlayer, this);
        // whevent.on(signal.FIRSTGETREACTION, this.onGetReaction, this);
        whevent.on(signal_1["default"].RESOLVE_ACTIONS, this.onResolveActions, this);
        whevent.on(signal_1["default"].DISCARD_LOOT, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].ACTIVATE_ITEM, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].NEW_MONSTER_ON_PLACE, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].SHOW_CARD_PREVIEW, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].ROLL_DICE, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].ROLL_DICE_ENDED, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].GET_NEXT_MONSTER, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].MOVE_CARD_TO_PILE, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].REMOVE_FROM_PILE, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].GET_SOUL, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].LOSE_SOUL, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].ADD_MONSTER, this.onBroadcastExceptOrigin, this);
        //Particle Signals
        whevent.on(signal_1["default"].ACTIVATE_PARTICLE_EFFECT, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].DISABLE_PARTICLE_EFFECT, this.onBroadcastExceptOrigin, this);
        //
        //BOARD SIGANL
        whevent.on(signal_1["default"].REMOVE_MONSTER, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].DRAW_CARD, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].DECK_ADD_TO_TOP, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].CARD_CHANGE_COUNTER, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].DECK_ADD_TO_BOTTOM, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].RECHARGE_ITEM, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].USE_ITEM, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].SET_TURN, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].ASSIGN_CHAR_TO_PLAYER, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].SET_CHAR, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].SET_CHAR_END, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].FLIP_CARD, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].REMOVE_ITEM_FROM_SHOP, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].UPDATE_PASSIVE_DATA, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].CARD_GET_COUNTER, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].END_BATTLE, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].END_TURN, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].NEW_MONSTER_PLACE, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].CHANGE_MONEY, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].ADD_STORE_CARD, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].REGISTER_PASSIVE_ITEM, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].REMOVE_FROM_PASSIVE_MANAGER, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].UPDATE_PASSIVES_OVER, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].REGISTER_ONE_TURN_PASSIVE_EFFECT, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].END_ROLL_ACTION, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].SHOW_DECISION, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].SHOW_STACK_EFFECT, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].SET_STACK_ICON, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].SHOW_DICE_ROLL, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].SHOW_EFFECT_CHOSEN, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].SHOW_REACTIONS, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].HIDE_REACTIONS, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].REACTION_TOGGLED, this.onBroadcastExceptOrigin, this);
        //stack events:
        whevent.on(signal_1["default"].REPLACE_STACK, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].REMOVE_FROM_STACK, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].FIZZLE_STACK_EFFECT, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].ADD_TO_STACK, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PUT_ON_STACK, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].END_PUT_ON_STACK, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].UPDATE_RESOLVING_STACK_EFFECTS, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].UPDATE_STACK_VIS, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].ADD_SE_VIS_PREV, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].REMOVE_SE_VIS_PREV, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].CLEAR_SE_VIS, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].STACK_EFFECT_LABLE_CHANGE, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].UPDATE_STACK_LABLE, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].UPDATE_STACK_EFFECT, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].NEXT_STACK_ID, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].GIVE_PLAYER_PRIORITY, this.onBroadcastExceptOrigin, this);
        //player events
        whevent.on(signal_1["default"].SET_MONEY, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_PROP_UPDATE, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_GAIN_ATTACK_ROLL_BONUS, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_GAIN_DMG, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_GAIN_FIRST_ATTACK_ROLL_BONUS, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_GAIN_HP, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_GAIN_ROLL_BONUS, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_GET_HIT, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_RECHARGE_ITEM, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAY_LOOT_CARD, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_GET_LOOT, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_LOSE_LOOT, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_HEAL, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_ADD_DMG_PREVENTION, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_DIED, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_ADD_CURSE, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].MAKE_CHOOSE_FROM, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].FINISH_MAKE_CHOOSE_FROM, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].CHANGE_TURN_DRAW_PLAYS, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_SET_RECHARGE_CHAR_AT_START_OF_TURN, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_SET_HAND_SHOW_CARD_BACK, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_CHANGE_LOOT_CARD_PLAYS, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_CHANGE_NUM_OF_ITEMS_TO_RECHARGE, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].PLAYER_CHANGE_EXTRA_SOULS_NEEDED_TO_WIN, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].CHANGE_PLAYER_ATTACKABLE, this.onBroadcastExceptOrigin, this);
        //
        //monster events
        whevent.on(signal_1["default"].MONSTER_GAIN_DMG, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].MONSTER_GAIN_HP, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].MONSTER_GAIN_ROLL_BONUS, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].MONSTER_GET_DAMAGED, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].MONSTER_HEAL, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].MONSTER_ADD_DMG_PREVENTION, this.onBroadcastExceptOrigin, this);
        //
        whevent.on(signal_1["default"].RESPOND_TO, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].FINISH_DO_STACK_EFFECT, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].DO_STACK_EFFECT, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].STACK_EMPTIED, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].TURN_PLAYER_DO_STACK_EFFECT, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].START_TURN, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].DECK_ARRAGMENT, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].MARK_DECK_AS_DRAW_FROM_PILE_INSTED, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].MOVE_CARD, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].MOVE_CARD_END, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].SOUL_CARD_MOVE_END, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].CARD_ADD_TRINKET, this.onBroadcastExceptOrigin, this);
        //eden events
        whevent.on(signal_1["default"].EDEN_CHOSEN, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].CHOOSE_FOR_EDEN, this.onSendToSpecificPlayer, this);
        //Action Lable
        whevent.on(signal_1["default"].ACTION_MASSAGE_ADD, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].ACTION_MASSAGE_REMOVE, this.onBroadcastExceptOrigin, this);
        //Single Card Events
        whevent.on(signal_1["default"].SET_CONCURENT_EFFECT_DATA, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].CARD_CHANGE_NUM_OF_SOULS, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].CARD_SET_OWNER, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].ITEM_SET_LAST_OWNER, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].ADD_EGG_COUNTER, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].REMOVE_EGG_COUNTER, this.onBroadcastExceptOrigin, this);
        //Announcement Lable
        whevent.on(signal_1["default"].SHOW_ANNOUNCEMENT, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].HIDE_ANNOUNCEMENT, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].SHOW_TIMER, this.onBroadcastExceptOrigin, this);
        whevent.on(signal_1["default"].HIDE_TIMER, this.onBroadcastExceptOrigin, this);
        //button data collector
        whevent.on(signal_1["default"].CHOOSE_BUTTON_DATA_COLLECTOR, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].CHOOSE_BUTTON_DATA_COLLECTOR_RESPONSE, this.onSendToSpecificPlayer, this);
        whevent.on(signal_1["default"].MOUSE_CURSOR_MOVE, this.onBroadcastExceptOrigin, this);
    };
    Server.prototype.getCardData = function (_a) {
        var _b;
        var player = _a.player, data = _a.data;
        if (((_b = player === null || player === void 0 ? void 0 : player.match) === null || _b === void 0 ? void 0 : _b.cards.length) == 0) {
            var allCards = JSON.parse(data.data.allCards);
            allCards.forEach(function (card) { return player.match.cards.push(new ServerCard_1.ServerCard(card.cardId, card.cardName)); });
            player.match.cards = allCards;
        }
    };
    Server.prototype.onBroadcastExceptOrigin = function (_a) {
        var _b;
        var player = _a.player, data = _a.data;
        (_b = player === null || player === void 0 ? void 0 : player.match) === null || _b === void 0 ? void 0 : _b.broadcastExept(player, data.signal, data);
    };
    Server.prototype.onSendToSpecificPlayer = function (_a) {
        var _b;
        var player = _a.player, data = _a.data;
        var playerToSendToId = data.data.playerId;
        (_b = player === null || player === void 0 ? void 0 : player.match) === null || _b === void 0 ? void 0 : _b.broadcastToPlayer(playerToSendToId, data.signal, data);
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
        if (ServerPlayer_1["default"].players.length >= 2) {
            var match = match_1["default"].getMatch();
            match.join(player);
            this.logger.addAPlayerToMatch(player.uuid);
        }
    };
    Server.prototype.onStartGame = function (_a) {
        var player = _a.player, data = _a.data;
        if (ServerPlayer_1["default"].players.length >= 2) {
            console.log("Starting match with " + player.match.players.length + " Players");
            player.match.start();
        }
    };
    Server.prototype.onFinishLoad = function (_a) {
        var _b;
        var player = _a.player, data = _a.data;
        player.match.loadedPlayers += 1;
        player.match.firstPlayerId = data.data.id;
        if (player.match.loadedPlayers == player.match.players.length) {
            console.log("on finish load");
            (_b = player === null || player === void 0 ? void 0 : player.match) === null || _b === void 0 ? void 0 : _b.broadcast(signal_1["default"].FINISH_LOAD, { id: player.match.firstPlayerId });
        }
    };
    Server.prototype.moveToTable = function (_a) {
        var player = _a.player, data = _a.data;
        console.log("Move to table request from players");
        player.send(signal_1["default"].MOVE_TO_TABLE, {
            playerID: player.uuid,
            numOfPlayers: ServerPlayer_1["default"].players.length
        });
    };
    //Stack events
    //END
    Server.prototype.onResolveActions = function (_a) {
        var _b;
        var player = _a.player, data = _a.data;
        var firstPlayer = player.match.getPlayerById(data.data.originalPlayer);
        firstPlayer.send(signal_1["default"].RESOLVE_ACTIONS, data);
        (_b = player === null || player === void 0 ? void 0 : player.match) === null || _b === void 0 ? void 0 : _b.broadcastExept(firstPlayer, signal_1["default"].OTHER_PLAYER_RESOLVE_REACTION, data);
        //add broadcast to other players with diffrent signal to exceute "other side action stack"
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
                var player = ServerPlayer_1["default"].getPlayer(ws);
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
    Server.prototype.onConnection = function (player) {
        console.log("Player " + player.uuid + " has connected!");
        player.send(signal_1["default"].UUID, player.uuid);
    };
    Server.prototype.onClose = function (player) {
        this.onBroadcastExceptOrigin({ player: player, data: { signal: signal_1["default"].PLAYER_DISCONNECTED, text: "player " + player.uuid + " has disconnected" } });
        player.remove();
        console.log("Player " + player.uuid + " has disconnected!");
        this.logger.commitLogWrite();
    };
    Server.prototype.onError = function (player, err) {
        console.log("Player " + player.uuid + " has encountered an error!", err);
    };
    Server.prototype.onMessage = function (player, message) {
        var _a;
        try {
            var data = JSON.parse(Buffer.from(message, "base64").toString());
            var recivedData = (_a = player === null || player === void 0 ? void 0 : player.match) === null || _a === void 0 ? void 0 : _a.parser.parseData(data.data);
            if (data.signal !== signal_1["default"].MOUSE_CURSOR_MOVE) {
                console.log(data.signal + " Recived From Player " + player.uuid + ": ", recivedData);
                console.log("\n");
            }
            var id = player.uuid;
            whevent.emit(data.signal, { player: player, data: data });
            if (this.logger) {
                this.logger.logFromServer(id, data);
            }
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
