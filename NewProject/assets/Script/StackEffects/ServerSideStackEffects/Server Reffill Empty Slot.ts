import { CARD_TYPE } from "../../Constants";
import Store from "../../Entites/GameEntities/Store";
import MonsterCardHolder from "../../Entites/MonsterCardHolder";
import MonsterField from "../../Entites/MonsterField";
import RefillEmptySlot from "../Refill Empty Slot";
import ServerStackEffectInterface from "./ServerStackEffectInterface";
import CardManager from "../../Managers/CardManager";


export default class ServerRefillEmptySlot implements ServerStackEffectInterface {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;
    lable: string;



    slotToFillId: number
    slotType: CARD_TYPE


    constructor(stackEffect: RefillEmptySlot) {
        this.entityId = stackEffect.entityId
        this.creatorCardId = stackEffect.creatorCardId;
        this.hasLockingStackEffect = stackEffect.hasLockingStackEffect;
        this.hasLockingStackEffectResolved = stackEffect.hasLockingStackEffectResolved;
        this.slotType = stackEffect.slotType;
        if (stackEffect.slotToFill) {
            this.slotToFillId = stackEffect.slotToFill.getComponent(MonsterCardHolder).id
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
        let slotToFill: cc.Node;
        if (this.slotType == CARD_TYPE.MONSTER) {
            slotToFill = MonsterField.getMonsterPlaceById(this.slotToFillId).node
        }
        if (this.slotType == CARD_TYPE.TREASURE) {
            slotToFill = Store.$.node;
        }
        let refillEmtySlot = new RefillEmptySlot(this.creatorCardId, slotToFill, this.slotType, this.entityId, this.lable)
        return refillEmtySlot;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Refill Slot\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.slotToFillId) endString = endString + `Slot To Fill:${MonsterField.getMonsterPlaceById(this.slotToFillId).name}\n`
        if (this.slotType) endString = endString + `Slot Type:${this.slotType}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
