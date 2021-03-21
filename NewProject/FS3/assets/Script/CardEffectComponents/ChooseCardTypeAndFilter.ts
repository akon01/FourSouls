import { CCBoolean, Enum, Node, _decorator } from 'cc';
import { CHOOSE_CARD_TYPE } from "../Constants";
import { FilterConcrete } from "./ChooseCardFilters/FilterConcrete";
const { ccclass, property } = _decorator;


@ccclass('ChooseCardTypeAndFilter')
export class ChooseCardTypeAndFilter {


    @property({ type: Enum(CHOOSE_CARD_TYPE) })
    chooseType: CHOOSE_CARD_TYPE = 0

    @property(CCBoolean)
    applyFilter: boolean = false;

    //@ts-ignore
    @property({
        visible: function (this: ChooseCardTypeAndFilter) {
            if (this.applyFilter) { return true }
        }
    })
    componentName: string = '';
    //@ts-ignore
    @property({
        visible: function (this: ChooseCardTypeAndFilter) {
            if (this.applyFilter) { return true }
        }
    })
    isMultiFilter: boolean = false;

    //@ts-ignore
    @property({
        type: FilterConcrete, visible: function (this: ChooseCardTypeAndFilter) {
            if (this.applyFilter && !this.isMultiFilter) { return true; }
        }
    })
    filterStatement: FilterConcrete | null = null;

    //@ts-ignore
    @property({
        type: [FilterConcrete], visible: function (this: ChooseCardTypeAndFilter) {
            if (this.applyFilter && this.isMultiFilter) { return true; }
        }
    })
    filterStatements: FilterConcrete[] = [];



    getFilterString() {
        let statements = '';
        if (this.isMultiFilter) {
            for (let i = 0; i < this.filterStatements.length; i++) {
                const filter = this.filterStatements[i];
                statements += filter.getStatement();
                if (i != this.filterStatements.length - 1) {
                    statements += ` && `
                }
            }
        } else {
            statements += this.filterStatement!.getStatement();
        }
        return `let comp = card.getComponent('${this.componentName}');
        if(!comp) {return false};
        if(${statements}){
            return true;
        } else return false;
        `

    }




    applyFilterToCards(cards: Node[]) {
        let fn1 = new Function("card", this.getFilterString())
        return cards.filter(fn1 as (x: any) => boolean)
        //cardsToChooseFrom = cardsToChooseFrom.filter()

    }




}
