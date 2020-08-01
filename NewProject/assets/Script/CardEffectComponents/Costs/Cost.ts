import CostInterface from "./CostInterface";
import PreCondition from "../PreConditions/PreCondition";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Cost extends cc.Component implements CostInterface {

    @property(PreCondition)
    preCondition: PreCondition

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
