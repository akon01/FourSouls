import { _decorator, Enum, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

import { IFilter } from "./FilterInterface";
import { Monster } from "../../Entites/CardTypes/Monster";
enum MONSTER_FILTERS {
    IS_NOT_DEAD,
    IS_NOT_BEING_ATTACKED,
    IS_NOT_NON_MONSTER,
    IS_NON_MONSTER,
    HAVE_EGG_COUNTERS,
    DONT_HAVE_EGG_COUNTER
}

@ccclass('MonsterFilter')
export class MonsterFilter implements IFilter {
    @property({ type: Enum(MONSTER_FILTERS) })
    filter: MONSTER_FILTERS = MONSTER_FILTERS.IS_NOT_DEAD;

    @property({
        type: CCInteger, visible: function (this: MonsterFilter) {
            return this.filter == MONSTER_FILTERS.HAVE_EGG_COUNTERS
        }
    })
    quantity = 0
    getStatement() {
        // const comp = new Monster()
        // comp.getEggCounters() >= ${ this.quantity }
        switch (this.filter) {
            case MONSTER_FILTERS.IS_NOT_DEAD:
                return 'comp.HP > 0 && comp._isDead == false'
            case MONSTER_FILTERS.IS_NOT_BEING_ATTACKED:
                return 'comp.isAttacked == false'
            case MONSTER_FILTERS.IS_NOT_NON_MONSTER:
                return `comp.isNonMonster == false`
            case MONSTER_FILTERS.IS_NON_MONSTER:
                return `comp.isNonMonster == true`
            case MONSTER_FILTERS.HAVE_EGG_COUNTERS:
                return `comp.getEggCounters() >= ${this.quantity}`
            case MONSTER_FILTERS.DONT_HAVE_EGG_COUNTER:
                return `comp.getEggCounters() == 0 `
            default:
                throw new Error("No Filter Found!");

                break;
        }
    }
}