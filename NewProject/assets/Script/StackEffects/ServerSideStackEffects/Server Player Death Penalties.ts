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
import PlayerDeathPenalties from "../Player Death Penalties";


export default class ServerPlayerDeathPenalties implements ServerStackEffectInterface {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;

    playerToPayCardId: number;

    constructor(stackEffect: PlayerDeathPenalties) {
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.playerToPayCardId = stackEffect.playerToPay.character.getComponent(Card)._cardId
        this.stackEffectType = stackEffect.stackEffectType;
    }



    convertToStackEffect() {
        let playerDeathPenalties = new PlayerDeathPenalties(this.creatorCardId, CardManager.getCardById(this.playerToPayCardId))
        return playerDeathPenalties;
    }

}
