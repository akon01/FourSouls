import { _decorator } from 'cc';
import { Effect } from '../CardEffectComponents/CardEffects/Effect';
import { TARGETTYPE } from '../Constants';
import { Card } from '../Entites/GameEntities/Card';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';

const { ccclass, property } = _decorator;


@ccclass('DeadCatEffect')
export class DeadCatEffect extends Effect {
  effectName = "DeadCatEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const damageToPrevent = data.getTarget(TARGETTYPE.NUMBER)! as number
    const diff = data.methodArgs[0] - damageToPrevent < 0 ? damageToPrevent - (data.methodArgs[0] - damageToPrevent) : data.methodArgs[0] - damageToPrevent
    data.methodArgs[0] -= damageToPrevent
    if (data.methodArgs[0] < 0) {
      data.methodArgs[0] = 0
    }
    await this.getEffectCard().getComponent(Card)!.putCounter(-diff, true)
    return data
  }
}