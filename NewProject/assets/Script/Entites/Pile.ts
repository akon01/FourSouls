
const { ccclass, property } = cc._decorator;

@ccclass
export default class Pile extends cc.Component {

    @property
    private cards: cc.Node[] = [];

    @property
    topCard: cc.Node = null;

    @property
    pileSprite: cc.Sprite = null;


    addCardToTopPile(card: cc.Node) {
        this.cards.push(card);
        this.topCard = card;
        this.pileSprite.spriteFrame = card.getComponent(cc.Sprite).spriteFrame;
        card.parent = null;
        return this.cards;
    }

    addCardToBottomPile(card: cc.Node) {
        this.cards = this.cards.fill(card, 0, 1);
        return this.cards;
    }

    getCards() {
        return this.cards;
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.pileSprite = this.node.getComponent(cc.Sprite);
    }

    start() {

    }

    // update (dt) {}
}
