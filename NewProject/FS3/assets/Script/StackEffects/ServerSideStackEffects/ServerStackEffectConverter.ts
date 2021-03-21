import { Node } from 'cc';
import { Effect } from '../../CardEffectComponents/CardEffects/Effect';
import { CARD_TYPE, STACK_EFFECT_TYPE } from "../../Constants";
import { CardEffect } from "../../Entites/CardEffect";
import { Player } from "../../Entites/GameEntities/Player";
import { ServerPassiveMeta } from "../../Managers/ServerPassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { ActivateItem } from "../ActivateItem";
import { ActivatePassiveEffect } from "../ActivatePassiveEffect";
import { AttackRoll } from "../AttackRoll";
import { CombatDamage } from "../CombatDamage";
import { DeclareAttack } from "../DeclareAttack";
import { MonsterDeath } from "../MonsterDeath";
import { MonsterEndDeath } from "../MonsterEndDeath";
import { MonsterRewardStackEffect } from "../MonsterReward";
import { PlayerDeath } from "../PlayerDeath";
import { PlayerDeathPenalties } from "../PlayerDeathPenalties";
import { PlayLootCardStackEffect } from "../PlayLootCard";
import { PurchaseItem } from "../PurchaseItem";
import { RefillEmptySlot } from "../RefillEmptySlot";
import { RollDiceStackEffect } from "../RollDIce";
import { StackEffectInterface } from "../StackEffectInterface";
import { StartTurnLoot } from "../StartTurnLoot";

export class ServerStackEffectConverter {



















    /**
     *
     */
    constructor() {

    }

