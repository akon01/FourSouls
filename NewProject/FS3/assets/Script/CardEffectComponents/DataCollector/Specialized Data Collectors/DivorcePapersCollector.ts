
import { _decorator, Component, Node } from 'cc';
import { Signal } from '../../../../Misc/Signal';
import { whevent } from '../../../../ServerClient/whevent';
import { CHOOSE_CARD_TYPE, GAME_EVENTS, PLAYER_FILTERS } from '../../../Constants';
import { Item } from '../../../Entites/CardTypes/Item';
import { Card } from '../../../Entites/GameEntities/Card';
import { Player } from '../../../Entites/GameEntities/Player';
import { EffectTarget } from '../../../Managers/EffectTarget';
import { WrapperProvider } from '../../../Managers/WrapperProvider';
import { PlayerFilter } from '../../ChooseCardFilters/PlayerFIlter';
import { ChooseCard } from '../ChooseCard';
import { DataCollector } from '../DataCollector';
const { ccclass, property } = _decorator;

@ccclass('DivorcePapersCollector')
export class DivorcePapersCollector extends DataCollector {
    playerId: number = -1;
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    async collectData(data: { cardPlayerId: number }): Promise<any> {
        const player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!
        this.playerId = data.cardPlayerId;
        const choosePlayerToChoose = new ChooseCard()
        choosePlayerToChoose.chooseType!.chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS
        choosePlayerToChoose.chooseType!.applyFilter = true;
        choosePlayerToChoose.chooseType!.componentName = "Character"
        const filter = new PlayerFilter()
        filter.filter = PLAYER_FILTERS.IS_NOT_ME
        choosePlayerToChoose.chooseType!.filterStatement = filter as any
        const playerToGive = WrapperProvider.playerManagerWrapper.out.getPlayerByCard((await choosePlayerToChoose.collectData(data) as EffectTarget).effectTargetCard)!
        const loots = playerToGive.getHandCards();
        const lootToGive = await this.getCardTargetFromPlayer(loots, playerToGive, Math.floor(loots.length / 2), "Choose loots To Give")
        const allItems = [...playerToGive.getPaidItems(), ...playerToGive.getActiveItems(), ...playerToGive.getPassiveItems()].filter(itemNode => !itemNode.getComponent(Item)?.eternal)
        const itemToGive = await this.getCardTargetFromPlayer(allItems, playerToGive, 1, "Choose An Item To Give")

        return [...lootToGive, itemToGive, new EffectTarget(playerToGive.character!)]
    }


    private async getCardTargetFromPlayer(cardsToChooseFrom: Node[], targetPlayer: Player, numOfCardsToChoose: number, flavorText: string) {
        WrapperProvider.serverClientWrapper.out.send(Signal.MAKE_CHOOSE_FROM, {
            cards: cardsToChooseFrom.map(c => c.getComponent(Card)!._cardId), playerId: targetPlayer.playerId,
            numOfCardsToChoose, originPlayerId: this.playerId, flavorText: flavorText
        })
        const chosenCardsIds = await this.waitForPlayerReaction()
        const targets: EffectTarget[] = []
        for (let index = 0; index < chosenCardsIds.length; index++) {
            const id = chosenCardsIds[index];
            const target = new EffectTarget(WrapperProvider.cardManagerWrapper.out.getCardById(id, true));
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

    start() {
        // [3]
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

