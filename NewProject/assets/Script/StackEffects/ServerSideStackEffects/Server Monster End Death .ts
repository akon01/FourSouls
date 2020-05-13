import Card from "../../Entites/GameEntities/Card";
import CardManager from "../../Managers/CardManager";
import MonsterEndDeath from "../Monster End Death";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


export default class ServerMonsterEndDeath implements ServerStackEffectInterface {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;
    lable: string

    monsterWhoDiedCardId: number;

    constructor(stackEffect: MonsterEndDeath) {
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.monsterWhoDiedCardId = stackEffect.monsterWhoDied.node.getComponent(Card)._cardId
        this.stackEffectType = stackEffect.stackEffectType;
        this.lable = stackEffect._lable
    }



    convertToStackEffect() {
        let monsterEndDeath = new MonsterEndDeath(this.creatorCardId, CardManager.getCardById(this.monsterWhoDiedCardId), this.entityId, this.lable)
        return monsterEndDeath;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Monster End Death\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.monsterWhoDiedCardId) endString = endString + `Monster Who Died:${CardManager.getCardById(this.monsterWhoDiedCardId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
