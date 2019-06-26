import Card from "../Entites/Card";
import PlayerManager from "../Managers/PlayerManager";
import { CardLayout } from "../Entites/CardLayout";
import ActionManager from "../Managers/ActionManager";
import Item from "../Entites/CardTypes/Item";
import Character from "../Entites/CardTypes/Character";
import { CARD_TYPE } from "../Constants";
import CharacterItem from "../Entites/CardTypes/CharacterItem";
import CardEffect from "../Entites/CardEffect";
import { ServerEffect } from "../Entites/ServerCardEffect";
import { resolve } from "dns";

//add swich for diffrent events
export function cardPressed(card: Card) {
  let currentPlayerCardSelected = new cc.Event.EventCustom("cardPressed", true);
  card.node.dispatchEvent(currentPlayerCardSelected);
}

export function dragDrawedCard(card: cc.Node, event: cc.Event.EventTouch) {
  card.parent = cc.find("Canvas");
  let dragStartPos = event.getLocation();
  card.setPosition(card.parent.convertToNodeSpaceAR(dragStartPos));
  event.target = card;
  this.startDrag(event);
}

export function hideCardPreview() {
  if (this.node != null) {
    this.node.active = false;
    this.node.setSiblingIndex(0);
  }
}

export function endDrag(event: cc.Event.EventTouch) {
  let cardNode: cc.Node = event.target;

  let card: Card = cardNode.getComponent("Card");

  card.moving = false;
  //if card was in hand and was dragged
  if (card.wasDragged) {
    let myHand: CardLayout = PlayerManager.mePlayer.getComponentInChildren(
      "CardLayout"
    );
    myHand.hideHandLayout();

    let cEvent = new cc.Event.EventCustom("cardMoved", true);
    cEvent.setUserData(card.dragStartPos);

    cardNode.dispatchEvent(cEvent);
    card.wasDragged = false;
  } else {
    //show card preview
    viewCard(event);
  }

  //handles positioning after setting diffrent parent
  let newPos = cardNode.parent.convertToNodeSpaceAR(
    new cc.Vec2(
      event.getLocationX() - card.xDiff,
      event.getLocationY() - card.yDiff
    )
  );
  if (card.xDiff != null && card.yDiff != null) {
    cardNode.setPosition(newPos);
  }
  card.yDiff = null;
  card.xDiff = null;
  cardNode.zIndex = 0;
}

export function unCancelDrag(event: cc.Event.EventTouch) {
  let cardNode: cc.Node = event.target;
  let card: Card = cardNode.getComponent("Card");
  let pos = cardNode.parent.convertToNodeSpaceAR(
    new cc.Vec2(
      event.getLocationX() - this.xDiff,
      event.getLocationY() - this.yDiff
    )
  );
  cardNode.setPosition(pos);
}

export function viewCard(event: cc.Event.EventTouch) {
  let cardNode: cc.Node = event.target;
  let card: Card = cardNode.getComponent("Card");
  let cardPreview: cc.Node = cc.find("Canvas/CardPreview");
  let sprite = cardPreview.getComponent(cc.Sprite);
  sprite.spriteFrame = card.getComponent(cc.Sprite).spriteFrame;
  if (cardPreview.active) {
    cardPreview.stopAllActions();
    sprite.unschedule(hideCardPreview);
  }
  cardPreview.opacity = 0;
  cardPreview.active = true;
  cardPreview.runAction(cc.fadeIn(0.5));
  cardPreview.setSiblingIndex(cardPreview.parent.childrenCount - 1);

  cardPreview.runAction(cc.sequence(cc.delayTime(3), cc.fadeOut(2)));
  sprite.scheduleOnce(hideCardPreview, 3 + 2.1);
}

export async function cardClickedToActivate(
  timeToRespondTimeOut,
  card,
  data,
  player
) {
  clearTimeout(timeToRespondTimeOut);
  //now is only a bool, change to hold the serverCardEffect
  let serverCardEffect = await player.activateCard(card);
  //simulate the promise of ServerCardEffect

  //after each reaction all players get a new reaction chance so all of the booleans turn to false.
  let newBooleans: boolean[] = [];
  for (let i = 0; i < data.booleans.length; i++) {
    newBooleans.push(false);
  }
  data.booleans = newBooleans;
  //push the card effect to the new data
  data.serverCardEffects.push(serverCardEffect);
  data.lastPlayerTakenAction = this.playerId;
  ActionManager.sendGetReactionToNextPlayer(data);
  //   this.reactionData = data
  player.hideAvailableReactions();
  for (let j = 0; j < player.reactionNodes.length; j++) {
    const card = player.reactionNodes[j];
    card.getComponent(Card).enableMoveComps();
  }
}

export function chargeCard(card: cc.Node) {
  //cc.log("charge itme");
  card.stopAllActions();
  card.runAction(cc.rotateTo(0.5, 0));
  switch (card.getComponent(Card).type) {
    case CARD_TYPE.CHAR:
      card.getComponent(Item).activated = false;
      break;
    case CARD_TYPE.CHARITEM:
      card.getComponent(CharacterItem).activated = false;
      break;
    default:
      card.getComponent(Item).activated = false;
      break;
  }
}
