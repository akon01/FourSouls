import { _decorator, Enum } from 'cc';
const { ccclass, property } = _decorator;

import { IFilter } from "./FilterInterface";
import { Monster } from "../../Entites/CardTypes/Monster";
enum MONSTER_FILTERS {
    IS_NOT_DEAD,
    IS_NOT_BEING_ATTACKED,
    IS_NOT_NON_MONSTER,
    IS_NON_MONSTER
}

@ccclass('MonsterFilter')
export class MonsterFilter implements IFilter {
    @property({ type: Enum(MONSTER_FILTERS) })
    filter: MONSTER_FILTERS = MONSTER_FILTERS.IS_NOT_DEAD;
    getStatement() {
        //     const comp = new Monster()
        //   comp.isNonMonster
        switch (this.filter) {
            case MONSTER_FILTERS.IS_NOT_DEAD:
                return 'comp.HP > 0 && comp._isDead == false'
            case MONSTER_FILTERS.IS_NOT_BEING_ATTACKED:
                return 'comp.isAttacked == false'
            case MONSTER_FILTERS.IS_NOT_NON_MONSTER:
                return `comp.isNonMonster == false`
            case MONSTER_FILTERS.IS_NON_MONSTER:
                return `comp.isNonMonster == true`
            default:
                throw new Error("No Filter Found!");

                break;
        }
    }
}