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

    toString() {
        let endString = `id:${this.entityId}\ntype: Player Death\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.playerToDieCardId) endString = endString + `Player To DIe:${CardManager.getCardById(this.playerToDieCardId).name}\n`
        if (this.killerId) endString = endString + `Killer:${CardManager.getCardById(this.killerId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
