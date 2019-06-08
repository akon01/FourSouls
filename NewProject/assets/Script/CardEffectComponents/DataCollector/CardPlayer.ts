
import { COLLECTORTYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";



const {ccclass, property} = cc._decorator;

@ccclass
export default class CardPlayer extends DataCollector {
    type= COLLECTORTYPE.AUTO;
    collectorName = 'CardPlayer';

    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data) {
        let data2 ={target:data.cardPlayerId}
        return data2
    }

}
