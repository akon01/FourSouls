import { CCInteger, Component, log, _decorator } from 'cc';
import { CardEffect } from "../../Entites/CardEffect";
import { Card } from "../../Entites/GameEntities/Card";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { EffectData } from '../../Managers/EffectData';
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

  cardEffectComp: CardEffect | null = null

  currStack: StackEffectInterface[] = []

  currData: ActiveEffectData | PassiveEffectData | null = null

  /**
   *
   * @param data {target:PlayerId}
   */

  doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {

    const effectsData = [];
    this.currStack = stack
    this.currData = data
    this.cardEffectComp = this.node.getComponent(CardEffect)!
    if (!this._chainCollector) { debugger; throw new Error("No Chain Collector In Chain Effects!"); }
    const effectData = this._chainCollector.effectsData
    const effectsToChain = this.getEffectsToChain()
    const i = 1;
    return this.handleEffectInChain(i, effectsToChain.length)
  }

  private handleEffectInChain(idx: number, length: number): Promise<ActiveEffectData | PassiveEffectData | StackEffectInterface[]> {
    if (this.cardEffectComp && this.currData && this.currStack) {
      const effect = this.effectsToChain[idx];
      if (effect.hasPlayerChoiceToActivateInChainEffects) {
        console.log(effect)
        return WrapperProvider.playerManagerWrapper.out.getPlayerById(this.cardEffectComp.cardPlayerId)!.giveYesNoChoice(effect.optionalFlavorText).then(yesOrNo => {
          if (yesOrNo) {
            return this.doInnerEffect(effect, this.cardEffectComp!, this.currStack, this.currData!)
              //.then(s=>{})
              .then(s => {
                return this.handleAfterEffectInChain(idx, length, s)
              });

          }
          return this.handleEndOfChainEffects()
        })
      } else {
        return this.doInnerEffect(effect, this.cardEffectComp!, this.currStack, this.currData!).then(afterEffectData => {
          return this.handleAfterEffectInChain(idx, length, afterEffectData)
        });
      }
    }
    return this.handleEndOfChainEffects()
  }

  private handleAfterEffectInChain(idx: number, length: number, afterEffectData: EffectData | StackEffectInterface[] | null): Promise<ActiveEffectData | PassiveEffectData | StackEffectInterface[]> {
    if (afterEffectData instanceof ActiveEffectData) {
      (this.currData as ActiveEffectData).addTarget(afterEffectData.effectTargets as EffectTarget[]);
    }
    if (idx < length) {
      return this.handleEffectInChain(idx++, length)
    } else {
      return this.handleEndOfChainEffects()
    }
  }
  private handleEndOfChainEffects(): Promise<ActiveEffectData | PassiveEffectData | StackEffectInterface[]> {
    if (this.conditions.length > 0) {
      return Promise.resolve(this.currData!);
    } else { return Promise.resolve(this.currStack) }
  }

  private doInnerEffect(effect: Effect, cardEffectComp: CardEffect, stack: StackEffectInterface[], data: ActiveEffectData | PassiveEffectData) {

    const runEffectWithData = (effectData: ActiveEffectData | PassiveEffectData, effect: Effect) => {
      console.log(effectData);
      console.log(`do effect ${effect.effectName} of ${cardEffectComp.node.name} in chain effect`);
      return EffectRunner.runEffect(effect, stack, WrapperProvider.dataInerpreterWrapper.out.convertToEffectData(effectData))
    }

    const logRunEffectError = (res: any) => {
      WrapperProvider.loggerWrapper.out.error(`${effect.effectName} has failed`);
      WrapperProvider.loggerWrapper.out.error(res, effect.effectData);
    }
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(effect.node);
    let effectData: ActiveEffectData | PassiveEffectData;
    if (effect.effectData) {
      effectData = effect.effectData;
    } else {
      return thisCard.getComponent(CardEffect)!.collectEffectData(effect, { cardId: thisCard.getComponent(Card)!._cardId, cardPlayerId: cardEffectComp.cardPlayerId }, true).then(effectData => {
        return runEffectWithData(effectData, effect).then(afterEffectData => {
          return afterEffectData!
        }, res => {
          logRunEffectError(res)
          if (this.conditions.length > 0) {
            return this.currData!;
          } else { return this.currStack }

        })
      });
    }
    if (!effectData) {
      effectData = data
    }
    return runEffectWithData(effectData, effect).then(afterEffectData => {
      return afterEffectData!
    }, res => {
      logRunEffectError(res)
      if (this.conditions.length > 0) {
        return this.currData!;
      } else { return this.currStack }
    })

  }
}
