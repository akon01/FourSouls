import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import Deck from "../../Entites/GameEntities/Deck";
import CardManager from "../../Managers/CardManager";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";
import Card from "../../Entites/GameEntities/Card";


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

  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {
    cc.log(data)
    let cardTarget = data.getTarget(TARGETTYPE.CARD)
    if (cardTarget == null) {
      throw `no target in ${this.name}`
    } else {

      let deck = CardManager.getDeckByType((cardTarget as cc.Node).getComponent(Card).type).getComponent(Deck)

      if (deck._cards.includes(cardTarget as cc.Node)) deck._cards.splice(deck._cards.indexOf(cardTarget as cc.Node), 1)

      cc.log(deck._cards.map(card => card.name))
      if (this.putOnBottomOfDeck) {
        cc.log(`add on bottom`)

        await deck.addToDeckOnBottom(cardTarget as cc.Node, true)
        cc.log(deck._cards.map(card => card.name))
      } else {
        cc.log(`add on top`)
        await deck.addToDeckOnTop(cardTarget as cc.Node, true)
        cc.log(deck._cards.map(card => card.name))
      }
    }


    if (this.conditions.length > 0) {
      return data;
    } else return stack
  }
}
