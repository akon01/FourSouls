import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import PreCondition from "./PreCondition";
import Card from "../../Entites/GameEntities/Card";


const { ccclass, property } = cc._decorator;

@ccclass
export default class HasLootCards extends PreCondition {

  @property
  cardsNeeded: number = 1;

  testCondition(meta: any) {

    let thisCard = Card.getCardNodeByChild(this.node)
    let owner = CardManager.getCardOwner(thisCard);
    if (owner) {
      let player = PlayerManager.getPlayerByCard(owner)
      if (player.getHandCards().length > 0) {
        return true
      } else return false
    } else {
      throw `no owner for this card ${thisCard}`
    }
  }
}
