import DataCollector from "../DataCollector";
import { COLLECTORTYPE } from "../../../Constants";
import PlayerManager from "../../../Managers/PlayerManager";
import { EffectTarget } from "../../../Managers/DataInterpreter";
import ChooseCard from "../ChooseCard";
import DiscardLoot from "../../CardEffects/DiscardLoot";





const { ccclass, property } = cc._decorator;

@ccclass
export default class TinyHandCollector extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'TinyHandCollector';

    @property(ChooseCard)
    chooseCard: ChooseCard = null

    @property(DiscardLoot)
    discardLoot: DiscardLoot = null

    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data) {
        let player = PlayerManager.getPlayerById(data.cardPlayerId);
        const numToDiscard = player.getHandCards().length - 2
        this.chooseCard.numOfCardsToChoose = numToDiscard;
        this.discardLoot.numOfLoot = numToDiscard;
    }

}
