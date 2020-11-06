import Card from "./GameEntities/Card";

export class CardSet implements Iterable<cc.Node> {

    constructor() {
        this.cardSet = new Set();
        this.cardArray = new Array()
    }

    [Symbol.iterator](): Iterator<cc.Node, cc.Node, cc.Node> {
        return {
            next() {
                if (this.pointer < this.cardArray.length) {
                    return {
                        done: false, value: this.cardArray[this.pointer++]
                    }
                } else {
                    return { done: false, value: null }
                }
            }
        }
    }

    private pointer = 0

    private cardSet: Set<number> = null

    private cardArray: cc.Node[] = null

    length: number = 0

    fill(card: cc.Node, startIndex: number, endIndex: number) {
        if (this.cardSet.has(card.getComponent(Card)._cardId)) {
            return false;
        }
        this.cardArray = this.cardArray.fill(card, startIndex, endIndex)
        this.cardSet.add(card.getComponent(Card)._cardId)
        return true
    }

    push(card: cc.Node) {
        if (this.cardSet.has(card.getComponent(Card)._cardId)) {
            return false
        } else {
            this.cardArray.push(card)
            this.cardSet.add(card.getComponent(Card)._cardId)
            this.length++
            return true
        }
    }

    clear() {
        this.cardSet = new Set()
        this.cardArray = new Array()
        this.length = 0
    }

    set(cards: cc.Node[]) {
        this.clear()
        cards.forEach(card => {
            this.push(card)
        });
    }

    getCards() {
        return this.cardArray
    }

    filter(filterFun: (value:cc.Node,index?:number,array?:cc.Node[]) => unknown) {
        return this.cardArray.filter(filterFun)
    }

    includes(card: cc.Node) {
        if (this.cardArray.includes(card)) {
            return true
        }
        return false
    }

    getCard(index: number) {
        return this.cardArray[index]
    }

    pop() {
        const card = this.cardArray.pop()
        this.cardSet.delete(card.getComponent(Card)._cardId)
        this.length--
        return card
    }

    splice(cardIndex: number, deleteCount: number,newElemnt?:cc.Node) {
        let arrayMaxIndex = (this.cardArray.length==0)? 0:this.cardArray.length-1
        if(cardIndex>arrayMaxIndex){
            throw new Error("Card Index Is Larger Than Card Array Length")
        }
        for (let i = 0; i < deleteCount; i++) {
            arrayMaxIndex = (this.cardArray.length==0)? 0:this.cardArray.length-1
            var isLonger = (arrayMaxIndex<cardIndex+i)
            if(isLonger){
                break
            }
            const card = this.cardArray[cardIndex+i]
            if (card) {
                this.cardSet.delete(card.getComponent(Card)._cardId)
                this.length--      
                if(!newElemnt){
                    return this.cardArray.splice(cardIndex, deleteCount)
                }
            }
        }
        
        if(newElemnt){
            if(!this.cardSet.has(newElemnt.getComponent(Card)._cardId)){
                this.cardSet.add(newElemnt.getComponent(Card)._cardId)
                this.length++
                return this.cardArray.splice(cardIndex, deleteCount,newElemnt)
            }
            return this.cardArray.splice(cardIndex, deleteCount)
        }
    }

    indexOf(card: cc.Node) {
        return this.cardArray.indexOf(card)
    }

    map(mapFunc: (i: cc.Node) => any) {
        return this.cardArray.map(mapFunc)
    }

    unshift(card: cc.Node) {
        if (this.cardSet.has(card.getComponent(Card)._cardId)) {
            return false
        } else {
            this.cardArray.unshift(card)
        }
    }


}
