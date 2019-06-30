import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import CardEffect from "../../Entites/CardEffect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddTrinket extends Effect {
  effectName = "AddTrinket";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  @property({ type: cc.Node, override: true })
  itemEffectToAdd: cc.Node = null;

  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(serverEffectStack: ServerEffect[], data?: { target: number }) {
    let targetPlayer = PlayerManager.getPlayerById(data.target);
    let player: Player = targetPlayer.getComponent(Player);
    player.addItem(this.node.parent, false, true);
    let thisCardEffect = this.node.parent.getComponent(CardEffect)
    thisCardEffect.passiveEffects.push(this.itemEffectToAdd)
    thisCardEffect.activeEffects.pop();
    this.node.removeComponent(this)

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}
