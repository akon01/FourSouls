import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { CARD_TYPE, TARGETTYPE } from "../Constants";
import Card from "../Entites/GameEntities/Card";
import Deck from "../Entites/GameEntities/Deck";
import MonsterField from "../Entites/MonsterField";
import BattleManager from "../Managers/BattleManager";
import CardManager from "../Managers/CardManager";
import CardPreviewManager from "../Managers/CardPreviewManager";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import StackEffectInterface from "../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TheHangedManEffect extends Effect {
  effectName = "TheHangedManEffect";

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {

    const targetCards = data.getTargets(TARGETTYPE.CARD)
    if (targetCards == null || targetCards.length == 0) {
      throw new Error("no targets")
    } else {
      const selectedToPutOnBottom = await CardPreviewManager.selectFromCards(targetCards as cc.Node[], 3)
      for (let i = 0; i < selectedToPutOnBottom.length; i++) {
        const card = selectedToPutOnBottom[i].getComponent(Card);
        switch (card.type) {
          case CARD_TYPE.LOOT:
            CardManager.lootDeck.getComponent(Deck).addToDeckOnBottom(card.node, true)
            break;
          case CARD_TYPE.MONSTER:
            CardManager.monsterDeck.getComponent(Deck).addToDeckOnBottom(card.node, true)
            break
          case CARD_TYPE.TREASURE:
            CardManager.treasureDeck.getComponent(Deck).addToDeckOnBottom(card.node, true)
          default:
            break;
        }
      }
    }
    return stack
  }
}
