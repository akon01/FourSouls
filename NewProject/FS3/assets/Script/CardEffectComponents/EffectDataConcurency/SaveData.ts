import { EffectTargetFactory } from '../../Managers/EffectTargetFactory';
import { _decorator } from 'cc';
import { Signal } from "../../../Misc/Signal";
import { ServerClient } from "../../../ServerClient/ServerClient";
import { ITEM_TYPE } from "../../Constants";
import { CardEffect } from "../../Entites/CardEffect";
import { Card } from "../../Entites/GameEntities/Card";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { DataInterpreter } from "../../Managers/DataInterpreter";
import { EffectTarget } from '../../Managers/EffectTarget';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { EffectDataConcurencyBase } from "./EffectDataConcurencyBase";
const { ccclass, property } = _decorator;


@ccclass('SaveData')
export class SaveData extends EffectDataConcurencyBase {
    @property
    isAddative = false
    runDataConcurency(newEffectData: ActiveEffectData | PassiveEffectData, numOfEffect: number, type: ITEM_TYPE, sendToServer: boolean) {
        //  const dataInterpreter = new DataInterpreter()
        const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
        const cardEffect = thisCard.getComponent(CardEffect)!
        if (this.isAddative) {
            const targets = newEffectData.getAllTargets()
            targets.nodes.forEach(nodeTarget => {
                cardEffect.concurentEffectData!.addTarget(WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(nodeTarget))
            });
            targets.stackEffects.forEach(stackTargets => {
                cardEffect.concurentEffectData!.addTarget(WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(stackTargets))
            })
            targets.effects.forEach(effects => {
                cardEffect.concurentEffectData?.addTarget(WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(effects))
            })
            targets.numbers.forEach(numbers => {
                cardEffect.concurentEffectData?.addTarget(WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(numbers))
            })
        } else {
            cardEffect.concurentEffectData = newEffectData
        }
        if (sendToServer) {
            const serverEffectData = WrapperProvider.dataInerpreterWrapper.out.convertToServerData(newEffectData)
            WrapperProvider.serverClientWrapper.out.send(Signal.SET_CONCURENT_EFFECT_DATA, { cardId: thisCard.getComponent(Card)!._cardId, numOfEffect, type, effectData: serverEffectData })
        }
    }
}
