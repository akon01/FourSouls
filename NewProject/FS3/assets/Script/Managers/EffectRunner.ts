
import { _decorator, Component, Node } from 'cc';
import { Signal } from '../../Misc/Signal';
import { Effect } from '../CardEffectComponents/CardEffects/Effect';
import { CardEffect } from '../Entites/CardEffect';
import { Card } from '../Entites/GameEntities/Card';
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';
import { WrapperProvider } from './WrapperProvider';
const { ccclass, property } = _decorator;

@ccclass('EffectRunner')
export class EffectRunner {
    static async runEffect(chosenEffect: Effect, stack: StackEffectInterface[], data?: any) {
        const serverEffectStack = await chosenEffect.doEffect(stack, data);
        const effectCard = chosenEffect._effectCard!;
        const cardEffectComp = effectCard.getComponent(CardEffect)!
        const effectDetails = cardEffectComp.getEffectIndexAndType(chosenEffect);
        if (chosenEffect.hasDataConcurency) {
            chosenEffect.runDataConcurency(data, effectDetails.index, effectDetails.type, true)
        }
        if (chosenEffect.isContinuousEffect) {
            if (chosenEffect.markAsRunningOrNotRunning) {
                chosenEffect.effectRunning = true;
            } else {
                chosenEffect.effectRunning = false;
            }
            WrapperProvider.serverClientWrapper.out.send(Signal.MARK_EFFECT_AS_RUNNING, { cardId: effectCard.getComponent(Card)?._cardId, effectIndex: effectDetails.index, effectType: effectDetails.type, markBool: chosenEffect.markAsRunningOrNotRunning })
        }
        return serverEffectStack
    }
}

