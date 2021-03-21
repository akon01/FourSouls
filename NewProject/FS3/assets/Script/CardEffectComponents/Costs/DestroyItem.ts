import { _decorator } from 'cc';
import { Card } from "../../Entites/GameEntities/Card";
import { EffectTarget } from "../../Managers/EffectTarget";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { ChooseCard } from "../DataCollector/ChooseCard";
import { Cost } from "./Cost";
const { ccclass, property } = _decorator;


@ccclass('DestroyItem')
export class DestroyItem extends Cost {

    @property(ChooseCard)
    itemToDestroyChooseCard: ChooseCard | null = null

    async takeCost() {
        if (!this.itemToDestroyChooseCard) {
            throw new Error("No item To Destroy Choose Card Set!");

        }
        let thisEffect = this.getThisEffect()
        let thisCard = thisEffect._effectCard!
        let cardComp = thisCard.getComponent(Card)!
        let player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!
        // let chooseCard = new ChooseCard();
        // chooseCard.flavorText = "Choose Item To Destroy"
        // chooseCard.chooseType = new ChooseCardTypeAndFilter();
        // chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.MY_ITEMS
        let chosen = await this.itemToDestroyChooseCard.collectData({ cardPlayerId: player.playerId })
        if (Array.isArray(chosen)) {
            chosen.forEach(async (chosenItem: EffectTarget) => {
                await player.destroyItem(chosenItem.effectTargetCard, true)
            });
        } else {
            await player.destroyItem(chosen.effectTargetCard, true)
        }
    }

}
