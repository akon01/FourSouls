
import { Node, _decorator } from 'cc';
import { Signal } from '../../../../Misc/Signal';
import { whevent } from '../../../../ServerClient/whevent';
import { GAME_EVENTS } from '../../../Constants';
import { Card } from '../../../Entites/GameEntities/Card';
import { Player } from '../../../Entites/GameEntities/Player';
import { EffectTarget } from '../../../Managers/EffectTarget';
import { EffectTargetFactory } from '../../../Managers/EffectTargetFactory';
import { WrapperProvider } from '../../../Managers/WrapperProvider';
import { DataCollector } from '../DataCollector';
const { ccclass, property } = _decorator;

@ccclass('ForgetMeNowCollector')
export class ForgetMeNowCollector extends DataCollector {
    playerId: number = -1;

    async collectData(data: { cardPlayerId: number }): Promise<any> {
        const playerManager = WrapperProvider.playerManagerWrapper.out;
        const players = playerManager.players.map(p => p.getComponent(Player)!)
        const targets: EffectTarget[] = []
        for (const player of players) {
            if (player.souls == 0) {
                continue
            }
            targets.push(...await this.getCardTargetFromPlayer(player.getSoulCards(), player, 1, "Choose Soul Card To Discard"))
        }

        return targets
    }


    private async getCardTargetFromPlayer(cardsToChooseFrom: Node[], targetPlayer: Player, numOfCardsToChoose: number, flavorText: string) {
        WrapperProvider.serverClientWrapper.out.send(Signal.MAKE_CHOOSE_FROM, {
            cards: cardsToChooseFrom.map(c => c.getComponent(Card)!._cardId), playerId: targetPlayer.playerId,
            numOfCardsToChoose, originPlayerId: this.playerId, flavorText: flavorText, isChooseFromPreviewManager: true
        })
        const chosenCardsIds = await this.waitForPlayerReaction()
        const targets: EffectTarget[] = []
        for (let index = 0; index < chosenCardsIds.length; index++) {
            const id = chosenCardsIds[index];
            const target = WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(WrapperProvider.cardManagerWrapper.out.getCardById(id, true));
            targets.push(target)
        }
        return targets;
    }
    waitForPlayerReaction(): Promise<number[]> {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.DID_CHOOSE_FROM, (cardsChosen: number[]) => {
                resolve(cardsChosen);
            });
        })
    }

}

