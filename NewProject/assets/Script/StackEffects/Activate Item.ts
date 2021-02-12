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
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import RollDiceStackEffect from "./Roll DIce";
import ServerActivateItem from "./ServerSideStackEffects/Server Activate Item";
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectInterface from "./StackEffectInterface";
import { ActivateItemVis } from "./StackEffectVisualRepresentation/Activate Item Vis";
import { IMultiEffectRollAndCollect } from "../CardEffectComponents/MultiEffectChooser/IMultiEffectRollAndCollect";
import StackEffectVisManager from "../Managers/StackEffectVisManager";


export default class ActivateItem extends StackEffectConcrete {
    visualRepesentation: ActivateItemVis;

    name = `Activate Item`

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

    isToBeFizzled: boolean = false;

    creationTurnId: number

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal: boolean = false;

    itemPlayer: Player;
    itemToActivate: cc.Node;
    effectToDo: Effect;
    hasDataBeenCollectedYet: boolean = false;

    constructor(creatorCardId: number, hasLockingStackEffect: boolean, itemToActivate: cc.Node, itemPlayerCard: cc.Node, hasDataBeenCollectedYet: boolean, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)

        this.hasLockingStackEffect = hasLockingStackEffect;
        if (this.hasLockingStackEffect) { this.hasLockingStackEffectResolved = false; }
        this.itemToActivate = itemToActivate;
        this.itemPlayer = PlayerManager.getPlayerByCard(itemPlayerCard)
        this.hasDataBeenCollectedYet = hasDataBeenCollectedYet;
        this.visualRepesentation = new ActivateItemVis(this.itemToActivate.getComponent(Card).cardSprite.spriteFrame)
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${this.itemPlayer.playerId} is going to activate ${this.itemToActivate.name}`, false)
        }
        const cardEffect = this.itemToActivate.getComponent(CardEffect);
        if (!cardEffect.hasMultipleEffects) {
            const activeEffects = cardEffect.getActiveEffects();
            const paidEffects = cardEffect.getPaidEffects();
            if (activeEffects[0]) {
                this.effectToDo = activeEffects[0]
            } else if (paidEffects[0]) {
                this.effectToDo = paidEffects[0]
            }
        }
    }

    async putOnStack() {
        const card = this.itemToActivate.getComponent(Card);
        const cardEffect = this.itemToActivate.getComponent(CardEffect)
        //let player choose effect b4 going in the stack
        if (cardEffect.hasMultipleEffects) {
            const multiEffectCollector = cardEffect.getMultiEffectCollector();
            const cost = multiEffectCollector.getCost();
            //if the card has multiple effects and the player needs to choose
            if (cost != null && cost.testPreCondition()) {
                await cost.takeCost()
            }
            if (multiEffectCollector instanceof MultiEffectChoose) {
                const effectChosen = await multiEffectCollector.collectData({ cardPlayed: this.itemToActivate, cardPlayerId: this.itemPlayer.playerId })
                this.effectToDo = effectChosen;
            }
        }
        //if the effect is chosen already and the player needs to choose targets, let him now.
        if (this.effectToDo != null) {
            if (this.effectToDo.hasLockingResolve) {
                this.hasLockingStackEffect = true
                this.hasLockingStackEffectResolved = false
            }
            const prev = StackEffectVisManager.$.getPreviewByStackId(this.entityId)
            if (prev && this.effectToDo.node) {
                prev.addSelectedEffectHighlight(this.effectToDo)
            }
            const collectedData = await cardEffect.collectEffectData(this.effectToDo, { cardId: this.itemToActivate.getComponent(Card)._cardId, cardPlayerId: this.itemPlayer.playerId })
            cardEffect.effectData = collectedData;
            this.hasDataBeenCollectedYet = true;
            const effectIndexType = cardEffect.getEffectIndexAndType(this.effectToDo)
            if (this.itemToActivate.getComponent(Item) != null && effectIndexType.type == ITEM_TYPE.ACTIVE && this.itemToActivate.getComponent(Monster) == null) {
                this.itemToActivate.getComponent(Item).useItem(true)
            }
        } else {
            if (this.itemToActivate.getComponent(Item) != null && this.hasLockingStackEffect && this.itemToActivate.getComponent(Monster) == null) {
                this.itemToActivate.getComponent(Item).useItem(true)
            }
        }
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)

    }

    async resolve() {
        cc.log(`resolve activate ${this.itemToActivate.name}`)
        let selectedEffect: Effect = this.effectToDo;
        const cardEffect = this.itemToActivate.getComponent(CardEffect)
        // if (this.effectToDo == null) {
        const multiEffectCollector = cardEffect.getMultiEffectCollector();
        //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has not yet resolved
        if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == false) {
            let lockingStackEffect: StackEffectInterface

            //if card has multiple effects that needs a lock, lock here
            if (multiEffectCollector) {
                if (multiEffectCollector instanceof IMultiEffectRollAndCollect) {
                    await multiEffectCollector.collectData({ cardPlayed: this.itemToActivate, cardPlayerId: this.itemPlayer.playerId })
                }
            }
            lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
            await Stack.addToStack(lockingStackEffect, true)

        }
        //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has resolved

        if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == true) {

            if (multiEffectCollector != null) {
                if (multiEffectCollector instanceof MultiEffectRoll || multiEffectCollector instanceof IMultiEffectRollAndCollect) {
                    // const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ROLL_DICE, [this.LockingResolve, ROLL_TYPE.EFFECT], null, this.itemPlayer.node, this.entityId)
                    // const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
                    // this.LockingResolve = afterPassiveMeta.args[0]
                    try {
                        selectedEffect = multiEffectCollector.getEffectByNumberRolled(this.LockingResolve, this.itemToActivate)
                    } catch (error) {
                        Logger.error(error)
                    }
                }
            }

            if (selectedEffect.hasLockingResolve) {
                selectedEffect.lockingResolve = this.LockingResolve
            }

        }
        // } else {
        //     selectedEffect = this.effectToDo;
        // }
        let newStack
        const prev = StackEffectVisManager.$.getPreviewByStackId(this.entityId)
        if (prev && selectedEffect.node) {
            cc.log(`add selected effect hightlight`)
            prev.addSelectedEffectHighlight(selectedEffect)
        } else {
            cc.error(`no prev found`)
            cc.log(StackEffectVisManager.$.currentPreviews)
            cc.log(this.entityId)
        }
        try {
            newStack = await this.doCardEffect(selectedEffect, this.hasDataBeenCollectedYet);
        } catch (error) {
            Logger.error(error)
        }
        this.setLable(`Player ${this.itemPlayer.playerId} has activated ${this.itemToActivate.name}`, true)
        const effects = [...cardEffect.getActiveEffects(), ...cardEffect.getPaidEffects()]
        if (!effects.includes(this.effectToDo)) {
            this.effectToDo = null;
        }

        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ACTIVATE_ITEM, [this.itemToActivate], null, this.itemPlayer.node)
        await PassiveManager.testForPassiveAfter(passiveMeta)

        //put new stack insted of old one (check maybe only add and removed the changed StackEffects)
        // if (newStack != null)
        //     Stack.replaceStack(newStack, true)

        //if the "item" is a non-monster monster card, move it to monster discard pile 
        if (this.itemToActivate.getComponent(Monster) != null && this.itemToActivate.getComponent(Monster).monsterPlace) {
            if (!this.itemToActivate.getComponent(Monster).isCurse) {

                await this.itemToActivate.getComponent(Monster).monsterPlace.discardTopMonster(true)
            } else {
                await this.itemToActivate.getComponent(Monster).monsterPlace.removeMonster(this.itemToActivate, true)
            }
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
