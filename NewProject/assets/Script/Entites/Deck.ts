import { cardPressed, dragDrawedCard } from "../Modules/CardModule";
import { CARD_WIDTH, CARD_HEIGHT } from "../Constants";
import { CARD_TYPE } from "../Constants";

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

  addToDeckOnTop(card: cc.Node) {
    this.cards.push(card);
  }

  drawCard(): cc.Node {
    if (this.cards.length != 0) {
      return this.cards.pop();
    } else return null;
  }

  addToDeckOnBottom(card: cc.Node) {
    this.cards.unshift(card);
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

  createNewTopBlank() {}

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
    //     //cc.log(this.interactive)
    //     if (this.interactive && this.cards.length != 0) {
    //      //   //cc.log(this.drawnCard.parent)
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

  start() {}

  // update (dt) {}
}
