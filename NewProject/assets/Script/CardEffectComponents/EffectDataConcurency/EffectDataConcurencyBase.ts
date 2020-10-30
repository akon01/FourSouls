import { ITEM_TYPE } from "../../Constants";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import IEffectDataConcurency from "./IEffectDataConcurency";


const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class EffectDataConcurencyBase extends cc.Component implements IEffectDataConcurency {
    abstract runDataConcurency(newEffectData: ActiveEffectData | PassiveEffectData, numOfEffect: number, type: ITEM_TYPE, sendToServer: boolean)

}
