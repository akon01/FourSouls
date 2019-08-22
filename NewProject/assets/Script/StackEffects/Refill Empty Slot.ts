import { CARD_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import Deck from "../Entites/GameEntities/Deck";
import Store from "../Entites/GameEntities/Store";
import MonsterCardHolder from "../Entites/MonsterCardHolder";
import MonsterField from "../Entites/MonsterField";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerRefillEmptySlot from "./ServerSideStackEffects/Server Reffill Empty Slot";
import StackEffectInterface from "./StackEffectInterface";
import { RefillEmptySlotVis } from "./StackEffectVisualRepresentation/Refill Empty Slot Vis";


export default class RefillEmptySlot implements StackEffectInterface {
    visualRepesentation: RefillEmptySlotVis;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.REFILL_EMPTY_SLOT;


    slotToFill: cc.Node
    slotType: CARD_TYPE


    constructor(creatorCardId: number, slotToFill: cc.Node, slotType: CARD_TYPE, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.slotToFill = slotToFill;
        this.slotType = slotType
        this.visualRepesentation = new RefillEmptySlotVis(this.slotType)
    }

    async putOnStack() {
        if (this.slotToFill != null) {
            cc.log(`${this.slotToFill.name} refill is put on the stack.`)
        }
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
    }

    async resolve() {
        cc.log('resolve Refill Empty slot')
        switch (this.slotType) {
            case CARD_TYPE.TREASURE:
                Store.$.addStoreCard(true)
                break;
            case CARD_TYPE.MONSTER:
                let newMonster = CardManager.monsterDeck.getComponent(Deck).drawCard(true)
                await MonsterField.addMonsterToExsistingPlace(this.slotToFill.getComponent(MonsterCardHolder).id, newMonster, true)
                break;
            default:
                break;
        }
    }

    convertToServerStackEffect() {
        let serverRefillEmptySlot = new ServerRefillEmptySlot(this)
        return serverRefillEmptySlot
    }

}
