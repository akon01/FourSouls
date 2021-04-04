"use strict";
exports.__esModule = true;
/**
 * Match entity
 * @author wheatup
 */
//@ts-nocheck
var signal_1 = require("../enums/signal");
var server_1 = require("../server");
var Logger_1 = require("../utils/Logger");
var utils_1 = require("../utils/utils");
var dataParser_1 = require("./dataParser");
var MIID = 0;
var Match = /** @class */ (function () {
    function Match() {
        this.cards = [];
        this.parser = null;
        this.loadedPlayers = 0;
        this.level = 0;
        this.firstPlayerId = 0;
        this.players = [];
        this.time = 120;
        this.letters = null;
        this.running = false;
        this.score = {};
    }
    Match.getMatch = function () {
        if (Match.pendingMatches.length > 0) {
            return Match.pendingMatches[0];
        }
        else {
            var match = new Match();
            match.parser = new dataParser_1["default"](match);
            server_1["default"].$.logger = new Logger_1.Logger();
            Match.pendingMatches.push(match);
            return match;
        }
    };
    Match.prototype.broadcast = function (signal, data) {
        var totalPlayers = this.players.length;
        for (var i = totalPlayers - 1; i >= 0; i--) {
            var player = this.players[i];
            if (player) {
                player.send(signal, data);
            }
        }
    };
    Match.prototype.getCardById = function (id) {
        if (this.cards.length == 0)
            return null;
        return this.cards.find(function (c) { return c.cardId == id; });
    };
    Match.prototype.getPlayerById = function (id) {
        for (var i = 0; i < this.players.length; i++) {
            var player = this.players[i];
            if (player.uuid == id) {
                return player;
            }
        }
    };
    Match.prototype.broadcastToPlayer = function (playerIdToSendTo, signal, data) {
        var player = this.getPlayerById(playerIdToSendTo);
        if (player) {
            player.send(signal, data);
        }
    };
    Match.prototype.broadcastToNextPlayer = function (currentPlayer, signal, data) {
        var totalPlayers = this.players.length;
        console.log(currentPlayer.uuid);
        var currentPlayerUuid = currentPlayer.uuid;
        if (currentPlayer.uuid == totalPlayers) {
            currentPlayerUuid = 0;
        }
        for (var i = totalPlayers - 1; i >= 0; i--) {
            var player = this.players[i];
            console.log("chekcing for player " + player.uuid);
            if (player.uuid == currentPlayerUuid + 1) {
                player.send(signal, data);
                break;
            }
        }
    };
    Match.prototype.broadcastExept = function (excludedPlayer, signal, data) {
        var totalPlayers = this.players.length;
        for (var i = totalPlayers - 1; i >= 0; i--) {
            var player = this.players[i];
            if (player !== excludedPlayer) {
                player.send(signal, data);
            }
        }
    };
    Match.prototype.start = function () {
        if (this.running) {
            return;
        }
        console.log("starting match");
        this.running = true;
        this.broadcast(signal_1["default"].START_GAME, {});
        // setTimeout(() => {
        //   this.timeup();
        // }, this.time * 1000);
        this.close();
    };
    Match.prototype.stop = function () {
        var _this = this;
        this.running = false;
        this.broadcast(signal_1["default"].RESULT, {
            interrupted: this.players.length < 2,
            score: this.score
        });
        this.close();
        this.players.forEach(function (player) {
            _this.leave(player, true);
        });
    };
    Match.prototype.timeup = function () {
        if (this.running) {
            this.stop();
        }
    };
    Match.prototype.join = function (player) {
        //if more then 4 players try to join or the same player tries to join twice
        if (this.players.length >= 4 || this.players.indexOf(player) >= 0) {
            return;
        }
        console.log(this.players.length);
        this.players.push(player);
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player_1 = _a[_i];
            player_1.match = this;
        }
        console.log("player " + player + " joined");
        this.broadcast(signal_1["default"].JOIN, { uuid: player.uuid });
    };
    Match.prototype.validate = function (player, ids) {
        var _this = this;
        var text = "";
        ids.forEach(function (id) {
            text += _this.letters[id];
        });
        if (utils_1["default"].isWord(text.toLowerCase())) {
            var letters_1 = utils_1["default"].generateLetters2(ids);
            var lettersArr_1 = this.letters.split("");
            var score = server_1["default"].$.config.scoreMap[text.length < server_1["default"].$.config.scoreMap.length
                ? text.length
                : server_1["default"].$.config.scoreMap.length - 1];
            ids.forEach(function (id, index) {
                lettersArr_1[id] = letters_1[index];
            });
            this.letters = lettersArr_1.join("");
            this.score[player.uuid].score += score;
            this.broadcast(signal_1["default"].CORRECT, {
                uuid: player.uuid,
                ids: ids,
                word: text,
                letters: letters_1,
                score: score
            });
        }
        else {
            this.broadcast(signal_1["default"].WRONG, { uuid: player.uuid, ids: ids });
        }
    };
    Match.prototype.leave = function (player, silence) {
        // if (this.players.indexOf(player) < 0) {
        // 	return;
        // }
        // player.match = null;
        // this.players.splice(this.players.indexOf(player), 1);
        // if (!silence) {
        // 	this.broadcast(signal.LEAVE, { uuid: player.uuid });
        // }
        if (this.running) {
            this.stop();
        }
        this.close();
    };
    Match.prototype.close = function () {
        if (Match.pendingMatches.indexOf(this) >= 0) {
            Match.pendingMatches.splice(Match.pendingMatches.indexOf(this), 1);
        }
    };
    Match.pendingMatches = [];
    return Match;
}());
exports["default"] = Match;
