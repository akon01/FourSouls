import Card from "../../Entites/GameEntities/Card";
import CardManager from "../../Managers/CardManager";
import PlayerDeath from "../Player Death";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


export default class ServerPlayerDeath implements ServerStackEffectInterface {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;

    playerToDieCardId: number;
    killerId: number

    constructor(stackEffect: PlayerDeath) {
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.playerToDieCardId = stackEffect.playerToDie.character.getComponent(Card)._cardId
        this.stackEffectType = stackEffect.stackEffectType;
        this.killerId = stackEffect.killer.getComponent(Card)._cardId
    }



    convertToStackEffect() {
        let playerDeath = new PlayerDeath(this.creatorCardId, CardManager.getCardById(this.playerToDieCardId), CardManager.getCardById(this.killerId, true))
        return playerDeath;
    }

}
