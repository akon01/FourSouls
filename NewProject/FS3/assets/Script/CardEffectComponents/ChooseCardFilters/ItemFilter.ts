import { _decorator, Enum } from 'cc';
const { ccclass, property } = _decorator;

import { IFilter } from "./FilterInterface";
import { Card } from "../../Entites/GameEntities/Card";
import { Item } from "../../Entites/CardTypes/Item";
import { ITEM_TYPE } from "../../Constants";
import { CardEffect } from '../../Entites/CardEffect';
enum ITEM_FILTERS {
    IS_NOT_CHARGED,
    IS_CHARGED,
    IS_NOT_ETERNAL,
    IS_NOT_NAMED,
    IS_ACTIVATED_ITEM,
    IS__NOT_ACTIVATED_ITEM,
    HAS_ACTIVATED_EFFECT
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
    stringInput: string = ``;
    getStatement() {
        const comp = new Item()
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
            default:
                throw new Error("No Filter Found!");
        }
    }
}
