import { STACK_EFFECT_TYPE } from "../Constants";
import Stack from "../Entites/Stack";
import TurnsManager from "../Managers/TurnsManager";
import StackEffectInterface from "./StackEffectInterface";
import { StackEffectVisualRepresentation } from "./StackEffectVisualRepresentation/Stack Vis Interface";

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
    nonOriginal: boolean = false;


    constructor(creatorCardId: number, entityId?: number) {
        if (entityId) {
            this.nonOriginal = true
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }
        this.creatorCardId = creatorCardId;
        this.creationTurnId = TurnsManager.currentTurn.turnId;
    }

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
        cc.log(this)
        if (this.isToBeFizzled) { return true }
        if (Stack._currentStack.findIndex(se => { if (se.entityId == this.entityId) { return true } }) == -1) { return true }
        if (this.creationTurnId != TurnsManager.currentTurn.turnId) { return true }
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    // update (dt) {}
}
