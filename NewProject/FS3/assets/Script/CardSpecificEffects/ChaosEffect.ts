
import { _decorator, Component, Node } from 'cc';
import { Effect } from '../CardEffectComponents/CardEffects/Effect';
import { Card } from '../Entites/GameEntities/Card';
import { Player } from '../Entites/GameEntities/Player';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';
const { ccclass, property } = _decorator;

@ccclass('ChaosEffect')
export class ChaosEffect extends Effect {


    async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

        const players = WrapperProvider.playerManagerWrapper.out.players;

        let playersData = players.map(player => {
            const playerComp = player.getComponent(Player)
            const playerCards = playerComp?.getHandCards().filter(c => !c.getComponent(Card)?.isGoingToBePlayed)!
            const playerId = playerComp?.playerId!
            const playerToGiveTo = playerId == players.length ? players[0].getComponent(Player)! : players[playerId].getComponent(Player)!
            return { player: playerComp, playerToGiveTo, cardsToGive: playerCards }
        })

        for (const playerData of playersData) {
            await this.giveCardsToOtherPlayer(playerData)
        }

        return stack
    }

    async giveCardsToOtherPlayer(data: { player: Player | null, playerToGiveTo: Player, cardsToGive: Node[] }) {
        for (const card of data.cardsToGive) {
            await data.player?.loseLoot(card, true)
            await WrapperProvider.cardManagerWrapper.out.moveCardTo(card, data.playerToGiveTo.hand?.node!, true, false)
            await data.playerToGiveTo.gainLoot(card, true)
        }
    }

}
