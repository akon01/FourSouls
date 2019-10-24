import { STACK_EFFECT_TYPE, PASSIVE_EVENTS, CHOOSE_CARD_TYPE } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import TurnsManager from "../Managers/TurnsManager";
import ServerDeclareAttack from "./ServerSideStackEffects/Server Declare Attack";
import StackEffectInterface from "./StackEffectInterface";
import { DeclareAttackVis } from "./StackEffectVisualRepresentation/Declare Attack Vis";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import CardManager from "../Managers/CardManager";
import Deck from "../Entites/GameEntities/Deck";
import ChooseCard from "../CardEffectComponents/DataCollector/ChooseCard";
import CardPreviewManager from "../Managers/CardPreviewManager";
import Monster from "../Entites/CardTypes/Monster";
import MonsterField from "../Entites/MonsterField";
import BattleManager from "../Managers/BattleManager";
import MonsterCardHolder from "../Entites/MonsterCardHolder";


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

        let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_DECLARE_ATTACK, [], null, this.attackingPlayer.node)
        let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        passiveMeta.args = afterPassiveMeta.args;
        TurnsManager.currentTurn.attackPlays -= 1;

        let monsterField = cc
            .find("Canvas/MonsterField")
            .getComponent(MonsterField);
        let monsterId;
        let monsterDeck = CardManager.monsterDeck.getComponent(Deck);
        let monsterCardHolder: MonsterCardHolder;
        let attackedMonster;
        let newMonster = this.cardBeingAttacked;
        if (this.cardBeingAttacked == monsterDeck.topBlankCard) {
            cc.log(`chosen card is top deck ${this.cardBeingAttacked.name}`)
            let chooseCard = new ChooseCard();
            newMonster = monsterDeck.drawCard(true);
            CardPreviewManager.getPreviews(Array.of(newMonster), true)
            CardPreviewManager.showToOtherPlayers(newMonster);
            chooseCard.chooseType = CHOOSE_CARD_TYPE.MONSTER_PLACES
            let monsterInSpotChosen = await chooseCard.collectData({ cardPlayerId: this.attackingPlayer.playerId })
            let activeMonsterSelected = monsterInSpotChosen.effectTargetCard.getComponent(Monster)
            cc.log(activeMonsterSelected.name)
            monsterCardHolder = MonsterField.getMonsterPlaceById(
                activeMonsterSelected.monsterPlace.id
            );
            await MonsterField.addMonsterToExsistingPlace(monsterCardHolder.id, newMonster, true)
            this.cardBeingAttacked = newMonster;
        }
        //if the drawn card is a non-monster play its effect
        if (this.cardBeingAttacked.getComponent(Monster).isNonMonster) {
            //  await this.attackingPlayer.activateCard(this.cardBeingAttacked, true)
            //if the drawn card is a monster, declare attack
        } else {
            await BattleManager.declareAttackOnMonster(this.cardBeingAttacked);
        }


        passiveMeta.result = null
        //do passive effects after!
        let thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
    }

    convertToServerStackEffect() {
        let serverDeclareAttack = new ServerDeclareAttack(this)
        return serverDeclareAttack
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Declare Attack\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.attackingPlayer) endString = endString + `Attacking Player:${this.attackingPlayer.name}\n`
        if (this.cardBeingAttacked) endString = endString + `Monster Being Attacked:${this.cardBeingAttacked.name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}
