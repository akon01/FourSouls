import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import { TARGETTYPE, CARD_TYPE } from "../../Constants";
import CardEffect from "../../Entites/CardEffect";
import Card from "../../Entites/GameEntities/Card";
import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import DataCollector from "../DataCollector/DataCollector";
import Effect from "./Effect";
import PileManager from "../../Managers/PileManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddTrinketOrCurse extends Effect {
  effectName = "AddTrinketOrCurse";

  @property({
    type: cc.Node, override: true, visible: function (this: AddTrinketOrCurse) {
      if (!this.addMuiliEffect) { return true; }
    }
  })
  itemEffectToAdd: cc.Node = null;

  @property({
    type: [cc.Node], visible: function (this: AddTrinketOrCurse) {
      if (this.addMuiliEffect) { return true; }
    }
  })
  itemEffectsToAdd: cc.Node[] = [];

  @property
  addMuiliEffect: boolean = false;

  @property({
    type: DataCollector, visible: function (this: AddTrinketOrCurse) {
      if (this.addMuiliEffect) { return true }
    }
  })
  multiEffectCollector: DataCollector = null

  @property
  isCurse: boolean = false

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)

    if (targetPlayerCard == null) {
      throw new Error(`target player is null`)
    } else {
      if (targetPlayerCard instanceof cc.Node) {
        const player: Player = PlayerManager.getPlayerByCard(targetPlayerCard);
        this.removeAddTrinketEffect()
        const thisCard = Card.getCardNodeByChild(this.node.parent)
        thisCard.getComponent(Card).type = CARD_TYPE.TREASURE;
        ServerClient.$.send(Signal.CARD_ADD_TRINKET, { cardId: thisCard.getComponent(Card)._cardId, playerId: player.playerId, addMuiliEffect: this.addMuiliEffect })
        if (!this.isCurse) {
          PileManager.removeFromPile(thisCard, true)
        }
        await player.addItem(thisCard, true, true);
        if (this.isCurse) {
          player.addCurse(thisCard, true)
        }
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }

  removeAddTrinketEffect() {
    const thisCard = Card.getCardNodeByChild(this.node.parent)
    const thisCardEffect = thisCard.getComponent(CardEffect)
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
