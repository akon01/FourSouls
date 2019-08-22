import { CARD_TYPE } from "../../Constants";
import Store from "../../Entites/GameEntities/Store";
import MonsterCardHolder from "../../Entites/MonsterCardHolder";
import MonsterField from "../../Entites/MonsterField";
import RefillEmptySlot from "../Refill Empty Slot";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


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



    slotToFillId: number
    slotType: CARD_TYPE


    constructor(stackEffect: RefillEmptySlot) {
        this.entityId = stackEffect.entityId
        this.creatorCardId = stackEffect.creatorCardId;
        this.hasLockingStackEffect = stackEffect.hasLockingStackEffect;
        this.hasLockingStackEffectResolved = stackEffect.hasLockingStackEffectResolved;
        this.slotType = stackEffect.slotType;
        if (stackEffect.slotToFill.getComponent(MonsterCardHolder) != null) {
            this.slotToFillId = stackEffect.slotToFill.getComponent(MonsterCardHolder).id
        } else {
            if (stackEffect.slotToFill.getComponent(Store) != null) {
                this.slotToFillId = 0;
            }
        }
        this.slotType = stackEffect.slotType;
        this.stackEffectType = stackEffect.stackEffectType;
    }


    convertToStackEffect() {
        let slotToFill: cc.Node;
        if (this.slotType == CARD_TYPE.MONSTER) {
            slotToFill = MonsterField.getMonsterPlaceById(this.slotToFillId).node
        }
        if (this.slotType == CARD_TYPE.TREASURE) {
            slotToFill = Store.$.node;
        }
        let refillEmtySlot = new RefillEmptySlot(this.creatorCardId, slotToFill, this.slotType)
        return refillEmtySlot;
    }

}
