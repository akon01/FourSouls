import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import Deck from "../Entites/GameEntities/Deck";
import MonsterField from "../Entites/MonsterField";
import BattleManager from "../Managers/BattleManager";
import CardManager from "../Managers/CardManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import { PassiveEffectData } from "../Managers/DataInterpreter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CreditCardEffect extends Effect {
  effectName = "CreditCardEffect";

  @property({ type: DataCollector, override: true })
  dataCollector = null;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData
  ) {

    cc.log(data)
    let targetCost = data.methodArgs[0]
    cc.log(targetCost)
    data.methodArgs[0] = 0

    return data
  }
}
