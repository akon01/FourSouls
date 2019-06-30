import { CardLayout } from "./CardLayout";

import { ITEM_TYPE } from "../Constants";
import { addCardToCardLayout } from "../Modules/HandModule";
import Item from "./CardTypes/Item";
import Card from "./GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerDesk extends cc.Component {
  @property
  deskId: number = 0;

  @property
  deskPosition: cc.Vec2 = null;

  @property(cc.Node)
  activeItemLayout: cc.Node = null;

  @property(cc.Node)
  passiveItemLayout: cc.Node = null;

  @property(cc.Node)
  characterCard: cc.Node = null;

  @property(cc.Node)
  characterItemCard: cc.Node = null;

  addToDesk(card: Card) {

    let deskComp: PlayerDesk = this.node.getComponent(PlayerDesk);
    card.isOnDesk = true;
    let itemComp = card.getComponent(Item);
    switch (itemComp.type) {
      case ITEM_TYPE.ACTIVE:
        addCardToCardLayout(
          card.node,
          deskComp.activeItemLayout.getComponent(CardLayout),
          false
        );
        break;
      case ITEM_TYPE.PASSIVE:
        addCardToCardLayout(
          card.node,
          deskComp.passiveItemLayout.getComponent(CardLayout),
          false
        );
        break;
      default:
        break;
    }
  }

  removeFromDesk(card: Card) {
    let deskComp: PlayerDesk = this.node.getComponent(PlayerDesk);
    card.isOnDesk = false;
    let itemComp = card.getComponent(Item);
    switch (itemComp.type) {
      case ITEM_TYPE.ACTIVE:
        deskComp.activeItemLayout.getComponent(CardLayout).removeCardFromLayout(card.node)
        // removeFromHand(
        //   card.node,
        //   deskComp.activeItemLayout.getComponent(CardLayout)
        // );
        break;
      case ITEM_TYPE.PASSIVE:
        deskComp.passiveItemLayout.getComponent(CardLayout).removeCardFromLayout(card.node)
        // removeFromHand(
        //   card.node,
        //   deskComp.passiveItemLayout.getComponent(CardLayout)
        // );
        break;
      default:
        break;
    }
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
