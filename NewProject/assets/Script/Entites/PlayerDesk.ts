import { CardLayout } from "./CardLayout";

import { ITEM_TYPE } from "../Constants";
import PlayerManager from "../Managers/PlayerManager";
import { addCardToCardLayout } from "../Modules/HandModule";
import Item from "./CardTypes/Item";
import Card from "./GameEntities/Card";
import Player from "./GameEntities/Player";
import { Logger } from "./Logger";
import Dice from "./GameEntities/Dice";
import PlayerStatsViewer from "./Player Stats Viewer";
import CardManager from "../Managers/CardManager";

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

  @property(cc.Node)
  soulsLayout: cc.Node = null

  @property(Dice)
  dice: Dice = null;

  @property(PlayerStatsViewer)
  playerStatsLayout: PlayerStatsViewer = null;

  @property(CardLayout)
  hand: CardLayout = null;




  checkLayoutOverflow(layout: cc.Node, card: cc.Node, removeCard: boolean) {

    const layoutLength = layout.width;
    let layoutChildrenWidth = 0
    if (layout.childrenCount == 0) { return false }
    layout.children.forEach(child => {
      layoutChildrenWidth += child.getComponent(Card)._originalWidth
    })
    if (!removeCard) {
      if (layoutLength - layoutChildrenWidth - card.getComponent(Card)._originalWidth <= 0) {
        return true
      } else { return false; }
    } else if (layoutLength - layoutChildrenWidth + card.getComponent(Card)._originalWidth <= 0) {
      return true
    } else { return false }
  }

  addToDesk(card: Card) {

    const player = PlayerManager.getPlayerById(this._playerId)
    player.addDeskCards([card.node])
    const deskComp: PlayerDesk = this;
    card._isOnDesk = true;
    const itemComp = card.getComponent(Item);
    card.node.parent = CardManager.$.onTableCardsHolder
    let lane: cc.Node
    let layout: cc.Node
    switch (itemComp.type) {
      case ITEM_TYPE.ACTIVE:
      case ITEM_TYPE.PAID:
      case ITEM_TYPE.ACTIVE_AND_PASSIVE:
      case ITEM_TYPE.ACTIVE_AND_PAID:
      case ITEM_TYPE.ALL:
      case ITEM_TYPE.PASSIVE_AND_PAID:
        cc.log(`active item`)
        lane = deskComp.activeItemLayout
        // addCardToCardLayout(
        //   card.node,
        //   deskComp.activeItemLayout.getComponent(CardLayout),
        //   false
        // );
        break;
      case ITEM_TYPE.PASSIVE:
        cc.log(`passive item`)
        lane = deskComp.passiveItemLayout
        // addCardToCardLayout(
        //   card.node,
        //   deskComp.passiveItemLayout.getComponent(CardLayout),
        //   false
        // );
        break;

      default:
        Logger.error(`Item type is not active or passive when adding to desk`)
        break;
    }
    // layout = lane.getChildByName("Card Layout")
    layout = lane
    if (this.checkLayoutOverflow(layout, card.node, false)) {
      layout.getComponent(cc.Layout).resizeMode = cc.Layout.ResizeMode.CHILDREN
    } else { layout.getComponent(cc.Layout).resizeMode = cc.Layout.ResizeMode.NONE }
    card.node.setParent(layout)
    card.node.setPosition(0, 0)
  }

  removeFromDesk(card: Card) {
    const deskComp: PlayerDesk = this.node.getComponent(PlayerDesk);
    card._isOnDesk = false;
    const player = PlayerManager.getPlayerById(this._playerId)
    player.removeFromDeskCards([card.node])
    const itemComp = card.getComponent(Item);
    let lane: cc.Node
    let layout: cc.Node
    switch (itemComp.type) {
      case ITEM_TYPE.ACTIVE:
        lane = deskComp.activeItemLayout
        // layout =lane.getChildByName('New Layout')
        // if (this.checkLayoutOverflow(layout, card.node,true)) {
        //   layout.getComponent(cc.Layout).resizeMode = cc.Layout.ResizeMode.CHILDREN
        // } else {
        //   layout.getComponent(cc.Layout).resizeMode = cc.Layout.ResizeMode.NONE
        //   layout.removeChild(card.node)
        //   layout.children.forEach(child=>child.width = child.getComponent(Card)._originalWidth)
        // }
        // deskComp.activeItemLayout.getComponent(CardLayout).removeCardFromLayout(card.node)
        // removeFromHand(
        //   card.node,
        //   deskComp.activeItemLayout.getComponent(CardLayout)
        // );
        break;
      case ITEM_TYPE.PASSIVE:
        lane = deskComp.passiveItemLayout
        // deskComp.passiveItemLayout.getChildByName('New Layout').removeChild(card.node)
        //deskComp.passiveItemLayout.getComponent(CardLayout).removeCardFromLayout(card.node)
        // removeFromHand(
        //   card.node,
        //   deskComp.passiveItemLayout.getComponent(CardLayout)
        // );
        break;
      default:
        break;
    }
    lane = deskComp.activeItemLayout
    layout = lane.getChildByName("Card Layout")
    if (this.checkLayoutOverflow(layout, card.node, true)) {
      layout.getComponent(cc.Layout).resizeMode = cc.Layout.ResizeMode.CHILDREN
    } else {
      layout.getComponent(cc.Layout).resizeMode = cc.Layout.ResizeMode.NONE
      layout.removeChild(card.node)
      layout.children.forEach(child => child.width = child.getComponent(Card)._originalWidth)
    }
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}
