import Card from "../../Entites/GameEntities/Card";
import CardManager from "../../Managers/CardManager";
import PlayerDeathPenalties from "../Player Death Penalties";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


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
