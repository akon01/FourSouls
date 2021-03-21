import { Enum, _decorator } from 'cc';
import { CardFilter } from "./CardFilter";
import { FilterStatementMaker } from "./FilterStatementMaker";
import { ItemFilter } from "./ItemFilter";
import { MonsterFilter } from "./MonsterFIlter";
import { PlayerFilter } from "./PlayerFIlter";
const { ccclass, property } = _decorator;

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
export class FilterConcrete {
    @property({ type: Enum(FILTER_TYPES) })
    filterType: FILTER_TYPES = FILTER_TYPES.PREMADE;

    //@ts-ignore
    @property({
        type: FilterStatementMaker, visible: function (this: FilterConcrete) {
            if (this.filterType == FILTER_TYPES.MANUAL) {
                return true
            }
        }
    })
    filterMaker: FilterStatementMaker | null = null
    //@ts-ignore
    @property({
        type: Enum(COMPONENT_TYPE), visible: function (this: FilterConcrete) {
            if (this.filterType != FILTER_TYPES.MANUAL) { return true }
        }
    })
    componentType: COMPONENT_TYPE = COMPONENT_TYPE.CARD;
    //@ts-ignore
    @property({
        type: PlayerFilter, visible: function (this: FilterConcrete) {
            if (this.filterType != FILTER_TYPES.MANUAL && this.componentType == COMPONENT_TYPE.PLAYER) {
                return true
            }
        }
    })
    playerFilter: PlayerFilter | null = null;

    //@ts-ignore
    @property({
        type: MonsterFilter, visible: function (this: FilterConcrete) {
            if (this.filterType != FILTER_TYPES.MANUAL && this.componentType == COMPONENT_TYPE.MONSTER) {
                return true
            }
        }
    })
    monsterFilter: MonsterFilter | null = null

    //@ts-ignore
    @property({
        type: CardFilter, visible: function (this: FilterConcrete) {
            if (this.filterType != FILTER_TYPES.MANUAL && this.componentType == COMPONENT_TYPE.CARD) {
                return true
            }
        }
    })
    cardFilter: CardFilter | null = null
    //@ts-ignore
    @property({
        type: ItemFilter, visible: function (this: FilterConcrete) {
            if (this.filterType != FILTER_TYPES.MANUAL && this.componentType == COMPONENT_TYPE.ITEM) {
                return true
            }
        }
    })
    itemFilter: ItemFilter | null = null


    getStatement() {
        switch (this.filterType) {
            case FILTER_TYPES.MANUAL:
                return this.filterMaker!.getStatement()
            case FILTER_TYPES.PREMADE:
                switch (this.componentType) {
                    case COMPONENT_TYPE.CARD:
                        return this.cardFilter!.getStatement()
                    case COMPONENT_TYPE.ITEM:
                        return this.itemFilter!.getStatement()
                    case COMPONENT_TYPE.MONSTER:
                        return this.monsterFilter!.getStatement()
                    case COMPONENT_TYPE.PLAYER:
                        return this.playerFilter!.getStatement()
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

}
