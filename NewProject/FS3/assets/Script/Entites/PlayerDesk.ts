import { Component, Layout, log, Node, UITransform, _decorator } from 'cc';
import { ITEM_TYPE } from "../Constants";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { CardLayout } from "./CardLayout";
import { Item } from "./CardTypes/Item";
import { Card } from "./GameEntities/Card";
import { Dice } from "./GameEntities/Dice";
import { PlayerStatsViewer } from "./PlayerStatsViewer";
const { ccclass, property } = _decorator;


@ccclass('PlayerDesk')
export class PlayerDesk extends Component {
      @property
      deskId: number = 0;

      @property(Node)
      activeItemLayout: Node | null = null;

      @property(Node)
      passiveItemLayout: Node | null = null;

      @property(Node)
      characterCard: Node | null = null;

      @property(Node)
      characterItemCard: Node | null = null;

      @property
      _playerId: number = 0;

      @property(Node)
      soulsLayout: Node | null = null

      @property(Dice)
      dice: Dice | null = null;

      @property(PlayerStatsViewer)
      playerStatsLayout: PlayerStatsViewer | null = null;

      @property(CardLayout)
      hand: CardLayout | null = null;







      checkLayoutOverflow(layout: Node, card: Node, removeCard: boolean) {

            const layoutLength = layout.getComponent(UITransform)!.width;
            let layoutChildrenWidth = 0
            if (layout.children.length == 0) { return false }
            layout.children.forEach(child => {
                  layoutChildrenWidth += child.getComponent(Card)!._originalWidth!
            })
            if (!removeCard) {
                  if (layoutLength - layoutChildrenWidth - card.getComponent(Card)!._originalWidth! <= 0) {
                        return true
                  } else { return false; }
            } else if (layoutLength - layoutChildrenWidth + card.getComponent(Card)!._originalWidth! <= 0) {
                  return true
            } else { return false }
      }

      addToDesk(card: Card) {

            const player = WrapperProvider.playerManagerWrapper.out.getPlayerById(this._playerId)!
            player.addDeskCards([card.node])
            const deskComp: PlayerDesk = this;
            card._isOnDesk = true;
            const itemComp = card.getComponent(Item)!;
            card.node.parent = WrapperProvider.cardManagerWrapper.out.onTableCardsHolder
            let lane: Node
            let layout: Node
            switch (itemComp.type) {
                  case ITEM_TYPE.ACTIVE:
                  case ITEM_TYPE.PAID:
                  case ITEM_TYPE.ACTIVE_AND_PASSIVE:
                  case ITEM_TYPE.ACTIVE_AND_PAID:
                  case ITEM_TYPE.ALL:
                  case ITEM_TYPE.PASSIVE_AND_PAID:
                        console.log(`active item`)
                        lane = deskComp.activeItemLayout!
                        // addCardToCardLayout(
                        //   card.node,
                        //   deskComp.activeItemLayout.getComponent(CardLayout),
                        //   false
                        // );
                        break;
                  case ITEM_TYPE.PASSIVE:
                        console.log(`passive item`)
                        lane = deskComp.passiveItemLayout!
                        // addCardToCardLayout(
                        //   card.node,
                        //   deskComp.passiveItemLayout.getComponent(CardLayout),
                        //   false
                        // );
                        break;

                  default:
                        WrapperProvider.loggerWrapper.out.error(`Item type is not active or passive when adding to desk`)
                        break;
            }
            // layout = lane.getChildByName("Card Layout")
            layout = lane!
            if (this.checkLayoutOverflow(layout, card.node, false)) {
                  layout.getComponent(Layout)!.resizeMode = Layout.ResizeMode.CHILDREN
            } else { layout.getComponent(Layout)!.resizeMode = Layout.ResizeMode.NONE }
            card.node.setParent(layout)
            card.node.setPosition(0, 0)
      }

      removeFromDesk(card: Card) {
            const deskComp: PlayerDesk = this.node.getComponent(PlayerDesk)!;
            card._isOnDesk = false;
            const player = WrapperProvider.playerManagerWrapper.out.getPlayerById(this._playerId)!
            player.removeFromDeskCards([card.node])
            const itemComp = card.getComponent(Item)!;
            let lane: Node
            let layout: Node
            switch (itemComp.type) {
                  case ITEM_TYPE.ACTIVE:
                        lane = deskComp.activeItemLayout!
                        // layout =lane.getChildByName('New Layout')
                        // if (this.checkLayoutOverflow(layout, card.node,true)) {
                        //   layout.getComponent(Layout)!.resizeMode = Layout.ResizeMode.CHILDREN
                        // } else {
                        //   layout.getComponent(Layout)!.resizeMode = Layout.ResizeMode.NONE
                        //   layout.removeChild(card.node)
                        //   layout.children.forEach(child=>child.width = child.getComponent(Card)!._originalWidth)
                        // }
                        // deskComp.activeItemLayout.getComponent(CardLayout)!.removeCardFromLayout(card.node)
                        // removeFromHand(
                        //   card.node,
                        //   deskComp.activeItemLayout.getComponent(CardLayout)
                        // );
                        break;
                  case ITEM_TYPE.PASSIVE:
                        lane = deskComp.passiveItemLayout!
                        // deskComp.passiveItemLayout.getChildByName('New Layout').removeChild(card.node)
                        //deskComp.passiveItemLayout.getComponent(CardLayout)!.removeCardFromLayout(card.node)
                        // removeFromHand(
                        //   card.node,
                        //   deskComp.passiveItemLayout.getComponent(CardLayout)
                        // );
                        break;
                  default:
                        break;
            }
            lane = deskComp.activeItemLayout!
            layout = lane.getChildByName("Card Layout")!
            if (this.checkLayoutOverflow(layout, card.node, true)) {
                  layout.getComponent(Layout)!.resizeMode = Layout.ResizeMode.CHILDREN
            } else {
                  layout.getComponent(Layout)!.resizeMode = Layout.ResizeMode.NONE
                  layout.removeChild(card.node)
                  layout.children.forEach(child => child.getComponent(UITransform)!.width = child.getComponent(Card)!._originalWidth!)
            }
      }

      // LIFE-CYCLE CALLBACKS:


}
