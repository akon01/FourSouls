import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import PreCondition from "./PreCondition";
import Card from "../../Entites/GameEntities/Card";
import Item from "../../Entites/CardTypes/Item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HasItems extends PreCondition {

  @property
  itemsNeeded: number = 1;

  testCondition(meta: any) {

    const thisCard = Card.getCardNodeByChild(this.node);
    const owner = CardManager.getCardOwner(thisCard);
    if (owner) {
      const player = PlayerManager.getPlayerByCard(owner)
      let playerItems = [player.activeItems.filter(item => !item.getComponent(Item).eternal), player.passiveItems.filter(item => !item.getComponent(Item).eternal)]
      if (playerItems.length > 0) {
        return true
      } else { return false }
    } else {
      throw new Error(`no owner for this card ${thisCard}`)
    }
  }
}
