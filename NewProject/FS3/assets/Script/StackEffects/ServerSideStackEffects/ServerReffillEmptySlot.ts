import { Node } from 'cc';
import { CARD_TYPE } from "../../Constants";
import { MonsterCardHolder } from "../../Entites/MonsterCardHolder";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { RefillEmptySlot } from "../RefillEmptySlot";
import { BaseServerStackEffect, ServerStackEffectInterface } from "./ServerStackEffectInterface";

export class ServerRefillEmptySlot extends BaseServerStackEffect {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean = false;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface | undefined;
    LockingResolve: any;
    lable: string;



    slotToFillId: number | null
    slotType: CARD_TYPE


    constructor(stackEffect: RefillEmptySlot) {
        super()
        this.entityId = stackEffect.entityId
        this.creatorCardId = stackEffect.creatorCardId;
        this.hasLockingStackEffect = stackEffect.hasLockingStackEffect;
        this.hasLockingStackEffectResolved = stackEffect.hasLockingStackEffectResolved;
        this.slotType = stackEffect.slotType;
        if (stackEffect.slotToFill) {
            this.slotToFillId = stackEffect.slotToFill.getComponent(MonsterCardHolder)!.id
        } else {
            this.slotToFillId = 0;
        }
        // if (stackEffect.slotToFill.getComponent(MonsterCardHolder) != null) {
        // } else {
        //     if (stackEffect.slotToFill.getComponent(Store) != null) {
        //         this.slotToFillId = 0;
        //     }
        // }
        this.slotType = stackEffect.slotType;
        this.stackEffectType = stackEffect.stackEffectType;
        this.lable = stackEffect._lable
    }


    convertToStackEffect() {
        let slotToFill: Node | null = null;
        if (this.slotType == CARD_TYPE.MONSTER) {
            slotToFill = WrapperProvider.monsterFieldWrapper.out.getMonsterPlaceById(this.slotToFillId!).node
        }
        if (this.slotType == CARD_TYPE.TREASURE) {
            slotToFill = WrapperProvider.storeWrapper.out.node;
        }
        if (!slotToFill) { debugger; throw new Error("No Slot To Fill"); }

        let refillEmtySlot = new RefillEmptySlot(this.creatorCardId, slotToFill, this.slotType, this.entityId, this.lable)
        return refillEmtySlot;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Refill Slot\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.slotToFillId) endString = endString + `Slot To Fill:${WrapperProvider.monsterFieldWrapper.out.getMonsterPlaceById(this.slotToFillId).name}\n`
        if (this.slotType) endString = endString + `Slot Type:${this.slotType}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
