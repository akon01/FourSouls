import CardManager from "../Managers/CardManager";
import CardPreviewManager from "../Managers/CardPreviewManager";
import Card from "./GameEntities/Card";
import Deck from "./GameEntities/Deck";
import { CardSet } from "./Card Set";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Pile extends cc.Component {

    @property
    cards: number[] = []

    @property
    topId: number = null;

    @property
    pileSprite: cc.Sprite = null;

    @property({ visible: false })
    deck: Deck = null


    addCardToTopPile(card: cc.Node) {
        this.cards.push(card.getComponent(Card)._cardId);

        this.setTopCard(card)
        //this.pileSprite.spriteFrame = card.getComponent(cc.Sprite).spriteFrame;
        card.parent = null;
        return this.cards;
    }

    addCardToBottomPile(card: cc.Node) {
        this.cards.splice(0, 0, card.getComponent(Card)._cardId);
        return this.cards;
    }

    getCards() {
        return this.cards.map(cid => CardManager.getCardById(cid))
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
        const cardComp = card.getComponent(Card);
        this.cards.splice(this.cards.indexOf(cardComp._cardId), 1)
        if (cardComp._cardId == this.topId) {
            if (this.cards.length > 0) {
                this.setTopCard(CardManager.getCardById(this.cards[this.cards.length - 1]))
            } else {
                this.setTopCard(null)
            }
        }
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.cards = [];
        this.pileSprite = this.node.getComponent(cc.Sprite);
        this.node.on(cc.Node.EventType.TOUCH_START, async () => {
            await CardPreviewManager.getPreviews(Array.of(this.node), true)
        })
    }

    start() {

    }

    // update (dt) {}
}
