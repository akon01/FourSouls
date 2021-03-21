import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { CardEffect } from "../../Entites/CardEffect";
import { PlayerManager } from "../../Managers/PlayerManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Effect } from "../CardEffects/Effect";
import { Cost } from "./Cost";

@ccclass('DestroyThis')
export class DestroyThis extends Cost {
    async takeCost() {
        let thisEffect = this.node.getComponent(CardEffect)!.getAllEffects().find(effect => effect.cost !== null && effect.cost.CostId == this.CostId)!;
        let thisCard = thisEffect._effectCard!
        let player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!
        await player.destroyItem(thisCard, true)
    }
}
