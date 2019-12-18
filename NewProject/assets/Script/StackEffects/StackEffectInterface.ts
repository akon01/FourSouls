
import { resolve } from "url";
import { STACK_EFFECT_TYPE } from "../Constants";
import { StackEffectVisualRepresentation } from "./StackEffectVisualRepresentation/Stack Vis Interface";


export default interface StackEffectInterface {

    entityId: number

    creatorCardId: number

    visualRepesentation: StackEffectVisualRepresentation

    isLockingStackEffect: boolean;

    stackEffectToLock: StackEffectInterface;

    hasLockingStackEffect: boolean

    hasLockingStackEffectResolved: boolean

    lockingStackEffect: StackEffectInterface

    LockingResolve: any;

    stackEffectType: STACK_EFFECT_TYPE;

    _lable: string;

    isToBeFizzled: boolean

    creationTurnId: number


    resolve()

    putOnStack()

    convertToServerStackEffect();

    checkForFizzle()

}

