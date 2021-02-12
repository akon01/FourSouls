import PreConditionInterface from "../PreConditions/PreConditionInterface";


const { ccclass, property } = cc._decorator;

export default interface CostInterface {

    CostId: number

    preConditionIdFinal: number

    testPreCondition(): boolean

    takeCost();
    getThisEffect()


}
