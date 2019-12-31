import { COLLECTORTYPE, ITEM_TYPE } from "../../Constants";
import Item from "../../Entites/CardTypes/Item";
import DataInterpreter, { ActiveEffectData, EffectTarget, PassiveEffectData, ServerEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import ChainEffects from "../CardEffects/ChainEffects";
import Effect from "../CardEffects/Effect";
import DataCollector from "./DataCollector";
import Card from "../../Entites/GameEntities/Card";
import CardEffect from "../../Entites/CardEffect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChainCollector extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "ChainCollector";

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
    const effects = this.node.parent.getComponent(ChainEffects).effectsToChain
    let effectsData: ActiveEffectData | PassiveEffectData;
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i]
      //  let effectData = this.effectsData[i]
      cc.log(`in chain collector, collecting for ${effect.name}`)
      //   let endData: ActiveEffectData | PassiveEffectData = null;
      let endData: ServerEffectData
      if (effect.dataCollector && !effect.hasPlayerChoiceToActivateInChainEffects) {
        endData = await Card.getCardNodeByChild(effect.node).getComponent(CardEffect).collectEffectData(effect, data)

      }
      cc.log(endData)
      effect.effectData = DataInterpreter.convertToEffectData(endData);
      //  effect.effectData = endData ;
    }

    // let player = PlayerManager.getPlayerByCard(this.node.parent.parent)
    // let data2 = { cardOwner: player.playerId };
    this.effectsData = effectsData
    return effectsData;
  }

  getEffectData(effect: Effect) {
    const effects = this.node.parent.getComponent(ChainEffects).effectsToChain
    // for (let i = 0; i < this.effectsData.length; i++) {
    //   const effectIndex = this.effectsData[i].effectIndex;
    //   if (effects.indexOf(effect) == effectIndex) return this.effectsData[i].data
    // }
  }
}
