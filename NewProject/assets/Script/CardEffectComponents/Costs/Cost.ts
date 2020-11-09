import CostInterface from "./CostInterface";
import PreCondition from "../PreConditions/PreCondition";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Cost extends cc.Component implements CostInterface {

    resetInEditor() {
        debugger
        this.setCostId();
    }

    @property
    costId: number = -1

    @property(PreCondition)
    preCondition: PreCondition

    @property
    preConditionId: number

    setCostId() {
        if (this.node && this.costId == -1) {
            const comps = this.node.getComponents(Cost);
            this.costId = comps.findIndex(ed => ed == this);
        }
    }

    testPreCondition(): boolean {
        if (!this.preCondition) {
            cc.error('No PreCondition On Cost')
            return true
        }
        return this.preCondition.testCondition()
    }


    takeCost() {
        throw new Error("Method not implemented.");
    }



}
