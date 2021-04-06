import { _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { DiplopiaEffect } from './DiplopiaEffect';
const { ccclass, property } = _decorator;


@ccclass('DiplopiaEffect2')
export class DiplopiaEffect2 extends Effect {
  effectName = "DiplopiaEffect2";


  @property(DiplopiaEffect)
  diplopiaEffect: DiplopiaEffect | null = null

  /**
   *
   * @param data {target:PlayerId}
   */
  // eslint-disable-next-line 
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {

    const copiedCard = this.diplopiaEffect!.copiedCard!
    this.diplopiaEffect!.copiedCard != null
    copiedCard.node.destroy()
    this.node.active = true
    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
