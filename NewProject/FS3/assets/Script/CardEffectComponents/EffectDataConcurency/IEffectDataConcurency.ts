import { ITEM_TYPE } from "../../Constants";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
interface IEffectDataConcurency {
    ConcurencyId: number
    setDataConcurencyId(): void
    runDataConcurency(newEffectData: ActiveEffectData | PassiveEffectData, numOfEffect: number, type: ITEM_TYPE, sendToServer: boolean): void
}

export type { IEffectDataConcurency };
