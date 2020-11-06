import CardEffect from "../../Entites/CardEffect";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import ChainCollector from "../DataCollector/ChainCollector";
import Effect from "./Effect";
import { Logger } from "../../Entites/Logger";
import Card from "../../Entites/GameEntities/Card";
import DataInterpreter, { ActiveEffectData, PassiveEffectData, ServerEffectData } from "../../Managers/DataInterpreter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChainEffects extends Effect {

  effectName = "ChainEffects";

  @property([Effect])
  effectsToChain: Effect[] = [];

  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?:  ActiveEffectData | PassiveEffectData
  ) {

    const effectsData = [];
    const currentStack = stack
    const cardEffectComp = this.node.parent.getComponent(CardEffect)
    const effectData = this.node.getComponentInChildren(ChainCollector).effectsData
    for (let i = 0; i < this.effectsToChain.length; i++) {
      let afterEffectData =null
      const effect = this.effectsToChain[i];
      // cc.log(effect.effectData)
      if (effect.hasPlayerChoiceToActivateInChainEffects) {
        cc.log(effect)
        const yesOrNo = await PlayerManager.getPlayerById(cardEffectComp.cardPlayerId).giveYesNoChoice(effect.optionalFlavorText)
        cc.log(yesOrNo)
        if (yesOrNo) {
       afterEffectData=   await this.doInnerEffect(effect, cardEffectComp, stack,data);

        }
      } else {
        afterEffectData=   await this.doInnerEffect(effect, cardEffectComp, stack,data);
      }
      if(afterEffectData instanceof ActiveEffectData ){
        (data as ActiveEffectData).addTarget(afterEffectData.effectTargets);
      } else if (afterEffectData instanceof PassiveEffectData){
        (data as PassiveEffectData).terminateOriginal = (afterEffectData.terminateOriginal)? true :(data as PassiveEffectData).terminateOriginal
      }
    }
    if (this.conditions.length > 0) {
      return data;
    } else { return stack }
  }

  private async doInnerEffect(effect: Effect, cardEffectComp: CardEffect, stack: StackEffectInterface[],data:ActiveEffectData|PassiveEffectData) {
    try {
      const thisCard = Card.getCardNodeByChild(effect.node);
      let effectData:ActiveEffectData|PassiveEffectData|ServerEffectData;
      if (effect.effectData) {
        effectData = effect.effectData;
      } else {
        effectData = await thisCard.getComponent(CardEffect).collectEffectData(effect, { cardId: thisCard.getComponent(Card)._cardId, cardPlayerId: cardEffectComp.cardPlayerId }, true);
      }
      if(!effectData){
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
