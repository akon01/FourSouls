import { _decorator } from 'cc';
import { TARGETTYPE } from '../../../Constants';
import { Monster } from '../../../Entites/CardTypes/Monster';
import { PassiveEffectData } from "../../../Managers/PassiveEffectData";
import { StackEffectInterface } from "../../../StackEffects/StackEffectInterface";
import { Effect } from "../Effect";
const { ccclass, property } = _decorator;


@ccclass('ChangeAttackedMonster')
export class ChangeAttackedMonster extends Effect {
  effectName = "ChangeAttackedMonster";

  @property
  isPreSetSpecificMonster: boolean = false

  @property({
    visible: function (this: ChangeAttackedMonster) {
      return this.isPreSetSpecificMonster
    }
  })
  specificMonster: Monster | null = null
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    if (this.isPreSetSpecificMonster) {
      if (!this.specificMonster) throw new Error("No Specific Monster Set!");
      data.methodArgs[0] = this.specificMonster
    } else {
      data.methodArgs[0] = data.getTarget(TARGETTYPE.MONSTER)
    }

    return data
  }
}