    convertToStackEffect(serverStackEffectData: any): StackEffectInterface {
        const stackEffectType = serverStackEffectData.stackEffectType
        const converter = new ServerStackEffectConverter();

        switch (stackEffectType) {
            case STACK_EFFECT_TYPE.ACTIVATE_ITEM:

                const itemToActivate = WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.itemToPlayCardId, true)
                const charCard = WrapperProvider.playerManagerWrapper.out.getPlayerById(serverStackEffectData.itemPlayerId)!.character!;
                const activateItem = new ActivateItem(serverStackEffectData.creatorCardId, serverStackEffectData.hasLockingStackEffect, itemToActivate, charCard, serverStackEffectData.hasDataBeenCollectedYet, serverStackEffectData.entityId, serverStackEffectData.lable)
                activateItem.LockingResolve = serverStackEffectData.LockingResolve;
                if (serverStackEffectData.effectToDoData != null) {
                    activateItem.effectToDo = itemToActivate.getComponent(CardEffect)!.getEffectByNumAndType(serverStackEffectData.effectToDoData.index, serverStackEffectData.effectToDoData.type)
                }
                activateItem.hasLockingStackEffectResolved = serverStackEffectData.hasLockingStackEffectResolved
                return activateItem

            case STACK_EFFECT_TYPE.ATTACK_ROLL:
                const rollAttackDice = new AttackRoll(serverStackEffectData.creatorCardId, WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(serverStackEffectData.rollingPlayerCardId)!.node, WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.attackedMonsterCardId), serverStackEffectData.entityId, serverStackEffectData.lable)
                rollAttackDice.numberRolled = serverStackEffectData.numberRolled;
                return rollAttackDice;
            case STACK_EFFECT_TYPE.COMBAT_DAMAGE:
                let entityToDoDamageTo: Node;
                if (serverStackEffectData.isPlayerDoDamage) {
                    entityToDoDamageTo = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(serverStackEffectData.entityToDoDamageCardId)!.node
                } else {
                    entityToDoDamageTo = WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.entityToDoDamageCardId)
                }
                let entityToTakeDamageFrom: Node;
                if (serverStackEffectData.isPlayerTakeDamage) {
                    //  entityToTakeDamageFrom = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(serverStackEffectData.entityToTakeDamageCardId).node
                    entityToTakeDamageFrom = WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.entityToTakeDamageCardId)
                } else {
                    entityToTakeDamageFrom = WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.entityToTakeDamageCardId)
                }
                const combatDamage = new CombatDamage(serverStackEffectData.creatorCardId, entityToTakeDamageFrom, entityToDoDamageTo, serverStackEffectData.numberRolled, serverStackEffectData.entityId, serverStackEffectData.lable)

                return combatDamage;
            case STACK_EFFECT_TYPE.DECLARE_ATTACK:
                const declareAttack = new DeclareAttack(serverStackEffectData.creatorCardId, WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(serverStackEffectData.attackingPlayerCardId)!.getComponent(Player)!, WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.idOfCardBeingAttacked, true), serverStackEffectData.entityId, serverStackEffectData.lable)
                return declareAttack;
            case STACK_EFFECT_TYPE.MONSTER_DEATH:
                const monsterDeath = new MonsterDeath(serverStackEffectData.creatorCardId, WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.monsterToDieCardId), WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.killerId), serverStackEffectData.numberRolled, serverStackEffectData.entityId, serverStackEffectData.lable)
                return monsterDeath;
            case STACK_EFFECT_TYPE.MONSTER_END_DEATH:
                const monsterEndDeath = new MonsterEndDeath(serverStackEffectData.creatorCardId, WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.monsterWhoDiedCardId), serverStackEffectData.entityId, serverStackEffectData.lable)
                return monsterEndDeath;
            case STACK_EFFECT_TYPE.MONSTER_REWARD:
                const playerToReward = WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.playerCardIdToReward, true)
                const monster = WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.monsterCardWithRewardId)
                const monsterReward = new MonsterRewardStackEffect(serverStackEffectData.creatorCardId, monster, playerToReward, serverStackEffectData.numberRolled, serverStackEffectData.entityId, serverStackEffectData.lable)
                monsterReward.LockingResolve = serverStackEffectData.LockingResolve;
                monsterReward.hasLockingStackEffectResolved = serverStackEffectData.hasLockingStackEffectResolved
                return monsterReward
            case STACK_EFFECT_TYPE.PLAY_LOOT_CARD:
                const lootToPlay = WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.lootToPlayCardId, true)
                const playerCharacterCard = WrapperProvider.playerManagerWrapper.out.getPlayerById(serverStackEffectData.lootPlayerId)!.character!;

                const playLoot = new PlayLootCardStackEffect(serverStackEffectData.creatorCardId, serverStackEffectData.hasLockingStackEffect, lootToPlay, playerCharacterCard, serverStackEffectData.hasDataBeenCollectedYet, serverStackEffectData.hasLockingStackEffectResolved, serverStackEffectData.entityId, serverStackEffectData.lable)
                playLoot.LockingResolve = serverStackEffectData.LockingResolve;
                if (serverStackEffectData.effectToDo != null) {
                    playLoot.effectToDo = lootToPlay.getComponent(CardEffect)!.getEffectByNumAndType(serverStackEffectData.effectToDo.cardEffectNum, serverStackEffectData.effectToDo.effctType)
                }
                playLoot.hasLockingStackEffectResolved = serverStackEffectData.hasLockingStackEffectResolved
                return playLoot
            case STACK_EFFECT_TYPE.PURCHASE_ITEM:
                const purchaseItem = new PurchaseItem(serverStackEffectData.creatorCardId, WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.itemToPurchaseCardId, true), WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(serverStackEffectData.playerWhoBuysCardId)!.getComponent(Player)!.playerId, serverStackEffectData.entityId, serverStackEffectData.lable)
                return purchaseItem;
            case STACK_EFFECT_TYPE.REFILL_EMPTY_SLOT:
                let slotToFill: Node | null = null;
                if (serverStackEffectData.slotType == CARD_TYPE.MONSTER) {
                    slotToFill = WrapperProvider.monsterFieldWrapper.out.getMonsterPlaceById(serverStackEffectData.slotToFillId).node
                }
                if (serverStackEffectData.slotType == CARD_TYPE.TREASURE) {
                    slotToFill = null
                }
                const refillEmtySlot = new RefillEmptySlot(serverStackEffectData.creatorCardId, slotToFill, serverStackEffectData.slotType, serverStackEffectData.entityId, serverStackEffectData.lable)
                return refillEmtySlot;
            case STACK_EFFECT_TYPE.ROLL_DICE:
                const stackEffectToLock: StackEffectInterface = converter.convertToStackEffect(serverStackEffectData.stackEffectToLock)
                const rollDice = new RollDiceStackEffect(serverStackEffectData.creatorCardId, stackEffectToLock, serverStackEffectData.entityId, serverStackEffectData.lable)
                if (rollDice.hasLockingStackEffectResolved == true) {
                    rollDice.numberRolled = serverStackEffectData.numberRolled;
                }
                return rollDice;
            case STACK_EFFECT_TYPE.START_TURN_LOOT:
                const startLootTurn = new StartTurnLoot(serverStackEffectData.creatorCardId, WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.turnPlayerCardId, true), serverStackEffectData.entityId, serverStackEffectData.lable)
                return startLootTurn;
            case STACK_EFFECT_TYPE.ACTIVATE_PASSIVE_EFFECT:

                const card = WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.cardWithEffectId)
                let effect: Effect | null = null
                const index = serverStackEffectData.index
                // if (serverStackEffectData.effectPassiveMeta) {
                //     index =
                // } else {
                //     index = null
                // }
                if (serverStackEffectData.effectToDo) {
                    effect = card.getComponent(CardEffect)!.getEffectByNumAndType(serverStackEffectData.effectToDo.cardEffectNum, serverStackEffectData.effectToDo.effctType)!
                    //activatePassive.effectToDo = effect

                }
                if (!effect) { debugger; throw new Error("No Effect Found"); }

                const activatePassive = new ActivatePassiveEffect(serverStackEffectData.creatorCardId, serverStackEffectData.hasLockingStackEffect, serverStackEffectData.cardActivatorId, card, effect, serverStackEffectData.hasDataBeenCollectedYet, serverStackEffectData.isAfterActivation, index, serverStackEffectData.entityId, serverStackEffectData.lable)
                if (serverStackEffectData.hasDataBeenCollectedYet) {
                    card.getComponent(CardEffect)!.effectData = serverStackEffectData.effectCollectedData
                    activatePassive.effectCollectedData = serverStackEffectData.effectCollectedData
                }
                if (serverStackEffectData.effectPassiveMeta) {
                    const serverPassiveMeta = new ServerPassiveMeta();
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
                const playerDeath = new PlayerDeath(serverStackEffectData.creatorCardId, WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.playerToDieCardId), WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.killerId), serverStackEffectData.entityId, serverStackEffectData.lable)
                return playerDeath
            case STACK_EFFECT_TYPE.PLAYER_DEATH_PENALTY:
                const playerDeathPenalty = new PlayerDeathPenalties(serverStackEffectData.creatorCardId, WrapperProvider.cardManagerWrapper.out.getCardById(serverStackEffectData.playerToPayCardId), serverStackEffectData.entityId, serverStackEffectData.lable)
                return playerDeathPenalty
            default:
                throw new Error(`No Stack Effect Type Case Found For ${stackEffectType}`);
        }
    }

}
