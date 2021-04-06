import { CCInteger, Enum, _decorator } from 'cc';
import { PLAYER_FILTERS } from '../../Constants';
import { Character } from '../../Entites/CardTypes/Character';
import { IFilter } from "./FilterInterface";
const { ccclass, property } = _decorator;



@ccclass('PlayerFilter')
export class PlayerFilter implements IFilter {
    @property({ type: Enum(PLAYER_FILTERS) })
    filter: PLAYER_FILTERS = PLAYER_FILTERS.HAS_LOOT;
    @property({
        type: CCInteger, visible: function (this: PlayerFilter) {
            return this.filter == PLAYER_FILTERS.HAS_LOOT || this.filter == PLAYER_FILTERS.HAS_MONEY || this.filter == PLAYER_FILTERS.HAVE_EGG_COUNTERS
        }
    })
    quantity = 0
    getStatement() {
        const comp: Character = new Character()
        // if (comp.player.me == false) {
        //     comp.player?.getEggCounters() >= ${ this.quantity }
        // }
        switch (this.filter) {
            case PLAYER_FILTERS.IS_NOT_DEAD:
                return `comp.player._Hp > 0 && comp.player._isDead == false`
            case PLAYER_FILTERS.HAS_LOOT:
                return `comp.player.getHandCards().length > ${this.quantity} && comp.player.getHandCards().map(card => card.getComponent("Card").isGoingToBePlayed).includes(false)`
            case PLAYER_FILTERS.HAS_MONEY:
                return `comp.player.coins > ${this.quantity}`
            case PLAYER_FILTERS.IS_NOT_ME:
                return `comp.player.me == false`
            case PLAYER_FILTERS.HAS_NON_ETERNAL_ITEMS:
                return `comp.player.getActiveItems().concat(comp.player.getPaidItems(),comp.player.getPassiveItems()).filter(card=>!card.getComponent("Item").eternal)`
            case PLAYER_FILTERS.HAVE_EGG_COUNTERS:
                return `comp.player.getEggCounters() >= ${this.quantity}`
            case PLAYER_FILTERS.DONT_HAVE_EGG_COUNTER:
                return `comp.player.getEggCounters() == 0`
            default:
                throw new Error("No Filter Found!");

                break;
        }
    }
}
