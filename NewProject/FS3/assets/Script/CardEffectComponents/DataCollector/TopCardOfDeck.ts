import { Enum, _decorator, Node } from 'cc';
import { CARD_TYPE, COLLECTORTYPE, TARGETTYPE } from "../../Constants";
import { Deck } from "../../Entites/GameEntities/Deck";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { EffectTarget } from "../../Managers/EffectTarget";
import { EffectTargetFactory } from '../../Managers/EffectTargetFactory';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from "./DataCollector";
const { ccclass, property } = _decorator;


@ccclass('TopCardOfDeck')
export class TopCardOfDeck extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'TopCardOfDeck';
    @property({ type: Enum(CARD_TYPE), visible: function (this: TopCardOfDeck) { return !this.isDeckFromDataCollector } })
    deckType: CARD_TYPE = CARD_TYPE.LOOT

    @property
    numOfCard: number = 1

    @property
    isDeckFromDataCollector: boolean = false

    @property({ type: DataCollector, visible: function (this: TopCardOfDeck) { return this.isDeckFromDataCollector } })
    dataCollectorToGetDeckFrom: DataCollector | null = null
    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    async collectData(data: any) {
        let deck: Deck | null = null
        if (this.isDeckFromDataCollector) {
            deck = (await this.dataCollectorToGetDeckFrom?.collectData(data) as EffectTarget).effectTargetCard.getComponent(Deck)!
        } else
            switch (this.deckType) {
                case CARD_TYPE.LOOT:
                    const lootDeck = WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck)!;
                    deck = lootDeck
                    //return WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(lootDeck.getCards()[lootDeck.getCardsLength() - 1])
                    break
                case CARD_TYPE.MONSTER:
                    const monsterDeck = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!;
                    deck = monsterDeck
                    break
                // return WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(monsterDeck.getCards()[monsterDeck.getCardsLength() - 1])
                case CARD_TYPE.TREASURE:
                    const treasueDeck = WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!;
                    deck = treasueDeck
                    break
                //return WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(treasueDeck.getCards()[treasueDeck.getCardsLength() - 1])
                default:
                    throw new Error("No Card Type Handler!");
            }
        const targets: EffectTarget[] = []
        for (let i = 0; i < this.numOfCard; i++) {
            targets.push(WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(deck.getCards()[deck.getCardsLength() - 1 - i]))
        }
        return targets
    }
}