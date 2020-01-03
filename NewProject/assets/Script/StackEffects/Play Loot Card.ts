import Effect from "../CardEffectComponents/CardEffects/Effect";
import { IMultiEffectRollAndCollect } from "../CardEffectComponents/MultiEffectChooser/IMultiEffectRollAndCollect";
import MultiEffectChoose from "../CardEffectComponents/MultiEffectChooser/MultiEffectChoose";
import MultiEffectRoll from "../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import { CARD_TYPE, GAME_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import Item from "../Entites/CardTypes/Item";
import Card from "../Entites/GameEntities/Card";
import Player from "../Entites/GameEntities/Player";
import { Logger } from "../Entites/Logger";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PileManager from "../Managers/PileManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import RollDiceStackEffect from "./Roll DIce";
import ServerPlayLootCard from "./ServerSideStackEffects/Server Play Loot Card ";
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectInterface from "./StackEffectInterface";
import { PlayLootCardVis } from "./StackEffectVisualRepresentation/Play Loot Card Vis";

export default class PlayLootCardStackEffect extends StackEffectConcrete {
    visualRepesentation: PlayLootCardVis;

    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PLAY_LOOT_CARD;
    _lable: string;

    set lable(text: string) {
        this._lable = text
        if (!this.nonOriginal) { whevent.emit(GAME_EVENTS.LABLE_CHANGE) }
    }

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

    lootPlayer: Player;
    lootToPlay: cc.Node;
    effectToDo: Effect;
    hasDataBeenCollectedYet: boolean;

    constructor(creatorCardId: number, hasLockingStackEffect: boolean, lootToPlay: cc.Node, lootPlayerCard: cc.Node, hasDataBeenCollectedYet: boolean, hasLockingStackEffectResolved: boolean, entityId?: number) {
        super(creatorCardId, entityId)

        this.hasLockingStackEffect = hasLockingStackEffect;
        this.lootToPlay = lootToPlay;
        this.lootPlayer = PlayerManager.getPlayerByCard(lootPlayerCard)
        this.hasDataBeenCollectedYet = hasDataBeenCollectedYet;
        this.hasLockingStackEffectResolved = hasLockingStackEffectResolved
        this.visualRepesentation = new PlayLootCardVis(this.lootToPlay.getComponent(cc.Sprite).spriteFrame)
        this.lable = `Player ${this.lootPlayer.playerId} play ${lootToPlay.name} `
    }

