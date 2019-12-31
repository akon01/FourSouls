import CardEffect from "../../Entites/CardEffect";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import ChainCollector from "../DataCollector/ChainCollector";
import Effect from "./Effect";
import { Logger } from "../../Entites/Logger";
import Card from "../../Entites/GameEntities/Card";
import DataInterpreter from "../../Managers/DataInterpreter";

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
    data?: Array<{}>
  ) {

    const effectsData = [];
    const currentStack = stack
    const cardEffectComp = this.node.parent.getComponent(CardEffect)
    const effectData = this.node.getComponentInChildren(ChainCollector).effectsData
    for (let i = 0; i < this.effectsToChain.length; i++) {
      const effect = this.effectsToChain[i];
      // cc.log(effect.effectData)
      if (effect.hasPlayerChoiceToActivateInChainEffects) {
        const yesOrNo = await PlayerManager.getPlayerById(cardEffectComp.cardPlayerId).giveYesNoChoice()
        if (yesOrNo) {
          try {
            const thisCard = Card.getCardNodeByChild(effect.node);
            let effectData
            if (effect.effectData) {
              effectData = effect.effectData
            } else {
              effectData = await thisCard.getComponent(CardEffect).collectEffectData(effect, { cardId: thisCard.getComponent(Card)._cardId, cardPlayerId: cardEffectComp.cardPlayerId }, true)
            }
            cc.log(effectData)
            cc.log(`do effect ${effect.effectName} of ${cardEffectComp.node.name} in chain effect`)
            await effect.doEffect(
              stack,
              DataInterpreter.convertToEffectData(effectData)
            );
          } catch (error) {
            cc.error(`${effect.effectName} has failed`)
            cc.log(effect.effectData)
            Logger.error(error)
            cc.log((error as Error).stack)
          }

        }
      } else {
        try {
          cc.log(`do effect ${effect.effectName} of ${cardEffectComp.node.name} in chain effect`)
          await effect.doEffect(
            stack,
            effect.effectData
          );
        } catch (error) {
          cc.error(`${effect.effectName} has failed`)
          Logger.error(error)
          effect.effectData
          cc.log((error as Error).stack)
        }

      }
    }
    if (this.conditions.length > 0) {
      return data;
    } else { return stack }
  }
}
