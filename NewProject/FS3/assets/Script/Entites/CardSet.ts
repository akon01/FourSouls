import { _decorator, Node } from 'cc';
import { Card } from "./GameEntities/Card";

export class CardSet {

    constructor() {
        this.cardSet = new Set();
        this.cardArray = []
    }

    private pointer = 0

    private cardSet: Set<number> = new Set()

    private cardArray: Node[] = []

    length = 0

    fill(card: Node, startIndex: number, endIndex: number) {
        if (this.cardSet.has(card.getComponent(Card)!._cardId)) {
            return false;
        }
        this.cardArray = this.cardArray.fill(card, startIndex, endIndex)
        this.cardSet.add(card.getComponent(Card)!._cardId)
        return true
    }

    push(card: Node) {
        if (this.cardSet.has(card.getComponent(Card)!._cardId)) {
            return false
        } else {
            this.cardArray.push(card)
            this.cardSet.add(card.getComponent(Card)!._cardId)
            this.length++
            return true
        }
    }

    clear() {
        this.cardSet = new Set()
        this.cardArray = []
        this.length = 0
    }

    set(cards: Node[]) {
        this.clear()
        cards.forEach(card => {
            this.push(card)
        });
    }

    getCards() {
        return this.cardArray
    }

    filter(filterFun: (value: Node, index?: number, array?: Node[]) => unknown) {
        return this.cardArray.filter(filterFun)
    }

    includes(card: Node) {
        if (this.cardArray.indexOf(card) >= 0) {
            return true
        }
        return false
    }

    getCard(index: number) {
        return this.cardArray[index]
    }

    pop() {
        const card = this.cardArray.pop()
        this.cardSet.delete(card!.getComponent(Card)!._cardId)
        this.length--
        return card
    }

    splice(cardIndex: number, deleteCount: number, newElemnt?: Node) {
        let arrayMaxIndex = (this.cardArray.length == 0) ? 0 : this.cardArray.length - 1
        if (cardIndex > arrayMaxIndex) {
            throw new Error("Card Index Is Larger Than Card Array Length")
        }
        for (let i = 0; i < deleteCount; i++) {
            arrayMaxIndex = (this.cardArray.length == 0) ? 0 : this.cardArray.length - 1
            let isLonger = (arrayMaxIndex < cardIndex + i)
            if (isLonger) {
                break
            }
            const card = this.cardArray[cardIndex + i]
            if (card) {
                this.cardSet.delete(card.getComponent(Card)!._cardId)
                this.length--
                if (!newElemnt) {
                    return this.cardArray.splice(cardIndex, deleteCount)
                }
            }
        }

        if (newElemnt) {
            if (!this.cardSet.has(newElemnt.getComponent(Card)!._cardId)) {
                this.cardSet.add(newElemnt.getComponent(Card)!._cardId)
                this.length++
                return this.cardArray.splice(cardIndex, deleteCount, newElemnt)
            }
            return this.cardArray.splice(cardIndex, deleteCount)
        }
    }

    indexOf(card: Node) {
        return this.cardArray.indexOf(card)
    }

    map(mapFunc: (i: Node) => any) {
        return this.cardArray.map(mapFunc)
    }

    unshift(card: Node) {
        if (this.cardSet.has(card.getComponent(Card)!._cardId)) {
            return false
        } else {
            this.cardArray.unshift(card)
        }
    }


}
