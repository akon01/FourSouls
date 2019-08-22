import Effect from "../CardEffectComponents/CardEffects/Effect";
import MultiEffectChoose from "../CardEffectComponents/MultiEffectChooser/MultiEffectChoose";
import MultiEffectRoll from "../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import { CARD_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import Item from "../Entites/CardTypes/Item";
import Monster from "../Entites/CardTypes/Monster";
import Card from "../Entites/GameEntities/Card";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import PileManager from "../Managers/PileManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import RollDiceStackEffect from "./Roll DIce";
import ServerActivateItem from "./ServerSideStackEffects/Server Activate Item";
import StackEffectInterface from "./StackEffectInterface";
import { ActivateItemVis } from "./StackEffectVisualRepresentation/Activate Item Vis";

export default class ActivateItem implements StackEffectInterface {
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

    itemPlayer: Player;
    itemToActivate: cc.Node;
    effectToDo: Effect;
    hasDataBeenCollectedYet: boolean = false;


    constructor(creatorCardId: number, hasLockingStackEffect: boolean, itemToActivate: cc.Node, itemPlayerCard: cc.Node, hasDataBeenCollectedYet: boolean, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }
        this.creatorCardId = creatorCardId;
        this.hasLockingStackEffect = hasLockingStackEffect;
        if (this.hasLockingStackEffect) this.hasLockingStackEffectResolved = false;
        this.itemToActivate = itemToActivate;
        this.itemPlayer = PlayerManager.getPlayerByCard(itemPlayerCard)
        this.hasDataBeenCollectedYet = hasDataBeenCollectedYet;
        this.visualRepesentation = new ActivateItemVis(this.itemToActivate.getComponent(cc.Sprite).spriteFrame)
    }



    async putOnStack() {

        let card = this.itemToActivate.getComponent(Card);
        let cardEffect = this.itemToActivate.getComponent(CardEffect)
        //let player choose effect b4 going in the stack
        if (cardEffect.hasMultipleEffects) {
            //if the card has multiple effects and the player needs to choose
            if (cardEffect.multiEffectCollector instanceof MultiEffectChoose) {
                let effectChosen = await cardEffect.multiEffectCollector.collectData({ cardPlayed: this.itemToActivate, cardPlayerId: this.itemPlayer.playerId })
                this.effectToDo = effectChosen;

            }
        } else {

            this.effectToDo = cardEffect.getOnlyEffect()
        }
        //if the effect is chosen already and the player needs to choose targets, let him now.
        if (this.effectToDo != null) {
            let collectedData = await cardEffect.collectEffectData(this.effectToDo, { cardId: this.itemToActivate.getComponent(Card)._cardId, cardPlayerId: this.itemPlayer.playerId })
            cardEffect.effectData = collectedData;
            this.hasDataBeenCollectedYet = true;
        }
        this.itemToActivate.getComponent(Item).useItem(true)
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)

    }

    async resolve() {
        cc.log(`resolve activate ${this.itemToActivate.name}`)
        let selectedEffect: Effect = null;
        let cardEffect = this.itemToActivate.getComponent(CardEffect)
        if (this.effectToDo == null) {

            //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has not yet resolved
            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == false) {

                let lockingStackEffect: StackEffectInterface
                if (cardEffect.multiEffectCollector instanceof MultiEffectRoll) {
                    lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                }


                //TODO add put on stack when the method is complete
                await Stack.addToStack(lockingStackEffect, true)


                //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has resolved
            }

            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == true) {

                if (cardEffect.multiEffectCollector instanceof MultiEffectRoll) {
                    selectedEffect = cardEffect.multiEffectCollector.getEffectByNumberRolled(this.LockingResolve, this.itemToActivate)
                }
            }
        } else {
            selectedEffect = this.effectToDo;
        }
        let newStack
        try {
            newStack = await this.doCardEffect(selectedEffect, this.hasDataBeenCollectedYet);
        } catch (e) {
            cc.error(e)
        }

        //put new stack insted of old one (check maybe only add and removed the changed StackEffects)
        if (newStack != null)
            Stack.replaceStack(newStack, true)

        //if the "item" is a non-monster monster card, move it to monster discard pile
        if (this.itemToActivate.getComponent(Monster) != null) {
            await PileManager.addCardToPile(CARD_TYPE.MONSTER, this.itemToActivate, true)
            //await CardManager.moveCardTo(this.itemToActivate, PileManager.monsterCardPile.node, true)
        }
    }

    async doCardEffect(effect: Effect, hasDataBeenCollectedYet: boolean) {
        if (effect == null) {
            throw `effect is null`
        }
        let cardEffect = this.itemToActivate.getComponent(CardEffect)
        let serverEffect = await cardEffect.getServerEffect(effect, this.itemPlayer.playerId, !hasDataBeenCollectedYet)
        //change in every effect that it recives the current stack (maybe not needed cuz stack is static) so that effects that affect the stack (butter bean) can cancel them
        //  (build an interpreter that can take a StackEffect and check in what state it is , what is the chosen effect is and what can change it)
        let newStack = await cardEffect.doServerEffect2(serverEffect, Stack._currentStack)
        return newStack;
    }

    convertToServerStackEffect() {
        let serverPlayLoot = new ServerActivateItem(this);
        return serverPlayLoot;
    }

}
