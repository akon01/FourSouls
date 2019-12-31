export class CardSet implements Iterable<cc.Node> {

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

    private cardSet: Set<cc.Node> = new Set();

    private cardArray: cc.Node[] = new Array()

    length: number = 0

    push(card: cc.Node) {
        if (this.cardSet.has(card)) {
            return false
        } else {
            this.cardArray.push(card)
            this.cardSet.add(card)
            this.length++
            return true
        }
    }

    filter(filterFun: (i) => any) {
        return this.cardArray.filter(filterFun)
    }

    includes(card: cc.Node) {
        if (this.cardArray.includes(card)) {
            return true
        }
        return flase
    }

    pop() {
        const card = this.cardArray.pop()
        this.cardSet.delete(card)
        this.length--
        return card
    }

    splice(cardIndex: number, deleteCount?: number) {
        const card = this.cardArray[cardIndex]
        if (card) {
            this.cardSet.delete(card)
            this.length--
            return this.cardArray.splice(cardIndex, deleteCount)
        }
    }

    indexOf(card: cc.Node) {
        return this.cardArray.indexOf(card)
    }

    map(mapFunc: (i) => any) {
        return this.cardArray.map(mapFunc)
    }

    unshift(card: cc.Node) {
        if (this.cardSet.has(card)) {
            return false
        } else {
            this.cardArray.unshift(card)
        }
    }

}
