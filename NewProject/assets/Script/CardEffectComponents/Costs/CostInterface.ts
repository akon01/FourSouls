import PreConditionInterface from "../PreConditions/PreConditionInterface";


const { ccclass, property } = cc._decorator;

export default interface CostInterface {

    preCondition: PreConditionInterface

    testPreCondition(): boolean

    takeCost();

}
