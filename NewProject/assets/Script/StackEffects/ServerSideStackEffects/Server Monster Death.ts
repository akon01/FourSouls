import Card from "../../Entites/GameEntities/Card";
import CardManager from "../../Managers/CardManager";
import MonsterDeath from "../Monster Death";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


export default class ServerMonsterDeath implements ServerStackEffectInterface {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;

    monsterToDieCardId: number;
    killerId: number

    constructor(stackEffect: MonsterDeath) {
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.monsterToDieCardId = stackEffect.monsterToDie.node.getComponent(Card)._cardId
        this.stackEffectType = stackEffect.stackEffectType;
        this.killerId = stackEffect.killer.getComponent(Card)._cardId
    }



    convertToStackEffect() {
        let monsterDeath = new MonsterDeath(this.creatorCardId, CardManager.getCardById(this.monsterToDieCardId), CardManager.getCardById(this.killerId, true))
        return monsterDeath;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Monster Death\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.monsterToDieCardId) endString = endString + `Monster To Die:${CardManager.getCardById(this.monsterToDieCardId).name}\n`
        if (this.killerId) endString = endString + `Killer:${CardManager.getCardById(this.killerId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
