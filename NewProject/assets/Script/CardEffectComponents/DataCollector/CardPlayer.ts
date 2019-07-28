
import { COLLECTORTYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";
import Player from "../../Entites/GameEntities/Player";
import { EffectTarget } from "../../Managers/DataInterpreter";



const { ccclass, property } = cc._decorator;

@ccclass
export default class CardPlayer extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'CardPlayer';

    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data) {
        let player = PlayerManager.getPlayerById(data.cardPlayerId);
        let playerCard = player.getComponent(Player).character;
        let effectTarget = new EffectTarget(playerCard)
        let data2 = { cardPlayer: data.cardPlayerId }
        return effectTarget
    }

}
