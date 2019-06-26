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
  drawnCard: cc.Node = null;

  @property(cc.Prefab)
  blankTopPrefab: cc.Prefab = null;

  @property([cc.Node])
  cards: cc.Node[] = [];

  @property([cc.Prefab])
  cardsPrefab: cc.Prefab[] = [];

  @property(cc.Boolean)
  interactive: boolean = false;

  @property
  drawingCard: boolean = false;

  @property
  cardId: number = 0;

  @property
  isRequired: boolean = false;

  @property
  requiredFor: DataCollector = null;

  @property(cc.Node)
  topCard: cc.Node = null;

  addToDeckOnTop(card: cc.Node) {
    CardManager.monsterCardPool.put(card);
    this.cards.push(card);
    CardManager.inDecksCards.push(card);
  }

  //@printMethodStarted(COLORS.LIGHTBLUE)
  drawCard(sendToServer: boolean): cc.Node {
    cc.log(this.cards.map(card => card.name))
    if (this.cards.length != 0) {
      let newCard = this.cards.pop();

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
    this.cards.unshift(card);
    CardManager.inDecksCards.push(card);
  }

  shuffleDeck() {
    let newDeckArrangment: cc.Node[];
    for (let i = 0; i < this.cards.length; i++) {
      newDeckArrangment.push(
        this.cards[Math.floor(Math.random() * this.cards.length)]
      );
    }
    this.cards = newDeckArrangment;
  }

  createNewTopBlank() { }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    if (this.deckType != CARD_TYPE.LOOT) {
      this.interactive = false;
    }
    this.node.width = CARD_WIDTH;
    this.node.height = CARD_HEIGHT;

    let sprite = this.drawnCard.getComponent(cc.Sprite);
    sprite.enabled = false;

    // this.drawnCard.on('touchstart', (event) => {
    //     ////cc.log(this.interactive)
    //     if (this.interactive && this.cards.length != 0) {
    //      //   ////cc.log(this.drawnCard.parent)
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