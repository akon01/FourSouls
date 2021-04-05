import { Animation, CCInteger, Component, Enum, instantiate, Label, Mask, Node, Sprite, SpriteFrame, SystemEventType, UITransform, Widget, _decorator } from 'cc';
import { Signal } from "../../../Misc/Signal";
import { DataCollector } from "../../CardEffectComponents/DataCollector/DataCollector";
import { CARD_HEIGHT, CARD_TYPE, CARD_WIDTH, PASSIVE_EVENTS } from "../../Constants";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { HoverSpriteType as HoverSpriteType, Mouse } from './Mouse';
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
      _isShowingBack: boolean = false;

      _ownedBy: Player | null = null;

      setOwner(player: Player | null, sendToServer: boolean) {
            this._ownedBy = player
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.CARD_SET_OWNER, { cardId: this._cardId, playerId: player?.playerId ?? null })
            }
      }

      @property
      hasCounter: boolean = false;

      @property
      _effectCounterLable: Label | null = null;

      @property
      _counters: number = 0;

      @property
      _hasEventsBeenModified: boolean = false;

      private hoverSpriteType: HoverSpriteType = HoverSpriteType.default

      getHoverSpriteType() {
            return this.hoverSpriteType
      }

      setHoverSpriteType(type: HoverSpriteType) {
            this.hoverSpriteType = type
      }

      flipCard(sendToServer: boolean) {
            this._isShowingBack = !this._isShowingBack;
            if (this._isShowingBack) {
                  this.cardSprite!.spriteFrame = this.backSprite;
            } else {
                  this.cardSprite!.spriteFrame = this.frontSprite;
            }
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.FLIP_CARD, { cardId: this._cardId })
            }
      }

      changeNumOfSouls(diff: number, sendToServer: boolean) {
            this.souls += diff
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.CARD_CHANGE_NUM_OF_SOULS, { cardId: this._cardId, diff: diff })
            }

      }

      async putCounter(numOfCounters: number, sendToServer: boolean) {

            if (this._effectCounterLable == null) {
                  this.addCountLable()
            }

            if (sendToServer) {
                  const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.CARD_GAINS_COUNTER, [numOfCounters], null, this.node)
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
                  if (!afterPassiveMeta.args) { debugger; throw new Error("No Args !"); }

                  numOfCounters = afterPassiveMeta.args[0]

                  this._counters += numOfCounters;

                  WrapperProvider.serverClientWrapper.out.send(Signal.CARD_GET_COUNTER, { cardId: this._cardId, numOfCounters: numOfCounters })
                  await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
                  WrapperProvider.serverClientWrapper.out.send(Signal.CARD_CHANGE_COUNTER, { cardId: this._cardId, numOfCounters })
            } else {
                  this._counters += numOfCounters
            }

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

            // //Todo - only for test 
            // const mouseNode = WrapperProvider.CanvasNode.getChildByName("Mouse")

            // const mosueEventFn = (e: any) => {
            //       mouseNode?.getComponent(Mouse)!.setCardHover(this)
            // }

            // const mosueEventLeaveFn = (e: any) => {
            //       console.log(`card on leave ${this.cardName}`);

            //       mouseNode?.getComponent(Mouse)!.setCardHoverLeave(this)
            // }

            // const mouses = WrapperProvider.playerManagerWrapper.out.players.map(p => p.getComponent(Player)!.mouse!)
            // for (const mouse of mouses) {
            const meMouse = WrapperProvider.playerManagerWrapper.out.mePlayer?.getComponent(Player)?.mouse
            if (meMouse)
                  meMouse.setCardEnterAndLeaveEvents(this)
            // }

            // this.node.on(SystemEventType.MOUSE_ENTER, mosueEventFn, this)
            // this.node.on(SystemEventType.MOUSE_LEAVE, mosueEventLeaveFn, this)
            // if (!this.hasCounter) {
            //   //   this._effectCounterLable.node.destroy()
            // } else {
            //   try {

            //     this._effectCounterLable = this.node.getChildByName("EffectCounter").getComponent(Label)
            //   } catch (error) {
            //     console.error(`card ${this.cardName} should have a counter, no counter found!`)
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
