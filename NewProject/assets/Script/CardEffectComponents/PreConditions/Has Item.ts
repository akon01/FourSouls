import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import PreCondition from "./PreCondition";
import Card from "../../Entites/GameEntities/Card";
import Item from "../../Entites/CardTypes/Item";

const { ccclass, property } = cc._decorator;

@ccclass('HasItems')
export default class HasItems extends PreCondition {

  @property
  itemsNeeded: number = 1;

  testCondition(meta: any) {
    const thisCard = Card.getCardNodeByChild(this.node);
    const owner = CardManager.getCardOwner(thisCard);
    if (owner) {
      const player = PlayerManager.getPlayerByCard(owner)
      const playerItems = [...player.getActiveItems().filter(item => { if (!item.getComponent(Item).eternal) { return true } }),
      ...player.getPassiveItems().filter(item => { if (!item.getComponent(Item).eternal) { return true } }),
      ...player.getPaidItems().filter(item => { if (!item.getComponent(Item).eternal) { return true } })]
      cc.log(playerItems)
      if (playerItems.length >= this.itemsNeeded) {
        return true
      } else {
        return false
      }
    } else {
      throw new Error(`no owner for this card ${thisCard}`)
    }
  }
}
