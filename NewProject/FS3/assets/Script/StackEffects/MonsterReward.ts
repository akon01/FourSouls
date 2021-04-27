import { error, Node } from 'cc';
import { MonsterReward } from "../CardEffectComponents/MonsterRewards/MonsterReward";
import { PASSIVE_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import { Monster } from "../Entites/CardTypes/Monster";
import { Card } from "../Entites/GameEntities/Card";
import { Player } from "../Entites/GameEntities/Player";
import { PassiveMeta } from "../Managers/PassiveMeta";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { RollDiceStackEffect } from "./RollDIce";
import { ServerMonsterReward } from "./ServerSideStackEffects/ServerMonsterReward";
import { StackEffectConcrete } from "./StackEffectConcrete";
import { StackEffectInterface } from "./StackEffectInterface";
import { MonsterRewardVis } from "./StackEffectVisualRepresentation/MonsterRewardVis";


export class MonsterRewardStackEffect extends StackEffectConcrete {
    visualRepesentation: MonsterRewardVis;
    name = `MonsterDeath Reward`
    entityId!: number;
    creatorCardId!: number;
    isLockingStackEffect!: boolean;
    stackEffectToLock!: StackEffectInterface;
    hasLockingStackEffect!: boolean;
    hasLockingStackEffectResolved!: boolean;
    lockingStackEffect!: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.MONSTER_REWARD;
    _lable!: string;

    isToBeFizzled = false;

    creationTurnId!: number;

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    numberRolled: number | undefined
    nonOriginal = false;
    monsterWithReward: Monster
    monsterReward: MonsterReward;
    playerToReward: Player

    constructor(creatorCardId: number, monsterToGetRewardFrom: Node, playerToRewardCard: Node, numberRolled?: number, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)



        this.monsterWithReward = monsterToGetRewardFrom.getComponent(Monster)!
        if (this.monsterWithReward.monsterRewardDescription != null) {
            this.monsterReward = this.monsterWithReward.getReward()
        } else {
            this.monsterReward = this.monsterWithReward.getReward();
        }
        if (!this.monsterReward) { throw new Error(`No MonsterReward on ${this.monsterWithReward.name}`) }
        this.playerToReward = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerToRewardCard)!
        if (this.monsterReward.hasRoll) {
            this.hasLockingStackEffect = true;
            this.lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
            this.hasLockingStackEffectResolved = false
        }
        this.numberRolled = numberRolled
        this.visualRepesentation = new MonsterRewardVis(monsterToGetRewardFrom.getComponent(Monster)!)
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${this.playerToReward.playerId} Is Going To Get ${this.monsterWithReward.name}'s Reward`, false)
        }

    }

    async putOnStack() {
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.MONSTER_IS_KILLED, [this.numberRolled, this.monsterWithReward.killer], null, this.monsterWithReward.node, this.entityId)
        const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)

        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
        turnPlayer.givePriority(true)

        //add passive check for every time a monster dies.

    }

    async resolve() {
        if (this.hasLockingStackEffect) {
            await WrapperProvider.stackWrapper.out.addToStack(this.lockingStackEffect, true)
            this.monsterReward.rollNumber = this.LockingResolve;
        }
        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
        await this.monsterReward.rewardPlayer(this.playerToReward.node, true)
        const cardComp = this.monsterWithReward.node.getComponent(Card)!
        this.monsterWithReward._isDead = true
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.MONSTER_IS_KILLED, [], null, this.monsterWithReward.node, this.entityId)
        await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
        await WrapperProvider.stackWrapper.out.fizzleStackEffect(this, true, true)

        console.error(`after passive check, discard top monster or give souls card`)
        if (this.monsterWithReward.monsterPlace) {
            if (cardComp.souls == 0) {
                await this.monsterWithReward.monsterPlace.discardTopMonster(true)
                //await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.MONSTER, this.monsterWithReward.node, true);
            } else {
                await turnPlayer.receiveSoulCard(this.monsterWithReward.node, true)
            }
        }
        // await WrapperProvider.stackWrapper.out.fizzleStackEffect(this, true)
    }

    convertToServerStackEffect() {
        const serverMonsterReward = new ServerMonsterReward(this)
        return serverMonsterReward
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: MonsterReward\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.monsterWithReward) { endString = endString + `Monster With Reward:${this.monsterWithReward.name}\n` }
        if (this.monsterReward) { endString = endString + `Reward:${this.monsterReward.name}\n` }
        if (this.playerToReward) { endString = endString + `Player To Reward:${this.playerToReward.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
