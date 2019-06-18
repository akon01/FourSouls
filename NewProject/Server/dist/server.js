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
var signal_1 = require("./enums/signal");
var whevent = require("whevent");
var fs = require("fs");
var signal_2 = require("./enums/signal");
var match_1 = require("./entities/match");
var Server = /** @class */ (function () {
    function Server() {
        this.wss = null;
        this.config = null;
        this.words = [];
        Server.$ = this;
    }
    Server.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log("Loading config...");
                        _a = this;
                        return [4 /*yield*/, this.loadConfig()];
                    case 1:
                        _a.config = _c.sent();
                        console.log("Loading dictionary...");
                        _b = this;
                        return [4 /*yield*/, this.loadWords()];
                    case 2:
                        _b.words = _c.sent();
                        console.log("Setting up server...");
                        this.setupWebSocket();
                        this.bindEvents();
                        return [2 /*return*/];
                }
            });
        });
    };
    Server.prototype.bindEvents = function () {
        whevent.on(signal_2["default"].MATCH, this.onRequestMatch, this);
        whevent.on(signal_2["default"].MOVETOTABLE, this.moveToTable, this);
        whevent.on(signal_2["default"].NEXTTURN, this.nextTurn, this);
        whevent.on(signal_2["default"].STARTGAME, this.onStartGame, this);
        whevent.on(signal_2["default"].VALIDATE, this.onValidate, this);
        whevent.on(signal_2["default"].CARDDRAWED, this.onCardDrawed, this);
        whevent.on(signal_2["default"].ADDANITEM, this.onAddItem, this);
        whevent.on(signal_2["default"].DECLAREATTACK, this.onDeclareAttack, this);
        whevent.on(signal_2["default"].PLAYLOOTCARD, this.onLootCardPlayed, this);
        whevent.on(signal_1["default"].GETREACTION, this.onGetReaction, this);
        whevent.on(signal_1["default"].FIRSTGETREACTION, this.onGetReaction, this);
        whevent.on(signal_1["default"].RESOLVEACTIONS, this.onResolveActions, this);
        whevent.on(signal_2["default"].DISCRADLOOT, this.onDiscardLoot, this);
        whevent.on(signal_2["default"].ACTIVATEITEM, this.onActivateItem, this);
        whevent.on(signal_2["default"].NEWMONSTERONPLACE, this.onNewActiveMonster, this);
        whevent.on(signal_2["default"].SHOWCARDPREVIEW, this.onShowCardPreview, this);
        whevent.on(signal_2["default"].ROLLDICE, this.onRollDice, this);
        whevent.on(signal_2["default"].ROLLDICEENDED, this.onRollDiceEnded, this);
    };
    Server.prototype.onRequestMatch = function (_a) {
        var player = _a.player, data = _a.data;
        if (player_1["default"].players.length >= 2) {
            var match = match_1["default"].getMatch();
            match.join(player);
        }
    };
    Server.prototype.onStartGame = function (_a) {
        var player = _a.player, data = _a.data;
        if (player_1["default"].players.length >= 2) {
            console.log("Starting match with " + player.match.players.length + " Players");
            player.match.start();
        }
    };
    Server.prototype.moveToTable = function (_a) {
        var player = _a.player, data = _a.data;
        console.log("Move to table request from players");
        player.send(signal_2["default"].MOVETOTABLE, {
            playerID: player.uuid,
            numOfPlayers: player_1["default"].players.length
        });
    };
    Server.prototype.onGetReaction = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastToNextPlayer(player, signal_2["default"].GETREACTION, data);
    };
    Server.prototype.onResolveActions = function (_a) {
        var player = _a.player, data = _a.data;
        var firstPlayer = player.match.getPlayerById(data.data.originalPlayer);
        firstPlayer.send(signal_2["default"].RESOLVEACTIONS, data);
        player.match.broadcastExept(firstPlayer, signal_2["default"].OTHERPLAYERRESOLVEREACTION, data);
        //add broadcast to other players with diffrent signal to exceute "other side action stack"
    };
    Server.prototype.onCardDrawed = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_2["default"].CARDDRAWED, data);
    };
    Server.prototype.onRollDiceEnded = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_2["default"].ROLLDICEENDED, data);
    };
    Server.prototype.onRollDice = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_2["default"].ROLLDICE, data);
    };
    Server.prototype.onShowCardPreview = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_2["default"].SHOWCARDPREVIEW, data);
    };
    Server.prototype.onNewActiveMonster = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_2["default"].NEWMONSTERONPLACE, data);
    };
    Server.prototype.onActivateItem = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_2["default"].ACTIVATEITEM, data);
    };
    Server.prototype.onDeclareAttack = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_2["default"].DECLAREATTACK, data);
    };
    Server.prototype.onLootCardPlayed = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_2["default"].PLAYLOOTCARD, data);
    };
    Server.prototype.onDiscardLoot = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_2["default"].DISCRADLOOT, data);
    };
    Server.prototype.onAddItem = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_2["default"].ADDANITEM, data);
    };
    Server.prototype.nextTurn = function (_a) {
        var player = _a.player, data = _a.data;
        player.match.broadcastExept(player, signal_2["default"].NEXTTURN, data);
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
