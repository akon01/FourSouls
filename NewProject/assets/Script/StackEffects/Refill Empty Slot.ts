import { CARD_TYPE, GAME_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import Deck from "../Entites/GameEntities/Deck";
import Store from "../Entites/GameEntities/Store";
import MonsterCardHolder from "../Entites/MonsterCardHolder";
import MonsterField from "../Entites/MonsterField";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerRefillEmptySlot from "./ServerSideStackEffects/Server Reffill Empty Slot";
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectInterface from "./StackEffectInterface";
import { RefillEmptySlotVis } from "./StackEffectVisualRepresentation/Refill Empty Slot Vis";
import { whevent } from "../../ServerClient/whevent";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

export default class RefillEmptySlot extends StackEffectConcrete {
    visualRepesentation: RefillEmptySlotVis;
    name = `Reffil Empty Slot`
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


    isToBeFizzled: boolean = false;

    creationTurnId: number

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        switch (this.slotType) {
            case CARD_TYPE.TREASURE:
                if (Store.storeCards.length == Store.maxNumOfItems && this.hasResolved == false) {
                    this.isToBeFizzled = true
                    return true
                }
                break;
            case CARD_TYPE.MONSTER:
                if (this.slotToFill.getComponent(MonsterCardHolder).activeMonster && this.hasResolved == false) {
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
    hasResolved: boolean = false;
    slotToFill: cc.Node
    slotType: CARD_TYPE

    constructor(creatorCardId: number, slotToFill: cc.Node, slotType: CARD_TYPE, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)
        this.slotToFill = slotToFill;
        this.slotType = slotType
        this.visualRepesentation = new RefillEmptySlotVis(this.slotType)
        let firstLableString;
        if (this.slotToFill) {
            this.name = `Reffil Empty Monster Slot`
            firstLableString = `Refill ${slotToFill.name} Slot`
        } else {
            this.name = `Reffil Empty Store Slot`
            firstLableString = `Refill Store slot`
        }
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(firstLableString, false)
        }
    }

    async putOnStack() {
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
    }

    async resolve(true) {
        this.hasResolved = true
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
