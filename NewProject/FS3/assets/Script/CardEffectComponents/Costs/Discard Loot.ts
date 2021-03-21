import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { CHOOSE_CARD_TYPE, CARD_TYPE } from "../../Constants";
import { CardManager } from "../../Managers/CardManager";
import { PlayerManager } from "../../Managers/PlayerManager";
import { ChooseCard } from "../DataCollector/ChooseCard";
import { Cost } from "./Cost";
import { PileManager } from "../../Managers/PileManager";
import { ChooseCardTypeAndFilter } from "../ChooseCardTypeAndFilter";
import { EffectTarget } from "../../Managers/EffectTarget";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('DiscardLootCost')
export class DiscardLootCost extends Cost {
    @property
    numOfLoot: number = 1;
    async takeCost() {
        let cardOwner = WrapperProvider.cardManagerWrapper.out.getCardOwner(this.node)
        if (cardOwner) {
            let player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardOwner)!
            let chosenLoot: Node | null = null

            const handCards = player.getHandCards();
            if (handCards.length == 1) {
                chosenLoot = handCards[0]
            } else {
                let chooseCard = new ChooseCard()
                chooseCard.flavorText = "Choose Loot To Discard"
                chooseCard.chooseType = new ChooseCardTypeAndFilter();
                chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.MY_HAND
                let chosenCard = await chooseCard.collectData({ cardPlayerId: player.playerId }) as EffectTarget
                chosenLoot = chosenCard.effectTargetCard
            }
            await player.loseLoot(chosenLoot, true)
            await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.LOOT, chosenLoot, true)
        };
    }
}