import { ITEM_TYPE } from "../../Constants";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import IdAndName from "../IdAndNameComponent";

export default interface IEffectDataConcurency {
    ConcurencyId: number
    setDataConcurencyId()
    runDataConcurency(newEffectData: ActiveEffectData | PassiveEffectData, numOfEffect: number, type: ITEM_TYPE, sendToServer: boolean)
}
