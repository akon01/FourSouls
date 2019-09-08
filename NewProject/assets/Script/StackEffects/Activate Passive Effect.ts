import Effect from "../CardEffectComponents/CardEffects/Effect";
import { STACK_EFFECT_TYPE } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import Card from "../Entites/GameEntities/Card";
import Stack from "../Entites/Stack";
import DataInterpreter, { EffectTarget } from "../Managers/DataInterpreter";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";

import StackEffectInterface from "./StackEffectInterface";
import { ActivatePassiveItemVis } from "./StackEffectVisualRepresentation/Activate Passive Item Vis";
import ServerActivatePassive from "./ServerSideStackEffects/Server Activate Passive";
import PlayerManager from "../Managers/PlayerManager";
import Player from "../Entites/GameEntities/Player";
import CardManager from "../Managers/CardManager";


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

        if (this.effectToDo.dataCollector != null && this.effectToDo.dataCollector.length > 0) {
            cc.log(`activate pssive effect collect data`)
            let collectedData = await cardEffect.collectEffectData(this.effectToDo, { cardId: this.cardWithEffect.getComponent(Card)._cardId, cardPlayerId: cardOwner.getComponent(Player).playerId })
            cc.log(collectedData)
            cardEffect.effectData = collectedData;
            this.hasDataBeenCollectedYet = true;
        }


    }

    async resolve() {
        let cardEffect = this.cardWithEffect.getComponent(CardEffect)
        this.effectPassiveMeta = PassiveManager.passiveMethodData;
        cc.log(this.effectPassiveMeta)
        await this.doCardEffect(this.effectToDo, this.hasDataBeenCollectedYet);
        this.effectToDo = null;

    }

    async doCardEffect(effect: Effect, hasDataBeenCollectedYet: boolean) {
        let cardEffect = this.cardWithEffect.getComponent(CardEffect)
        cc.log(cardEffect.effectData)
        let serverEffect = await cardEffect.getServerEffect(effect, this.cardActivatorId, !this.hasDataBeenCollectedYet)
        cc.log(serverEffect)

        let passiveData = DataInterpreter.makeEffectData(this.effectPassiveMeta, this.cardWithEffect, this.cardActivatorId, false, false)


        if (cardEffect.effectData.effectTargets.length > 0) {
            if (cardEffect.effectData.isTargetStackEffect) {
                passiveData.effectTargets = cardEffect.effectData.effectTargets.map((target) => new EffectTarget(Stack._currentStack.find(stackEffect => stackEffect.entityId == target)))
            } else {
                passiveData.effectTargets = cardEffect.effectData.effectTargets.map((target) => new EffectTarget(CardManager.getCardById(target, true)))
            }
        }

        // passiveData.addTarget()
        passiveData.effectTargets.push(...cardEffect.effectData)
        serverEffect.cardEffectData = passiveData;
        cc.log(serverEffect.cardEffectData)
        let newPassiveMethodData = await cardEffect.doServerEffect2(serverEffect, Stack._currentStack)
        cc.log(newPassiveMethodData)
        PassiveManager.passiveMethodData = newPassiveMethodData
    }

    convertToServerStackEffect() {
        let serverActivatePassive = new ServerActivatePassive(this);
        return serverActivatePassive;
    }

}
