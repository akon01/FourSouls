import { CCInteger, Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { Monster } from '../../Entites/CardTypes/Monster';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Player } from '../../Entites/GameEntities/Player';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('AddEggCounter')
export class AddEggCounter extends Effect {
  effectName = "AddEggCounter";
  @property(CCInteger)
  numOfCounters = 0;




  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }

    const targets = data.getTargets(TARGETTYPE.CARD) as Node[]
    if (targets.length == 0) {
      throw new CardEffectTargetError(`target cards are null`, true, data, stack)
    }
    for (const target of targets) {
      const monsterComp = target.getComponent(Monster);
      if (monsterComp) {
        await monsterComp.addEggCounters(this.getQuantityInRegardsToBlankCard(monsterComp.node, this.numOfCounters), true)
      } else {
        const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target)
        await player?.addEggCounters(this.getQuantityInRegardsToBlankCard(player.node, this.numOfCounters), true)
      }
    }
    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
