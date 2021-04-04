import { Node, _decorator } from 'cc';
import { CHOOSE_CARD_TYPE } from '../../../Constants';
import { Item } from '../../../Entites/CardTypes/Item';
import { Player } from '../../../Entites/GameEntities/Player';
import { EffectTarget } from '../../../Managers/EffectTarget';
import { EffectTargetFactory } from '../../../Managers/EffectTargetFactory';
import { WrapperProvider } from '../../../Managers/WrapperProvider';
import { ChooseCardTypeAndFilter } from '../../ChooseCardTypeAndFilter';
import { ChooseAPlayerToChooseCards } from '../ChooseAPlayerToChooseCards';
import { DataCollector } from '../DataCollector';
const { ccclass, property } = _decorator;

@ccclass('RemoteDetonatorCollector')
export class RemoteDetonatorCollector extends DataCollector {
    collectorName = 'RemoteDetonatorCollector';

    async collectData(data: any) {
        const card = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
        const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(card)
        let ItemToChooseFrom: Node[] = []
        const players = WrapperProvider.playerManagerWrapper.out.players;
        players.forEach(player => {
            const playerComp = player.getComponent(Player)!;
            ItemToChooseFrom = ItemToChooseFrom.concat((playerComp.getDeskCards().filter(card => {
                if (!card.getComponent(Item)!.eternal) { return true; }
            }).filter(c => !(playerComp._curses.indexOf(c) >= 0))))
        })
        const chooseCard = new ChooseAPlayerToChooseCards();
        chooseCard.chooseType = new ChooseCardTypeAndFilter();
        chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS_NON_ETERNAL_ITEMS


        const chosenItems: Node[] = []

        for (const player of players.map(p => p.getComponent(Player)!)) {
            chosenItems.push(await this.getPlayerChoice(player, ItemToChooseFrom, chooseCard))
        }

        var frequency = {};  // array of frequency.
        var max = 0;  // holds the max frequency.
        var result;   // holds the max frequency element.
        for (var v in chosenItems) {
            //@ts-ignore
            frequency[chosenItems[v].uuid] = (frequency[chosenItems[v].uuid] || 0) + 1; // increment frequency.
            //@ts-ignore
            if (frequency[chosenItems[v].uuid] > max) { // is this frequency > max so far ?
                //@ts-ignore
                max = frequency[chosenItems[v].uuid];  // update max.
                result = chosenItems[v];          // update result.
            }
        }
        result = [];
        for (var key in frequency) {
            //@ts-ignore
            if (frequency[key] == max) {
                result.push(...chosenItems.filter(c => c.uuid == key));
            }
        }
        console.log(result);
        if (result.length > 1) {
            return null
            WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(WrapperProvider.cardManagerWrapper.out.lootDeck)
        } else {
            return WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(result[0])
        }

    }

    private async getPlayerChoice(player: Player, cardsToChooseFrom: Node[], dataCollector: ChooseAPlayerToChooseCards) {
        const retVal = (await dataCollector.getCardTargetFromPlayer(cardsToChooseFrom, player, 1))[0];
        return retVal.effectTargetCard
    }
}