    async putOnStack() {

        const card = this.lootToPlay.getComponent(Card);
        const cardEffect = this.lootToPlay.getComponent(CardEffect)

        await this.lootPlayer.loseLoot(this.lootToPlay, true)
        //await CardManager.moveCardTo(this.lootToPlay, PileManager.lootPlayPile, true, true)
        await PileManager.addCardToPile(CARD_TYPE.LOOT_PLAY, this.lootToPlay, true)

        //let player choose effect b4 going in the stack
        if (cardEffect.hasMultipleEffects) {
            //if the card has multiple effects and the player needs to choose
            if (cardEffect.multiEffectCollector instanceof MultiEffectChoose) {
                const effectChosen = await cardEffect.multiEffectCollector.collectData({ cardPlayed: this.lootToPlay, cardPlayerId: this.lootPlayer.playerId })
                this.effectToDo = effectChosen;
                //this.lable = `Player ${this.lootPlayer.playerId} play ${this.lootToPlay.name}: ${this.effectToDo.effectName}`
            }
        } else {
            this.effectToDo = cardEffect.activeEffects[0].getComponent(Effect)
            // this.lable = `Player ${this.lootPlayer.playerId} play ${this.lootToPlay.name}: ${this.effectToDo.effectName}`
        }
        //if the effect is chosen already and the player needs to choose targets, let him now.
        if (this.effectToDo != null) {
            this.lable = `Player ${this.lootPlayer.playerId} play ${this.lootToPlay.name}: ${this.effectToDo.effectName}`
            const collectedData = await cardEffect.collectEffectData(this.effectToDo, { cardId: this.lootToPlay.getComponent(Card)._cardId, cardPlayerId: this.lootPlayer.playerId })
            cardEffect.effectData = collectedData;
            this.hasDataBeenCollectedYet = true;
        }

        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)

    }

    async resolve() {
        let selectedEffect: Effect = null;
        const cardEffect = this.lootToPlay.getComponent(CardEffect)
        this.lootPlayer._lootCardsPlayedThisTurn.push(this.lootToPlay)
        if (this.effectToDo == null) {
            cc.log(this.hasLockingStackEffect)
            //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has not yet resolved
            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == false) {

                let lockingStackEffect: StackEffectInterface
                if (cardEffect.multiEffectCollector instanceof MultiEffectRoll) {
                    lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                }
                if (cardEffect.multiEffectCollector instanceof IMultiEffectRollAndCollect) {
                    await cardEffect.multiEffectCollector.collectData({ cardPlayed: this.lootToPlay, cardPlayerId: this.lootPlayer.playerId })
                    lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                }

                lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                await Stack.addToStack(lockingStackEffect, true)

                // let lockingStackEffect: StackEffectInterface
                // if (cardEffect.multiEffectCollector instanceof MultiEffectRoll || cardEffect.multiEffectCollector instanceof IMultiEffectRollAndCollect) {
                //     lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                //     this.lockingStackEffect = lockingStackEffect;
                // }
                // //TODO add put on stack when the method is complete
                // await Stack.addToStack(lockingStackEffect, true)

                //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has resolved
            }
            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == true) {
                if (cardEffect.multiEffectCollector instanceof MultiEffectRoll || cardEffect.multiEffectCollector instanceof IMultiEffectRollAndCollect) {
                    try {
                        selectedEffect = cardEffect.multiEffectCollector.getEffectByNumberRolled(this.LockingResolve, this.lootToPlay)
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
        if (!selectedEffect) {
            throw new Error(`no selected effect where should be!`)
        } else {
            this.lable = `Player ${this.lootPlayer.playerId} play ${this.lootToPlay.name}: ${selectedEffect.effectName}`
            try {
                newStack = await this.doCardEffect(selectedEffect, this.hasDataBeenCollectedYet);
            } catch (error) {
                cc.error(error)
                Logger.error(error)
            }
        }
        this.effectToDo = null;
        //put new stack insted of old one (check maybe only add and removed the changed StackEffects)

        //if the loot card is not a trinket (triknets have Item component)
        if (this.lootToPlay.getComponent(Item) == null) {
            await PileManager.removeFromPile(this.lootToPlay, true)
            await PileManager.addCardToPile(CARD_TYPE.LOOT, this.lootToPlay, true)
            //    await CardManager.moveCardTo(this.lootToPlay, PileManager.lootCardPile.node, true)

        }
        return newStack
    }

    async doCardEffect(effect: Effect, hasDataBeenCollectedYet: boolean) {
        const cardEffect = this.lootToPlay.getComponent(CardEffect)

        const serverEffect = await cardEffect.getServerEffect(effect, this.lootPlayer.playerId, !hasDataBeenCollectedYet)

        if (hasDataBeenCollectedYet) {
            serverEffect.cardEffectData = cardEffect.effectData
        }
        //change in every effect that it recives the current stack (maybe not needed cuz stack is static) so that effects that affect the stack (butter bean) can cancel them
        //  (build an interpreter that can take a StackEffect and check in what state it is , what is the chosen effect is and what can change it)
        const newStack = await cardEffect.doServerEffect2(serverEffect, Stack._currentStack)
        return newStack;
    }

    convertToServerStackEffect() {
        const serverPlayLoot = new ServerPlayLootCard(this);
        return serverPlayLoot;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Play Loot Card\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.effectToDo) { endString = endString + `Effect:${this.effectToDo.name}\n` }
        if (this.lootPlayer) { endString = endString + `Player:${this.lootPlayer.name}\n` }
        if (this.lootToPlay) { endString = endString + `Loot To Play:${this.lootToPlay.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
