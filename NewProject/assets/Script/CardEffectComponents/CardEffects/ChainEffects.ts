import CardEffect from "../../Entites/CardEffect";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import ChainCollector from "../DataCollector/ChainCollector";
import Effect from "./Effect";


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
    data?: {}[]
  ) {

    let effectsData = [];
    let currentStack = stack
    let cardEffectComp = this.node.parent.getComponent(CardEffect)
    const effectData = this.node.getComponentInChildren(ChainCollector).effectsData
    for (let i = 0; i < this.effectsToChain.length; i++) {
      const effect = this.effectsToChain[i];
      // cc.log(effect.effectData)
      if (effect.hasPlayerChoiceToActivateInChainEffects) {
        let yesOrNo = await PlayerManager.getPlayerById(cardEffectComp.cardPlayerId).giveYesNoChoice()
        if (yesOrNo) {

          await effect.doEffect(
            stack,
            effect.effectData
          );
        }
      } else {
        await effect.doEffect(
          stack,
          effect.effectData
        );
      }
    }
    if (this.conditions.length > 0) {
      return data;
    } else return stack
  }
}
