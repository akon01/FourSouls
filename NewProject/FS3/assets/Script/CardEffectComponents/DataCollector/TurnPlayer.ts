import { _decorator } from 'cc';
import { COLLECTORTYPE } from "../../Constants";
import { EffectTarget } from "../../Managers/EffectTarget";
import { TurnsManager } from "../../Managers/TurnsManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from "./DataCollector";
const { ccclass, property } = _decorator;


@ccclass('TurnPlayer')
export class TurnPlayer extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'TurnPlayer';
    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data: any) {
        const player = WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.getTurnPlayer()!
        const effectTarget = new EffectTarget(player.character!)
        return effectTarget
    }
}
