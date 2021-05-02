
import { _decorator, Component, Node } from 'cc';
import { Signal } from '../../Misc/Signal';
import { Condition } from '../CardEffectComponents/CardConditions/Condition';
import { Effect } from '../CardEffectComponents/CardEffects/Effect';
import { CardEffect } from '../Entites/CardEffect';
import { CardEffectTargetError } from '../Entites/Errors/CardEffectTargetError';
import { Card } from '../Entites/GameEntities/Card';
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';
import { WrapperProvider } from './WrapperProvider';
const { ccclass, property } = _decorator;

@ccclass('EffectRunner')
export class EffectRunner {
    static async runEffect(chosenEffect: Effect, stack: StackEffectInterface[], data?: any) {
        try {
            const serverEffectStack = await chosenEffect.doEffect(stack, data);
            const effectCard = chosenEffect.getEffectCard()!;
            const cardEffectComp = effectCard.getComponent(CardEffect)!
            try {
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
            } catch (error) {
                console.error(error)
                console.error("After Running Effect, Cant Find Effect By Index and Type, currnetly happens in trinkets always")
            }
            const passiveManager = WrapperProvider.passiveManagerWrapper.out
            if (chosenEffect.isOneTimeUse && [...passiveManager.oneTurnAfterEffects, passiveManager.oneTurnBeforeEffects].includes(chosenEffect)) {
                passiveManager.removeOneTurnPassiveEffect(chosenEffect, true)
            }
            return serverEffectStack
        } catch (error) {
            if (error instanceof CardEffectTargetError) {
                console.error(`Target Error Doing Effect: ${error.message} `, error.stack)
                console.error(`The Error Is Marked ${error.isOkToHappen} Ok To Happen`)
                console.error(`original Effect Data:`, error.originalEffectData)
                console.error(`original InGameStack:`, error.inGameStack)
            } else {
                debugger
                console.error(error)
                console.error(`i dont think i need to Be Here now!`)
            }
        }
        return null
    }

    static async testCondition(condition: Condition, conditionData: any) {
        if (!condition.isConditionActive) return false
        return await condition.testCondition(conditionData)
    }
}

