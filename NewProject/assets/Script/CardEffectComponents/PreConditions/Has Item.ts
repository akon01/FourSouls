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
    cc.log(`has item check`)
    const thisCard = Card.getCardNodeByChild(this.node);
    const owner = CardManager.getCardOwner(thisCard);
    if (owner) {
      const player = PlayerManager.getPlayerByCard(owner)
      const playerItems = [...player.activeItems.filter(item => { if (!item.getComponent(Item).eternal) { return true } }), ...player.passiveItems.filter(item => { if (!item.getComponent(Item).eternal) { return true } })]
      cc.log(playerItems)
      if (playerItems.length > 0) {
        cc.log(`has items return true`)
        return true
      } else {
        cc.log(`doenst have items`)
        return false
      }
    } else {
      throw new Error(`no owner for this card ${thisCard}`)
    }
  }
}
