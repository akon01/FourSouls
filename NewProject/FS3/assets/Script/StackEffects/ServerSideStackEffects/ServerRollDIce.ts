import { WrapperProvider } from "../../Managers/WrapperProvider";
import { RollDiceStackEffect } from "../RollDIce";
import { BaseServerStackEffect, ServerStackEffectInterface } from "./ServerStackEffectInterface";

export class ServerRollDiceStackEffect extends BaseServerStackEffect {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean = false;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean = false;
    lockingStackEffect: ServerStackEffectInterface | undefined;
    LockingResolve: any;
    lable: string


    numberRolled: number

    constructor(stackEffect: RollDiceStackEffect) {
        super()
        this.entityId = stackEffect.entityId;
        this.creatorCardId = stackEffect.creatorCardId;
        if (stackEffect.stackEffectToLock != null) {
            this.stackEffectToLock = stackEffect.stackEffectToLock.convertToServerStackEffect();
        }
        this.hasLockingStackEffect = stackEffect.hasLockingStackEffect;
        this.numberRolled = stackEffect.numberRolled
        this.stackEffectType = stackEffect.stackEffectType;
        this.lable = stackEffect._lable
    }



    convertToStackEffect() {
        let rollDice = new RollDiceStackEffect(this.creatorCardId, this.stackEffectToLock!.convertToStackEffect(), this.entityId, this.lable)
        rollDice.numberRolled = this.numberRolled;
        return rollDice;
    }


    toString() {
        let endString = `id:${this.entityId}\ntype: Roll Dice\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.numberRolled) endString = endString + `Number Rolled:${this.numberRolled}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
