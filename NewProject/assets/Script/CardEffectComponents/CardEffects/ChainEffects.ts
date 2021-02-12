import CardEffect from "../../Entites/CardEffect";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import ChainCollector from "../DataCollector/ChainCollector";
import Effect from "./Effect";
import { Logger } from "../../Entites/Logger";
import Card from "../../Entites/GameEntities/Card";
import DataInterpreter, { ActiveEffectData, PassiveEffectData, ServerEffectData } from "../../Managers/DataInterpreter";
import IdAndName from "../IdAndNameComponent";
import { ITEM_TYPE } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChainEffects extends Effect {

  effectName = "ChainEffects";

  resetInEditor() {
    // const cardEffect = this.node.getComponent(CardEffect)
    // const newIds = []
    // const oldChainEffects = this.node.children[this.node.getComponents(Effect).indexOf(this)].getComponent(ChainEffects)
    // oldChainEffects.effectsToChain.forEach(effect => {
    //   newIds.push(cardEffect.addEffect(effect, ITEM_TYPE.ACTIVE, false))
    // })
    // this.effectsToChainIds = newIds.map(id => id.effectName))
    // oldChainEffects.effectsToChain = [] 
  }

  // setWithOld(oldEffect: ChainEffects) {
  //   const cardEffect = this.node.getComponent(CardEffect)
  //   const newIds = []
  //   oldEffect.effectsToChain.forEach(effect => {
  //     if (effect.hasBeenHandled) {
  //       newIds.push(effect.EffectId)
  //     } else {
  //       newIds.push(cardEffect.addEffect(effect, ITEM_TYPE.ACTIVE, false))
  //     }
  //   })
  //   this.effectsToChainIds = newIds.map(id => id.effectName))
  //   oldEffect.effectsToChain = []
  //   this.createChainCollector(oldEffect)

  // }


  @property([cc.Integer])
  effectsToChainIdsFinal: number[] = []

  createChainCollector(oldEffect: ChainEffects) {
    if (this.node) {
      const collector = this.node.addComponent(ChainCollector);
      collector.resetInEditor();
      collector.chainEffectsIdFinal = this.EffectId
      this.dataCollectorsIdsFinal.push(collector.DataCollectorId)
      oldEffect.dataCollectorsIdsFinal = this.dataCollectorsIdsFinal
      const chainCollectorsComponents = this.node.getComponentsInChildren(ChainCollector);
      if (chainCollectorsComponents.length > 0) {
        chainCollectorsComponents.forEach(cc => {
          this.node.removeChild(cc.node)
        })
      }
      return collector.DataCollectorId
    } else return null
  }

  @property([cc.Integer])
  dataCollectorsIdsFinal: number[] = []

  getEffectsToChain() {
    const cardEffect = this.node.getComponent(CardEffect)
    return this.effectsToChainIdsFinal.map(eid => cardEffect.getEffect(eid))
  }

  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {

    const effectsData = [];
    const currentStack = stack
    const cardEffectComp = this.node.getComponent(CardEffect)
    const effectData = cardEffectComp.getDataCollector<ChainCollector>(this.dataCollectorsIdsFinal[0]).effectsData
    const effectsToChain = this.getEffectsToChain()
    for (let i = 0; i < effectsToChain.length; i++) {
      let afterEffectData = null
      const effect = effectsToChain[i];
      // cc.log(effect.effectData)
      if (effect.hasPlayerChoiceToActivateInChainEffects) {
        cc.log(effect)
        const yesOrNo = await PlayerManager.getPlayerById(cardEffectComp.cardPlayerId).giveYesNoChoice(effect.optionalFlavorText)
        cc.log(yesOrNo)
        if (yesOrNo) {
          afterEffectData = await this.doInnerEffect(effect, cardEffectComp, stack, data);

        }
      } else {
        afterEffectData = await this.doInnerEffect(effect, cardEffectComp, stack, data);
      }
      if (afterEffectData instanceof ActiveEffectData) {
        (data as ActiveEffectData).addTarget(afterEffectData.effectTargets);
      } else if (afterEffectData instanceof PassiveEffectData) {
        (data as PassiveEffectData).terminateOriginal = (afterEffectData.terminateOriginal) ? true : (data as PassiveEffectData).terminateOriginal
      }
    }
    if (this.conditionsIdsFinal.length > 0) {
      return data;
    } else { return stack }
  }

  private async doInnerEffect(effect: Effect, cardEffectComp: CardEffect, stack: StackEffectInterface[], data: ActiveEffectData | PassiveEffectData) {
    try {
      const thisCard = Card.getCardNodeByChild(effect.node);
      let effectData: ActiveEffectData | PassiveEffectData | ServerEffectData;
      if (effect.effectData) {
        effectData = effect.effectData;
      } else {
        effectData = await thisCard.getComponent(CardEffect).collectEffectData(effect, { cardId: thisCard.getComponent(Card)._cardId, cardPlayerId: cardEffectComp.cardPlayerId }, true);
      }
      if (!effectData) {
        effectData = data
      }
      cc.log(effectData);
      cc.log(`do effect ${effect.effectName} of ${cardEffectComp.node.name} in chain effect`);
      return await effect.doEffect(
        stack,
        DataInterpreter.convertToEffectData(effectData)
      );
    } catch (error) {
      Logger.error(`${effect.effectName} has failed`);
      Logger.error(error, effect.effectData);
    }
  }
}
