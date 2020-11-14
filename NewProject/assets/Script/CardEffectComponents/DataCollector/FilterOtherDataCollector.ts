
import { COLLECTORTYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, EffectTarget, PassiveEffectData } from "../../Managers/DataInterpreter";
import FilterConcrete from "../Choose Card Filters/FilterConcrete";
import IdAndName from "../IdAndNameComponent";
import { Card } from "../../../../Server/src/entities/Card";
import CardEffect from "../../Entites/CardEffect";
import { createNewDataCollector } from "../../reset";



const { ccclass, property } = cc._decorator;

@ccclass
export default class FilterOtherDataCollector extends DataCollector {


    setWithOld(data: FilterOtherDataCollector) {
        const newCollectorId = createNewDataCollector(this.node, data.dataCollector)
        this.dataCollectorId = IdAndName.getNew(newCollectorId, data.dataCollector.collectorName)
        data.dataCollector = null
        this.dataCollector = null
    }


    type = COLLECTORTYPE.AUTO;
    collectorName = 'FilterOtherDataCollector';

    @property({ type: DataCollector })
    dataCollector: DataCollector = null

    @property({ type: IdAndName })
    dataCollectorId: IdAndName = null

    @property()
    componentName: string = '';

    @property()
    isMultiFilter: boolean = false;

    @property({
        type: FilterConcrete, visible: function (this: FilterOtherDataCollector) {
            if (!this.isMultiFilter) { return true; }
        }
    })
    filterStatement: FilterConcrete = null;

    @property({
        type: [FilterConcrete], visible: function (this: FilterOtherDataCollector) {
            if (this.isMultiFilter) { return true; }
        }
    })
    filterStatements: FilterConcrete[] = [];



    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data) {
        const collectedData = this.dataCollector.collectData(data) as EffectTarget[]
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
