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
    CostId: number = -1

    getThisEffect() {
        return this.node.getComponent(CardEffect).getAllEffects().find(effect => effect.costId !== null && effect.costId.id == this.CostId);
    }

    @property(PreCondition)
    preCondition: PreCondition = null

    @property({ type: IdAndName, multiline: true })
    preConditionId: IdAndName = null

    @property({ type: cc.Integer, multiline: true })
    preConditionIdFinal: number = -1


    getPreCondition() {
        return this.node.getComponent(CardEffect).getPreCondtion(this.preConditionId.id)
    }

    setCostId() {
        if (this.node && this.CostId == -1) {
            const comps = this.node.getComponents(Cost);
            this.CostId = comps.findIndex(ed => ed == this);
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
