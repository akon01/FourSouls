import { _decorator } from 'cc';
import { COLLECTORTYPE } from "../../Constants";
import { CardEffect } from '../../Entites/CardEffect';
import { Card } from '../../Entites/GameEntities/Card';
import { EffectTarget } from '../../Managers/EffectTarget';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { MultiEffectChoose } from '../MultiEffectChooser/MultiEffectChoose';
import { DataCollector } from "./DataCollector";
const { ccclass, property } = _decorator;


@ccclass('ChooseEffectFromCard')
export class ChooseEffectFromCard extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'ChooseEffectFromCard';

    @property(DataCollector)
    cardDataCollector: DataCollector | null = null

    @property({ visible: function (this: ChooseEffectFromCard) { return !this.isOnlyPaid } })
    isOnlyActives: boolean = false

    @property({ visible: function (this: ChooseEffectFromCard) { return !this.isOnlyActives } })
    isOnlyPaid: boolean = false
    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    async collectData(data: any) {
        if (!this.cardDataCollector) {
            throw new Error("No Card Data Collector!");
        }
        const cardToChooseFromEffectTarget = await this.cardDataCollector.collectData(data) as EffectTarget | EffectTarget[]
        let cardToChooseFrom: Card | null = null
        if (Array.isArray(cardToChooseFromEffectTarget)) {
            cardToChooseFrom = cardToChooseFromEffectTarget[0].effectTargetCard.getComponent(Card)!
        } else {
            cardToChooseFrom = cardToChooseFromEffectTarget.effectTargetCard.getComponent(Card)!
        }

        const cardEffectComp = cardToChooseFrom.getComponent(CardEffect)!;
        if (cardEffectComp.hasMultipleEffects) {

        }
        const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(this.getEffectCard())
        const multiEffectChoose = new MultiEffectChoose()
        if (this.isOnlyActives) {
            multiEffectChoose.isOnlyActives = true
        } else if (this.isOnlyPaid) {
            multiEffectChoose.isOnlyPaid = true
        }
        const chosenEffect = await multiEffectChoose.collectData({ cardPlayed: cardToChooseFrom.node, cardPlayerId: cardOwner!.playerId })
        return WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(chosenEffect)
    }
}
