import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import DataCollector from "../../CardEffectComponents/DataCollector/DataCollector";
import { CARD_HEIGHT, CARD_TYPE, CARD_WIDTH, PASSIVE_EVENTS, ROLL_TYPE } from "../../Constants";
import Player from "./Player";
import PassiveManager, { PassiveMeta } from "../../Managers/PassiveManager";

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

  @property
  _hasEventsBeenModified: boolean = false;


  flipCard(sendToServer: boolean) {
    this._isFlipped = !this._isFlipped;
    if (this._isFlipped) {
      this.node.getComponent(cc.Sprite).spriteFrame = this.backSprite;
    } else {
      this.node.getComponent(cc.Sprite).spriteFrame = this.frontSprite;
    }
    if (sendToServer) {
      ServerClient.$.send(Signal.FLIP_CARD, { cardId: this._cardId })
    }
  }

  async putCounter(numOfCounters: number) {

    let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.CARD_GAINS_COUNTER, [numOfCounters], null, this.node)
    let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
    numOfCounters = afterPassiveMeta.args[0]

    this._counters += numOfCounters;

    ServerClient.$.send(Signal.CARD_GET_COUNTER, { cardId: this._cardId, numOfCounters: numOfCounters })

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
    } else {
      try {

        this._effectCounterLable = this.node.getChildByName('EffectCounter').getComponent(cc.Label)
      } catch (error) {
        cc.error(`card should have a counter, no counter found!`)
      }

    }
  }

  start() { }

  update(dt) {
    if (this._effectCounterLable != null) {
      this._effectCounterLable.string = this._counters.toString();
    }
  }


}
