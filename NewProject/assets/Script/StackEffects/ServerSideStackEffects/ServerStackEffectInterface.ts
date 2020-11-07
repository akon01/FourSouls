
import { STACK_EFFECT_TYPE } from "../../Constants";


export default interface ServerStackEffectInterface {

    entityId: number

    creatorCardId: number

    isLockingStackEffect: boolean;

    stackEffectToLock: ServerStackEffectInterface;

    hasLockingStackEffect: boolean

    hasLockingStackEffectResolved: boolean

    lockingStackEffect: ServerStackEffectInterface

    LockingResolve: any;

    stackEffectType: STACK_EFFECT_TYPE;

    lable: string

    convertToStackEffect();

}

