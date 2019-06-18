import { CARD_HEIGHT, CARD_TYPE, CARD_WIDTH } from "../../Constants";
import { CardLayout } from "../CardLayout";
import Player from "./Player";
import Signal from "../../../Misc/Signal";
import { ActivatePassiveAction } from "../Action";
import ActionManager from "../../Managers/ActionManager";
import CardManager from "../../Managers/CardManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Card extends cc.Component {
  @property
  cardName: string = "";

  @property
  cardId: number = 0;

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
  isOnDesk: boolean = false;

  @property
  originalParent: cc.Node = null;

  @property
  newPos: cc.Vec2 = null;

  @property(cc.Node)
  topDeckof: cc.Node = null;

  @property
  wasDragged: boolean = false;

  @property({
    type: cc.Enum(CARD_TYPE)
  })
  type: CARD_TYPE = CARD_TYPE.CHAR;

  // @property
  //currentCardLayout: CardLayout = null;

  @property
  hasDraggableComp: boolean = false;

  @property
  frontSprite: cc.SpriteFrame = null;

  @property
  backSprite: cc.SpriteFrame = null;

  @property
  isFlipped: boolean = false;

  @property
  ownedBy: Player = null;

  flipCard() {
    this.isFlipped = !this.isFlipped;
    if (this.isFlipped) {
      this.node.getComponent(cc.Sprite).spriteFrame = this.backSprite;
    } else {
      this.node.getComponent(cc.Sprite).spriteFrame = this.frontSprite;
    }
  }

  async activatePassive(
    cardActivatorId: number,
    passiveIndex: number,
    sendToServer: boolean
  ) {
    let serverData = {
      signal: Signal.ACTIVATEPASSIVE,
      srvData: { cardId: this.cardId, passiveIndex: passiveIndex }
    };
    let action = new ActivatePassiveAction(
      { activatedCard: this.node, passiveIndex: passiveIndex },
      cardActivatorId
    );
    if (ActionManager.inReactionPhase) {
      cc.log("in reaction phase");
      action.showAction();
      if (sendToServer) {
        action.serverBrodcast(serverData);
      }
      let serverEffect = await CardManager.activateCard(
        this.node,
        cardActivatorId,
        passiveIndex
      );
      cc.log("pushed " + serverEffect.effectName);
      ActionManager.serverCardEffectStack.push(serverEffect);
    } else {
      cc.log("not in reaction phase");
      if (sendToServer) {
        cc.log("send activate passive to server");
        ActionManager.doAction(action, serverData);
      } else {
        cc.log(" dont send activate passive to server");
        ActionManager.showSingleAction(action, serverData, sendToServer);
      }
    }
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.node.height = CARD_HEIGHT;
    this.node.width = CARD_WIDTH;
    this.frontSprite = this.node.getComponent(cc.Sprite).spriteFrame;
  }

  start() {}

  update(dt) {
    if (this.moving) {
      this.node.setPosition(this.newPos);
    }
  }

  toString() {
    return this.cardName + " ID: " + this.cardId;
  }
}
