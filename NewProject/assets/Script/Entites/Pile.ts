import CardManager from "../Managers/CardManager";
import CardPreviewManager from "../Managers/CardPreviewManager";
import Card from "./GameEntities/Card";
import Deck from "./GameEntities/Deck";
import { CardSet } from "./Card Set";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Pile extends cc.Component {

    @property
    private cards: CardSet = null

    @property
    topId: number = null;

    @property
    pileSprite: cc.Sprite = null;

    @property({ visible: false })
    deck: Deck = null


    addCardToTopPile(card: cc.Node) {
        this.cards.push(card);

        this.setTopCard(card)
        //this.pileSprite.spriteFrame = card.getComponent(cc.Sprite).spriteFrame;
        card.parent = null;
        return this.cards;
    }

    addCardToBottomPile(card: cc.Node) {
        this.cards.fill(card, 0, 1);
        return this.cards;
    }

    getCards() {
        return this.cards.getCards();
    }

    setTopCard(card: cc.Node) {
        if (card != null) {
            this.topId = card.getComponent(Card)._cardId
            this.pileSprite.spriteFrame = card.getComponent(Card).frontSprite
        } else {
            this.topId = null
            this.pileSprite.spriteFrame = null
        }
    }

    removeFromPile(card: cc.Node) {
        this.cards.splice(this.cards.indexOf(card), 1)
        if (card.getComponent(Card)._cardId == this.topId) {
            if (this.cards.length > 0) {
                this.setTopCard(this.cards[this.cards.length - 1])
            } else {
                this.setTopCard(null)
            }
        }
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.cards = new CardSet();
        this.pileSprite = this.node.getComponent(cc.Sprite);
        this.node.on(cc.Node.EventType.TOUCH_START, async () => {
            await CardPreviewManager.getPreviews(Array.of(this.node), true)
        })
    }

    start() {

    }

    // update (dt) {}
}
