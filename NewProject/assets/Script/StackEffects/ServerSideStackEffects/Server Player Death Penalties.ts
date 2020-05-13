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
    lable: string;

    playerToPayCardId: number;

    constructor(stackEffect: PlayerDeathPenalties) {
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        this.playerToPayCardId = stackEffect.playerToPay.character.getComponent(Card)._cardId
        this.stackEffectType = stackEffect.stackEffectType;
        this.lable = stackEffect._lable
    }



    convertToStackEffect() {
        let playerDeathPenalties = new PlayerDeathPenalties(this.creatorCardId, CardManager.getCardById(this.playerToPayCardId), this.entityId, this.lable)
        return playerDeathPenalties;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Player Death Penalties\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.playerToPayCardId) endString = endString + `Player To Pay:${CardManager.getCardById(this.playerToPayCardId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }


}
