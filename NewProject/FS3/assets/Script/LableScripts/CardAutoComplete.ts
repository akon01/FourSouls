import { Component, Label, log, Node, _decorator } from 'cc';
import { Card } from "../Entites/GameEntities/Card";
import { WrapperProvider } from '../Managers/WrapperProvider';
const { ccclass, property } = _decorator;


@ccclass('CardAutoComplete')
export class CardAutoComplete extends Component {



    @property(Label)
    label: Label | null = null;

    @property
    text: string = 'hello';

    getClosestCardByText(text: string) {
        log(`searching using ${text}`)
        const allCards = new Map<string, Node>()
        WrapperProvider.cardManagerWrapper.out.GetAllCards().forEach(card => allCards.set(card.getComponent(Card)!.cardName, card))
        let availalbleAnswers = new Map<string, Node>();
        allCards.forEach((card, cardName) => {
            if (cardName.toLowerCase().startsWith(text.toLowerCase())) {
                availalbleAnswers.set(cardName, card)
            }
        })
        log(`available answers`)
        log(availalbleAnswers)
        if (availalbleAnswers.size == 0) return null;
        if (availalbleAnswers.has(text)) {
            return availalbleAnswers.get(text)!
        }
        log(Array.from(availalbleAnswers.values()))
        return Array.from(availalbleAnswers.values())[0]
    }






    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}


    // update (dt) {}
}
