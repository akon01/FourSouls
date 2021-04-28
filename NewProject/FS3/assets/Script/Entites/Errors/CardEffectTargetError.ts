import { ActiveEffectData } from "../../Managers/ActiveEffectData";
import { PassiveEffectData, PassiveEffectDataType } from "../../Managers/PassiveEffectData";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";

export class CardEffectTargetError extends Error {
    isOkToHappen: boolean;
    originalEffectData: ActiveEffectData | PassiveEffectData | undefined;
    inGameStack: StackEffectInterface[];
    /**
     *
     */
    constructor(message: string, isOkToHappen: boolean, effectData: ActiveEffectData | PassiveEffectData | undefined, inGameStack: StackEffectInterface[]) {
        super(message);
        this.isOkToHappen = isOkToHappen
        this.originalEffectData = Object.assign({}, effectData)
        this.inGameStack = inGameStack

    }
}