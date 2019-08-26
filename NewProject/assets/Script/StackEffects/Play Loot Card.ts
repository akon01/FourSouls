import Effect from "../CardEffectComponents/CardEffects/Effect";
import MultiEffectChoose from "../CardEffectComponents/MultiEffectChooser/MultiEffectChoose";
import MultiEffectRoll from "../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import { CARD_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import Item from "../Entites/CardTypes/Item";
import Card from "../Entites/GameEntities/Card";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PileManager from "../Managers/PileManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import RollDiceStackEffect from "./Roll DIce";
import ServerPlayLootCard from "./ServerSideStackEffects/Server Play Loot Card ";
import StackEffectInterface from "./StackEffectInterface";
import { PlayLootCardVis } from "./StackEffectVisualRepresentation/Play Loot Card Vis";


export default class PlayLootCardStackEffect implements StackEffectInterface {
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

    lootPlayer: Player;
    lootToPlay: cc.Node;
    effectToDo: Effect;
    hasDataBeenCollectedYet: boolean;


    constructor(creatorCardId: number, hasLockingStackEffect: boolean, lootToPlay: cc.Node, lootPlayerCard: cc.Node, hasDataBeenCollectedYet: boolean, hasLockingStackEffectResolved: boolean, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.hasLockingStackEffect = hasLockingStackEffect;
        this.lootToPlay = lootToPlay;
        this.lootPlayer = PlayerManager.getPlayerByCard(lootPlayerCard)
        this.hasDataBeenCollectedYet = hasDataBeenCollectedYet;
        this.hasLockingStackEffectResolved = hasLockingStackEffectResolved
        this.visualRepesentation = new PlayLootCardVis(this.lootToPlay.getComponent(cc.Sprite).spriteFrame)
    }



    async putOnStack() {

        let card = this.lootToPlay.getComponent(Card);
        let cardEffect = this.lootToPlay.getComponent(CardEffect)


        await this.lootPlayer.loseLoot(this.lootToPlay, true)
        await CardManager.moveCardTo(this.lootToPlay, PileManager.lootPlaceTest, true, true)

        //let player choose effect b4 going in the stack
        if (cardEffect.hasMultipleEffects) {
            //if the card has multiple effects and the player needs to choose
            if (cardEffect.multiEffectCollector instanceof MultiEffectChoose) {
                let effectChosen = await cardEffect.multiEffectCollector.collectData({ cardPlayed: this.lootToPlay, cardPlayerId: this.lootPlayer.playerId })
                this.effectToDo = effectChosen;
            }
        } else {
            cc.log(`only has one effect`)
            this.effectToDo = cardEffect.getOnlyEffect()
        }
        //if the effect is chosen already and the player needs to choose targets, let him now.
        if (this.effectToDo != null) {
            let collectedData = await cardEffect.collectEffectData(this.effectToDo, { cardId: this.lootToPlay.getComponent(Card)._cardId, cardPlayerId: this.lootPlayer.playerId })
            cardEffect.effectData = collectedData;
            this.hasDataBeenCollectedYet = true;
        }

        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)

    }

    async resolve() {
        let selectedEffect: Effect = null;
        let cardEffect = this.lootToPlay.getComponent(CardEffect)
        if (this.effectToDo == null) {
            cc.log(`no chosen effect to do yet`)
            //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has not yet resolved
            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == false) {
                cc.log(`need lock, lock isnt resolved, add lock`)
                let lockingStackEffect: StackEffectInterface
                if (cardEffect.multiEffectCollector instanceof MultiEffectRoll) {
                    lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                    this.lockingStackEffect = lockingStackEffect;
                }

                cc.log('b4 add to stack of Roll Dice')
                //TODO add put on stack when the method is complete
                await Stack.addToStack(lockingStackEffect, true)
                cc.log('after add to stack of Roll Dice')

                //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has resolved
            }
            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == true) {
                if (cardEffect.multiEffectCollector instanceof MultiEffectRoll) {
                    selectedEffect = cardEffect.multiEffectCollector.getEffectByNumberRolled(this.LockingResolve, this.lootToPlay)
                }
            }
        } else {
            selectedEffect = this.effectToDo;
        }
        cc.log(selectedEffect.effectName)
        let newStack = await this.doCardEffect(selectedEffect, this.hasDataBeenCollectedYet);

        //put new stack insted of old one (check maybe only add and removed the changed StackEffects)

        //if the loot card is not a trinket (triknets have Item component)
        if (this.lootToPlay.getComponent(Item) == null) {
            await PileManager.addCardToPile(CARD_TYPE.LOOT, this.lootToPlay, true)
            //    await CardManager.moveCardTo(this.lootToPlay, PileManager.lootCardPile.node, true)

        }
        return newStack
    }

    async doCardEffect(effect: Effect, hasDataBeenCollectedYet: boolean) {
        let cardEffect = this.lootToPlay.getComponent(CardEffect)
        let serverEffect = await cardEffect.getServerEffect(effect, this.lootPlayer.playerId, !hasDataBeenCollectedYet)

        if (hasDataBeenCollectedYet) {
            serverEffect.cardEffectData = cardEffect.effectData
        }
        //change in every effect that it recives the current stack (maybe not needed cuz stack is static) so that effects that affect the stack (butter bean) can cancel them
        //  (build an interpreter that can take a StackEffect and check in what state it is , what is the chosen effect is and what can change it)
        let newStack = await cardEffect.doServerEffect2(serverEffect, Stack._currentStack)
        return newStack;
    }

    convertToServerStackEffect() {
        let serverPlayLoot = new ServerPlayLootCard(this);
        return serverPlayLoot;
    }

}
