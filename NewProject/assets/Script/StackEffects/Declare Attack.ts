import ChooseCard from "../CardEffectComponents/DataCollector/ChooseCard";
import { CHOOSE_CARD_TYPE, GAME_EVENTS, PASSIVE_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Deck from "../Entites/GameEntities/Deck";
import Player from "../Entites/GameEntities/Player";
import MonsterCardHolder from "../Entites/MonsterCardHolder";
import MonsterField from "../Entites/MonsterField";
import Stack from "../Entites/Stack";
import BattleManager from "../Managers/BattleManager";
import CardManager from "../Managers/CardManager";
import CardPreviewManager from "../Managers/CardPreviewManager";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerDeclareAttack from "./ServerSideStackEffects/Server Declare Attack";
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectInterface from "./StackEffectInterface";
import { DeclareAttackVis } from "./StackEffectVisualRepresentation/Declare Attack Vis";
import ChooseCardTypeAndFilter from "../CardEffectComponents/ChooseCardTypeAndFilter";
import { whevent } from "../../ServerClient/whevent";
import Card from "../Entites/GameEntities/Card";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

export default class DeclareAttack extends StackEffectConcrete {
    visualRepesentation: DeclareAttackVis;
    name = `Player Declare Attack On Monster`
    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.DECLARE_ATTACK;
    _lable: string;

    isToBeFizzled: boolean = false;

    creationTurnId: number

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        if (!MonsterField.activeMonsters.includes(this.cardBeingAttacked)) {
            cc.log(this.cardBeingAttacked)
            cc.log(MonsterField.activeMonsters)
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal: boolean = false;
    attackingPlayer: Player
    cardBeingAttacked: cc.Node

    constructor(creatorCardId: number, attackingPlayer: Player, cardBeingAttacked: cc.Node, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)

        this.attackingPlayer = attackingPlayer;
        this.cardBeingAttacked = cardBeingAttacked;
        this.visualRepesentation = new DeclareAttackVis(attackingPlayer, cardBeingAttacked, this.cardBeingAttacked.getComponent(Card).cardSprite.spriteFrame)
        this.visualRepesentation.flavorText = `player ${this.attackingPlayer.playerId} has declared an attack on ${this.cardBeingAttacked.name}`
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${this.attackingPlayer.playerId} declared attack on ${this.cardBeingAttacked.name}`, false)
        }
    }

    async putOnStack() {
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
    }

    async resolve() {

        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_DECLARE_ATTACK, [], null, this.attackingPlayer.node, this.entityId)
        const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        if (!afterPassiveMeta.continue) { return }
        passiveMeta.args = afterPassiveMeta.args;
        if (TurnsManager.currentTurn.attackPlays > 0) {
            TurnsManager.currentTurn.attackPlays -= 1;
        }

        const monsterDeck = CardManager.monsterDeck.getComponent(Deck);
        let monsterCardHolder: MonsterCardHolder;
        let newMonster = this.cardBeingAttacked;
        if (this.cardBeingAttacked == monsterDeck.node) {
            cc.log(`chosen card is top deck ${this.cardBeingAttacked.name}`)
            if (TurnsManager.currentTurn.monsterDeckAttackPlays > 0 && TurnsManager.currentTurn.attackPlays == 0) {
                TurnsManager.currentTurn.monsterDeckAttackPlays = -1
            }
            const chooseCard = new ChooseCard();
            chooseCard.flavorText = "Choose A Monster To Cover"
            newMonster = monsterDeck.drawCard(true);
            await CardPreviewManager.getPreviews(Array.of(newMonster), true)
            CardPreviewManager.showToOtherPlayers(newMonster);
            chooseCard.chooseType = new ChooseCardTypeAndFilter()
            chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.MONSTER_PLACES
            const monsterInSpotChosen = await chooseCard.collectData({ cardPlayerId: this.attackingPlayer.playerId })
            const activeMonsterSelected = monsterInSpotChosen.effectTargetCard.getComponent(Monster)
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
            await BattleManager.declareAttackOnMonster(this.cardBeingAttacked, true);
        }
        this.setLable(`Player ${this.attackingPlayer.playerId} Has Entered Battle with ${this.cardBeingAttacked.name}`, true)

        passiveMeta.result = null
        //do passive effects after!
        const thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
    }

    convertToServerStackEffect() {
        const serverDeclareAttack = new ServerDeclareAttack(this)
        return serverDeclareAttack
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Declare Attack\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.attackingPlayer) { endString = endString + `Attacking Player:${this.attackingPlayer.name}\n` }
        if (this.cardBeingAttacked) { endString = endString + `Monster Being Attacked:${this.cardBeingAttacked.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
