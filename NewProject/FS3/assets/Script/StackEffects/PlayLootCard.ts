import { log, Node } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { IMultiEffectRollAndCollect } from "../CardEffectComponents/MultiEffectChooser/IMultiEffectRollAndCollect";
import { MultiEffectChoose } from "../CardEffectComponents/MultiEffectChooser/MultiEffectChoose";
import { MultiEffectRoll } from "../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import { CARD_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import { CardEffect } from "../Entites/CardEffect";
import { Item } from "../Entites/CardTypes/Item";
import { Card } from "../Entites/GameEntities/Card";
import { Player } from "../Entites/GameEntities/Player";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { RollDiceStackEffect } from "./RollDIce";
import { ServerPlayLootCard } from "./ServerSideStackEffects/ServerPlayLootCard";
import { StackEffectConcrete } from "./StackEffectConcrete";
import { StackEffectInterface } from "./StackEffectInterface";
import { PlayLootCardVis } from "./StackEffectVisualRepresentation/PlayLootCardVis";

export class PlayLootCardStackEffect extends StackEffectConcrete {
    visualRepesentation: PlayLootCardVis;
    name = `PlayLootCard`
    entityId!: number;
    creatorCardId!: number;
    isLockingStackEffect!: boolean;
    stackEffectToLock!: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect!: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PLAY_LOOT_CARD;
    _lable!: string;

    isToBeFizzled = false;

    creationTurnId!: number








    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal = false;

    lootPlayer: Player;
    lootToPlay: Node;
    effectToDo: Effect | null = null;
    hasDataBeenCollectedYet: boolean;

    constructor(creatorCardId: number, hasLockingStackEffect: boolean, lootToPlay: Node, lootPlayerCard: Node, hasDataBeenCollectedYet: boolean, hasLockingStackEffectResolved: boolean, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)

