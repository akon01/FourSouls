import { CHOOSE_CARD_TYPE, CARD_TYPE } from "../../Constants";
import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import ChooseCard from "../DataCollector/ChooseCard";
import Cost from "./Cost";
import PileManager from "../../Managers/PileManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class DiscardLoot extends Cost {

    @property
    numOfLoot: number = 1;

    async takeCost() {
        let cardOwner = CardManager.getCardOwner(this.node.parent.parent)
        if (cardOwner) {
            let player = PlayerManager.getPlayerByCard(cardOwner)
            let chosenLoot: cc.Node
            if (player.handCards.length == 1) {
                chosenLoot = player.handCards[0]
            } else {
                let chooseCard = new ChooseCard()
                chooseCard.flavorText = "Choose Loot To Discard"
                chooseCard.chooseType = CHOOSE_CARD_TYPE.MY_HAND
                let chosenCard = await chooseCard.collectData({ cardPlayerId: player.playerId })
                chosenLoot = chosenCard.effectTargetCard
            }
            await player.loseLoot(chosenLoot, true)
            await PileManager.addCardToPile(CARD_TYPE.LOOT, chosenLoot, true)
        };
    }



}
