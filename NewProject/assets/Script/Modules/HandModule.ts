import { CardLayout } from "../Entites/CardLayout";
import Card from "../Entites/GameEntities/Card";



export function setHandCards(handCards: cc.Node[], hand: CardLayout) {
    hand.layoutCards = handCards;
}

export function getHandCards(hand: CardLayout) {
    return hand.layoutCards;
}

export function addCardToCardLayout(card: cc.Node, layout: CardLayout, inHand: boolean) {

    let cardComp: Card = card.getComponent('Card');
    layout.addCardToLayout(card)
    // if (inHand) {
    //     cardComp.isInHand = true;
    // }



}

export function removeFromHand(card: cc.Node, hand: CardLayout) {

    for (let i = 0; i < hand.layoutCards.length; i++) {
        const handCard: cc.Node = hand.layoutCards[i];
        if (card == handCard) {
            hand.removeCardFromLayout(card)
            let handCardComp: Card = handCard.getComponent('Card')
            handCardComp.isInHand = false;
        }
    }
}

export function isInHand(card: cc.Node, hand: CardLayout): boolean {

    for (let i = 0; i < hand.layoutCards.length; i++) {
        const handCard = hand.layoutCards[i];
        if (handCard.name === card.name) {
            return true;
        }

    }
    return false;
}