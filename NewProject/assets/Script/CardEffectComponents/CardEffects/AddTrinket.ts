import { TARGETTYPE } from "../../Constants";
import CardEffect from "../../Entites/CardEffect";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import DataCollector from "../DataCollector/DataCollector";


const { ccclass, property } = cc._decorator;

@ccclass
export default class AddTrinket extends Effect {
  effectName = "AddTrinket";

  @property({
    type: cc.Node, override: true, visible: function (this: AddTrinket) {
      if (!this.addMuiliEffect) return true;
    }
  })
  itemEffectToAdd: cc.Node = null;

  @property({
    type: [cc.Node], visible: function (this: AddTrinket) {
      if (this.addMuiliEffect) return true;
    }
  })
  itemEffectsToAdd: cc.Node[] = [];

  @property
  addMuiliEffect: boolean = false;

  @property({
    type: DataCollector, visible: function (this: AddTrinket) {
      if (this.addMuiliEffect) return true
    }
  })
  multiEffectCollector: DataCollector = null

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      cc.log(`target player is null`)
    } else {
      if (targetPlayerCard instanceof cc.Node) {
        let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard);
        await player.addItem(this.node.parent, true, true);
        let thisCardEffect = this.node.parent.getComponent(CardEffect)
        thisCardEffect.activeEffects.pop();
        if (this.addMuiliEffect) {
          for (let i = 0; i < this.itemEffectsToAdd.length; i++) {
            const effect = this.itemEffectsToAdd[i];
            thisCardEffect.passiveEffects.push(effect)
          }
          thisCardEffect.multiEffectCollector = this.multiEffectCollector;
          thisCardEffect.hasMultipleEffects = true;
        } else {
          thisCardEffect.passiveEffects.push(this.itemEffectToAdd)
        }
        this.node.removeComponent(this)
      }
    }

    if (data instanceof PassiveEffectData) return data
    return stack
  }
}
