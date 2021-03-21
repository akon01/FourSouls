import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { Card } from "../../Entites/GameEntities/Card";
import { CardManager } from "../../Managers/CardManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('GainBonusSoul')
export class GainBonusSoul extends Effect {
  effectName = "GainBonusSoul";
  @property(Node)
  soulCardToGain: Node | null = null;
  @property
  addSoulToCard: boolean = false;
  @property({
    visible: function (this: GainBonusSoul) {
      return this.addSoulToCard
    }
  })
  numOfSoulsToAdd: number = 1
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
    if (targetPlayerCard == null) {
      throw new Error(`no target player`)
    } else {
      if (targetPlayerCard instanceof Node) {
        if (this.addSoulToCard) {
          WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node).getComponent(Card)!.souls += this.numOfSoulsToAdd
        }
        // this.soulCardToGain.parent = find('Canvas')
        // this.soulCardToGain.x = 0;
        // this.soulCardToGain.y = 0
        // cc.log(`after put soul card on table`)
        // cc.log(this.soulCardToGain)
        const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard)!
        if (!this.soulCardToGain) { debugger; throw new Error("No Soul Card To Gain"); }

        await player.receiveSoulCard(this.soulCardToGain, true)
      }


      if (data instanceof PassiveEffectData) { return data }
      return stack
    }
  }
}