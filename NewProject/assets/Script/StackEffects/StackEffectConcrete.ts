import { STACK_EFFECT_TYPE, GAME_EVENTS } from "../Constants";
import Stack from "../Entites/Stack";
import TurnsManager from "../Managers/TurnsManager";
import StackEffectInterface from "./StackEffectInterface";
import { StackEffectVisualRepresentation } from "./StackEffectVisualRepresentation/Stack Vis Interface";
import { whevent } from "../../ServerClient/whevent";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

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
    previewId: number
    isSilent = false;
    name: string = 'Concrete'

    setLable(text: string, sendToServer: boolean) {
        this._lable = text
        if (sendToServer) {
            whevent.emit(GAME_EVENTS.LABLE_CHANGE)
            ServerClient.$.send(Signal.STACK_EFFECT_LABLE_CHANGE, { stackId: this.entityId, text: text })
        }
    }


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
        if (this.isToBeFizzled) { return true }
        if (Stack._currentStack.findIndex(se => { if (se.entityId == this.entityId) { return true } }) == -1) { return true }
        if (this.creationTurnId != TurnsManager.currentTurn.turnId) { return true }
    }

    fizzleThis() {

    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    // update (dt) {}
}
