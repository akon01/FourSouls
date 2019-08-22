import { STACK_EFFECT_TYPE } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import TurnsManager from "../Managers/TurnsManager";
import ServerDeclareAttack from "./ServerSideStackEffects/Server Declare Attack";
import StackEffectInterface from "./StackEffectInterface";
import { DeclareAttackVis } from "./StackEffectVisualRepresentation/Declare Attack Vis";


export default class DeclareAttack implements StackEffectInterface {
    visualRepesentation: DeclareAttackVis;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.DECLARE_ATTACK;

    attackingPlayer: Player
    cardBeingAttacked: cc.Node


    constructor(creatorCardId: number, attackingPlayer: Player, cardBeingAttacked: cc.Node, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.attackingPlayer = attackingPlayer;
        this.cardBeingAttacked = cardBeingAttacked;
        this.visualRepesentation = new DeclareAttackVis(this.cardBeingAttacked.getComponent(cc.Sprite).spriteFrame)
        this.visualRepesentation.flavorText = `player ${this.attackingPlayer.playerId} has declared an attack on ${this.cardBeingAttacked.name}`
    }

    async putOnStack() {
        cc.log(`player ${this.attackingPlayer.playerId} has declared an attack on ${this.cardBeingAttacked.name}`)
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
    }


    async resolve() {
        cc.log('resolve declare attack')

        TurnsManager.currentTurn.attackPlays -= 1;
    }

    convertToServerStackEffect() {
        let serverDeclareAttack = new ServerDeclareAttack(this)
        return serverDeclareAttack
    }

}
