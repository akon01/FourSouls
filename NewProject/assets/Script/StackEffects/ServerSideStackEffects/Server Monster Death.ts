import StackEffectInterface from "../StackEffectInterface";
import Stack from "../../Entites/Stack";
import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import { ROLL_TYPE } from "../../Constants";
import ServerStackEffectInterface from "./ServerStackEffectInterface";
import RollDiceStackEffect from "../Roll DIce";
import AttackRoll from "../Attack Roll";
import Card from "../../Entites/GameEntities/Card";
import Player from "../../Entites/GameEntities/Player";
import MonsterDeath from "../Monster Death";


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

    constructor(stackEffect: MonsterDeath) {
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.monsterToDieCardId = stackEffect.monsterToDie.node.getComponent(Card)._cardId
        this.stackEffectType = stackEffect.stackEffectType;
    }



    convertToStackEffect() {
        let monsterDeath = new MonsterDeath(this.creatorCardId, CardManager.getCardById(this.monsterToDieCardId))
        return monsterDeath;
    }

}
