import { STACK_EFFECT_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Stack from "../Entites/Stack";
import PlayerManager from "../Managers/PlayerManager";
import ServerTakeDamage from "./ServerSideStackEffects/Server Take Damage";
import StackEffectInterface from "./StackEffectInterface";
import { TakeDamageVis } from "./StackEffectVisualRepresentation/Take Damage Vis";


export default class TakeDamage implements StackEffectInterface {


    visualRepesentation: TakeDamageVis
    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.TAKE_DAMAGE;

    entityToTakeDamageCard: cc.Node
    entityToDoDamageCard: cc.Node
    damage: number
    isMonsterTakeDamage: boolean
    isPlayerTakeDamage: boolean
    isMonsterDoDamage: boolean
    isPlayerDoDamage: boolean;

    constructor(creatorCardId: number, entityToTakeDamageCard: cc.Node, entityToDoDamageCard: cc.Node, damageToDo: number, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.entityToTakeDamageCard = entityToTakeDamageCard;
        if (this.entityToDoDamageCard.getComponent(Monster) != null) {
            this.isPlayerDoDamage = true
            this.isMonsterDoDamage = false;
        } else {
            this.isPlayerDoDamage = false;
            this.isMonsterDoDamage = true
        }
        this.entityToDoDamageCard = entityToDoDamageCard
        if (this.entityToDoDamageCard.getComponent(Monster) != null) {
            this.isPlayerTakeDamage = true
            this.isMonsterTakeDamage = false;
        } else {
            this.isPlayerDoDamage = false;
            this.isMonsterTakeDamage = true
        }
        this.damage = damageToDo
        this.visualRepesentation = new TakeDamageVis(this.damage, `${this.entityToDoDamageCard.name} is going to do ${this.damage} to ${this.entityToTakeDamageCard.name}`)
    }


    async putOnStack() {
        cc.log('put damage on stack')
        // let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        // turnPlayer.givePriority(true)
    }

    async resolve() {
        cc.log('resolve combat damage')
        switch (this.isPlayerTakeDamage) {
            case true:
                let player = PlayerManager.getPlayerByCard(this.entityToTakeDamageCard)
                await player.getHit(this.damage, true)
                if (player._Hp == 0) {
                    await player.killPlayer(true, true, this)
                }
                break;
            case false:
                player = PlayerManager.getPlayerByCard(this.entityToDoDamageCard);
                let monster = this.entityToTakeDamageCard.getComponent(Monster)
                await monster.getDamaged(this.damage, true)
                if (monster.currentHp == 0) {
                    await monster.kill(true, this)
                }
                break;
            default:
                break;
        }
    }

    convertToServerStackEffect() {
        let serverCombatDamage = new ServerTakeDamage(this)
        return serverCombatDamage
    }

}
