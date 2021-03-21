import { _decorator, Enum } from 'cc';
const { ccclass, property } = _decorator;

import { IFilter } from "./FilterInterface";
import { Monster } from "../../Entites/CardTypes/Monster";
enum MONSTER_FILTERS {
    IS_NOT_DEAD,
    IS_NOT_BEING_ATTACKED
}

@ccclass('MonsterFilter')
export class MonsterFilter implements IFilter {
    @property({ type: Enum(MONSTER_FILTERS) })
    filter: MONSTER_FILTERS = MONSTER_FILTERS.IS_NOT_DEAD;
    getStatement() {
        // const comp = new Monster()
        // if()
        switch (this.filter) {
            case MONSTER_FILTERS.IS_NOT_DEAD:
                return 'comp.HP > 0 && comp._isDead == false'
            case MONSTER_FILTERS.IS_NOT_BEING_ATTACKED:
                return 'comp.isAttacked == false'
            default:
                throw new Error("No Filter Found!");

                break;
        }
    }
}