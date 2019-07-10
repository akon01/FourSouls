import { CARD_HEIGHT, CARD_TYPE, CARD_WIDTH } from "../../Constants";
import { CardLayout } from "../CardLayout";
import Player from "./Player";
import Signal from "../../../Misc/Signal";
import { ActivatePassiveAction } from "../Action";
import ActionManager from "../../Managers/ActionManager";
import CardManager from "../../Managers/CardManager";
import DataCollector from "../../CardEffectComponents/DataCollector/DataCollector";
import CardEffect from "../CardEffect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Card extends cc.Component {
  @property
  cardName: string = "";

  @property
  _cardId: number = 0;

  @property
  _isInHand: boolean = false;

  @property
  _isOnDesk: boolean = false;

  @property
  _originalParent: cc.Node = null;

  @property(cc.Node)
  topDeckof: cc.Node = null;

  @property
  souls: number = 0;

  _cardHolderId: number = -1;

  @property({
    type: cc.Enum(CARD_TYPE)
  })
  type: CARD_TYPE = CARD_TYPE.CHAR;

  // @property
  //currentCardLayout: CardLayout = null;

  @property
  _isAttackable: boolean = false;

  @property
  _isBuyable: boolean = false;

  @property
  _isPlayable: boolean = false;

  @property
  _isActivateable: boolean = false;

  @property
  _isReactable: boolean = false;

  @property
  _isRequired: boolean = false;

  @property
  _requiredFor: DataCollector = null;

  @property
  frontSprite: cc.SpriteFrame = null;

  @property
  backSprite: cc.SpriteFrame = null;

  @property
  _isFlipped: boolean = false;

  @property
  _ownedBy: Player = null;

  @property
  hasCounter: boolean = false;

  @property
  _effectCounterLable: cc.Label = null;

  @property
  _counters: number = 0;


  flipCard() {
    this._isFlipped = !this._isFlipped;
    if (this._isFlipped) {
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
      srvData: {
        cardId: this._cardId,
        passiveIndex: passiveIndex,
        cardActivatorId: cardActivatorId
      }
    };
    let action = new ActivatePassiveAction(
      { activatedCard: this.node, passiveIndex: passiveIndex },
      cardActivatorId
    );
    if (ActionManager.inReactionPhase) {

      action.showAction();
      if (sendToServer) {
        action.serverBrodcast(serverData);
      }
      let serverEffect = await CardManager.activateCard(
        this.node,
        cardActivatorId,
        passiveIndex
      );

      ;
      ActionManager.serverEffectStack.push(serverEffect);
    } else {

      if (sendToServer) {
        ActionManager.doAction(action, serverData);
      } else {
        ActionManager.doSingleAction(action, serverData, sendToServer);
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
    if (this.topDeckof != null) {
      this.frontSprite = this.node.getComponent(cc.Sprite).spriteFrame;
    }
    if (!this.hasCounter) {
      //   this._effectCounterLable.node.destroy()
    } else this._effectCounterLable = this.node.getChildByName('EffectCounter').getComponent(cc.Label)
  }

  start() { }

  update(dt) {
    if (this._effectCounterLable != null) {
      this._effectCounterLable.string = this._counters.toString();
    }
  }


}
