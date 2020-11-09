import PreConditionInterface from "../PreConditions/PreConditionInterface";


const { ccclass, property } = cc._decorator;

export default interface CostInterface {

    costId: number

    preCondition: PreConditionInterface

    testPreCondition(): boolean

    takeCost();

}
