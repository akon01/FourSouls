import { CHOOSE_CARD_TYPE } from "../../Constants";
import Card from "../../Entites/GameEntities/Card";
import { EffectTarget } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import ChooseCardTypeAndFilter from "../ChooseCardTypeAndFilter";
import ChooseCard from "../DataCollector/ChooseCard";
import Cost from "./Cost";


const { ccclass, property } = cc._decorator;

@ccclass
export default class DestroyItemCost extends Cost {



    async takeCost() {
        let thisEffect = this.getThisEffect()
        let thisCard = thisEffect._effectCard
        let cardComp = thisCard.getComponent(Card)
        let player = PlayerManager.getPlayerByCard(thisCard)
        let chooseCard = new ChooseCard();
        chooseCard.flavorText = "Choose Item To Destroy"
        chooseCard.chooseType = new ChooseCardTypeAndFilter();
        chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.MY_ITEMS
        let chosenItem = await chooseCard.collectData({ cardPlayerId: player.playerId }) as EffectTarget
        await player.destroyItem(chosenItem.effectTargetCard, true)
    }



}
