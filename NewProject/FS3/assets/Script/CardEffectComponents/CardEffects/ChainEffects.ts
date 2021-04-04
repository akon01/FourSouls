import { CCInteger, Component, log, _decorator } from 'cc';
import { CardEffect } from "../../Entites/CardEffect";
import { Card } from "../../Entites/GameEntities/Card";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { EffectRunner } from '../../Managers/EffectRunner';
import { EffectTarget } from '../../Managers/EffectTarget';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { ChainCollector } from "../DataCollector/ChainCollector";
import { DataCollector } from '../DataCollector/DataCollector';
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('ChainEffects')
export class ChainEffects extends Effect {

  effectName = "ChainEffects";

  onLoad() {
    this.createChainCollector()
  }


  @property([CCInteger])
  effectsToChainIdsFinal: number[] = []

  _chainCollector: ChainCollector | null = null

  @property([Component])
  effectsToChain: Effect[] = []

  createChainCollector() {
    if (this.node) {
      const collector = this.node.addComponent(ChainCollector);
      this._chainCollector = collector
      //collector.resetInEditor();
      collector.chainEffects = this
      this.dataCollectors.push(collector)
      // oldEffect.dataCollectors = this.dataCollectors
      // const chainCollectorsComponents = this.node.getComponentsInChildren(ChainCollector);
      // if (chainCollectorsComponents.length > 0) {
      //   chainCollectorsComponents.forEach(chainCollector => {
      //     this.node.removeChild(chainCollector.node)
      //   })
      // }
      return collector
    } else return null
  }

  @property({ type: [CCInteger], override: true })
  dataCollectorsIdsFinal: number[] = []

  @property({ type: [DataCollector], override: true })
  dataCollectors: DataCollector[] = []

  getEffectsToChain() {
    return this.effectsToChain
    // const cardEffect = this.node.getComponent(CardEffect)!
    // return this.effectsToChainIdsFinal.map(eid => cardEffect.getEffect(eid))
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
    const cardEffectComp = this.node.getComponent(CardEffect)!
    if (!this._chainCollector) { debugger; throw new Error("No Chain Collector In Chain Effects!"); }
    const effectData = this._chainCollector.effectsData
    const effectsToChain = this.getEffectsToChain()
    for (let i = 0; i < effectsToChain.length; i++) {
      let afterEffectData = null
      const effect = effectsToChain[i];
      // console.log(effect.effectData)
      if (effect.hasPlayerChoiceToActivateInChainEffects) {
        console.log(effect)
        const yesOrNo = await WrapperProvider.playerManagerWrapper.out.getPlayerById(cardEffectComp.cardPlayerId)!.giveYesNoChoice(effect.optionalFlavorText)
        console.log(yesOrNo)
        if (yesOrNo) {
          afterEffectData = await this.doInnerEffect(effect, cardEffectComp, stack, data!);

        }
      } else {
        afterEffectData = await this.doInnerEffect(effect, cardEffectComp, stack, data!);
      }
      if (afterEffectData instanceof ActiveEffectData) {
        (data as ActiveEffectData).addTarget(afterEffectData.effectTargets as EffectTarget[]);
      }
      // else if (afterEffectData instanceof PassiveEffectData) {
      //   (data as PassiveEffectData).terminateOriginal = (afterEffectData.terminateOriginal) ? true : (data as PassiveEffectData).terminateOriginal
      // }
    }
    if (this.conditions.length > 0) {
      return data!;
    } else { return stack }
  }

  private async doInnerEffect(effect: Effect, cardEffectComp: CardEffect, stack: StackEffectInterface[], data: ActiveEffectData | PassiveEffectData) {
    try {
      const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(effect.node);
      let effectData: ActiveEffectData | PassiveEffectData;
      if (effect.effectData) {
        effectData = effect.effectData;
      } else {
        effectData = await thisCard.getComponent(CardEffect)!.collectEffectData(effect, { cardId: thisCard.getComponent(Card)!._cardId, cardPlayerId: cardEffectComp.cardPlayerId }, true);
      }
      if (!effectData) {
        effectData = data
      }
      console.log(effectData);
      console.log(`do effect ${effect.effectName} of ${cardEffectComp.node.name} in chain effect`);
      return await EffectRunner.runEffect(effect, stack, WrapperProvider.dataInerpreterWrapper.out.convertToEffectData(effectData))
      // await effect.doEffect(
      //   stack,
      //   WrapperProvider.dataInerpreterWrapper.out.convertToEffectData(effectData)
      // );
    } catch (error) {
      WrapperProvider.loggerWrapper.out.error(`${effect.effectName} has failed`);
      WrapperProvider.loggerWrapper.out.error(error, effect.effectData);
    }
  }
}
