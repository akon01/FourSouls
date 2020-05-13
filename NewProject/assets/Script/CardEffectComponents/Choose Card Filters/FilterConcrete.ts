import IFilter from "./FilterInterface";
import MonsterFilter from "./MonsterFIlter";
import PlayerFilter from "./PlayerFIlter";
import CardFilter from "./CardFilter";
import FilterStatementMaker from "./FIlterStringMaker";
import ItemFilter from "./ItemFilter";


const { ccclass, property } = cc._decorator;

enum LOGIC_GATES {
    AND, OR, NONE
}


enum FILTER_TYPES {
    MANUAL, PREMADE
}

enum COMPONENT_TYPE {
    PLAYER, MONSTER, CARD, ITEM
}


@ccclass('FilterConcrete')
export default class FilterConcrete {

    @property({ type: cc.Enum(FILTER_TYPES) })
    filterType: FILTER_TYPES = FILTER_TYPES.PREMADE;


    @property({
        type: FilterStatementMaker, visible: function (this: FilterConcrete) {
            if (this.filterType == FILTER_TYPES.MANUAL) {
                return true
            }
        }
    })
    filterMaker: FilterStatementMaker = null

    @property({
        type: cc.Enum(COMPONENT_TYPE), visible: function (this: FilterConcrete) {
            if (this.filterType != FILTER_TYPES.MANUAL) { return true }
        }
    })
    componentType: COMPONENT_TYPE = COMPONENT_TYPE.CARD;

    @property({
        type: PlayerFilter, visible: function (this: FilterConcrete) {
            if (this.filterType != FILTER_TYPES.MANUAL && this.componentType == COMPONENT_TYPE.PLAYER) {
                return true
            }
        }
    })
    playerFilter: PlayerFilter = null;


    @property({
        type: MonsterFilter, visible: function (this: FilterConcrete) {
            if (this.filterType != FILTER_TYPES.MANUAL && this.componentType == COMPONENT_TYPE.MONSTER) {
                return true
            }
        }
    })
    monsterFilter: MonsterFilter = null


    @property({
        type: CardFilter, visible: function (this: FilterConcrete) {
            if (this.filterType != FILTER_TYPES.MANUAL && this.componentType == COMPONENT_TYPE.CARD) {
                return true
            }
        }
    })
    cardFilter: CardFilter = null

    @property({
        type: ItemFilter, visible: function (this: FilterConcrete) {
            if (this.filterType != FILTER_TYPES.MANUAL && this.componentType == COMPONENT_TYPE.ITEM) {
                return true
            }
        }
    })
    itemFilter: ItemFilter = null


    getStatement() {
        switch (this.filterType) {
            case FILTER_TYPES.MANUAL:
                return this.filterMaker.getStatement()
            case FILTER_TYPES.PREMADE:
                switch (this.componentType) {
                    case COMPONENT_TYPE.CARD:
                        return this.cardFilter.getStatement()
                    case COMPONENT_TYPE.ITEM:
                        return this.itemFilter.getStatement()
                    case COMPONENT_TYPE.MONSTER:
                        return this.monsterFilter.getStatement()
                    case COMPONENT_TYPE.PLAYER:
                        return this.playerFilter.getStatement()
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

}
