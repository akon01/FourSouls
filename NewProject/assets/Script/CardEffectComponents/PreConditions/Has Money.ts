import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import PreCondition from "./PreCondition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HasMoney extends PreCondition {

  @property
  moneyNeeded: number = 1;

  testCondition(meta: any) {

    const thisCard = Card.getCardNodeByChild(this.node);
    const owner = CardManager.getCardOwner(thisCard);
    if (owner) {
      const player = PlayerManager.getPlayerByCard(owner)
      if (player.coins >= this.moneyNeeded) {
        return true
      } else { return false }
    } else {
      throw new Error(`no owner for this card ${thisCard}`)
    }
  }
}
