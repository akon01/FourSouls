import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import Deck from "../Entites/GameEntities/Deck";
import MonsterField from "../Entites/MonsterField";
import BattleManager from "../Managers/BattleManager";
import CardManager from "../Managers/CardManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import { TARGETTYPE, CARD_TYPE } from "../Constants";
import CardPreviewManager from "../Managers/CardPreviewManager";
import Card from "../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TheHangedManEffect extends Effect {
  effectName = "TheHangedManEffect";

  @property({ type: DataCollector, override: true })
  dataCollector = null;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {

    let targetCards = data.getTargets(TARGETTYPE.CARD)
    if (targetCards == null || targetCards.length == 0) {
      throw new Error('no targets')
    } else {
      let selectedToPutOnBottom = await CardPreviewManager.selectFromCards(targetCards as cc.Node[], 3)
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
