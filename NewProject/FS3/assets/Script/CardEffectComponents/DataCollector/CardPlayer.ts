import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { COLLECTORTYPE } from "../../Constants";
import { PlayerManager } from "../../Managers/PlayerManager";
import { DataCollector } from "./DataCollector";
import { Player } from "../../Entites/GameEntities/Player";
import { EffectTarget } from "../../Managers/EffectTarget";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('CardPlayer')
export class CardPlayer extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'CardPlayer';
    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data: any) {
        let player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!;
        let playerCard = player.character!;
        let effectTarget = new EffectTarget(playerCard)
        return effectTarget
    }
}
