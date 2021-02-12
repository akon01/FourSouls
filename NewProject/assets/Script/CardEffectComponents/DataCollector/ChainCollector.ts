import { COLLECTORTYPE } from "../../Constants";
import CardEffect from "../../Entites/CardEffect";
import Card from "../../Entites/GameEntities/Card";
import DataInterpreter, { ActiveEffectData, PassiveEffectData, ServerEffectData } from "../../Managers/DataInterpreter";
import ChainEffects from "../CardEffects/ChainEffects";
import Effect from "../CardEffects/Effect";
import IdAndName from "../IdAndNameComponent";
import DataCollector from "./DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChainCollector extends DataCollector {

  type = COLLECTORTYPE.AUTO;
  collectorName = "ChainCollector";

  @property({ type: cc.Integer, multiline: true })
  chainEffectsIdFinal: number = -1


  getChainEffects() {
    return this.node.getComponent(CardEffect).getEffect<ChainEffects>(this.chainEffectsIdFinal)
  }

  // @property(DataCollector)
  // dataCollectors: DataCollector[] = [];

  // effectsData: { effectIndex: number, data: (ActiveEffectData | PassiveEffectData)[] }[] = [];
  effectsData: ActiveEffectData | PassiveEffectData;
  /**
   *
   * @param data cardId:card id
   * @returns {target:cc.node of the card that was played}
   */
  async collectData(data) {
    const effects = this.getChainEffects().getEffectsToChain()
    let effectsData: ActiveEffectData | PassiveEffectData;
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i]
      //  let effectData = this.effectsData[i]
      cc.log(`in chain collector, collecting for ${effect.name}`)
      //   let endData: ActiveEffectData | PassiveEffectData = null;
      let endData: ServerEffectData
      if (effect.dataCollectorsIdsFinal.length > 0 && !effect.hasPlayerChoiceToActivateInChainEffects) {
        endData = await Card.getCardNodeByChild(effect.node).getComponent(CardEffect).collectEffectData(effect, data)

      }
      cc.log(endData)
      effect.effectData = DataInterpreter.convertToEffectData(endData);
      //  effect.effectData = endData ;
    }


    // let data2 = { cardOwner: player.playerId };
    this.effectsData = effectsData
    return effectsData;
  }
}
