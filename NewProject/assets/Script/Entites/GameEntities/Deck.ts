import { CARD_TYPE, CARD_WIDTH, CARD_HEIGHT, printMethodStarted, COLORS } from "../../Constants";
import CardManager from "../../Managers/CardManager";
import DataCollector from "../../CardEffectComponents/DataCollector/DataCollector";
import Server from "../../../ServerClient/ServerClient";
import Signal from "../../../Misc/Signal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Deck extends cc.Component {
  @property({
    type: cc.Enum(CARD_TYPE)
  })
  deckType: CARD_TYPE = CARD_TYPE.LOOT;

  @property(cc.Node)
  topBlankCard: cc.Node = null;

  @property([cc.Node])
  _cards: cc.Node[] = [];

  @property([cc.Prefab])
  cardsPrefab: cc.Prefab[] = [];

  @property
  _cardId: number = 0;

  @property
  _isRequired: boolean = false;

  @property
  _requiredFor: DataCollector = null;


  addToDeckOnTop(card: cc.Node) {
    CardManager.monsterCardPool.put(card);
    this._cards.push(card);
    CardManager.inDecksCards.push(card);
  }

  //@printMethodStarted(COLORS.LIGHTBLUE)
  drawCard(sendToServer: boolean): cc.Node {

    if (this._cards.length != 0) {
      let newCard = this._cards.pop();

      CardManager.removeFromInAllDecksCards(newCard);
      if (sendToServer) {
        Server.$.send(Signal.DRAWCARD, { deckType: this.deckType })
      }
      return newCard;
    } else {
      return null;
    }

  }

  addToDeckOnBottom(card: cc.Node) {
    this._cards.unshift(card);
    CardManager.inDecksCards.push(card);
  }

  shuffleDeck() {
    let newDeckArrangment: cc.Node[];
    for (let i = 0; i < this._cards.length; i++) {
      newDeckArrangment.push(
        this._cards[Math.floor(Math.random() * this._cards.length)]
      );
    }
    this._cards = newDeckArrangment;
  }

  createNewTopBlank() { }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {

    this.node.width = CARD_WIDTH;
    this.node.height = CARD_HEIGHT;

    let sprite = this.topBlankCard.getComponent(cc.Sprite);
    sprite.enabled = false;

    // this.drawnCard.on('touchstart', (event) => {
    //     
    //     if (this.interactive && this.cards.length != 0) {
    //      //   
    //         this.drawingCard = true;
    //         //  this.drawnCard = this.drawCard();

    //         sprite.enabled = true;
    //         startDrag(event)
    //     }
    // }, this)

    // this.drawnCard.on('touchmove', (event: cc.Event.EventTouch) => {
    //     if (this.drawingCard) {

    //         Drag(event)
    //     }
    // })

    // this.drawnCard.on('touchend', (event) => {
    //     if (this.drawingCard) {

    //         endTopCardDrag(event)
    //         if (this.cards.length == 0) {
    //             sprite.enabled = false;
    //             this.node.runAction(cc.rotateBy(0.5, 90, 0, 0))
    //         }
    //     }
    //     this.drawingCard = false;

    // })
  }

  start() { }

  // update (dt) {}
}
