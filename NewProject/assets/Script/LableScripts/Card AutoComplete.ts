import CardManager from "../Managers/CardManager";
import Card from "../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardAutoComplete extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    getClosestCardByText(text: string) {
        cc.log(`searching using ${text}`)
        return CardAutoComplete.getClosestCardByTextStatic(text)
    }


    static getClosestCardByTextStatic(text: string) {

        const allCards = new Map<string, cc.Node>()
        CardManager.GetAllCards().forEach(card => allCards.set(card.getComponent(Card).cardName, card))
        let availalbleAnswers = new Map<string, cc.Node>();
        allCards.forEach((card, cardName) => {
            if (cardName.toLowerCase().startsWith(text.toLowerCase())) {
                availalbleAnswers.set(cardName, card)
            }
        })
        cc.log(`available answers`)
        cc.log(availalbleAnswers)
        if (availalbleAnswers.size == 0) return null;
        if (availalbleAnswers.has(text)) {
            return availalbleAnswers.get(text)
        }
        cc.log(Array.from(availalbleAnswers.values()))
        return Array.from(availalbleAnswers.values())[0]
    }



    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
