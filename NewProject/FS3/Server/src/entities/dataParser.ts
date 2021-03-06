//@ts-nocheck
import Match from "./match";
import { ServerCard } from "./ServerCard";
import ServerPlayer from "./ServerPlayer";

export default class DataParser {

    match: Match

    constructor(match: Match) {
        this.match = match;
    }

    parseData(data: any) {
        if (data == undefined || data == null) { return data }
        const originData = Object.create(data)
        const parsedData = [];
        let card: ServerCard
        let player: ServerPlayer
        const cardsArrangement: ServerCard[] = []
        const keys = Object.keys(data)
        // tslint:disable-next-line: forin
        for (const key in data) {
            const lowerKey = key.toLowerCase()
            if (key == "arrangement" || key == `cardsIds`) {
                for (const cardId of data[key]) {
                    cardsArrangement.push(this.match.getCardById(cardId))
                }
                parsedData.push(cardsArrangement.map(c => `Card ${c?.cardName}:${c?.cardId}`))
                delete originData[key]
                continue
            }

            if (lowerKey.includes(`cardid`) || lowerKey.includes(`monsterid`)) {
                card = this.match.cards.find(c => c.cardId == data[key])
                parsedData.push(`Card ${card?.cardName}:${card?.cardId}`)
                delete originData[key]
                continue
            } else if (key == 'cardId') {
                card = this.match.cards.find(c => c.cardId == data.cardId)
                parsedData.push(`Card ${card?.cardName}:${card?.cardId}`)
                delete originData.cardId
                continue
            }
            if (lowerKey.includes(`playerid`)) {
                player = this.match.players.find(p => p?.uuid == data[key])
                parsedData.push(`Player ${player?.uuid}`)
                delete originData[key]
                continue
            } else if (key == "playerId") {
                player = this.match.players.find(p => p?.uuid == data.playerId)
                parsedData.push(`Player ${player?.uuid}`)
                delete originData.playerId
                continue
            }

        }
        return { data, parsedData };
    }
}