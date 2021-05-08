import { Node, _decorator } from 'cc';
import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Card } from "../../Entites/GameEntities/Card";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('DiscardLoot')
export class DiscardLoot extends Effect {
  effectName = "DiscardLoot";
  currTargets: StackEffectInterface[] | Node[] | number[] | Effect[] = [];
  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const targetLoots = data.getTargets(TARGETTYPE.CARD)
    if (targetLoots.length == 0) {
      throw new CardEffectTargetError(`target loots to dicards are null`, true, data, stack)
    } else {
      let player: Player
      const index = 0;
      this.currTargets = targetLoots
      this.currData = data
      this.currStack = stack
      return this.handleTarget(index, targetLoots.length)
    }
  }

  handleTarget(index: number, length: number) {
    const lootToDiscard = this.currTargets[index];
    if ((lootToDiscard as Node).getComponent(Card)!.type != CARD_TYPE.LOOT) {
      return this.handleAfterTarget(index++, length, this.handleTarget, this)
    }
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(lootToDiscard as Node)!
    return player.discardLoot(lootToDiscard as Node, true).then(_ => {
      return this.handleAfterTarget(index++, length, this.handleTarget, this)
    })
  }
}
