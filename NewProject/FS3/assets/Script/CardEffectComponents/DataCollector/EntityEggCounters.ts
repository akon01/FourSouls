import { _decorator, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

import { COLLECTORTYPE, CARD_TYPE, TARGETTYPE } from "../../Constants";
import { PlayerManager } from "../../Managers/PlayerManager";
import { DataCollector } from "./DataCollector";
import { Player } from "../../Entites/GameEntities/Player";
import { EffectTarget } from "../../Managers/EffectTarget";
import { CardManager } from "../../Managers/CardManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { EffectTargetFactory } from '../../Managers/EffectTargetFactory';
import { IEggCounterable } from '../IEggCounterable';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { Monster } from '../../Entites/CardTypes/Monster';

@ccclass('EntityEggCounters')
export class EntityEggCounters extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'EntityEggCounters';


    @property({
        type: Node, visible: function (this: EntityEggCounters) {
            return this.isSpecificEntity
        }
    })
    specificEntity: Node | null = null

    @property
    isSpecificEntity = false

    @property({
        type: DataCollector, visible: function (this: EntityEggCounters) {
            return !this.isSpecificEntity
        }
    })
    dataCollectorToGetEntityFrom: DataCollector | null = null

    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    async collectData(data: ActiveEffectData | PassiveEffectData) {
        const entityToGetCountersFrom = this.isSpecificEntity ? this.specificEntity : await this.dataCollectorToGetEntityFrom?.collectData(data)// data.getTarget(TARGETTYPE.CARD) as Node
        if (!entityToGetCountersFrom) {
            throw new Error("No Entity To Get Counters From!");
        }

        let entityComp: IEggCounterable | null = null
        entityComp = entityToGetCountersFrom.getComponent(Monster)
        if (!entityComp) {
            entityComp = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(entityToGetCountersFrom)
        }
        return WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(entityComp!.getEggCounters()!)
    }
}
