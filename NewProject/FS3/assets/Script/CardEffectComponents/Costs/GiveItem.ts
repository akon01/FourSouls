import { _decorator, Node } from 'cc';
import { Card } from "../../Entites/GameEntities/Card";
import { Player } from '../../Entites/GameEntities/Player';
import { EffectTarget } from "../../Managers/EffectTarget";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { ChooseCard } from "../DataCollector/ChooseCard";
import { Cost } from "./Cost";
const { ccclass, property } = _decorator;


@ccclass('GiveItem')
export class GiveItem extends Cost {

    @property(ChooseCard)
    itemToGiveChooseCard: ChooseCard | null = null

    @property(ChooseCard)
    playerToGiveToChooseCard: ChooseCard | null = null

    async takeCost() {
        if (!this.itemToGiveChooseCard) {
            throw new Error("No item To Give Choose Card Set!");
        }
        if (!this.playerToGiveToChooseCard) {
            throw new Error("No Player To Give To Choose Card Set!");
        }
        let thisEffect = this.getThisEffect()
        let thisCard = thisEffect._effectCard!
        let cardComp = thisCard.getComponent(Card)!

        let player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!
        const playerToGiveTo = WrapperProvider.playerManagerWrapper.out.getPlayerByCard((await this.playerToGiveToChooseCard.collectData({ cardPlayerId: player.playerId }) as EffectTarget).effectTargetCard)!
        // let chooseCard = new ChooseCard();
        // chooseCard.flavorText = "Choose Item To Destroy"
        // chooseCard.chooseType = new ChooseCardTypeAndFilter();
        // chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.MY_ITEMS
        let chosenItems = await this.itemToGiveChooseCard.collectData({ cardPlayerId: player.playerId })
        if (Array.isArray(chosenItems)) {
            chosenItems.forEach(async (chosenItem: EffectTarget) => {
                await this.GiveItem(chosenItem.effectTargetCard, player, playerToGiveTo)
                //  await player.destroyItem(chosenItem.effectTargetCard, true)
            });
        } else {
            await this.GiveItem(chosenItems.effectTargetCard, player, playerToGiveTo)
        }
    }

    async GiveItem(itemToGive: Node, playerToGive: Player, playerToGet: Player) {
        await playerToGive.loseItem(itemToGive, true)
        await playerToGet.addItem(itemToGive, true, true)
    }

}
