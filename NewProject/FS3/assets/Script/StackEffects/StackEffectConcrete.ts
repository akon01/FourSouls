import { _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { whevent } from "../../ServerClient/whevent";
import { GAME_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { BaseServerStackEffect } from './ServerSideStackEffects/ServerStackEffectInterface';
import { StackEffectInterface } from "./StackEffectInterface";
import { StackEffectVisualRepresentation } from "./StackEffectVisualRepresentation/StackVisInterface";


export class StackEffectConcrete implements StackEffectInterface {

    entityId: number;
    creatorCardId: number;
    visualRepesentation!: StackEffectVisualRepresentation;
    isLockingStackEffect!: boolean;
    stackEffectToLock!: StackEffectInterface;
    hasLockingStackEffect!: boolean;
    hasLockingStackEffectResolved!: boolean;
    lockingStackEffect!: StackEffectInterface;
    LockingResolve: any;
    stackEffectType!: STACK_EFFECT_TYPE;
    _lable!: string;
    isToBeFizzled!: boolean;
    creationTurnId: number;
    nonOriginal: boolean = false;
    previewId!: number;
    isSilent = false;
    name: string = 'Concrete'





















    setLable(text: string, sendToServer: boolean) {
        this._lable = text
        if (sendToServer) {
            whevent.emit(GAME_EVENTS.LABLE_CHANGE)
            WrapperProvider.serverClientWrapper.out.send(Signal.STACK_EFFECT_LABLE_CHANGE, { stackId: this.entityId, text: text })
        }
    }


    constructor(creatorCardId: number, entityId?: number) {
        if (entityId) {
            this.nonOriginal = true
            this.entityId = entityId
        } else {
            this.entityId = WrapperProvider.stackWrapper.out.getNextStackEffectId()
        }
        this.creatorCardId = creatorCardId;
        this.creationTurnId = WrapperProvider.turnsManagerWrapper.out.currentTurn!.turnId;
    }

    resolve() {
        throw new Error("Method not implemented.");
    }
    putOnStack() {
        throw new Error("Method not implemented.");
    }
    convertToServerStackEffect() {
        return new BaseServerStackEffect()
    }
    checkForFizzle(): boolean {
        if (this.isToBeFizzled) { return true }
        if (WrapperProvider.stackWrapper.out._currentStack.findIndex(se => { if (se.entityId == this.entityId) { return true } }) == -1) { return true }
        if (this.creationTurnId != WrapperProvider.turnsManagerWrapper.out.currentTurn!.turnId) { return true }
        return false
    }

    fizzleThis() {

    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    // update (dt) {}
}
