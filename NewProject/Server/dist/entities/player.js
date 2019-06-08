"use strict";
/**
 * Player entity
 * @author wheatup
 */
exports.__esModule = true;
var Player = /** @class */ (function () {
    function Player(ws, uuid) {
        this.ws = null;
        this.uuid = null;
        this.match = null;
        this.ws = ws;
        this.uuid = uuid;
    }
    Player.getPlayer = function (ws) {
        //@ts-ignore
        if (Player.getPlayerByWs(ws) == null) {
            var player = new Player(ws, ++Player.UUID);
            Player.players.push(player);
            return player;
        }
        else {
            return Player.getPlayerByWs(ws);
        }
    };
    Player.getPlayerByWs = function (ws) {
        for (var i = 0; i < Player.players.length; i++) {
            var player = Player.players[i];
            if (player.ws == ws) {
                return player;
            }
        }
        return null;
    };
    Player.prototype.send = function (signal, data) {
        var pack = { signal: signal, data: data };
        try {
            this.ws.send(Buffer.from(JSON.stringify(pack)).toString('base64'));
        }
        catch (ex) {
            // console.error(ex);
        }
    };
    Player.prototype.remove = function () {
        if (this.match) {
            this.match.leave(this);
            this.match = null;
        }
        Player.players.splice(Player.players.indexOf(Player.players[this.uuid]), 1);
        --Player.UUID;
    };
    Player.players = [];
    Player.UUID = 0;
    return Player;
}());
exports["default"] = Player;
