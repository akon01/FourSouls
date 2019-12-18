
import { CARD_TYPE, STACK_EFFECT_TYPE } from "../../Constants";
import CardEffect from "../../Entites/CardEffect";
import Card from "../../Entites/GameEntities/Card";
import Player from "../../Entites/GameEntities/Player";
import Store from "../../Entites/GameEntities/Store";
import MonsterField from "../../Entites/MonsterField";
import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import ActivateItem from "../Activate Item";
import ActivatePassiveEffect from "../Activate Passive Effect";
import AttackRoll from "../Attack Roll";
import CombatDamage from "../Combat Damage";
import DeclareAttack from "../Declare Attack";
import MonsterDeath from "../Monster Death";
import MonsterEndDeath from "../Monster End Death";
import MonsterRewardStackEffect from "../Monster Reward";
import PlayLootCardStackEffect from "../Play Loot Card";
import PlayerDeath from "../Player Death";
import PlayerDeathPenalties from "../Player Death Penalties";
import PurchaseItem from "../Purchase Item";
import RefillEmptySlot from "../Refill Empty Slot";
import RollDiceStackEffect from "../Roll DIce";
import StackEffectInterface from "../StackEffectInterface";
import StartTurnLoot from "../Start Turn Loot";
import TakeDamage from "../Take Damage";
import { ServerPassiveMeta } from "../../Managers/PassiveManager";


export default class ServerStackEffectConverter {

