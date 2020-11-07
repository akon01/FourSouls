

import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import { ITEM_TYPE } from "../../Constants";
import CardEffect from "../../Entites/CardEffect";
import Card from "../../Entites/GameEntities/Card";
import MonsterField from "../../Entites/MonsterField";
import DataInterpreter, { ActiveEffectData, EffectTarget, PassiveEffectData } from "../../Managers/DataInterpreter";
import EffectDataConcurencyBase from "./EffectDataConcurencyBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SaveCurrentActiveMonsters extends EffectDataConcurencyBase {

    @property
    isAddative: boolean = false

    runDataConcurency(newEffectData: ActiveEffectData | PassiveEffectData, numOfEffect: number, type: ITEM_TYPE, sendToServer: boolean) {
        const cardEffect = this.node.getComponent(CardEffect)
        if (this.isAddative) {
            const targets = MonsterField.getActiveMonsters()
            targets.forEach(nodeTarget => {
                cardEffect.concurentEffectData.addTarget(new EffectTarget(nodeTarget))
            });
        } else {
            cardEffect.concurentEffectData = newEffectData
        }
        if (sendToServer) {
            ServerClient.$.send(Signal.SET_CONCURENT_EFFECT_DATA, { cardId: this.node.getComponent(Card)._cardId, numOfEffect, type, effectData: DataInterpreter.convertToServerData(newEffectData) })
        }
    }


}
