import CostInterface from "./CostInterface";
import PreCondition from "../PreConditions/PreCondition";
import IdAndName from "../IdAndNameComponent";
import CardEffect from "../../Entites/CardEffect";


const { ccclass, property } = cc._decorator;

@ccclass("Cost")
export default class Cost extends cc.Component implements CostInterface {

    resetInEditor() {
        debugger
        this.setCostId();
    }

    @property
    costId: number = -1

    @property(PreCondition)
    preCondition: PreCondition = null

    @property({ type: IdAndName, multiline: true })
    preConditionId: IdAndName = null

    getPreCondition() {
        return this.node.getComponent(CardEffect).getPreCondtion(this.preConditionId.id)
    }

    setCostId() {
        if (this.node && this.costId == -1) {
            const comps = this.node.getComponents(Cost);
            this.costId = comps.findIndex(ed => ed == this);
        }
    }

    testPreCondition(): boolean {
        if (!this.preConditionId) {
            cc.error('No PreCondition On Cost')
            return true
        }
        return this.getPreCondition().testCondition()
    }


    takeCost() {
        throw new Error("Method not implemented.");
    }



}
