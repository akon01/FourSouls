import { STACK_EFFECT_TYPE } from "../../Constants";
import Card from "../../Entites/GameEntities/Card";
import CardManager from "../../Managers/CardManager";
import StartTurnLoot from "../Start Turn Loot";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


export default class ServerStartTurnLoot implements ServerStackEffectInterface {
    stackEffectType: STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;



    turnPlayerCardId: number


    constructor(purchaseItemStackEffect: StartTurnLoot) {
        this.entityId = purchaseItemStackEffect.entityId;
        this.creatorCardId = purchaseItemStackEffect.creatorCardId;
        this.turnPlayerCardId = purchaseItemStackEffect.turnPlayer.character.getComponent(Card)._cardId
        this.stackEffectType = purchaseItemStackEffect.stackEffectType;
    }

    convertToStackEffect() {
        let startLootTurn = new StartTurnLoot(this.creatorCardId, CardManager.getCardById(this.turnPlayerCardId, true))
        return startLootTurn;
    }


}
