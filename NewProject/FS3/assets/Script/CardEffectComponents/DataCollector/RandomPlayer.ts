import { _decorator } from 'cc';
import { COLLECTORTYPE } from "../../Constants";
import { Player } from '../../Entites/GameEntities/Player';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { DataCollector } from "./DataCollector";
const { ccclass, property } = _decorator;


@ccclass('RandomPlayer')
export class RandomPlayer extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'RandomPlayer';
    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data: any) {
        const players = WrapperProvider.playerManagerWrapper.out.players
        const rand = Math.random() * players.length
        const selectedPlayer = players[rand]
        const effectTarget = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(selectedPlayer.getComponent(Player)!.character!)
        return effectTarget
    }
}
