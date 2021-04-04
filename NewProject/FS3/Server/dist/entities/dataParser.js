"use strict";
exports.__esModule = true;
var DataParser = /** @class */ (function () {
    function DataParser(match) {
        this.match = match;
    }
    DataParser.prototype.parseData = function (data) {
        if (data == undefined || data == null) {
            return data;
        }
        ;
        var originData = Object.create(data);
        var parsedData = [];
        var card;
        var player;
        var cardsArrangement = [];
        var keys = Object.keys(data);
        var _loop_1 = function (key) {
            var lowerKey = key.toLowerCase();
            if (key == "arrangement" || key == "cardsIds") {
                for (var _i = 0, _a = data[key]; _i < _a.length; _i++) {
                    var cardId = _a[_i];
                    cardsArrangement.push(this_1.match.getCardById(cardId));
                }
                parsedData.push(cardsArrangement.map(function (c) { return "Card " + (c === null || c === void 0 ? void 0 : c.cardName) + ":" + (c === null || c === void 0 ? void 0 : c.cardId); }));
                delete originData[key];
                return "continue";
            }
            if (lowerKey.includes("cardid") || lowerKey.includes("monsterid")) {
                card = this_1.match.cards.find(function (c) { return c.cardId == data[key]; });
                parsedData.push("Card " + (card === null || card === void 0 ? void 0 : card.cardName) + ":" + (card === null || card === void 0 ? void 0 : card.cardId));
                delete originData[key];
                return "continue";
            }
            else if (key == 'cardId') {
                card = this_1.match.cards.find(function (c) { return c.cardId == data.cardId; });
                parsedData.push("Card " + (card === null || card === void 0 ? void 0 : card.cardName) + ":" + (card === null || card === void 0 ? void 0 : card.cardId));
                delete originData.cardId;
                return "continue";
            }
            if (lowerKey.includes("playerid")) {
                player = this_1.match.players.find(function (p) { return (p === null || p === void 0 ? void 0 : p.uuid) == data[key]; });
                parsedData.push("Player " + (player === null || player === void 0 ? void 0 : player.uuid));
                delete originData[key];
                return "continue";
            }
            else if (key == "playerId") {
                player = this_1.match.players.find(function (p) { return (p === null || p === void 0 ? void 0 : p.uuid) == data.playerId; });
                parsedData.push("Player " + (player === null || player === void 0 ? void 0 : player.uuid));
                delete originData.playerId;
                return "continue";
            }
        };
        var this_1 = this;
        // tslint:disable-next-line: forin
        for (var key in data) {
            _loop_1(key);
        }
        return { data: data, parsedData: parsedData };
    };
    return DataParser;
}());
exports["default"] = DataParser;
