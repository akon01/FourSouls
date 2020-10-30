

import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import { ITEM_TYPE } from "../../Constants";
import CardEffect from "../../Entites/CardEffect";
import Card from "../../Entites/GameEntities/Card";
import DataInterpreter, { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import EffectDataConcurencyBase from "./EffectDataConcurencyBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SaveData extends EffectDataConcurencyBase {

    @property
    isAddative: boolean = false

    runDataConcurency(newEffectData: ActiveEffectData | PassiveEffectData, numOfEffect: number, type: ITEM_TYPE, sendToServer: boolean) {
        const thisCard = Card.getCardNodeByChild(this.node);
        const cardEffect = thisCard.getComponent(CardEffect)
        if (this.isAddative) {
            const targets = newEffectData.getAllTargets()
            targets.nodes.forEach(nodeTarget => {
                cardEffect.concurentEffectData.addTarget(nodeTarget)
            });
            targets.stackEffects.forEach(stackTargets => {
                cardEffect.concurentEffectData.addTarget(stackTargets)
            })
        } else {
            cardEffect.concurentEffectData = newEffectData
        }
        if (sendToServer) {
            const serverEffectData = DataInterpreter.convertToServerData(newEffectData)
            ServerClient.$.send(Signal.SET_CONCURENT_EFFECT_DATA, { cardId: thisCard.getComponent(Card)._cardId, numOfEffect, type, effectData: serverEffectData })
        }
    }


}
