import IFilter from "./FilterInterface";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

enum CARD_FILTERS {
    IS_NOT_GOING_TO_BE_PLAYED,
}

@ccclass('CardFilter')
export default class CardFilter implements IFilter {

    @property({ type: cc.Enum(CARD_FILTERS) })
    filter: CARD_FILTERS = CARD_FILTERS.IS_NOT_GOING_TO_BE_PLAYED;


    getStatement() {
         const comp = new Card()
        // if(comp.isGoingToBePlayed == false)
        switch (this.filter) {
            case CARD_FILTERS.IS_NOT_GOING_TO_BE_PLAYED:
                return 'comp.isGoingToBePlayed == false'
            default:
                break;
        }
    }

}

