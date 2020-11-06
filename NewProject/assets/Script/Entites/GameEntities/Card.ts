import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import DataCollector from "../../CardEffectComponents/DataCollector/DataCollector";
import { CARD_HEIGHT, CARD_TYPE, CARD_WIDTH, PASSIVE_EVENTS, ROLL_TYPE } from "../../Constants";
import PassiveManager, { PassiveMeta } from "../../Managers/PassiveManager";
import Player from "./Player";
import CardManager from "../../Managers/CardManager";
import ParticleManager from "../../Managers/ParticleManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Card extends cc.Component {
  @property
  cardName: string = "";

  @property
  doNotMake: boolean = false;

  @property({ visible: false })
  cardMask: cc.Mask = null;

  @property({ visible: false })
  cardSprite: cc.Sprite = null

  @property
  makeMultiCards: boolean = false;

  @property({
    visible: function (this: Card) {
      if (this.makeMultiCards) { return true }
    }, type: cc.Integer, min: 2
  })
  numOfCopies: number = 2;

  @property({
    type: [cc.SpriteFrame], visible: function (this: Card) {
      if (this.makeMultiCards) { return true }
    }
  })
  copiesSprites: cc.SpriteFrame[] = []

  @property
  _cardId: number = 0;

  @property
  _isInHand: boolean = false;

  @property
  _isOnDesk: boolean = false;

  @property
  _originalParent: cc.Node = null;

  @property
  _originalWidth: number = null;

  @property(cc.Node)
  topDeckof: cc.Node = null;

  @property
  souls: number = 0;

  _cardHolderId: number = -1;

  @property({
    type: cc.Enum(CARD_TYPE)
  })
  type: CARD_TYPE = CARD_TYPE.CHAR;

  @property({ visible: false })
  isGoingToBePlayed: boolean = false;

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

  @property({ visible: false })
  frontSprite: cc.SpriteFrame = null;

  @property({ visible: false })
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

  static getCardNodeByChild(childNode: cc.Node): cc.Node {
    if (childNode.getComponent(Card) != null) {
      return childNode
    }
    return Card.getCardNodeByChild(childNode.parent)
  }

  flipCard(sendToServer: boolean) {
    this._isFlipped = !this._isFlipped;
    if (this._isFlipped) {
      this.cardSprite.spriteFrame = this.backSprite;
    } else {
      this.cardSprite.spriteFrame = this.frontSprite;
    }
    if (sendToServer) {
      ServerClient.$.send(Signal.FLIP_CARD, { cardId: this._cardId })
    }
  }

  async putCounter(numOfCounters: number) {

    if (this._effectCounterLable == null) {
      this.addCountLable()
    }

    const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.CARD_GAINS_COUNTER, [numOfCounters], null, this.node)
    const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
    numOfCounters = afterPassiveMeta.args[0]

    this._counters += numOfCounters;

    ServerClient.$.send(Signal.CARD_GET_COUNTER, { cardId: this._cardId, numOfCounters: numOfCounters })
    await PassiveManager.testForPassiveAfter(passiveMeta)

  }

  // LIFE-CYCLE CALLBACKS:

  setSprites() {

    const sprites = cc.instantiate(CardManager.$.cardSpritesPrefab)
    const cardSprite = sprites.getChildByName(`Card Sprite`);
    const glowSprite = sprites.getChildByName(`Glow Sprite`);
    cardSprite.getComponent(cc.Widget).target = this.node
    cardSprite.getComponent(cc.Widget).updateAlignment();
    glowSprite.getComponent(cc.Widget).target = this.node
    glowSprite.getComponent(cc.Widget).updateAlignment();
    const glows = ParticleManager.$.glows
    for (let index = 0; index < glows.length; index++) {
      const glow = glows[index];
      glowSprite.getComponent(cc.Animation).addClip(glow)
    }
    cardSprite.getComponent(cc.Sprite).spriteFrame = this.node.getComponent(cc.Sprite).spriteFrame
    if (!sprites.isChildOf(this.node)) {
      this.node.addChild(sprites)
      this.cardSprite = cardSprite.getComponent(cc.Sprite)
      this.node.removeComponent(cc.Sprite)
    }
  }

  addCountLable() {
    const cardEffectCounter = cc.instantiate(CardManager.effectCounter)
    cardEffectCounter.setPosition(0, 0)
    this.node.addChild(cardEffectCounter)
    cardEffectCounter.getComponent(cc.Widget).updateAlignment()
    this._effectCounterLable = cardEffectCounter.getComponent(cc.Label)
  }

  onLoad() {
    this.node.height = CARD_HEIGHT;
    this.node.width = CARD_WIDTH;
    this.cardMask = this.node.getComponentInChildren(cc.Mask)
    if (this.cardMask) {
      this.cardMask.node.active = false;
      this.node.removeChild(this.cardMask.node, true)
    }

    this._originalWidth = this.node.width
    if (this.topDeckof != null) {
      this.frontSprite = this.node.getComponent(cc.Sprite).spriteFrame;
    }
    // if (!this.hasCounter) {
    //   //   this._effectCounterLable.node.destroy()
    // } else {
    //   try {

    //     this._effectCounterLable = this.node.getChildByName("EffectCounter").getComponent(cc.Label)
    //   } catch (error) {
    //     cc.error(`card ${this.cardName} should have a counter, no counter found!`)
    //   }

    // }
  }

  start() { }

  update(dt) {
    if (this._effectCounterLable != null) {
      if (this._counters > 0) {
        this._effectCounterLable.node.active = true
        this._effectCounterLable.string = this._counters.toString();
      } else {
        this._effectCounterLable.node.active = false
      }
    }
  }

}
