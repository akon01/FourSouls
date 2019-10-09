import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import CardManager from "../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PandorasBoxSixthEffect extends Effect {
  effectName = "PandorasBoxSixthEffect";

  @property({ type: DataCollector, override: true })
  dataCollector = null;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData | ActiveEffectData
  ) {


    let thisCard = this.node.parent
    let thisOwner = PlayerManager.getPlayerByCard(CardManager.getCardOwner(thisCard))
    await thisOwner.getSoulCard(thisCard, true)

    if (data instanceof PassiveEffectData) {
      return data
    }
    return stack
  }
}