        this.hasLockingStackEffect = hasLockingStackEffect;
        this.lootToPlay = lootToPlay;
        this.lootPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(lootPlayerCard)!
        this.hasDataBeenCollectedYet = hasDataBeenCollectedYet;
        this.hasLockingStackEffectResolved = hasLockingStackEffectResolved
        this.visualRepesentation = new PlayLootCardVis(this.lootToPlay.getComponent(Card)!.cardSprite!.spriteFrame!)
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${this.lootPlayer.playerId} Is Going To Play ${lootToPlay.name} `, false)
        }
    }

    async putOnStack() {

        const card = this.lootToPlay.getComponent(Card)!;
        card.isGoingToBePlayed = true
        const cardEffect = this.lootToPlay.getComponent(CardEffect)!

        await this.lootPlayer.loseLoot(this.lootToPlay, true)
        //await WrapperProvider.cardManagerWrapper.out.moveCardTo(this.lootToPlay, WrapperProvider.pileManagerWrapper.out.lootPlayPile, true, true)
        if (WrapperProvider.pileManagerWrapper.out.getPileByCard(this.lootToPlay) == null) {
            await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.LOOT_PLAY, this.lootToPlay, true)
        }

        //let player choose effect b4 going in the stack
        if (cardEffect.hasMultipleEffects) {
            const multiEffectCollector = cardEffect.getMultiEffectCollector()!;
            const cost = multiEffectCollector.getCost();
            if (cost != null && cost.testPreCondition()) {
                await cost.takeCost()
            }
            //if the card has multiple effects and the player needs to choose
            if (multiEffectCollector instanceof MultiEffectChoose) {
                const effectChosen = await multiEffectCollector.collectData({ cardPlayed: this.lootToPlay, cardPlayerId: this.lootPlayer.playerId })
                this.effectToDo = effectChosen;

                //this.setLable(`Player ${this.lootPlayer.playerId} play ${this.lootToPlay.name}: ${this.effectToDo.effectName}`,true)
            }
        } else {
            this.effectToDo = cardEffect.getActiveEffects()[0]
            // this.setLable(`Player ${this.lootPlayer.playerId} play ${this.lootToPlay.name}: ${this.effectToDo.effectName}`,true)
        }
        //if the effect is chosen already and the player needs to choose targets, let him now.
        if (this.effectToDo != null) {
            const prev = WrapperProvider.stackEffectVisManagerWrapper.out.getPreviewByStackId(this.entityId)
            if (prev) {
                prev.addSelectedEffectHighlight(this.effectToDo)
            }
            this.setLable(`Player ${this.lootPlayer.playerId} Is Going To Play ${this.lootToPlay.name}: ${this.effectToDo.effectName}`, true)
            const collectedData = await cardEffect.collectEffectData(this.effectToDo, { cardId: this.lootToPlay.getComponent(Card)!._cardId, cardPlayerId: this.lootPlayer.playerId })
            cardEffect.effectData = collectedData;
            this.hasDataBeenCollectedYet = true;
        }

        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
        turnPlayer.givePriority(true)

    }

    async resolve() {
        let selectedEffect: Effect | null = null;
        const cardEffect = this.lootToPlay.getComponent(CardEffect)!
        this.lootPlayer._lootCardsPlayedThisTurn.push(this.lootToPlay)
        console.log(`this loot card has locking stack effect ${this.hasLockingStackEffect}`)
        const multiEffectCollector = cardEffect.getMultiEffectCollector();
        if (this.effectToDo == null) {
            //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has not yet resolved
            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == false) {

                let lockingStackEffect: StackEffectInterface

                if (multiEffectCollector instanceof MultiEffectRoll) {

                    lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                }
                if (multiEffectCollector instanceof IMultiEffectRollAndCollect) {
                    await multiEffectCollector.collectData({ cardPlayed: this.lootToPlay, cardPlayerId: this.lootPlayer.playerId })
                    lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                }

                lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                await WrapperProvider.stackWrapper.out.addToStack(lockingStackEffect, true)

                //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has resolved
            }
            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == true) {
                if (multiEffectCollector instanceof MultiEffectRoll || multiEffectCollector instanceof IMultiEffectRollAndCollect) {
                    try {
                        selectedEffect = multiEffectCollector.getEffectByNumberRolled(this.LockingResolve, this.lootToPlay)
                    } catch (error) {
                        WrapperProvider.loggerWrapper.out.error(error)
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
            const prev = WrapperProvider.stackEffectVisManagerWrapper.out.getPreviewByStackId(this.entityId)
            if (prev) {
                prev.addSelectedEffectHighlight(selectedEffect)
            }
            this.setLable(`Player ${this.lootPlayer.playerId} Plays ${this.lootToPlay.name}: ${selectedEffect.effectName}`, true)
            try {
                newStack = await this.doCardEffect(selectedEffect, this.hasDataBeenCollectedYet);
            } catch (error) {
                WrapperProvider.loggerWrapper.out.error(error)
            }
        }
        this.effectToDo = null;
        //put new stack insted of old one (check maybe only add and removed the changed StackEffects)

        //if the loot card is not a trinket (triknets have Item component)
        if (this.lootToPlay.getComponent(Item) == null) {
            this.lootToPlay.getComponent(Card)!.isGoingToBePlayed = false
            await WrapperProvider.pileManagerWrapper.out.removeFromPile(this.lootToPlay, true)
            await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.LOOT, this.lootToPlay, true)
            //    await WrapperProvider.cardManagerWrapper.out.moveCardTo(this.lootToPlay, WrapperProvider.pileManagerWrapper.out.lootCardPile.node, true)

        }
        return newStack
    }

    async doCardEffect(effect: Effect, hasDataBeenCollectedYet: boolean) {
        const cardEffect = this.lootToPlay.getComponent(CardEffect)!

        const serverEffect = await cardEffect.getServerEffect(effect, this.lootPlayer.playerId, !hasDataBeenCollectedYet)

        if (hasDataBeenCollectedYet) {
            serverEffect.cardEffectData = cardEffect.effectData
        }
        //change in every effect that it recives the current stack (maybe not needed cuz stack is static) so that effects that affect the stack (butter bean) can cancel them
        //  (build an interpreter that can take a StackEffect and check in what state it is , what is the chosen effect is and what can change it)
        const newStack = await cardEffect.doServerEffect2(serverEffect, WrapperProvider.stackWrapper.out._currentStack)
        return newStack;
    }

    convertToServerStackEffect() {
        const serverPlayLoot = new ServerPlayLootCard(this);
        return serverPlayLoot;
    }

    async fizzleThis() {
        super.fizzleThis()
        this.lootToPlay.getComponent(Card)!.isGoingToBePlayed = false
        WrapperProvider.pileManagerWrapper.out.removeFromPile(this.lootToPlay, true)
        await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.LOOT, this.lootToPlay, true)
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: PlayLootCard\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.effectToDo) { endString = endString + `Effect:${this.effectToDo.name}\n` }
        if (this.lootPlayer) { endString = endString + `Player:${this.lootPlayer.name}\n` }
        if (this.lootToPlay) { endString = endString + `Loot To Play:${this.lootToPlay.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}
