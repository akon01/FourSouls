import { TARGETTYPE } from "../../Constants";
import CardEffect from "../../Entites/CardEffect";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import DataCollector from "../DataCollector/DataCollector";
import ServerClient from "../../../ServerClient/ServerClient";
import Signal from "../../../Misc/Signal";
import Card from "../../Entites/GameEntities/Card";
import Stack from "../../Entites/Stack";


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
        this.removeAddTrinketEffect()
        ServerClient.$.send(Signal.CARD_ADD_TRINKET, { cardId: this.node.parent.getComponent(Card)._cardId, playerId: player.playerId, addMuiliEffect: this.addMuiliEffect })
        await player.addItem(this.node.parent, true, true);
      }
    }


    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }

  removeAddTrinketEffect() {
    let thisCardEffect = this.node.parent.getComponent(CardEffect)
    //Remove this Effect!
    thisCardEffect.activeEffects.pop();
    if (this.addMuiliEffect) {
      for (let i = 0; i < this.itemEffectsToAdd.length; i++) {
        const effect = this.itemEffectsToAdd[i];
        thisCardEffect.passiveEffects.push(effect)
      }
      if (this.multiEffectCollector) {
        thisCardEffect.multiEffectCollector = this.multiEffectCollector;
        thisCardEffect.hasMultipleEffects = true;
      }
    } else {
      thisCardEffect.passiveEffects.push(this.itemEffectToAdd)
    }
    this.node.removeComponent(this)

  }

}
