"use strict";
exports.__esModule = true;
var ServerPlayer = /** @class */ (function () {
    function ServerPlayer(ws, uuid) {
        this.ws = null;
        this.uuid = null;
        this.match = null;
        this.ws = ws;
        this.uuid = uuid;
    }
    ServerPlayer.getPlayer = function (ws) {
        //@ts-ignore
        if (ServerPlayer.getPlayerByWs(ws) == null) {
            var player = new ServerPlayer(ws, ++ServerPlayer.UUID);
            ServerPlayer.players.push(player);
            return player;
        }
        else {
            return ServerPlayer.getPlayerByWs(ws);
        }
    };
    ServerPlayer.getPlayerByWs = function (ws) {
        for (var i = 0; i < ServerPlayer.players.length; i++) {
            var player = ServerPlayer.players[i];
            if (player.ws == ws) {
                return player;
            }
        }
        return null;
    };
    ServerPlayer.prototype.send = function (signal, data) {
        var pack = { signal: signal, data: data };
        try {
            this.ws.send(Buffer.from(JSON.stringify(pack)).toString("base64"));
        }
        catch (ex) {
            // console.error(ex);
        }
    };
    ServerPlayer.prototype.remove = function () {
        if (this.match) {
            this.match.leave(this);
            this.match = null;
        }
        ServerPlayer.players.splice(ServerPlayer.players.indexOf(ServerPlayer.players[this.uuid]), 1);
        --ServerPlayer.UUID;
    };
    ServerPlayer.players = [];
    ServerPlayer.UUID = 0;
    return ServerPlayer;
}());
exports["default"] = ServerPlayer;
