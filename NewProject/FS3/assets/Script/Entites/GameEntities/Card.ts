import { Animation, CCInteger, Component, Enum, instantiate, Label, Mask, Node, Sprite, SpriteFrame, UITransform, Widget, _decorator } from 'cc';
import { Signal } from "../../../Misc/Signal";
import { DataCollector } from "../../CardEffectComponents/DataCollector/DataCollector";
import { CARD_HEIGHT, CARD_TYPE, CARD_WIDTH, PASSIVE_EVENTS } from "../../Constants";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Player } from "./Player";
const { ccclass, property } = _decorator;



@ccclass('Card')
export class Card extends Component {
      @property
      cardName: string = "";

      @property
      doNotMake: boolean = false;

      cardMask: Mask | null = null;

      cardSprite: Sprite | null = null

      @property
      makeMultiCards: boolean = false;

      //@ts-ignore
      @property({
            visible: function (this: Card) {
                  if (this.makeMultiCards) { return true }
            }, type: CCInteger, min: 2
      })
      numOfCopies: number = 2;

      //@ts-ignore
      @property({
            type: [SpriteFrame], visible: function (this: Card) {
                  if (this.makeMultiCards) { return true }
            }
      })
      copiesSprites: SpriteFrame[] = []

      @property
      _cardId: number = 0;

      @property
      _isInHand: boolean = false;

      @property
      _isOnDesk: boolean = false;

      @property
      _originalParent: Node | null = null;

      @property
      _originalWidth: number | null = null;

      @property(Node)
      topDeckof: Node | null = null;

      @property
      souls: number = 0;

      _cardHolderId: number = -1;

      @property({
            type: Enum(CARD_TYPE)
      })
      type: CARD_TYPE = CARD_TYPE.CHAR;


      isGoingToBePlayed: boolean = false;


      isGoingToBeDestroyed: boolean = false;

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

      _requiredFor: DataCollector | null = null;


      frontSprite: SpriteFrame | null = null;


      backSprite: SpriteFrame | null = null;

      @property
      _isFlipped: boolean = false;

      _ownedBy: Player | null = null;

      @property
      hasCounter: boolean = false;

      @property
      _effectCounterLable: Label | null = null;

      @property
      _counters: number = 0;

      @property
      _hasEventsBeenModified: boolean = false;

      flipCard(sendToServer: boolean) {
            this._isFlipped = !this._isFlipped;
            if (this._isFlipped) {
                  this.cardSprite!.spriteFrame = this.backSprite;
            } else {
                  this.cardSprite!.spriteFrame = this.frontSprite;
            }
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.FLIP_CARD, { cardId: this._cardId })
            }
      }

      async putCounter(numOfCounters: number) {

            if (this._effectCounterLable == null) {
                  this.addCountLable()
            }

            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.CARD_GAINS_COUNTER, [numOfCounters], null, this.node)
            const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
            if (!afterPassiveMeta.args) { debugger; throw new Error("No Args !"); }

            numOfCounters = afterPassiveMeta.args[0]

            this._counters += numOfCounters;

            WrapperProvider.serverClientWrapper.out.send(Signal.CARD_GET_COUNTER, { cardId: this._cardId, numOfCounters: numOfCounters })
            await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)

      }

      // LIFE-CYCLE CALLBACKS:

      setSprites() {

            const sprites = instantiate(WrapperProvider.cardManagerWrapper.out.cardSpritesPrefab) as unknown as Node
            const cardSprite = sprites.getChildByName(`Card Sprite`)!;
            const glowSprite = sprites.getChildByName(`Glow Sprite`)!;
            cardSprite.getComponent(Sprite)!.spriteFrame = this.node.getComponent(Sprite)!.spriteFrame
            if (!sprites.isChildOf(this.node)) {
                  this.node.addChild(sprites)
                  //  this.node.getComponent(Sprite)?.destroy()
            }
            this.cardSprite = cardSprite.getComponent(Sprite)
            // this.node.parent = WrapperProvider.CanvasNode
            cardSprite.getComponent(Widget)!.target = this.node
            cardSprite.getComponent(Widget)!.updateAlignment();
            glowSprite.getComponent(Widget)!.target = this.node
            glowSprite.getComponent(Widget)!.updateAlignment();
            const glows = WrapperProvider.particleManagerWrapper.out.glows
            for (let index = 0; index < glows.length; index++) {
                  const glow = glows[index];
                  glowSprite!.getComponent(Animation)!.createState(glow)
            }
      }

      addCountLable() {
            const cardEffectCounter = instantiate(WrapperProvider.cardManagerWrapper.out.effectCounter)!
            cardEffectCounter.setPosition(0, 0)
            this.node.addChild(cardEffectCounter)
            cardEffectCounter.getComponent(Widget)!.updateAlignment()
            this._effectCounterLable = cardEffectCounter.getComponent(Label)
      }

      onLoad() {
            const trans = this.getComponent(UITransform)!
            trans.height = CARD_HEIGHT;
            trans.width = CARD_WIDTH;
            this.cardMask = this.node.getComponentInChildren(Mask)
            if (this.cardMask) {
                  this.cardMask.node.active = false;
                  this.node.removeChild(this.cardMask.node)
            }

            this._originalWidth = trans.width
            if (this.topDeckof != null) {
                  this.frontSprite = this.node.getComponent(Sprite)!.spriteFrame;
            }
            // if (!this.hasCounter) {
            //   //   this._effectCounterLable.node.destroy()
            // } else {
            //   try {

            //     this._effectCounterLable = this.node.getChildByName("EffectCounter").getComponent(Label)
            //   } catch (error) {
            //     error(`card ${this.cardName} should have a counter, no counter found!`)
            //   }

            // }
      }

      start() { }

      update(dt: number) {
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
