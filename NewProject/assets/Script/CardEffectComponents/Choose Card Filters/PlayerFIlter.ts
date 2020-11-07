import IFilter from "./FilterInterface";

import Player from "../../Entites/GameEntities/Player";
import Card from "../../Entites/GameEntities/Card";
import Character from "../../Entites/CardTypes/Character";
import { SIGNS } from "../../Constants";
import Item from "../../Entites/CardTypes/Item";

const { ccclass, property } = cc._decorator;

enum PLAYER_FILTERS {
    HAS_LOOT,
    IS_NOT_DEAD,
    HAS_MONEY,
    IS_NOT_ME,
    HAS_NON_ETERNAL_ITEMS
}

@ccclass('PlayerFilter')
export default class PlayerFilter implements IFilter {

    @property({ type: cc.Enum(PLAYER_FILTERS) })
    filter: PLAYER_FILTERS = PLAYER_FILTERS.HAS_LOOT;

    @property({
        type: cc.Integer, visible: function (this: PlayerFilter) {
            if (this.filter == PLAYER_FILTERS.HAS_LOOT || this.filter == PLAYER_FILTERS.HAS_MONEY) { return true }
        }
    })
    quantity: number = 0


    getStatement() {
        const comp: Character = new Character()
        if (comp.player.me == false) {
            comp.player.getActiveItems().concat(comp.player.getPaidItems(), comp.player.getPassiveItems()).filter(card => !card.getComponent(Item).eternal)
        }
        switch (this.filter) {
            case PLAYER_FILTERS.IS_NOT_DEAD:
                return `comp.player._Hp > 0 && comp.player._isDead == false`
            case PLAYER_FILTERS.HAS_LOOT:
                return `comp.player.handCards.length > ${this.quantity} && comp.player.handCards.map(card => card.getComponent("Card").isGoingToBePlayed).includes(false)`
            case PLAYER_FILTERS.HAS_MONEY:
                return `comp.player.coins > ${this.quantity}`
            case PLAYER_FILTERS.IS_NOT_ME:
                return `comp.player.me == false`
            case PLAYER_FILTERS.HAS_NON_ETERNAL_ITEMS:
                return `comp.player.activeItems.concat(comp.player.paidItems,comp.player.passiveItems).filter(card=>!card.getComponent(Item).eternal)`
            default:
                break;
        }
    }

}
