import { Component, Node, Sprite, _decorator } from 'cc';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { Card } from "./GameEntities/Card";
import { Deck } from "./GameEntities/Deck";
const { ccclass, property } = _decorator;


@ccclass('Pile')
export class Pile extends Component {
    @property
    cards: number[] = []

    @property
    topId = -1;

    @property
    pileSprite: Sprite | null = null;

    deck: Deck | null = null


    addCardToTopPile(card: Node) {
        this.cards.push(card.getComponent(Card)!._cardId);

        this.setTopCard(card)
        //this.pileSprite.spriteFrame = card.getComponent(Sprite).spriteFrame;
        card.active = false
        //card.parent = null;
        return this.cards;
    }

    addCardToBottomPile(card: Node) {
        this.cards.splice(0, 0, card.getComponent(Card)!._cardId);
        return this.cards;
    }

    getCards() {
        return this.cards.map(cid => WrapperProvider.cardManagerWrapper.out.getCardById(cid))
    }

    getTopCard() {
        return WrapperProvider.cardManagerWrapper.out.getCardById(this.topId);
    }

    setTopCard(card: Node | null) {
        if (card != null) {
            this.topId = card.getComponent(Card)!._cardId
            this.pileSprite!.spriteFrame = card.getComponent(Card)!.frontSprite!
        } else {
            this.topId = -1
            this.pileSprite!.spriteFrame = null
        }
    }

    removeFromPile(card: Node) {
        if (!card.active) {
            card.active = true
        }
        const cardComp = card.getComponent(Card)!;
        this.cards.splice(this.cards.indexOf(cardComp._cardId), 1)
        if (cardComp._cardId == this.topId) {
            if (this.cards.length > 0) {
                this.setTopCard(WrapperProvider.cardManagerWrapper.out.getCardById(this.cards[this.cards.length - 1]))
            } else {
                this.setTopCard(null)
            }
        }
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.cards = [];
        this.pileSprite = this.node.getComponent(Sprite);
        this.node.on(Node.EventType.TOUCH_START, async () => {
            await WrapperProvider.cardPreviewManagerWrapper.out.getPreviews(Array.of(this.node), true)
        })
    }



    // update (dt) {}
}
