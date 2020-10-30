import { ITEM_TYPE } from "../../Constants";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";

export default interface IEffectDataConcurency {
    runDataConcurency(newEffectData: ActiveEffectData | PassiveEffectData, numOfEffect: number, type: ITEM_TYPE, sendToServer: boolean)
}
