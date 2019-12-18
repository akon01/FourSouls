import Effect from "../CardEffectComponents/CardEffects/Effect";
import MultiEffectChoose from "../CardEffectComponents/MultiEffectChooser/MultiEffectChoose";
import MultiEffectChooseThenRoll from "../CardEffectComponents/MultiEffectChooser/MultiEffectChooseThenRoll";
import MultiEffectDestroyThisThenRoll from "../CardEffectComponents/MultiEffectChooser/MultiEffectDestroyThisThenRoll";
import MultiEffectRoll from "../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import { CARD_TYPE, GAME_EVENTS, ITEM_TYPE, PASSIVE_EVENTS, ROLL_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import Item from "../Entites/CardTypes/Item";
import Monster from "../Entites/CardTypes/Monster";
import Card from "../Entites/GameEntities/Card";
import Player from "../Entites/GameEntities/Player";
import { Logger } from "../Entites/Logger";
import MonsterField from "../Entites/MonsterField";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import PileManager from "../Managers/PileManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import RollDiceStackEffect from "./Roll DIce";
import ServerActivateItem from "./ServerSideStackEffects/Server Activate Item";
import StackEffectInterface from "./StackEffectInterface";
import { ActivateItemVis } from "./StackEffectVisualRepresentation/Activate Item Vis";
import StackEffectConcrete from "./StackEffectConcrete";

export default class ActivateItem extends StackEffectConcrete {
    visualRepesentation: ActivateItemVis;

    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ACTIVATE_ITEM;
    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    _lable: string;

    set lable(text: string) {
        this._lable = text
        if (!this.nonOriginal) { whevent.emit(GAME_EVENTS.LABLE_CHANGE) }
    }

    isToBeFizzled: boolean = false;

    creationTurnId: number

    checkForFizzle() {
        if (this.creationTurnId != TurnsManager.currentTurn.turnId) { return true }
        return false
    }

    nonOriginal: boolean = false;

    itemPlayer: Player;
    itemToActivate: cc.Node;
    effectToDo: Effect;
    hasDataBeenCollectedYet: boolean = false;

    constructor(creatorCardId: number, hasLockingStackEffect: boolean, itemToActivate: cc.Node, itemPlayerCard: cc.Node, hasDataBeenCollectedYet: boolean, entityId?: number) {
        super()
        if (entityId) {
            this.nonOriginal = true
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }
        this.creatorCardId = creatorCardId;
        this.creationTurnId = TurnsManager.currentTurn.turnId;
        this.hasLockingStackEffect = hasLockingStackEffect;
        if (this.hasLockingStackEffect) { this.hasLockingStackEffectResolved = false; }
        this.itemToActivate = itemToActivate;
        this.itemPlayer = PlayerManager.getPlayerByCard(itemPlayerCard)
        this.hasDataBeenCollectedYet = hasDataBeenCollectedYet;
        this.visualRepesentation = new ActivateItemVis(this.itemToActivate.getComponent(cc.Sprite).spriteFrame)
        this.lable = `Player ${this.itemPlayer.playerId} activated ${this.itemToActivate.name}`
    }

