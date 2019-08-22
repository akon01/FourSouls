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
import PlayerDeath from "../Player Death";


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

    constructor(stackEffect: PlayerDeath) {
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.playerToDieCardId = stackEffect.playerToDie.character.getComponent(Card)._cardId
        this.stackEffectType = stackEffect.stackEffectType;
    }



    convertToStackEffect() {
        let playerDeath = new PlayerDeath(this.creatorCardId, CardManager.getCardById(this.playerToDieCardId))
        return playerDeath;
    }

}
