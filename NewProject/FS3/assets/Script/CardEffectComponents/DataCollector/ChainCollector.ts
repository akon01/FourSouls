import { CCInteger, Component, log, _decorator } from 'cc';
import { COLLECTORTYPE } from "../../Constants";
import { CardEffect } from "../../Entites/CardEffect";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { ServerEffectData } from '../../Managers/ServerEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { ChainEffects } from "../CardEffects/ChainEffects";
import { DataCollector } from "./DataCollector";
const { ccclass, property } = _decorator;


@ccclass('ChainCollector')
export class ChainCollector extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "ChainCollector";
  // @property({ type: CCInteger, multiline: true })
  // chainEffectsIdFinal: number = -1
  @property({ type: Component, multiline: true })
  chainEffects: ChainEffects | null = null
  getChainEffects() {
    return this.chainEffects
    // return this.node.getComponent(CardEffect)!.getEffect<ChainEffects>(this.chainEffectsIdFinal)
  }
  // @property(DataCollector)
  // dataCollectors: DataCollector[] = [];
  // effectsData: { effectIndex: number, data: (ActiveEffectData | PassiveEffectData)[] }[] = [];
  effectsData: ActiveEffectData | PassiveEffectData | null = null;
  /**
   *
   * @param data cardId:card id
   * @returns {target:node of the card that was played}
   */
  async collectData(data: any) {
    const chainEffects = this.getChainEffects();
    if (!chainEffects) { debugger; throw new Error("No Chain Effects Set!"); }
    //const dataInterpreter = new DataInterpreter()
    const effects = chainEffects.getEffectsToChain()
    let effectsData: ActiveEffectData | PassiveEffectData | null = null;
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i]
      //  let effectData = this.effectsData[i]
      console.log(`in chain collector, collecting for ${effect.name}`)
      // let endData: ActiveEffectData | PassiveEffectData = null;
      let endData: ServerEffectData | null = null
      if (effect.dataCollectors.length > 0 && !effect.hasPlayerChoiceToActivateInChainEffects) {
        endData = await WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(effect.node).getComponent(CardEffect)!.collectEffectData(effect, data)

      }
      console.log(endData)
      if (!endData) { debugger; throw new Error("No End Data"); }

      effect.effectData = WrapperProvider.dataInerpreterWrapper.out.convertToEffectData(endData);
      //  effect.effectData = endData ;
    }


    // let data2 = { cardOwner: player.playerId };
    this.effectsData = effectsData
    return effectsData;
  }
}
