import { _decorator, Node, log } from 'cc';
import { PASSIVE_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import { Monster } from "../Entites/CardTypes/Monster";
import { Card } from "../Entites/GameEntities/Card";
import { Deck } from "../Entites/GameEntities/Deck";
import { Player } from "../Entites/GameEntities/Player";
import { PassiveMeta } from "../Managers/PassiveMeta";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { ServerDeclareAttack } from "./ServerSideStackEffects/ServerDeclareAttack";
import { StackEffectConcrete } from "./StackEffectConcrete";
import { StackEffectInterface } from "./StackEffectInterface";
import { DeclareAttackVis } from "./StackEffectVisualRepresentation/DeclareAttackVis";

export class DeclareAttack extends StackEffectConcrete {
    visualRepesentation: DeclareAttackVis;
    name = `Player DeclareAttack On Monster`
    entityId!: number;
    creatorCardId!: number;
    isLockingStackEffect!: boolean;
    stackEffectToLock!: StackEffectInterface;
    hasLockingStackEffect!: boolean;
    hasLockingStackEffectResolved!: boolean;
    lockingStackEffect!: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.DECLARE_ATTACK;
    _lable!: string;

    isToBeFizzled = false;

    creationTurnId!: number;

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        if (!(WrapperProvider.monsterFieldWrapper.out.getActiveMonsters().indexOf(this.cardBeingAttacked) >= 0)) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal = false;
    attackingPlayer: Player
    cardBeingAttacked: Node

    constructor(creatorCardId: number, attackingPlayer: Player, cardBeingAttacked: Node, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)

        this.attackingPlayer = attackingPlayer;
        this.cardBeingAttacked = cardBeingAttacked;
        this.visualRepesentation = new DeclareAttackVis(attackingPlayer, cardBeingAttacked, this.cardBeingAttacked.getComponent(Card)!.cardSprite!.spriteFrame!)
        this.visualRepesentation.flavorText = `player ${this.attackingPlayer.playerId} has declared an attack on ${this.cardBeingAttacked.name}`
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${this.attackingPlayer.playerId} declared attack on ${this.cardBeingAttacked.name}`, false)
        }
    }

    async putOnStack() {
        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
        turnPlayer.givePriority(true)
    }

    async resolve() {
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_DECLARE_ATTACK, [this.cardBeingAttacked], null, this.attackingPlayer.node, this.entityId)
        const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
        if (!afterPassiveMeta.continue) { return }
        passiveMeta.args = afterPassiveMeta.args;
        if (afterPassiveMeta.args) {
            this.cardBeingAttacked = afterPassiveMeta.args[0]
        }
        let usedPlayerTurnAttack = false
        //use player turn attack
        if (this.attackingPlayer.attackPlays > 0) {
            this.attackingPlayer.attackPlays -= 1;
            usedPlayerTurnAttack = true
        }
        //if player must attack use it also
        if (this.attackingPlayer._mustAttackPlays > 0) {
            this.attackingPlayer._mustAttackPlays -= 1
        }

        const monsterDeck = WrapperProvider.cardManagerWrapper.out.monsterDeck!.getComponent(Deck)!;
        let newMonster = this.cardBeingAttacked;
        //if the card was the mosnter deck
        if (this.cardBeingAttacked == monsterDeck.node) {
            //if the player must attack deck use it
            if (this.attackingPlayer._mustDeckAttackPlays > 0) {
                this.attackingPlayer._mustDeckAttackPlays -= 1
            }

            //if the player has an extra attack on the deck, and no more normal attacks was used, use it.
            if (this.attackingPlayer._attackDeckPlays > 0 && !usedPlayerTurnAttack) {
                this.attackingPlayer._attackDeckPlays -= 1
            }
            console.log(`chosen card is top deck ${this.cardBeingAttacked.name}`)
            newMonster = monsterDeck.drawCard(true);
            await WrapperProvider.monsterFieldWrapper.out.givePlayerChoiceToCoverPlace(newMonster.getComponent(Monster)!, this.attackingPlayer)
            this.cardBeingAttacked = newMonster;
        }
        const monsterComp = this.cardBeingAttacked.getComponent(Monster);
        //if the drawn card is a non-monster play its effect
        if (monsterComp && monsterComp.isNonMonster) {
            //  await this.attackingPlayer.activateCard(this.cardBeingAttacked, true)
            //if the drawn card is a monster, declare attack
        } else if (monsterComp && monsterComp.isMonsterWhoCantBeAttacked) {
            console.log(`is Monster Who Cant Be attacked!`)
            debugger
        } else {
            if (monsterComp && this.attackingPlayer._mustAttackMonsters.indexOf(monsterComp) >= 0) {
                this.attackingPlayer._mustAttackMonsters.splice(this.attackingPlayer._mustAttackMonsters.indexOf(monsterComp))
            }
            await WrapperProvider.battleManagerWrapper.out.declareAttackOnMonster(this.cardBeingAttacked, true);
            this.setLable(`Player ${this.attackingPlayer.playerId} Has Entered Battle with ${this.cardBeingAttacked.name}`, true)
        }
        await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
        passiveMeta.result = null
        //do passive effects after!
    }

    convertToServerStackEffect() {
        const serverDeclareAttack = new ServerDeclareAttack(this)
        return serverDeclareAttack
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: DeclareAttack\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.attackingPlayer) { endString = endString + `Attacking Player:${this.attackingPlayer.name}\n` }
        if (this.cardBeingAttacked) { endString = endString + `Monster Being Attacked:${this.cardBeingAttacked.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
