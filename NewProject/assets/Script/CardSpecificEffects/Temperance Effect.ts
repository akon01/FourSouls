import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { TARGETTYPE } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass('TemperanceEffect')
export default class TemperanceEffect extends Effect {
  effectName = "TemperanceEffect";

  @property
  dmgToTake: number = 0;

  @property
  moneyToGet: number = 0


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data
  ) {

    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
    if (targetPlayerCard == null) {
      cc.log(`no target player`)
    } else {
      let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard as cc.Node)
      let owner = CardManager.getCardOwner(this.node.parent)
      await player.takeDamage(this.dmgToTake, true, owner)
      await player.changeMoney(this.moneyToGet, true)
    }


    return stack
  }
}
