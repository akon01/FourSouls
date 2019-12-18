import StackEffectInterface from "./StackEffectInterface";
import { StackEffectVisualRepresentation } from "./StackEffectVisualRepresentation/Stack Vis Interface";
import { STACK_EFFECT_TYPE } from "../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StackEffectConcrete implements StackEffectInterface {

    entityId: number;
    creatorCardId: number;
    visualRepesentation: StackEffectVisualRepresentation;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE;
    _lable: string;
    isToBeFizzled: boolean;
    creationTurnId: number;
    resolve() {
        throw new Error("Method not implemented.");
    }
    putOnStack() {
        throw new Error("Method not implemented.");
    }
    convertToServerStackEffect() {
        throw new Error("Method not implemented.");
    }
    checkForFizzle() {
        throw new Error("Method not implemented.");
    }



    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    // update (dt) {}
}
