import { CARD_HEIGHT, CARD_WIDTH, CARD_TYPE, ITEM_TYPE } from "../Constants";
import { CardLayout } from "./CardLayout";
import CardManager from "../Managers/CardManager";
import Player from "./Player";






const { ccclass, property } = cc._decorator;

@ccclass
export default class Card extends cc.Component {

    @property
    cardName: string = "";

    @property
    cardId:number = 0;

    @property(cc.Boolean)
    moving: boolean = false;

    @property(cc.Vec2)
    dragStartPos: cc.Vec2 = null;

    @property
    xDiff: number = null;

    @property
    yDiff: number = null;

    @property
    isInHand: boolean = false;

    @property
    isOnDesk:boolean = false;

    @property
    originalParent: cc.Node = null;

    @property
    newPos:cc.Vec2 = null;

    @property(cc.Node)
    topDeckof:cc.Node = null;

    @property
    wasDragged:boolean = false;

    @property({
        type: cc.Enum(CARD_TYPE)
    })
    type:CARD_TYPE = CARD_TYPE.CHAR;

    @property
    currentCardLayout:CardLayout = null;

    @property
    hasDraggableComp:boolean =false;
    
    @property
    frontSprite:cc.SpriteFrame = null;

    @property
    backSprite:cc.SpriteFrame = null;

    @property
    isFlipped:boolean = false;

    @property
    ownedBy:Player = null;

    flipCard(){
        if(this.isFlipped){
            this.node.getComponent(cc.Sprite).spriteFrame = this.frontSprite;
        } else {
            this.node.getComponent(cc.Sprite).spriteFrame = this.backSprite;
        }
    }



    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.height = CARD_HEIGHT;
        this.node.width = CARD_WIDTH;
        this.frontSprite = this.node.getComponent(cc.Sprite).spriteFrame;
        this.backSprite = CardManager.lootCardBack;
     
    }

    start() {

    }

    update(dt) {
        if (this.moving) {
            this.node.setPosition(this.newPos)
        } 
    }
}