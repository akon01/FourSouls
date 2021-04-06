import { Node } from 'cc';
import { STACK_EFFECT_TYPE } from "../Constants";
import { Player } from "../Entites/GameEntities/Player";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { ServerStartTurnLoot } from "./ServerSideStackEffects/ServerStartTurnLoot";
import { StackEffectConcrete } from "./StackEffectConcrete";
import { StackEffectInterface } from "./StackEffectInterface";
import { StartTurnVis } from "./StackEffectVisualRepresentation/StartTurnVis";

export class StartTurnLoot extends StackEffectConcrete {
    visualRepesentation: StartTurnVis
    name = `StartTurnLoot Draw`
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.START_TURN_LOOT;
    entityId!: number;
    creatorCardId!: number;
    isLockingStackEffect!: boolean;
    stackEffectToLock!: StackEffectInterface;
    hasLockingStackEffect!: boolean;
    hasLockingStackEffectResolved!: boolean;
    lockingStackEffect!: StackEffectInterface;
    LockingResolve: any;
    _lable!: string;


    isToBeFizzled = false;

    creationTurnId!: number;

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        return false;
    }

    nonOriginal = false;

    turnPlayer: Player;

    constructor(creatorCardId: number, turnPlayerCard: Node, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)

        this.turnPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(turnPlayerCard)!
        this.visualRepesentation = new StartTurnVis(this.turnPlayer)
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${this.turnPlayer.playerId} Is About To Loot For Start Turn`, false)
        }
    }


    async putOnStack() {
        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
        turnPlayer.givePriority(true)

    }

    async resolve() {
        //  let cardToDraw = await WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck).drawCard(true)
        await this.turnPlayer.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true)
        this.setLable(`Player ${this.turnPlayer.playerId} Has Drawn Loot For Start Turn`, true)
    }

    convertToServerStackEffect() {
        const serverPlayLoot = new ServerStartTurnLoot(this);
        return serverPlayLoot;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: StartTurnLoot\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.turnPlayer) { endString = endString + `Turn Player: ${this.turnPlayer.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