    async putOnStack() {

        const card = this.itemToActivate.getComponent(Card);
        const cardEffect = this.itemToActivate.getComponent(CardEffect)
        //let player choose effect b4 going in the stack
        if (cardEffect.hasMultipleEffects) {
            //if the card has multiple effects and the player needs to choose
            if (cardEffect.multiEffectCollector instanceof MultiEffectChoose) {
                const effectChosen = await cardEffect.multiEffectCollector.collectData({ cardPlayed: this.itemToActivate, cardPlayerId: this.itemPlayer.playerId })
                this.effectToDo = effectChosen;

            }
        } else {

            this.effectToDo = cardEffect.activeEffects[0].getComponent(Effect)
        }
        //if the effect is chosen already and the player needs to choose targets, let him now.
        if (this.effectToDo != null) {
            const collectedData = await cardEffect.collectEffectData(this.effectToDo, { cardId: this.itemToActivate.getComponent(Card)._cardId, cardPlayerId: this.itemPlayer.playerId })
            cardEffect.effectData = collectedData;
            this.hasDataBeenCollectedYet = true;
        }
        if (this.effectToDo) {
            const effectIndexType = cardEffect.getEffectIndexAndType(this.effectToDo)
            if (this.itemToActivate.getComponent(Item) != null && effectIndexType.type == ITEM_TYPE.ACTIVE) {
                this.itemToActivate.getComponent(Item).useItem(true)
            }
        } else {
            if (this.itemToActivate.getComponent(Item) != null) {
                this.itemToActivate.getComponent(Item).useItem(true)
            }
        }
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)

    }

    async resolve() {
        cc.log(`resolve activate ${this.itemToActivate.name}`)
        let selectedEffect: Effect = null;
        const cardEffect = this.itemToActivate.getComponent(CardEffect)
        if (this.effectToDo == null) {

            //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has not yet resolved
            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == false) {

                let lockingStackEffect: StackEffectInterface
                if (cardEffect.multiEffectCollector instanceof MultiEffectRoll) {
                    lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                }
                if (cardEffect.multiEffectCollector instanceof MultiEffectChooseThenRoll || cardEffect.multiEffectCollector instanceof MultiEffectDestroyThisThenRoll) {
                    await cardEffect.multiEffectCollector.collectData({ cardPlayed: this.itemToActivate, cardPlayerId: this.itemPlayer.playerId })
                    lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                }

                lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                cc.error(`add to stack :${lockingStackEffect._lable}`)
                await Stack.addToStack(lockingStackEffect, true)

                //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has resolved
            }

            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == true) {

                if (cardEffect.multiEffectCollector instanceof MultiEffectRoll || cardEffect.multiEffectCollector instanceof MultiEffectChooseThenRoll || cardEffect.multiEffectCollector instanceof MultiEffectDestroyThisThenRoll) {
                    const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ROLL_DICE, [this.LockingResolve, ROLL_TYPE.EFFECT], null, this.itemPlayer.node, this.entityId)
                    const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
                    this.LockingResolve = afterPassiveMeta.args[0]
                    try {
                        selectedEffect = cardEffect.multiEffectCollector.getEffectByNumberRolled(this.LockingResolve, this.itemToActivate)
                        cc.log(`selected effect from roll is ${selectedEffect.name}`)
                    } catch (error) {
                        cc.error(error)
                        Logger.error(error)
                    }
                }
            }
        } else {
            selectedEffect = this.effectToDo;
        }
        let newStack
        try {
            newStack = await this.doCardEffect(selectedEffect, this.hasDataBeenCollectedYet);
        } catch (error) {
            cc.error(error)
            Logger.error(error)
        }
        this.effectToDo = null;
        //put new stack insted of old one (check maybe only add and removed the changed StackEffects)
        // if (newStack != null)
        //     Stack.replaceStack(newStack, true)

        //if the "item" is a non-monster monster card, move it to monster discard pile
        if (this.itemToActivate.getComponent(Monster) != null) {

            await this.itemToActivate.getComponent(Monster).monsterPlace.discardTopMonster(true)
            // await PileManager.addCardToPile(CARD_TYPE.MONSTER, this.itemToActivate, true)
            //await CardManager.moveCardTo(this.itemToActivate, PileManager.monsterCardPile.node, true)
        }
    }

    async doCardEffect(effect: Effect, hasDataBeenCollectedYet: boolean) {
        if (effect == null) {
            throw new Error(`effect is null`)
        }
        cc.log(`do card effect has data been collected yet : ${hasDataBeenCollectedYet}`)
        const cardEffect = this.itemToActivate.getComponent(CardEffect)
        const serverEffect = await cardEffect.getServerEffect(effect, this.itemPlayer.playerId, !hasDataBeenCollectedYet)
        //change in every effect that it recives the current stack (maybe not needed cuz stack is static) so that effects that affect the stack (butter bean) can cancel them
        //  (build an interpreter that can take a StackEffect and check in what state it is , what is the chosen effect is and what can change it)
        const newStack = await cardEffect.doServerEffect2(serverEffect, Stack._currentStack)
        return newStack;
    }

    convertToServerStackEffect() {
        const serverPlayLoot = new ServerActivateItem(this);
        return serverPlayLoot;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Activate Item\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.effectToDo) { endString = endString + `Effect:${this.effectToDo.name}\n` }
        if (this.itemPlayer) { endString = endString + `Player:${this.itemPlayer.name}\n` }
        if (this.itemToActivate) { endString = endString + `Item:${this.itemToActivate.name}\n` }
        return endString
    }

}
