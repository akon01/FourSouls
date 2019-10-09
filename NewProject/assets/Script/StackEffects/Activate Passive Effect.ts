import Effect from "../CardEffectComponents/CardEffects/Effect";
import { STACK_EFFECT_TYPE, PASSIVE_EVENTS, ROLL_TYPE } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import Card from "../Entites/GameEntities/Card";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import DataInterpreter, { EffectTarget, PassiveEffectData } from "../Managers/DataInterpreter";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import PlayerManager from "../Managers/PlayerManager";
import ServerActivatePassive from "./ServerSideStackEffects/Server Activate Passive";
import StackEffectInterface from "./StackEffectInterface";
import { ActivatePassiveItemVis } from "./StackEffectVisualRepresentation/Activate Passive Item Vis";
import GetTargetFromPassiveMeta from "../CardEffectComponents/DataCollector/GetTargetFromPassiveMeta";
import MultiEffectChoose from "../CardEffectComponents/MultiEffectChooser/MultiEffectChoose";
import { resolve } from "dns";
import MultiEffectRoll from "../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import MultiEffectChooseThenRoll from "../CardEffectComponents/MultiEffectChooser/MultiEffectChooseThenRoll";
import MultiEffectDestroyThisThenRoll from "../CardEffectComponents/MultiEffectChooser/MultiEffectDestroyThisThenRoll";
import RollDiceStackEffect from "./Roll DIce";
import MultiEffectRollEffect from "../CardEffectComponents/CardEffects/MultiEffectRollAsEffect";



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
    index: number = null;
    isAfterActivation: boolean = null


    constructor(creatorCardId: number, hasLockingStackEffect: boolean, cardActivatorId: number, cardWithEffect: cc.Node, effectToDo: Effect, hasDataBeenCollectedYet: boolean, isAfterActivation: boolean, index?: number, entityId?: number) {
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
        cc.log(`creating activate passive effect with index ${index}`)
        this.index = index;
        this.isAfterActivation = isAfterActivation

    }



    async putOnStack() {

        let card = this.cardWithEffect.getComponent(Card);
        let cardEffect = this.cardWithEffect.getComponent(CardEffect)

        let player = PlayerManager.getPlayerByCard(this.cardWithEffect)
        let cardOwner: cc.Node
        if (player != null) {

            cardOwner = player.node
        } else {
            cardOwner = this.cardWithEffect
        }
        let id: number = 0;
        if (player) {
            id = cardOwner.getComponent(Player).playerId
        } else {
            id = cardOwner.getComponent(Card)._cardId
        }
        if (!this.effectToDo) {
            if (cardEffect.hasMultipleEffects) {
                //if the card has multiple effects and the player needs to choose
                if (cardEffect.multiEffectCollector instanceof MultiEffectChoose) {
                    let effectChosen = await cardEffect.multiEffectCollector.collectData({ cardPlayed: this.cardWithEffect, cardPlayerId: this.cardActivatorId })
                    this.effectToDo = effectChosen;

                }
            }
        }
        if (this.effectToDo) {
            //special cases
            if (this.effectToDo instanceof MultiEffectRollEffect) {
                for (const effect of this.effectToDo.effectsAndNumbers.map(eAn => eAn.effect)) {

                    if (effect.dataCollector != null && effect.dataCollector.length > 0) {
                        let specialDataCollector = effect.dataCollector.find(dataCollector => {
                            // Special Cases:
                            if (dataCollector instanceof GetTargetFromPassiveMeta) {
                                return true
                            }
                        })
                        if (specialDataCollector && specialDataCollector instanceof GetTargetFromPassiveMeta) {
                            specialDataCollector.metaIndex = this.index
                            specialDataCollector.isAfterActivation = this.isAfterActivation
                        }

                        let collectedData = await cardEffect.collectEffectData(effect, { cardId: this.cardWithEffect.getComponent(Card)._cardId, cardPlayerId: id })

                        cardEffect.effectData = collectedData;
                        this.hasDataBeenCollectedYet = true;
                    }
                }
            }
            if (this.effectToDo.dataCollector != null && this.effectToDo.dataCollector.length > 0) {
                let specialDataCollector = this.effectToDo.dataCollector.find(dataCollector => {
                    // Special Cases:
                    if (dataCollector instanceof GetTargetFromPassiveMeta) {
                        return true
                    }
                })
                if (specialDataCollector && specialDataCollector instanceof GetTargetFromPassiveMeta) {
                    specialDataCollector.metaIndex = this.index
                    specialDataCollector.isAfterActivation = this.isAfterActivation
                }

                let collectedData = await cardEffect.collectEffectData(this.effectToDo, { cardId: this.cardWithEffect.getComponent(Card)._cardId, cardPlayerId: id })

                cardEffect.effectData = collectedData;
                this.hasDataBeenCollectedYet = true;
            }
        }


    }

    async resolve() {
        let cardEffect = this.cardWithEffect.getComponent(CardEffect)
        let selectedEffect: Effect = null;
        this.isAfterActivation == true ? this.effectPassiveMeta = PassiveManager.afterActivationMap.get(this.index) : this.effectPassiveMeta = PassiveManager.beforeActivationMap.get(this.index)

        //Special Cases
        //1. Passive card which says "when .... roll: do:1,2,3"
        if (this.effectToDo instanceof MultiEffectRollEffect) {
            //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has not yet resolved
            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == false) {
                let lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                await Stack.addToStack(lockingStackEffect, true)
                cc.log(`passive effect locking resolve is ${this.LockingResolve}`)
            }

            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == true) {
                let owner = PlayerManager.getPlayerByCard(CardManager.getCardOwner(this.cardWithEffect))
                let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ROLL_DICE, [this.LockingResolve, ROLL_TYPE.EFFECT], null, owner.node)
                let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
                this.LockingResolve = afterPassiveMeta.args[0]
                try {
                    selectedEffect = (this.effectToDo as MultiEffectRollEffect).getEffectByNumberRolled(this.LockingResolve, this.cardWithEffect)
                } catch (error) {
                    cc.error(error)
                }
            }

        } else selectedEffect = this.effectToDo
        this.effectToDo = selectedEffect

        await this.doCardEffect(this.effectToDo, this.hasDataBeenCollectedYet);
        this.effectToDo = null;
        this.effectPassiveMeta = null

    }

    async doCardEffect(effect: Effect, hasDataBeenCollectedYet: boolean) {
        let cardEffect = this.cardWithEffect.getComponent(CardEffect)
        let serverEffect = await cardEffect.getServerEffect(effect, this.cardActivatorId, !this.hasDataBeenCollectedYet)


        let passiveData = DataInterpreter.makeEffectData(this.effectPassiveMeta, this.cardWithEffect, this.cardActivatorId, false, false)


        if (cardEffect.effectData) {
            if (cardEffect.effectData.effectTargets.length > 0) {
                if (cardEffect.effectData.isTargetStackEffect) {
                    passiveData.effectTargets = cardEffect.effectData.effectTargets.map((target) => new EffectTarget(Stack._currentStack.find(stackEffect => stackEffect.entityId == target)))
                } else {
                    passiveData.effectTargets = cardEffect.effectData.effectTargets.map((target) => new EffectTarget(CardManager.getCardById(target, true)))
                }
            }
            // passiveData.addTarget()
            passiveData.effectTargets.push(...cardEffect.effectData)
        }
        serverEffect.cardEffectData = passiveData as PassiveEffectData;

        let newPassiveMethodData = await cardEffect.doServerEffect2(serverEffect, Stack._currentStack)

        // PassiveManager.updatePassiveMethodData((newPassiveMethodData as PassiveEffectData),this.isAfterActivation,true)
        this.effectPassiveMeta.args = (newPassiveMethodData as PassiveEffectData).methodArgs
        this.effectPassiveMeta.preventMethod = (newPassiveMethodData as PassiveEffectData).terminateOriginal

        // PassiveManager.passiveMethodData.args = (newPassiveMethodData as PassiveEffectData).methodArgs
        // PassiveManager.passiveMethodData.preventMethod = (newPassiveMethodData as PassiveEffectData).terminateOriginal
        PassiveManager.updatePassiveMethodData(this.effectPassiveMeta, this.isAfterActivation, true)

    }

    convertToServerStackEffect() {
        let serverActivatePassive = new ServerActivatePassive(this);
        return serverActivatePassive;
    }

}
