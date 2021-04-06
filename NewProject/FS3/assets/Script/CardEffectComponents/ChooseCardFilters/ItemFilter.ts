import { _decorator, Enum } from 'cc';
const { ccclass, property } = _decorator;

import { IFilter } from "./FilterInterface";
import { Item } from "../../Entites/CardTypes/Item";
import { CardEffect } from '../../Entites/CardEffect';
import { ITEM_TYPE } from '../../Constants';
enum ITEM_FILTERS {
    IS_NOT_CHARGED,
    IS_CHARGED,
    IS_NOT_ETERNAL,
    IS_NOT_NAMED,
    IS_ACTIVATED_ITEM,
    IS__NOT_ACTIVATED_ITEM,
    HAS_ACTIVATED_EFFECT,
    IS_ITEM_TYPE
}

@ccclass('ItemFilter')
export class ItemFilter implements IFilter {
    @property({ type: Enum(ITEM_FILTERS) })
    filter: ITEM_FILTERS = ITEM_FILTERS.IS_NOT_CHARGED;
    @property({
        visible: function (this: ItemFilter) {
            return this.filter == ITEM_FILTERS.IS_NOT_NAMED
        }
    })
    stringInput = ``;

    @property({
        type: [Enum(ITEM_TYPE)], visible: function (this: ItemFilter) {
            return this.filter == ITEM_FILTERS.IS_ITEM_TYPE
        }
    })
    itemTypes: ITEM_TYPE[] = [];
    getStatement() {
        const comp = new Item()
        this.itemTypes.join(",").includes(comp.type.toString())
        if (comp.node.getComponent(CardEffect)!.activeEffects.length > 0) {

        }
        switch (this.filter) {
            case ITEM_FILTERS.IS_NOT_CHARGED:
                return 'comp.needsRecharge == true'
            case ITEM_FILTERS.IS_CHARGED:
                return 'comp.needsRecharge == false'
            case ITEM_FILTERS.IS_NOT_ETERNAL:
                return 'comp.eternal == false'
            case ITEM_FILTERS.IS_NOT_NAMED:
                return `comp.node.getComponent('Card').cardName != "${this.stringInput}"`
            case ITEM_FILTERS.IS_ACTIVATED_ITEM:
                return `(comp.type == 1 || comp.type == 5 || comp.type == 2 || comp.type == 7)`
            case ITEM_FILTERS.IS__NOT_ACTIVATED_ITEM:
                return `!(comp.type == 1 || comp.type == 5 || comp.type == 2 || comp.type == 7)`
            case ITEM_FILTERS.HAS_ACTIVATED_EFFECT:
                return `(comp.node.getComponent(CardEffect)!.activeEffects.length > 0 )`
            case ITEM_FILTERS.IS_ITEM_TYPE:
                const arrayStr = "[" + this.itemTypes.join(",") + "]"
                return `${arrayStr}.includes(comp.type.toString())`
            default:
                throw new Error("No Filter Found!");
        }
    }
}
