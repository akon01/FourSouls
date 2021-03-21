import { CCInteger, Node, _decorator } from 'cc';
import { COLLECTORTYPE } from "../../Constants";
import { CardEffect } from "../../Entites/CardEffect";
import { EffectTarget } from "../../Managers/EffectTarget";
import { FilterConcrete } from "../ChooseCardFilters/FilterConcrete";
import { DataCollector } from "./DataCollector";
const { ccclass, property } = _decorator;


@ccclass('FilterOtherDataCollector')
export class FilterOtherDataCollector extends DataCollector {

    type = COLLECTORTYPE.AUTO;
    collectorName = 'FilterOtherDataCollector';
    // @property({ type: CCInteger })
    // dataCollectorIdFinal: number = -1
    @property({ type: DataCollector })
    dataCollector: DataCollector | null = null
    // getThisDataCollector = () => this.node.getComponent(CardEffect)!.getDataCollector(this.dataCollectorIdFinal)
    getThisDataCollector = () => this.dataCollector
    @property
    componentName: string = '';
    @property
    isMultiFilter: boolean = false;
    @property({
        type: FilterConcrete, visible: function (this: FilterOtherDataCollector) {
            return !this.isMultiFilter
        }
    })
    filterStatement: FilterConcrete | null = null;
    @property({
        type: [FilterConcrete], visible: function (this: FilterOtherDataCollector) {
            return this.isMultiFilter
        }
    })
    filterStatements: FilterConcrete[] = [];
    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data: any) {
        const dataCollector = this.getThisDataCollector();
        if (!dataCollector) { debugger; throw new Error("No Data Collector Set!"); }
        const collectedData = dataCollector.collectData(data) as EffectTarget[]
        const cards = collectedData.map(et => et.effectTargetCard)
        return this.applyFilterToCards(cards).map(c => new EffectTarget(c))
    }
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