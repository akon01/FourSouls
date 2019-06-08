import Card from "../Entites/Card";
import { CardLayout } from "../Entites/CardLayout";
import PlayerManager from "../Managers/PlayerManager";
import ActionManager from "../Managers/ActionManager";
import CardManager from "../Managers/CardManager";
import { getLandedNode, getUniqeLandNode } from "./LandCheck";
import Deck from "../Entites/Deck";
import { addCardToCardLayout } from "./HandModule";

import Signal from "../../Misc/Signal";
import Server from "../../ServerClient/ServerClient";
import MainScript from "../MainScript";
import Player from "../Entites/Player";
import { LANDING_NODES } from "../Constants";
import { DrawCardAction } from "../Entites/Action";


const { ccclass, property } = cc._decorator;

@ccclass
export default class CardDrawable extends cc.Component {


    @property(cc.Node)
    drawnCard: cc.Node = null;

    startDrag(event: cc.Event.EventTouch) {
        let sprite = this.drawnCard.getComponent(cc.Sprite)
        sprite.enabled = true;
        ////cc.log('start drag')
        let sc = new cc.Scheduler(); 
        sc.enableForTarget(this);
        event.stopPropagation()
        let cardNode: cc.Node = event.target;

        let card: Card = cardNode.getComponent('Card')
        ////cc.log(card)

        //setting the card on top of everything
        //if is top card of deck
        if (cardNode.parent.getComponent('Deck') != null) {

            let pos: cc.Vec2 = cardNode.parent.getPosition();
            cardNode.parent = cc.find('Canvas')
            cardNode.setPosition(pos)
        }
        cardNode.setSiblingIndex(cardNode.parent.childrenCount - 1)
        card.moving = true;
        card.dragStartPos = cardNode.getPosition();
        card.newPos = card.dragStartPos;
        if (card.isInHand) {
            card.xDiff = cardNode.parent.convertToNodeSpaceAR(event.getLocation()).subSelf((cardNode.getPosition())).x;
            card.yDiff = cardNode.parent.convertToNodeSpaceAR(event.getLocation()).subSelf((cardNode.getPosition())).y;
        } else {
            card.xDiff = cc.find('Canvas').convertToNodeSpaceAR(event.getLocation()).subSelf(cardNode.getPosition()).x;
            card.yDiff = cc.find('Canvas').convertToNodeSpaceAR(event.getLocation()).subSelf(cardNode.getPosition()).y;
        }

    }

    Drag(event: cc.Event.EventTouch) {
        ////cc.log(' drag')
        let cardNode: cc.Node = event.target;
        let card: Card = cardNode.getComponent('Card')
        card.wasDragged = true;
        let myHand: CardLayout = PlayerManager.mePlayer.getComponentInChildren('CardLayout')
        let handBoundingBox = myHand.node.getBoundingBoxToWorld()
        //when dragging card above hand
        if (handBoundingBox.contains(event.getLocation())) {
            //dont enlarge if already large
            myHand.showHandLayout()
            //if was in hand and is over hand again scale to hand
            if (card.isInHand) {
                card.node.scale = myHand.node.scale;
            }
            //if not over hand when dragging
        } else {
            //if hand is enlarged ,make it regular size
            if (!card.isInHand) {
                myHand.hideHandLayout()
            }
            card.node.runAction(cc.scaleTo(0, 1))
        }
        if (card.xDiff != null && card.yDiff != null && card.moving) {
            card.newPos = cardNode.parent.convertToNodeSpaceAR(new cc.Vec2(event.getLocationX() - card.xDiff, event.getLocationY() - card.yDiff));
        } else return;

    }

    endTopCardDrag(event: cc.Event.EventTouch) {
        let sprite = this.drawnCard.getComponent(cc.Sprite)
        sprite.enabled = false
        ////cc.log('end drag')
        let cardNode: cc.Node = event.target;
        let card: Card = cardNode.getComponent('Card')
        let myHand: CardLayout = PlayerManager.mePlayer.getComponentInChildren('CardLayout')
        //restore hand to original 
        myHand.hideHandLayout()
        card.moving = false;
        this.drawLootCard(cardNode, event.getLocation())


        card.yDiff = null;
        card.xDiff = null;
        cardNode.zIndex = 0;
    }



    drawLootCard(topBlankCardNode: cc.Node, landingLocation: cc.Vec2) {
        let actionManager:ActionManager = cc.find('MainScript/ActionManager').getComponent(ActionManager)
        let currentPlayerComp = MainScript.currentPlayerNode.getComponent(Player)
        let topBlankCard: Card = topBlankCardNode.getComponent('Card')
        let drawnCard: cc.Node;

        let landData: { type: LANDING_NODES, zone: cc.Node } = getLandedNode(topBlankCardNode, MainScript.currentPlayerComp.landingZones, LANDING_NODES.HAND);
        let landedNode: cc.Node = landData.zone
        let landedLayoutComp: CardLayout = landedNode.getComponent(CardLayout)
        let landedNodeType = landData.type;
        let drawedFromDeck: Deck = topBlankCard.topDeckof.getComponent('Deck');
        //where the card landed

        if (landedNodeType == LANDING_NODES.HAND) {
            ////cc.log('landed on hand')
            let data = {topCard:topBlankCardNode,currentPlayer:currentPlayerComp,deck:drawedFromDeck}
            let drawAction = new DrawCardAction(data)
            let serverData = {signal:Signal.CARDDRAWED,srvData:{ player: currentPlayerComp.playerId, deck: drawedFromDeck.deckType }}
            ActionManager.doAction(drawAction,serverData)
           
            //send to server that a card has been drawn , with who drew and deck type
           // Server.$.send(Signal.CARDDRAWED, { player: currentPlayerComp.playerId, deck: drawedFromDeck.deckType })
        } else {
            ////cc.log('landed not on hand')
            //didnt land on hand, return to deck for now
            topBlankCardNode.parent = drawedFromDeck.node;
            topBlankCardNode.setPosition(topBlankCardNode.parent.convertToNodeSpaceAR(landingLocation))
            topBlankCardNode.runAction(cc.moveTo(0.5, 0, 0))
        }
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    }

    start() {

    }

    onEnable() {
        //enable dragging only if deck has cards
        if (this.node.getComponent(Deck).cards.length != 0) {
            this.drawnCard.on(cc.Node.EventType.TOUCH_START, this.startDrag, this)
            this.drawnCard.on(cc.Node.EventType.TOUCH_MOVE, this.Drag, this)
            this.drawnCard.on(cc.Node.EventType.TOUCH_END, this.endTopCardDrag, this)
            
        } else {
            this.node.runAction(cc.rotateBy(1, 90, 0))
        }

    }

    onDisable() {
        this.drawnCard.off(cc.Node.EventType.TOUCH_START, this.startDrag, this)
        this.drawnCard.off(cc.Node.EventType.TOUCH_MOVE, this.Drag, this)
        this.drawnCard.off(cc.Node.EventType.TOUCH_END, this.endTopCardDrag, this)
        if (this.node.getComponent(Deck).cards.length == 0) {
            this.node.runAction(cc.rotateBy(1, 90, 0))
        }
    }

    // update (dt) {}
}
