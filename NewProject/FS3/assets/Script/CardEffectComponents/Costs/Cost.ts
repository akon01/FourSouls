import { CCInteger, Component, error, _decorator } from 'cc';
import { CardEffect } from "../../Entites/CardEffect";
import { PreCondition } from '../PreConditions/PreCondition';
import { CostInterface } from "./CostInterface";
const { ccclass, property } = _decorator;


@ccclass('Cost')
export class Cost extends Component implements CostInterface {

    @property
    CostId = -1

    getThisEffect() {
        return this.node.getComponent(CardEffect)!.getAllEffects().find(effect => effect.cost !== null && effect.cost.CostId == this.CostId)!;
    }
    // @property({ type: CCInteger, multiline: true })
    // preConditionIdFinal: number = -1

    @property({ type: PreCondition, multiline: true })
    preCondition: PreCondition | null = null


    getPreCondition() {
        return this.preCondition
        // return this.node.getComponent(CardEffect)!.getPreCondtion(this.preConditionIdFinal)
    }
    setCostId() {
        if (this.node && this.CostId == -1) {
            const comps = this.node.getComponents(Cost);
            this.CostId = comps.findIndex(ed => ed == this);
        }
    }
    testPreCondition(): boolean {
        const preCondition = this.getPreCondition()
        if (!(preCondition)) {
            console.error('No PreCondition On Cost')
            return true
        }
        return preCondition.testCondition()
    }
    takeCost() {
        throw new Error("Method not implemented.");
    }
}