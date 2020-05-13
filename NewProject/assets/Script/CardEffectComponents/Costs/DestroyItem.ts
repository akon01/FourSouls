import CostInterface from "./CostInterface";
import Cost from "./Cost";
import Card from "../../Entites/GameEntities/Card";
import Effect from "../CardEffects/Effect";
import PlayerManager from "../../Managers/PlayerManager";
import ChooseCard from "../DataCollector/ChooseCard";
import { CHOOSE_CARD_TYPE } from "../../Constants";
import ChooseCardTypeAndFilter from "../ChooseCardTypeAndFilter";


const { ccclass, property } = cc._decorator;

@ccclass
export default class DestroyItemCost extends Cost {



    async takeCost() {
        let thisEffect = this.node.parent;
        let thisCard = thisEffect.getComponent(Effect)._effectCard
        let cardComp = thisCard.getComponent(Card)
        let player = PlayerManager.getPlayerByCard(thisCard)
        let chooseCard = new ChooseCard();
        chooseCard.flavorText = "Choose Item To Destroy"
        chooseCard.chooseType = new ChooseCardTypeAndFilter();
        chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.MY_ITEMS
        let chosenItem = await chooseCard.collectData({ cardPlayerId: player.playerId })
        await player.destroyItem(chosenItem.effectTargetCard, true)
    }



}
