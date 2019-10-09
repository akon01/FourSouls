import CostInterface from "./CostInterface";
import Cost from "./Cost";
import Card from "../../Entites/GameEntities/Card";
import Effect from "../CardEffects/Effect";
import PlayerManager from "../../Managers/PlayerManager";
import ChooseCard from "../DataCollector/ChooseCard";
import { CHOOSE_CARD_TYPE } from "../../Constants";


const { ccclass, property } = cc._decorator;

@ccclass
export default class DestroyThisCost extends Cost {



    async takeCost() {
        let thisEffect = this.node.parent;
        let thisCard = thisEffect.getComponent(Effect)._effectCard
        let player = PlayerManager.getPlayerByCard(thisCard)
        await player.destroyItem(thisCard, true)
    }



}
