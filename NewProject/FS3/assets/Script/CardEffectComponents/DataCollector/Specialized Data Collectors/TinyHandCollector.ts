import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { DataCollector } from "../DataCollector";
import { COLLECTORTYPE } from "../../../Constants";
import { PlayerManager } from "../../../Managers/PlayerManager";
import { EffectTarget } from "../../../Managers/EffectTarget";
import { ChooseCard } from "../ChooseCard";
import { DiscardLoot } from "../../CardEffects/DiscardLoot";
import { WrapperProvider } from '../../../Managers/WrapperProvider';

@ccclass('TinyHandCollector')
export class TinyHandCollector extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'TinyHandCollector';
    @property(ChooseCard)
    chooseCard: ChooseCard | null = null
    @property(DiscardLoot)
    discardLoot: DiscardLoot | null = null
    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data: any) {
        let player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!;
        const numToDiscard = player.getHandCards().length - 2
        if (!this.chooseCard) { debugger; throw new Error("No Choose CardSet"); }
        if (!this.discardLoot) { debugger; throw new Error("No Discard Set"); }
        this.chooseCard.numOfCardsToChoose = numToDiscard;
        this.discardLoot.numOfLoot = numToDiscard;
    }
}
