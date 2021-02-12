import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { TARGETTYPE } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import CardEffect from "../Entites/CardEffect";
import Item from "../Entites/CardTypes/Item";
import Card from "../Entites/GameEntities/Card";


const { ccclass, property } = cc._decorator;

@ccclass("RemoveAllAbilities")
export default class RemoveAllAbilities extends Effect {
  effectName = "RemoveAllAbilities";


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {
    const targetCard = data.getTarget(TARGETTYPE.CARD) as cc.Node
    if (targetCard == null) {
      throw new Error("No Target Card Was Found");
    } else {
      const thisCard = Card.getCardNodeByChild(this.node)
      const owner = CardManager.getCardOwner(targetCard)
      if (owner && owner.getComponent(Player)) {
        await owner.getComponent(Player).loseItem(thisCard, true)
      }
      const cardEffect = targetCard.getComponent(CardEffect)
      targetCard.getComponent(Item).enabled = false;
      cardEffect.enabled = false
      cardEffect.activeEffectsIdsFinal = []
      cardEffect.paidEffectsIdsFinal = []
      cardEffect.passiveEffectsIdsFinal = []
      cardEffect.toAddPassiveEffectsIdsFinal = []
    }
    if (data instanceof PassiveEffectData) { return data }
    return stack
  }
}
