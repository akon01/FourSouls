"use strict";
exports.__esModule = true;
var DataParser = /** @class */ (function () {
    function DataParser(match) {
        this.match = match;
    }
    DataParser.prototype.parseData = function (data) {
        var _a, _b, _c, _d, _e, _f;
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
                parsedData.push(cardsArrangement.map(function (c) { var _a, _b; return "Card " + ((_a = c) === null || _a === void 0 ? void 0 : _a.cardName) + ":" + ((_b = c) === null || _b === void 0 ? void 0 : _b.cardId); }));
                delete originData[key];
                return "continue";
            }
            if (lowerKey.includes("cardid") || lowerKey.includes("monsterid")) {
                card = this_1.match.cards.find(function (c) { return c.cardId == data[key]; });
                parsedData.push("Card " + ((_a = card) === null || _a === void 0 ? void 0 : _a.cardName) + ":" + ((_b = card) === null || _b === void 0 ? void 0 : _b.cardId));
                delete originData[key];
                return "continue";
            }
            else if (key == 'cardId') {
                card = this_1.match.cards.find(function (c) { return c.cardId == data.cardId; });
                parsedData.push("Card " + ((_c = card) === null || _c === void 0 ? void 0 : _c.cardName) + ":" + ((_d = card) === null || _d === void 0 ? void 0 : _d.cardId));
                delete originData.cardId;
                return "continue";
            }
            if (lowerKey.includes("playerid")) {
                player = this_1.match.players.find(function (p) { var _a; return ((_a = p) === null || _a === void 0 ? void 0 : _a.uuid) == data[key]; });
                parsedData.push("Player " + ((_e = player) === null || _e === void 0 ? void 0 : _e.uuid));
                delete originData[key];
                return "continue";
            }
            else if (key == "playerId") {
                player = this_1.match.players.find(function (p) { var _a; return ((_a = p) === null || _a === void 0 ? void 0 : _a.uuid) == data.playerId; });
                parsedData.push("Player " + ((_f = player) === null || _f === void 0 ? void 0 : _f.uuid));
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
