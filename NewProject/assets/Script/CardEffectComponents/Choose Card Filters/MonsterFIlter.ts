import IFilter from "./FilterInterface";
import Monster from "../../Entites/CardTypes/Monster";

const { ccclass, property } = cc._decorator;

enum MONSTER_FILTERS {
    IS_NOT_DEAD,
    IS_NOT_BEING_ATTACKED
}

@ccclass('MonsterFilter')
export default class MonsterFilter implements IFilter {

    @property({ type: cc.Enum(MONSTER_FILTERS) })
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
                break;
        }
    }

}
