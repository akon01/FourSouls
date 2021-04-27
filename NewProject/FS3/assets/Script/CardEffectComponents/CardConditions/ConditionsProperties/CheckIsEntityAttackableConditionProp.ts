
import { _decorator, Component, Node } from 'cc';
import { IAttackableEntity } from '../../../Entites/IAttackableEntity';
import { IEggCounterable } from '../../IEggCounterable';
const { ccclass, property } = _decorator;

@ccclass('CheckIsEntityAttackableConditionProp')
export class CheckIsEntityAttackableConditionProp {

    @property
    doCheck = false

    @property({
        visible: function (this: CheckIsEntityAttackableConditionProp) {
            return this.doCheck && !this.checkIsEntityNotAttackable
        }
    })
    checkIsEntityAttackable = false

    @property({
        visible: function (this: CheckIsEntityAttackableConditionProp) {
            return this.doCheck && !this.checkIsEntityAttackable
        }
    })
    checkIsEntityNotAttackable = false


    CheckEntity(entity: IAttackableEntity, currentAnswer: boolean) {
        if (!currentAnswer) {
            return currentAnswer
        }
        const isEntityAttackable = entity.getCanBeAttacked()
        if (this.checkIsEntityAttackable) {
            if (!isEntityAttackable) {
                currentAnswer = false
            }
        }
        if (this.checkIsEntityNotAttackable) {
            if (isEntityAttackable) {
                currentAnswer = false
            }
        }
        return currentAnswer
    }
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    start() {
        // [3]
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
