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
import { createNewDataCollector, createNewEffect } from "../../reset";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddTrinketOrCurse extends Effect {
  effectName = "AddTrinketOrCurse";

  setWithOld(oldEffect: AddTrinketOrCurse) {
    const cardEffectComp = this.node.getComponent(CardEffect)
    try {
      if (oldEffect.addMuiliEffect) {
        for (let i = 0; i < oldEffect.itemEffectsToAdd.length; i++) {
          const effectToAdd = oldEffect.itemEffectsToAdd[i].getComponent(Effect);
          if (effectToAdd.hasBeenHandled) {
            this.itemEffectsToAddIds.push(IdAndName.getNew(effectToAdd.EffectId, effectToAdd.effectName))
          } else {
            const newId = createNewEffect(effectToAdd.getComponent(Effect), this.node, false)
            this.itemEffectsToAddIds.push(IdAndName.getNew(newId, effectToAdd.effectName))
          }
        }

      } else {
        const newId = createNewEffect(oldEffect.itemEffectToAdd.getComponent(Effect), this.node, false)
        this.itemEffectToAddId = IdAndName.getNew(newId, oldEffect.itemEffectToAdd.getComponent(Effect).effectName)
        oldEffect.itemEffectToAddId = this.itemEffectToAddId
      }
      if (oldEffect.multiEffectCollector) {
        const newMultiId = createNewDataCollector(this.node, this.multiEffectCollector)
        this.multiEffectCollectorId = IdAndName.getNew(newMultiId, this.multiEffectCollector.collectorName)
        this.multiEffectCollector = null
        oldEffect.multiEffectCollector = null
        oldEffect.multiEffectCollectorId = this.multiEffectCollectorId
      }
      this.itemEffectToAdd = null;
      this.itemEffectsToAdd = []
      oldEffect.itemEffectToAdd = null
      oldEffect.itemEffectsToAdd = []
    } catch (error) {
      throw error
    }
  }

  @property({
    type: cc.Node, override: true, visible: function (this: AddTrinketOrCurse) {
      if (!this.addMuiliEffect) { return true; }
    }
  })
  itemEffectToAdd: cc.Node = null;

  @property({
    type: IdAndName, multiline: true, override: true, visible: function (this: AddTrinketOrCurse) {
      if (!this.addMuiliEffect) { return true; }
    }
  })
  itemEffectToAddId: IdAndName = null;

  @property({
    type: [cc.Node], visible: function (this: AddTrinketOrCurse) {
      if (this.addMuiliEffect) { return true; }
    }
  })
  itemEffectsToAdd: cc.Node[] = [];

  @property({
    type: IdAndName, visible: function (this: AddTrinketOrCurse) {
      if (this.addMuiliEffect) { return true; }
    }
  })
  itemEffectsToAddIds: IdAndName[] = [];


  @property
  addMuiliEffect: boolean = false;

  @property({
    type: DataCollector, visible: function (this: AddTrinketOrCurse) {
      if (this.addMuiliEffect) { return true }
    }
  })
  multiEffectCollector: DataCollector = null

  @property({
    type: IdAndName, visible: function (this: AddTrinketOrCurse) {
      if (this.addMuiliEffect) { return true }
    }
  })
  multiEffectCollectorId: IdAndName = null

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
    thisCardEffect.activeEffectsIds = thisCardEffect.activeEffectsIds.filter(aid => aid.id != this.EffectId);
    if (this.addMuiliEffect) {
      for (let i = 0; i < this.itemEffectsToAddIds.length; i++) {
        const effect = this.itemEffectsToAddIds[i];
        thisCardEffect.passiveEffectsIds.push(effect)
      }
      if (this.multiEffectCollectorId) {
        thisCardEffect.multiEffectCollectorId = this.multiEffectCollectorId;
        thisCardEffect.hasMultipleEffects = true;
      }
    } else {
      thisCardEffect.passiveEffectsIds.push(this.itemEffectToAddId)
    }
    this.node.removeComponent(this)

  }

}
