import Player from "../Entites/GameEntities/Player";
import { CHOOSE_CARD_TYPE } from "../Constants";
import FilterConcrete from "./Choose Card Filters/FilterConcrete";
import IFilter from "./Choose Card Filters/FilterInterface";


const { ccclass, property } = cc._decorator;

@ccclass('ChooseCardTypeAndFilter')
export default class ChooseCardTypeAndFilter {


    @property({ type: cc.Enum(CHOOSE_CARD_TYPE) })
    chooseType: CHOOSE_CARD_TYPE = 0

    @property(cc.Boolean)
    applyFilter: boolean = false;

    @property({
        visible: function (this: ChooseCardTypeAndFilter) {
            if (this.applyFilter) { return true }
        }
    })
    componentName: string = '';

    @property({
        visible: function (this: ChooseCardTypeAndFilter) {
            if (this.applyFilter) { return true }
        }
    })
    isMultiFilter: boolean = false;

    @property({
        type: FilterConcrete, visible: function (this: ChooseCardTypeAndFilter) {
            if (this.applyFilter && !this.isMultiFilter) { return true; }
        }
    })
    filterStatement: FilterConcrete = null;

    @property({
        type: [FilterConcrete], visible: function (this: ChooseCardTypeAndFilter) {
            if (this.applyFilter && this.isMultiFilter) { return true; }
        }
    })
    filterStatements: FilterConcrete[] = [];





    // @property({
    //     visible: function (this: FilterComponent) {
    //         if (this.applyFilter) { return true }
    //     }
    // })
    // testedValue: string = '';

    // @property({
    //     type: cc.Enum(SIGNS), visible: function (this: FilterComponent) {
    //         if (this.applyFilter) { return true }
    //     }
    // })
    // sign: SIGNS = SIGNS.EQUAL;

    // @property({
    //     visible: function (this: FilterComponent) {
    //         if (this.applyFilter) { return true }
    //     }
    // })
    // expectedValue: string = '';

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
            statements += this.filterStatement.getStatement();
        }
        return `let comp = card.getComponent('${this.componentName}');
        if(!comp) {return false};
        if(${statements}){
            return true;
        } else return false;
        `

    }




    applyFilterToCards(cards: cc.Node[]) {
        let fn1 = new Function("card", this.getFilterString())
        return cards.filter(fn1 as (x) => boolean)
        //cardsToChooseFrom = cardsToChooseFrom.filter()

    }




}
