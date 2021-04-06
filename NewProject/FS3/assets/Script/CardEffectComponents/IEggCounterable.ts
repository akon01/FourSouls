
import { _decorator, Component, Node } from 'cc';
import { Signal } from '../../Misc/Signal';
import { PASSIVE_EVENTS } from '../Constants';
import { Card } from '../Entites/GameEntities/Card';
import { PassiveMeta } from '../Managers/PassiveMeta';
import { WrapperProvider } from '../Managers/WrapperProvider';
const { ccclass, property } = _decorator;


export interface IEggCounterable {
    getEggCounters(): number
    addEggCounters(numToChange: number, sendToServer: boolean): Promise<void>
    removeEggCounters(numToChange: number, sendToServer: boolean): Promise<void>
}

export interface ICanHaveEggCounters {
    eggCounters: number
}

export const AddEggCounters = async (numOfCounters: number, hasEggCountersEntity: ICanHaveEggCounters, sendToServer: boolean, cardId?: number, methodScope?: Node) => {
    let passiveMeta: PassiveMeta | null = null
    if (sendToServer) {
        if (!(methodScope && cardId)) {
            throw new Error("No Method Scope And/Or CardId specified");

        }
        passiveMeta = new PassiveMeta(PASSIVE_EVENTS.EGG_COUNTER_ADDED, [numOfCounters], null, methodScope)
        const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
        if (!afterPassiveMeta.continue) {
            return
        }
    }
    hasEggCountersEntity.eggCounters += numOfCounters;
    if (sendToServer) {
        WrapperProvider.serverClientWrapper.out.send(Signal.ADD_EGG_COUNTER, { cardId: cardId, numOfCounters })
    }
}

export const RemoveEggCounters = async (numToChange: number, numOfCountersCurrently: number, hasEggCountersEntity: ICanHaveEggCounters, sendToServer: boolean, cardId?: number, methodScope?: Node) => {
    let passiveMeta: PassiveMeta | null = null
    if (sendToServer) {
        if (!(cardId && methodScope))
            throw new Error("No CardId And/Or MethodScope");

        passiveMeta = new PassiveMeta(PASSIVE_EVENTS.EGG_COUNTER_REMOVED, [numOfCountersCurrently, numToChange], null, methodScope)
        const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
        if (!afterPassiveMeta.continue) {
            return
        }
    }
    if (numToChange > 0) {
        numToChange = -1 * numToChange
    }
    hasEggCountersEntity.eggCounters += numToChange
    if (sendToServer) {
        await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta!)
        WrapperProvider.serverClientWrapper.out.send(Signal.REMOVE_EGG_COUNTER, { cardId: cardId })
    }
}
