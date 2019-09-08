import { TARGETTYPE } from "../../Constants";
import CardEffect from "../../Entites/CardEffect";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import DataCollector from "../DataCollector/DataCollector";


const { ccclass, property } = cc._decorator;

@ccclass
export default class AddTrinket extends Effect {
  effectName = "AddTrinket";

  @property({ type: cc.Node, override: true })
  itemEffectToAdd: cc.Node = null;

  @property
  addMuiliEffect: boolean = false;

  @property({ type: DataCollector })
  multiEffectCollector: DataCollector = null

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData) {
    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      cc.log(`target player is null`)
    } else {
      if (targetPlayerCard instanceof cc.Node) {
        let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard);
        await player.addItem(this.node.parent, true, true);
        let thisCardEffect = this.node.parent.getComponent(CardEffect)
        thisCardEffect.passiveEffects.push(this.itemEffectToAdd)
        thisCardEffect.activeEffects.pop();
        if (this.addMuiliEffect) {
          thisCardEffect.multiEffectCollector = this.multiEffectCollector;
          thisCardEffect.hasMultipleEffects = true;
        }
        this.node.removeComponent(this)
      }
    }

    return stack
  }
}
