
import { _decorator, Component, Node } from 'cc';
import { IEggCounterable } from '../../IEggCounterable';
const { ccclass, property } = _decorator;

@ccclass('CheckEggCounterConditionProp')
export class CheckEggCounterConditionProp {
    @property
    checkIfMonsterHasEggCoutners = false

    @property({
        visible: function (this: CheckEggCounterConditionProp) {
            return this.checkIfMonsterHasEggCoutners
        }
    })
    isCheckEqualOnly = false

    @property({
        visible: function (this: CheckEggCounterConditionProp) {
            return this.checkIfMonsterHasEggCoutners
        }
    })
    countersToCheck = 0


    checkEntity(entity: IEggCounterable, currentAnswer: boolean) {
        if (!currentAnswer) {
            return currentAnswer
        }
        const entityCounters = entity.getEggCounters()
        if (this.isCheckEqualOnly) {
            return entityCounters == this.countersToCheck
        } else {
            return entityCounters >= this.countersToCheck
        }
    }
}
