import { EffectTargetFactory } from '../../Managers/EffectTargetFactory';
import { _decorator } from 'cc';
import { Signal } from "../../../Misc/Signal";
import { ITEM_TYPE } from "../../Constants";
import { CardEffect } from "../../Entites/CardEffect";
import { Card } from "../../Entites/GameEntities/Card";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { DataInterpreter } from '../../Managers/DataInterpreter';
import { EffectTarget } from '../../Managers/EffectTarget';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { EffectDataConcurencyBase } from "./EffectDataConcurencyBase";
const { ccclass, property } = _decorator;


@ccclass('SaveCurrentActiveMonsters')
export class SaveCurrentActiveMonsters extends EffectDataConcurencyBase {
    @property
    isAddative: boolean = false
    runDataConcurency(newEffectData: ActiveEffectData | PassiveEffectData, numOfEffect: number, type: ITEM_TYPE, sendToServer: boolean) {
        //  const dataInterpreter = new DataInterpreter()
        const cardEffect = this.node.getComponent(CardEffect)!
        if (this.isAddative) {
            const targets = WrapperProvider.monsterFieldWrapper.out.getActiveMonsters()
            targets.forEach(nodeTarget => {
                cardEffect.concurentEffectData!.addTarget(WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(nodeTarget))
            });
        } else {
            cardEffect.concurentEffectData = newEffectData
        }
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.SET_CONCURENT_EFFECT_DATA, { cardId: this.node.getComponent(Card)!._cardId, numOfEffect, type, effectData: WrapperProvider.dataInerpreterWrapper.out.convertToServerData(newEffectData) })
        }
    }
}
