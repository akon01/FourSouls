
import { _decorator, Component, Node, Enum } from 'cc';
import { Item } from '../../Entites/CardTypes/Item';
import { EffectTarget } from '../../Managers/EffectTarget';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { ChooseCard } from './ChooseCard';
import { DataCollector } from './DataCollector';
const { ccclass, property } = _decorator;

enum playerStuff {
    Loot,
    Coins,
    EternalItem,
    NonEternalItems
}

@ccclass('ExtractPlayerPool')
export class ExtractPlayerPool extends DataCollector {


    @property(ChooseCard)
    playerToExtractFromChooseCard: ChooseCard | null = null

    @property({ type: Enum(playerStuff) })
    playerStuffToGet: playerStuff = playerStuff.Loot

    async collectData(data: {
        cardPlayerId: number;
    }) {
        if (!this.playerToExtractFromChooseCard) {
            throw new Error("No Choose Card Set!!");
        }
        const playerChosenTarget = WrapperProvider.playerManagerWrapper.out.getPlayerByCard((await this.playerToExtractFromChooseCard?.collectData(data) as EffectTarget).effectTargetCard)!
        switch (this.playerStuffToGet) {
            case playerStuff.Coins:
                return new EffectTarget(playerChosenTarget.coins)
            case playerStuff.EternalItem:
                return new EffectTarget(playerChosenTarget.characterItem!)
            case playerStuff.Loot:
                return playerChosenTarget.getHandCards().map(c => new EffectTarget(c))
            case playerStuff.NonEternalItems:
                return [...playerChosenTarget.getPaidItems(), ...playerChosenTarget.getActiveItems(), ...playerChosenTarget.getPassiveItems()].filter(i => !i.getComponent(Item)?.eternal).map(c => new EffectTarget(c))
            default:
                throw new Error("Should Not Get Here ! Check Enum!");
        }
    }


}
