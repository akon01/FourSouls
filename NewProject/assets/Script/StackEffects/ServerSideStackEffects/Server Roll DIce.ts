import RollDiceStackEffect from "../Roll DIce";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


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
    }



    convertToStackEffect() {
        let rollDice = new RollDiceStackEffect(this.creatorCardId, this.stackEffectToLock.convertToStackEffect())
        rollDice.numberRolled = this.numberRolled;
        return rollDice;
    }

}
