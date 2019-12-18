import { CARD_TYPE, GAME_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
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
    _lable: string;

    set lable(text: string) {
        this._lable = text
        if (!this.nonOriginal) { whevent.emit(GAME_EVENTS.LABLE_CHANGE) }
    }

    isToBeFizzled: boolean = false;

    creationTurnId: number

    checkForFizzle() {
        if (this.creationTurnId != TurnsManager.currentTurn.turnId) { return true }
        switch (this.slotType) {
            case CARD_TYPE.TREASURE:
                if (Store.storeCards.length == Store.maxNumOfItems) {
                    this.isToBeFizzled = true
                    return true
                }
                break;
            case CARD_TYPE.MONSTER:
                if (this.slotToFill.getComponent(MonsterCardHolder).activeMonster) {
                    this.isToBeFizzled = true
                    return true
                }
                break;
            default:
                break;
        }
        return false
    }

    nonOriginal: boolean = false;

    slotToFill: cc.Node
    slotType: CARD_TYPE

    constructor(creatorCardId: number, slotToFill: cc.Node, slotType: CARD_TYPE, entityId?: number) {
        if (entityId) {
            this.nonOriginal = true
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.creationTurnId = TurnsManager.currentTurn.turnId;
        this.slotToFill = slotToFill;
        this.slotType = slotType
        this.visualRepesentation = new RefillEmptySlotVis(this.slotType)
        if (this.slotToFill) {
            this.lable = `Refill ${slotToFill.name} slot`
        } else { this.lable = `Refill Store slot` }
    }

    async putOnStack() {
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
    }

    async resolve() {
        switch (this.slotType) {
            case CARD_TYPE.TREASURE:
                Store.$.addStoreCard(true)
                break;
            case CARD_TYPE.MONSTER:
                const newMonster = CardManager.monsterDeck.getComponent(Deck).drawCard(true)
                await MonsterField.addMonsterToExsistingPlace(this.slotToFill.getComponent(MonsterCardHolder).id, newMonster, true)
                break;
            default:
                break;
        }
    }

    convertToServerStackEffect() {
        const serverRefillEmptySlot = new ServerRefillEmptySlot(this)
        return serverRefillEmptySlot
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Refill Slot\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.slotToFill) { endString = endString + `Slot To Fill:${this.slotToFill.name}\n` }
        if (this.slotType) { endString = endString + `Slot Type:${this.slotType}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
