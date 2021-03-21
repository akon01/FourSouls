import { _decorator, Enum } from 'cc';
const { ccclass, property } = _decorator;

import { IFilter } from "./FilterInterface";
import { Card } from "../../Entites/GameEntities/Card";
enum CARD_FILTERS {
    IS_NOT_GOING_TO_BE_PLAYED,
    IS_NOT_GOING_TO_BE_DESTROYED
}

@ccclass('CardFilter')
export class CardFilter implements IFilter {
    @property({ type: Enum(CARD_FILTERS) })
    filter: CARD_FILTERS = CARD_FILTERS.IS_NOT_GOING_TO_BE_PLAYED;
    getStatement() {
        const comp = new Card()
        // if(comp.isGoingToBePlayed == false)
        switch (this.filter) {
            case CARD_FILTERS.IS_NOT_GOING_TO_BE_PLAYED:
                return 'comp.isGoingToBePlayed == false'
            case CARD_FILTERS.IS_NOT_GOING_TO_BE_DESTROYED:
                return 'comp.isGoingToBeDestroyed == false'
            default:
                throw new Error("No Filter Found!");

                break;
        }
    }
}
