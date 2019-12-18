import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import Card from "../../Entites/GameEntities/Card";
import Deck from "../../Entites/GameEntities/Deck";
import Store from "../../Entites/GameEntities/Store";
import MonsterField from "../../Entites/MonsterField";
import CardManager from "../../Managers/CardManager";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PutACardToDeck extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;

  effectName = "PutACardToDeck";

  @property
  putOnBottomOfDeck: boolean = false;

  /**
   *
   * @param data {target:PlayerId}
   */

  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData,
  ) {
    cc.log(data);
    const cardTargets = data.getTargets(TARGETTYPE.CARD);

    if (cardTargets == null || cardTargets.length == 0) {
      throw new Error(`no target in ${this.name}`);
    } else {
      if (cardTargets.length > 1) {

        for (let i = 0; i < cardTargets.length; i++) {
          const target = cardTargets[i] as cc.Node;
          const test = await this.putInDeck(target);
          cc.log(test);
          cc.log(`finished putting ${(target).name} in deck`);
        }
      } else {
        await this.putInDeck(cardTargets[0] as cc.Node);
      }
    }

    if (this.conditions.length > 0) {
      return data;
    } else { return stack; }
  }

  async putInDeck(card: cc.Node) {
    cc.log(`put in deck of ${card.name}`);
    const deck = CardManager.getDeckByType(card.getComponent(Card).type).getComponent(Deck);

    if (deck._cards.includes(card)) { deck._cards.splice(deck._cards.indexOf(card), 1); }

    if (this.putOnBottomOfDeck) {
      await deck.addToDeckOnBottom(card, true);
    } else {
      await deck.addToDeckOnTop(card, true);
    }

    switch (deck.deckType) {
      case CARD_TYPE.TREASURE:
        if (Store.storeCards.includes(card)) {
          await Store.$.removeFromStore(card, true);
        }
        break;
      case CARD_TYPE.MONSTER:
        if (MonsterField.activeMonsters.includes(card)) {
          cc.log(`b4 put `);
          const cardComp = (card).getComponent(Card)._cardId;
          const monsterCardHolder = MonsterField.getMonsterPlaceByActiveMonsterId(cardComp);
          cc.log(`b4 remove monster of monster holder`);
          await monsterCardHolder.removeMonster(card, true);
          cc.log(`after remove monster of monster holder`);
        }
      default:
        break;
    }
    return true;
  }

}
