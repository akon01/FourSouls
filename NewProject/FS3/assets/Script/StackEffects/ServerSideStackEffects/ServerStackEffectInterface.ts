import { STACK_EFFECT_TYPE } from "../../Constants";
import { StackEffectInterface } from '../StackEffectInterface';
interface ServerStackEffectInterface {
    entityId: number
    creatorCardId: number
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect: boolean
    hasLockingStackEffectResolved: boolean
    lockingStackEffect: ServerStackEffectInterface | undefined
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE;
    lable: string
    convertToStackEffect(): StackEffectInterface;
}
export type { ServerStackEffectInterface };

export class BaseServerStackEffect implements ServerStackEffectInterface {
    entityId!: number;
    creatorCardId!: number;
    isLockingStackEffect!: boolean;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect!: boolean;
    hasLockingStackEffectResolved!: boolean;
    lockingStackEffect: ServerStackEffectInterface | undefined;
    LockingResolve: any;
    stackEffectType!: STACK_EFFECT_TYPE;
    lable!: string;
    convertToStackEffect(): StackEffectInterface {
        throw new Error('Method not implemented.');
    }



















    /**
     *
     */
    constructor() {

    }

}
