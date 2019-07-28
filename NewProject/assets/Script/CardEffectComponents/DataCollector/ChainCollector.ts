import { COLLECTORTYPE, ITEM_TYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";
import ChainEffects from "../CardEffects/ChainEffects";
import Effect from "../CardEffects/Effect";
import DataInterpreter, { ActiveEffectData, PassiveEffectData, EffectTarget } from "../../Managers/DataInterpreter";
import Item from "../../Entites/CardTypes/Item";

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

    let effects = this.node.parent.getComponent(ChainEffects).effectsToChain
    let effectsData;
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i]
      //  let effectData = this.effectsData[i]
      cc.log(`in chain collector, collecting for ${effect.name}`)
      for (let j = 0; j < effect.dataCollector.length; j++) {
        const dataCollector = effect.dataCollector[j];
        cc.log(`collecting using ${dataCollector.name}`)
        let newData = await dataCollector.collectData(data)
        let thisCard = this.node.parent.parent
        let itemType = thisCard.getComponent(Item).type
        let isActive: boolean
        if (itemType == ITEM_TYPE.ACTIVE || itemType == ITEM_TYPE.BOTH) {
          isActive = true;
        }
        if (effectsData == null) {
          effectsData = DataInterpreter.makeEffectData(newData, thisCard, data.cardPlayerId, isActive, false)
        } else {
          cc.log(newData)
          if (newData instanceof EffectTarget) {
            effectsData.addTarget(newData.effectTargetCard)
          } else if (effectsData instanceof ActiveEffectData) effectsData.addTarget(DataInterpreter.getNodeFromData(newData))
        }
        // let formattedData = DataInterpreter.makeEffectData(newData, thisCard, data.cardPlayerId, isActive, false)
        // effectData.data.push(formattedData)
      }
    }

    // let player = PlayerManager.getPlayerByCard(this.node.parent.parent)
    // let data2 = { cardOwner: player.playerId };
    this.effectsData = effectsData
    return effectsData;
  }

  getEffectData(effect: Effect) {
    let effects = this.node.parent.getComponent(ChainEffects).effectsToChain
    // for (let i = 0; i < this.effectsData.length; i++) {
    //   const effectIndex = this.effectsData[i].effectIndex;
    //   if (effects.indexOf(effect) == effectIndex) return this.effectsData[i].data
    // }
  }
}
