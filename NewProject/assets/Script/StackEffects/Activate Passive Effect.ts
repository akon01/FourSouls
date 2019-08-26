import Effect from "../CardEffectComponents/CardEffects/Effect";
import { STACK_EFFECT_TYPE } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import Card from "../Entites/GameEntities/Card";
import Stack from "../Entites/Stack";
import DataInterpreter from "../Managers/DataInterpreter";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";

import StackEffectInterface from "./StackEffectInterface";
import { ActivatePassiveItemVis } from "./StackEffectVisualRepresentation/Activate Passive Item Vis";
import ServerActivatePassive from "./ServerSideStackEffects/Server Activate Passive";
import PlayerManager from "../Managers/PlayerManager";
import Player from "../Entites/GameEntities/Player";


export default class ActivatePassiveEffect implements StackEffectInterface {
    visualRepesentation: ActivatePassiveItemVis;

    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ACTIVATE_PASSIVE_EFFECT;
    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;

    cardActivatorId: number
    cardWithEffect: cc.Node;
    effectToDo: Effect;
    effectPassiveMeta: PassiveMeta
    hasDataBeenCollectedYet: boolean = false;


    constructor(creatorCardId: number, hasLockingStackEffect: boolean, cardActivatorId: number, cardWithEffect: cc.Node, effectToDo: Effect, hasDataBeenCollectedYet: boolean, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.hasLockingStackEffect = hasLockingStackEffect;
        this.effectToDo = effectToDo;
        this.cardActivatorId = cardActivatorId;
        if (this.hasLockingStackEffect) this.hasLockingStackEffectResolved = false;
        this.cardWithEffect = cardWithEffect;
        this.hasDataBeenCollectedYet = hasDataBeenCollectedYet;
        this.visualRepesentation = new ActivatePassiveItemVis(this.cardWithEffect.getComponent(cc.Sprite))

    }



    async putOnStack() {

        let card = this.cardWithEffect.getComponent(Card);
        let cardEffect = this.cardWithEffect.getComponent(CardEffect)

        let cardOwner = PlayerManager.getPlayerByCard(this.cardWithEffect).node
        if (cardOwner == null) {
            cardOwner = this.cardWithEffect
        }

        if (this.effectToDo.dataCollector.length > 0) {
            let collectedData = await cardEffect.collectEffectData(this.effectToDo, { cardId: this.cardWithEffect.getComponent(Card)._cardId, cardPlayerId: cardOwner.getComponent(Player).playerId })
            cardEffect.effectData = collectedData;
            this.hasDataBeenCollectedYet = true;
        }


    }

    async resolve() {
        let cardEffect = this.cardWithEffect.getComponent(CardEffect)
        this.effectPassiveMeta = PassiveManager.passiveMethodData;
        await this.doCardEffect(this.effectToDo, this.hasDataBeenCollectedYet);

        //put new stack insted of old one (check maybe only add and removed the changed StackEffects)
        // if (newStack != null)
        //     Stack.replaceStack(newStack, true)

        //if the "item" is a non-monster monster card, move it to monster discard pile
        // if (this.cardWithEffect.getComponent(Monster) != null) {
        //     await CardManager.moveCardTo(this.cardWithEffect, PileManager.monsterCardPile.node, true)
        // }
    }

    async doCardEffect(effect: Effect, hasDataBeenCollectedYet: boolean) {
        let cardEffect = this.cardWithEffect.getComponent(CardEffect)
        let serverEffect = await cardEffect.getServerEffect(effect, this.cardActivatorId, !this.hasDataBeenCollectedYet)
        let passiveData = DataInterpreter.makeEffectData(this.effectPassiveMeta, this.cardWithEffect, this.cardActivatorId, false, false)
        cc.log(passiveData)
        cc.log(cardEffect.effectData)
        passiveData.effectTargets.push(...cardEffect.effectData)
        cc.log(passiveData)
        serverEffect.cardEffectData = passiveData;
        //change in every effect that it recives the current stack (maybe not needed cuz stack is static) so that effects that affect the stack (butter bean) can cancel them
        //  (build an interpreter that can take a StackEffect and check in what state it is , what is the chosen effect is and what can change it)
        let newPassiveMethodData = await cardEffect.doServerEffect2(serverEffect, Stack._currentStack)
        PassiveManager.passiveMethodData = newPassiveMethodData
    }

    convertToServerStackEffect() {
        let serverActivatePassive = new ServerActivatePassive(this);
        return serverActivatePassive;
    }

}
