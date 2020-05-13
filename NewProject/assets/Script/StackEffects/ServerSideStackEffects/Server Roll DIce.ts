import RollDiceStackEffect from "../Roll DIce";
import ServerStackEffectInterface from "./ServerStackEffectInterface";
import CardManager from "../../Managers/CardManager";


export default class ServerRollDiceStackEffect implements ServerStackEffectInterface {
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


    numberRolled: number

    constructor(stackEffect: RollDiceStackEffect) {
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
        let rollDice = new RollDiceStackEffect(this.creatorCardId, this.stackEffectToLock.convertToStackEffect(), this.entityId, this.lable)
        rollDice.numberRolled = this.numberRolled;
        return rollDice;
    }


    toString() {
        let endString = `id:${this.entityId}\ntype: Roll Dice\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.numberRolled) endString = endString + `Number Rolled:${this.numberRolled}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
