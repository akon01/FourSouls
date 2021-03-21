import { _decorator } from 'cc';
import { COLLECTORTYPE } from "../../../Constants";
import { Player } from "../../../Entites/GameEntities/Player";
import { CardManager } from "../../../Managers/CardManager";
import { EffectTarget } from "../../../Managers/EffectTarget";
import { PlayerManager } from "../../../Managers/PlayerManager";
import { WrapperProvider } from '../../../Managers/WrapperProvider';
import { ChooseCard } from "../ChooseCard";
import { DataCollector } from "../DataCollector";
const { ccclass, property } = _decorator;


@ccclass('GreedCollector')
export class GreedCollector extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'GreedCollector';
    _chooseCard: ChooseCard = new ChooseCard()
    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    async collectData(data: any) {
        const allPlayers = WrapperProvider.playerManagerWrapper.out.players.map(p => p.getComponent(Player)!)
        let mostMoneyPlayer: Player[] = []
        allPlayers.forEach(player => {
            if (mostMoneyPlayer.length == 0) {
                mostMoneyPlayer.push(player)
            } else {
                if (mostMoneyPlayer.map(p => p.coins).some(s => s < player.coins)) {
                    mostMoneyPlayer = mostMoneyPlayer.filter(playero => playero.coins < player.coins)
                    mostMoneyPlayer.push(player)
                }
            }
        })
        if (mostMoneyPlayer.length == 1) {
            return new EffectTarget(mostMoneyPlayer[0].node)
        } else {
            const chosen = await this._chooseCard.requireChoosingACard(mostMoneyPlayer.map(p => p.character!))
            return new EffectTarget(WrapperProvider.cardManagerWrapper.out.getCardById(chosen.cardChosenId))
        }
    }
}