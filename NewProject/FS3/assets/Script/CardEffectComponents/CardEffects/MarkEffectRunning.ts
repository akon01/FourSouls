
import { _decorator, Component, Node } from 'cc';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from '../../StackEffects/StackEffectInterface';
import { Effect } from './Effect';
const { ccclass, property } = _decorator;

@ccclass('MarkEffectRunning')
export class MarkEffectRunning extends Effect {

    @property
    isToggle = false

    @property({
        visible: function (this: MarkEffectRunning) {
            return !this.isToggle && !this.isMarkOff
        }
    })
    isMarkOn = false

    @property({
        visible: function (this: MarkEffectRunning) {
            return !this.isToggle && !this.isMarkOn
        }
    })
    isMarkOff = false

    @property(Effect)
    effectToMark: Effect | null = null

    async doEffect(Stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

        if (!this.effectToMark) {
            throw new Error("No Effect To Mark As Running!!");
        }

        if (this.isToggle) {
            this.effectToMark.effectRunning = !this.effectToMark.effectRunning
        } else if (this.isMarkOff) {
            this.effectToMark.effectRunning = false
        } else if (this.isMarkOn) {
            this.effectToMark.effectRunning = true
        } else {
            throw new Error("No Operation Chosen For Mark Effect As Running");

        }

        if (data instanceof PassiveEffectData) { return data }
        return WrapperProvider.stackWrapper.out._currentStack
    }

}