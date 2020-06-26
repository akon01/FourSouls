import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import Card from "../../Entites/GameEntities/Card";
import CardManager from "../../Managers/CardManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GainBonusSoul extends Effect {
  effectName = "GainBonusSoul";

  @property(cc.Node)
  soulCardToGain: cc.Node = null;

  @property
  addSoulToCard: boolean = false;

  @property({
    visible: function (this: GainBonusSoul) {
      if (this.addSoulToCard) { return true }
    }
  })
  numOfSoulsToAdd: number = 1


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
    if (targetPlayerCard == null) {
      throw new Error(`no target player`)
    } else {
      if (targetPlayerCard instanceof cc.Node) {
        if (this.addSoulToCard) {
          Card.getCardNodeByChild(this.node).getComponent(Card).souls += this.numOfSoulsToAdd
        }
        // this.soulCardToGain.parent = cc.find('Canvas')
        // this.soulCardToGain.x = 0;
        // this.soulCardToGain.y = 0
        // cc.log(`after put soul card on table`)
        // cc.log(this.soulCardToGain)
        const player: Player = PlayerManager.getPlayerByCard(targetPlayerCard)
        await player.getSoulCard(this.soulCardToGain, true)
      }


      if (data instanceof PassiveEffectData) { return data }
      return stack
    }
  }
}