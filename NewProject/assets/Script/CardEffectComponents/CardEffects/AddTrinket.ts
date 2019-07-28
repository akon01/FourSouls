import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardEffect from "../../Entites/CardEffect";
import { ActiveEffectData } from "../../Managers/NewScript";
import { TARGETTYPE } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddTrinket extends Effect {
  effectName = "AddTrinket";

  @property({ type: cc.Node, override: true })
  itemEffectToAdd: cc.Node = null;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(serverEffectStack: ServerEffect[], data?: ActiveEffectData) {
    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard);
    await player.addItem(this.node.parent, true, true);
    let thisCardEffect = this.node.parent.getComponent(CardEffect)
    thisCardEffect.passiveEffects.push(this.itemEffectToAdd)
    thisCardEffect.activeEffects.pop();
    this.node.removeComponent(this)

    return serverEffectStack
  }
}
