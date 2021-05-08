import { CCInteger, Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { Monster } from '../../Entites/CardTypes/Monster';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Player } from '../../Entites/GameEntities/Player';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { EffectData } from '../../Managers/EffectData';
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




  currTargets: Node[] = []
  currData: ActiveEffectData | PassiveEffectData | null = null
  currStack: StackEffectInterface[] = []
  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(stack: StackEffectInterface[], data: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }

    this.currStack = stack
    this.currData = data
    const targets = data.getTargets(TARGETTYPE.CARD) as Node[]
    if (targets.length == 0) {
      throw new CardEffectTargetError(`target cards are null`, true, data, stack)
    }
    const index = 0;
    this.currTargets = targets
    this.currData = data
    this.currStack = stack
    return this.handleTarget(index, this.currTargets.length)
  }

  private handleTarget(index: number, length: number): Promise<StackEffectInterface[] | PassiveEffectData> {
    const target = this.currTargets[index]
    const monsterComp = target.getComponent(Monster);
    if (monsterComp) {
      return monsterComp.addEggCounters(this.getQuantityInRegardsToBlankCard(monsterComp.node, this.numOfCounters), true).then(_ => {
        return this.handleAfterTarget(index++, length, this.handleTarget, this)
      }, (res => {
        debugger
        throw new Error("");

      }))
    } else {
      const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target)!
      return player.addEggCounters(this.getQuantityInRegardsToBlankCard(player.node, this.numOfCounters), true).then(_ => {
        return this.handleAfterTarget(index++, length, this.handleTarget, this)
      }, (res => {
        debugger
        throw new Error("");

      }))
    }
  }

}
