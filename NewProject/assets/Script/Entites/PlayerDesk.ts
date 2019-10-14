import { CardLayout } from "./CardLayout";

import { ITEM_TYPE } from "../Constants";
import { addCardToCardLayout } from "../Modules/HandModule";
import Item from "./CardTypes/Item";
import Card from "./GameEntities/Card";
import PlayerManager from "../Managers/PlayerManager";
import Player from "./GameEntities/Player";
import { Logger } from "./Logger";

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

  @property
  _playerId: number = 0;

  addToDesk(card: Card) {
    cc.log(`add ${card.name} to ${this.node.name}`)
    let player = PlayerManager.getPlayerById(this._playerId).getComponent(Player)
    player.deskCards.push(card.node)
    let deskComp: PlayerDesk = this;
    card._isOnDesk = true;
    let itemComp = card.getComponent(Item);
    card.node.parent = cc.find('Canvas')
    switch (itemComp.type) {
      case ITEM_TYPE.ACTIVE:
      case ITEM_TYPE.PAID:
      case ITEM_TYPE.BOTH:
        cc.log(`active item`)
        addCardToCardLayout(
          card.node,
          deskComp.activeItemLayout.getComponent(CardLayout),
          false
        );
        break;
      case ITEM_TYPE.PASSIVE:
        cc.log(`passive item`)
        addCardToCardLayout(
          card.node,
          deskComp.passiveItemLayout.getComponent(CardLayout),
          false
        );
        break;

      default:
        cc.error(`Item type is not active or passive`)
        Logger.error(`Item type is not active or passive when adding to desk`)
        break;
    }
  }

  removeFromDesk(card: Card) {
    let deskComp: PlayerDesk = this.node.getComponent(PlayerDesk);
    card._isOnDesk = false;
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