    convertToStackEffect(serverStackEffectData): StackEffectInterface {
        let stackEffectType = serverStackEffectData.stackEffectType
        let converter = new ServerStackEffectConverter();

        switch (stackEffectType) {
            case STACK_EFFECT_TYPE.ACTIVATE_ITEM:

                let itemToActivate = CardManager.getCardById(serverStackEffectData.itemToPlayCardId, true)
                const charCard = PlayerManager.getPlayerById(serverStackEffectData.itemPlayerId).character;
                let activateItem = new ActivateItem(serverStackEffectData.creatorCardId, serverStackEffectData.hasLockingStackEffect, itemToActivate, charCard, serverStackEffectData.hasDataBeenCollectedYet, serverStackEffectData.entityId)
                activateItem.LockingResolve = serverStackEffectData.LockingResolve;
                if (serverStackEffectData.effectToDoData != null) {
                    activateItem.effectToDo = itemToActivate.getComponent(CardEffect).getEffectByNumAndType(serverStackEffectData.effectToDoData.index, serverStackEffectData.effectToDoData.type)
                }
                activateItem.hasLockingStackEffectResolved = serverStackEffectData.hasLockingStackEffectResolved
                return activateItem


            case STACK_EFFECT_TYPE.ATTACK_ROLL:
                let rollAttackDice = new AttackRoll(serverStackEffectData.creatorCardId, PlayerManager.getPlayerByCardId(serverStackEffectData.rollingPlayerCardId).node, CardManager.getCardById(serverStackEffectData.attackedMonsterCardId), serverStackEffectData.entityId)
                rollAttackDice.numberRolled = serverStackEffectData.numberRolled;
                return rollAttackDice;
            case STACK_EFFECT_TYPE.COMBAT_DAMAGE:
                let entityToDoDamageTo: cc.Node;
                if (serverStackEffectData.isPlayerDoDamage) {
                    entityToDoDamageTo = PlayerManager.getPlayerByCardId(serverStackEffectData.entityToDoDamageCardId).node
                } else {
                    entityToDoDamageTo = CardManager.getCardById(serverStackEffectData.entityToDoDamageCardId)
                }
                let entityToTakeDamageFrom: cc.Node;
                if (serverStackEffectData.isPlayerTakeDamage) {
                    entityToTakeDamageFrom = PlayerManager.getPlayerByCardId(serverStackEffectData.entityToTakeDamageCardId).node
                } else {
                    entityToTakeDamageFrom = CardManager.getCardById(serverStackEffectData.entityToTakeDamageCardId)
                }
                let combatDamage = new CombatDamage(serverStackEffectData.creatorCardId, entityToTakeDamageFrom, entityToDoDamageTo, serverStackEffectData.entityId)

                return combatDamage;
            case STACK_EFFECT_TYPE.DECLARE_ATTACK:
                let declareAttack = new DeclareAttack(serverStackEffectData.creatorCardId, PlayerManager.getPlayerByCardId(serverStackEffectData.attackingPlayerCardId).getComponent(Player), CardManager.getCardById(serverStackEffectData.idOfCardBeingAttacked, true), serverStackEffectData.entityId)
                return declareAttack;
            case STACK_EFFECT_TYPE.MONSTER_DEATH:
                let monsterDeath = new MonsterDeath(serverStackEffectData.creatorCardId, CardManager.getCardById(serverStackEffectData.monsterToDieCardId), serverStackEffectData.killerId, serverStackEffectData.entityId)
                return monsterDeath;
            case STACK_EFFECT_TYPE.MONSTER_END_DEATH:
                let monsterEndDeath = new MonsterEndDeath(serverStackEffectData.creatorCardId, CardManager.getCardById(serverStackEffectData.monsterWhoDiedCardId), serverStackEffectData.entityId)
                return monsterEndDeath;
            case STACK_EFFECT_TYPE.MONSTER_REWARD:
                let playerToReward = CardManager.getCardById(serverStackEffectData.playerCardIdToReward, true)
                const monster = CardManager.getCardById(serverStackEffectData.monsterCardWithRewardId)
                let monsterReward = new MonsterRewardStackEffect(serverStackEffectData.creatorCardId, monster, playerToReward, serverStackEffectData.entityId)
                monsterReward.LockingResolve = serverStackEffectData.LockingResolve;
                monsterReward.hasLockingStackEffectResolved = serverStackEffectData.hasLockingStackEffectResolved
                return monsterReward
            case STACK_EFFECT_TYPE.PLAY_LOOT_CARD:
                let lootToPlay = CardManager.getCardById(serverStackEffectData.lootToPlayCardId, true)
                const playerCharacterCard = PlayerManager.getPlayerById(serverStackEffectData.lootPlayerId).character;

                let playLoot = new PlayLootCardStackEffect(serverStackEffectData.creatorCardId, serverStackEffectData.hasLockingStackEffect, lootToPlay, playerCharacterCard, serverStackEffectData.hasDataBeenCollectedYet, serverStackEffectData.hasLockingStackEffectResolved, serverStackEffectData.entityId)
                playLoot.LockingResolve = serverStackEffectData.LockingResolve;
                if (serverStackEffectData.effectToDo != null) {
                    playLoot.effectToDo = lootToPlay.getComponent(CardEffect).getEffectByNumAndType(serverStackEffectData.effectToDo.cardEffectNum, serverStackEffectData.effectToDo.effctType)
                }
                playLoot.hasLockingStackEffectResolved = serverStackEffectData.hasLockingStackEffectResolved
                return playLoot
            case STACK_EFFECT_TYPE.PURCHASE_ITEM:
                let purchaseItem = new PurchaseItem(serverStackEffectData.creatorCardId, CardManager.getCardById(serverStackEffectData.itemToPurchaseCardId, true), PlayerManager.getPlayerByCardId(serverStackEffectData.playerWhoBuysCardId).getComponent(Player).playerId, serverStackEffectData.entityId)
                return purchaseItem;
            case STACK_EFFECT_TYPE.REFILL_EMPTY_SLOT:
                let slotToFill: cc.Node;
                if (serverStackEffectData.slotType == CARD_TYPE.MONSTER) {
                    slotToFill = MonsterField.getMonsterPlaceById(serverStackEffectData.slotToFillId).node
                }
                if (serverStackEffectData.slotType == CARD_TYPE.TREASURE) {
                    slotToFill = Store.$.node;
                }
                let refillEmtySlot = new RefillEmptySlot(serverStackEffectData.creatorCardId, slotToFill, serverStackEffectData.slotType, serverStackEffectData.entityId)
                return refillEmtySlot;
            case STACK_EFFECT_TYPE.ROLL_DICE:
                let stackEffectToLock: StackEffectInterface = converter.convertToStackEffect(serverStackEffectData.stackEffectToLock)
                let rollDice = new RollDiceStackEffect(serverStackEffectData.creatorCardId, stackEffectToLock, serverStackEffectData.entityId)
                if (rollDice.hasLockingStackEffectResolved == true) {
                    rollAttackDice.numberRolled = serverStackEffectData.numberRolled;
                }
                return rollDice;
            // case STACK_EFFECT_TYPE.TAKE_DAMAGE:
            //     let entityToDoDamage: cc.Node;
            //     if (serverStackEffectData.isPlayerDoDamage) {
            //         entityToDoDamageTo = PlayerManager.getPlayerByCardId(serverStackEffectData.entityToDoDamageCardId).node
            //     } else {
            //         entityToDoDamageTo = CardManager.getCardById(serverStackEffectData.entityToDoDamageCardId)
            //     }
            //     let entityToTakeDamage: cc.Node;
            //     if (serverStackEffectData.isPlayerTakeDamage) {
            //         entityToTakeDamageFrom = PlayerManager.getPlayerByCardId(serverStackEffectData.entityToTakeDamageCardId).node
            //     } else {
            //         entityToTakeDamageFrom = CardManager.getCardById(serverStackEffectData.entityToTakeDamageCardId)
            //     }
            //     let takeDamage = new TakeDamage(serverStackEffectData.creatorCardId, entityToTakeDamageFrom, entityToDoDamageTo, serverStackEffectData.damage, serverStackEffectData.entityId)
            //     return takeDamage;
            case STACK_EFFECT_TYPE.START_TURN_LOOT:
                let startLootTurn = new StartTurnLoot(serverStackEffectData.creatorCardId, CardManager.getCardById(serverStackEffectData.turnPlayerCardId, true), serverStackEffectData.entityId)
                return startLootTurn;
            case STACK_EFFECT_TYPE.ACTIVATE_PASSIVE_EFFECT:

                let card = CardManager.getCardById(serverStackEffectData.cardWithEffectId)
                let effect = null
                if (serverStackEffectData.effectToDo) {
                    effect = card.getComponent(CardEffect).getEffectByNumAndType(serverStackEffectData.effectToDo.cardEffectNum, serverStackEffectData.effectToDo.effctType)
                    if (serverStackEffectData.hasDataBeenCollectedYet) {
                        card.getComponent(CardEffect).effectData = serverStackEffectData.effectCollectedData
                    }
                }
                let index = serverStackEffectData.index
                // if (serverStackEffectData.effectPassiveMeta) {
                //     index = 
                // } else {
                //     index = null
                // }
                let activatePassive = new ActivatePassiveEffect(serverStackEffectData.creatorCardId, serverStackEffectData.hasLockingStackEffect, serverStackEffectData.cardActivatorId, card, effect, serverStackEffectData.hasDataBeenCollectedYet, serverStackEffectData.isAfterActivation, index, serverStackEffectData.entityId)
                if (serverStackEffectData.effectPassiveMeta) {
                    let serverPassiveMeta = new ServerPassiveMeta();
                    serverPassiveMeta.args = serverStackEffectData.effectPassiveMeta.args
                    serverPassiveMeta.methodScopeId = serverStackEffectData.effectPassiveMeta.methodScopeId
                    serverPassiveMeta.passiveEvent = serverStackEffectData.effectPassiveMeta.passiveEvent;
                    serverPassiveMeta.result = serverStackEffectData.effectPassiveMeta.result
                    serverPassiveMeta.preventMethod = serverStackEffectData.effectPassiveMeta.preventMethod;
                    serverPassiveMeta.scopeIsPlayer = serverStackEffectData.effectPassiveMeta.scopeIsPlayer
                    activatePassive.effectPassiveMeta = serverPassiveMeta.convertToPassiveMeta()
                }
                return activatePassive;
            case STACK_EFFECT_TYPE.PLAYER_DEATH:
                let playerDeath = new PlayerDeath(serverStackEffectData.creatorCardId, CardManager.getCardById(serverStackEffectData.playerToDieCardId), CardManager.getCardById(serverStackEffectData.killerId), serverStackEffectData.entityId)
                return playerDeath
            case STACK_EFFECT_TYPE.PLAYER_DEATH_PENALTY:
                let playerDeathPenalty = new PlayerDeathPenalties(serverStackEffectData.creatorCardId, CardManager.getCardById(serverStackEffectData.playerToPayCardId), serverStackEffectData.entityId)
                return playerDeathPenalty
            default:
                break;
        }
    }

}

