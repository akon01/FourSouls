import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import CardManager from "../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import Card from "../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PandorasBoxSixthEffect extends Effect {
  effectName = "PandorasBoxSixthEffect";

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData | ActiveEffectData
  ) {


    let thisCard = Card.getCardNodeByChild(this.node)
    let thisOwner = PlayerManager.getPlayerByCard(CardManager.getCardOwner(thisCard))
    await thisOwner.getSoulCard(thisCard, true)

    if (data instanceof PassiveEffectData) {
      return data
    }
    return stack
  }
}
