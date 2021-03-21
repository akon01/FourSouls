import { STACK_EFFECT_TYPE } from "../Constants";
import { ServerStackEffectInterface } from './ServerSideStackEffects/ServerStackEffectInterface';
import { StackEffectVisualRepresentation } from "./StackEffectVisualRepresentation/StackVisInterface";
interface StackEffectInterface {

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
    nonOriginal: boolean;

    previewId: number

    isSilent: boolean

    name: string;

    setLable(text: string, sendToServer: boolean): void



    resolve(): void

    putOnStack(): void

    convertToServerStackEffect(): ServerStackEffectInterface;

    checkForFizzle(): boolean

    fizzleThis(): void;

}

export type { StackEffectInterface };
