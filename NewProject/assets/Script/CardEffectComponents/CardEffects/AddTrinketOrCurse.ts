import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import { TARGETTYPE, CARD_TYPE, ITEM_TYPE } from "../../Constants";
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
import IdAndName from "../IdAndNameComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddTrinketOrCurse extends Effect {
  effectName = "AddTrinketOrCurse";

  // setWithOld(oldEffect: AddTrinketOrCurse) {
  //   const cardEffectComp = this.node.getComponent(CardEffect)
  //   try {
  //     if (oldEffect.addMuiliEffect) {
  //       for (let i = 0; i < oldEffect.itemEffectsToAdd2.length; i++) {
  //         const effectToAdd = oldEffect.itemEffectsToAdd2[i].getComponent(Effect);
  //         if (effectToAdd.hasBeenHandled) {
  //           this.itemEffectsToAddIds2.push(effectToAdd.EffectId)
  //         } else {
  //           const newId = createNewEffect(effectToAdd.getComponent(Effect), this.node, false)
  //           this.itemEffectsToAddIds2.push(newId)
  //         }
  //       }

  //     } else {
  //       const newId = createNewEffect(oldEffect.itemEffectToAdd2.getComponent(Effect), this.node, false)
  //       this.itemEffectToAddId2 = newId.effectName)
  //       oldEffect.itemEffectToAddId2 = this.itemEffectToAddId2
  //     }
  //     if (oldEffect.multiEffectCollector) {
  //       const newMultiId = createNewDataCollector(this.node, this.multiEffectCollector)
  //       this.multiEffectCollectorId = newMultiId
  //       this.multiEffectCollector = null
  //       oldEffect.multiEffectCollector = null
  //       oldEffect.multiEffectCollectorId = this.multiEffectCollectorId
  //     }
  //     this.itemEffectToAdd2 = null;
  //     this.itemEffectsToAdd2 = []
  //     oldEffect.itemEffectToAdd2 = null
  //     oldEffect.itemEffectsToAdd2 = []
  //   } catch (error) {
  //     throw error
  //   }
  // }

  @property({
    type: cc.Integer, override: true, visible: function (this: AddTrinketOrCurse) {
      if (!this.addMuiliEffect) { return true; }
    }
  })
  itemEffectToAddIdFinal: number = -1;

  @property({
    type: [cc.Integer], visible: function (this: AddTrinketOrCurse) {
      if (this.addMuiliEffect) { return true; }
    }
  })
  itemEffectsToAddIdsFinal: number[] = [];

  @property
  addMuiliEffect: boolean = false;

  @property({
    type: cc.Integer, visible: function (this: AddTrinketOrCurse) {
      if (this.addMuiliEffect) { return true }
    }
  })
  multiEffectCollectorIdFinal: number = -1

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
        const thisCard = Card.getCardNodeByChild(this.node)
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
    const thisCard = Card.getCardNodeByChild(this.node)
    const thisCardEffect = thisCard.getComponent(CardEffect)
    //Remove this Effect!
    thisCardEffect.activeEffectsIdsFinal = thisCardEffect.activeEffectsIdsFinal.filter(aid => aid != this.EffectId);
    if (this.addMuiliEffect) {
      for (let i = 0; i < this.itemEffectsToAddIdsFinal.length; i++) {
        const effect = this.itemEffectsToAddIdsFinal[i];
        thisCardEffect.passiveEffectsIdsFinal.push(effect)
      }
      if (this.multiEffectCollectorIdFinal != -1) {
        thisCardEffect.multiEffectCollectorIdFinal = this.multiEffectCollectorIdFinal;
        thisCardEffect.hasMultipleEffects = true;
      }
    } else {
      thisCardEffect.passiveEffectsIdsFinal.push(this.itemEffectToAddIdFinal)
    }
    this.node.removeComponent(this)

  }

}
