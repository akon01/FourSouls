import { CCInteger, Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { Monster } from '../../Entites/CardTypes/Monster';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('RemoveEggCounter')
export class RemoveEggCounter extends Effect {
  effectName = "RemoveEggCounter";
  @property({
    type: CCInteger, visible: function (this: RemoveEggCounter) {
      return !this.isAllCounters
    }
  })
  numOfCounters = 0;

  @property
  isAllCounters = true
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }

    const targets = data.getTargets(TARGETTYPE.CARD) as Node[]
    let numOfCountersToRemove = this.numOfCounters
    for (const target of targets) {
      const monsterComp = target.getComponent(Monster);
      if (monsterComp) {
        if (this.isAllCounters) {
          numOfCountersToRemove = monsterComp.getEggCounters()
        }
        await monsterComp.removeEggCounters(numOfCountersToRemove, true)
      } else {
        const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target)
        if (this.isAllCounters) {
          numOfCountersToRemove = player!.getEggCounters()
        }
        await player?.removeEggCounters(numOfCountersToRemove, true)
      }
    }
    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
