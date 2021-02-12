import Effect from "../CardEffectComponents/CardEffects/Effect";
import MultiEffectRollEffect from "../CardEffectComponents/CardEffects/MultiEffectRollAsEffect";
import GetTargetFromPassiveMeta from "../CardEffectComponents/DataCollector/GetTargetFromPassiveMeta";
import MultiEffectChoose from "../CardEffectComponents/MultiEffectChooser/MultiEffectChoose";
import { GAME_EVENTS, PASSIVE_EVENTS, ROLL_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import Card from "../Entites/GameEntities/Card";
import Player from "../Entites/GameEntities/Player";
import { Logger } from "../Entites/Logger";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import DataInterpreter, { EffectTarget, PassiveEffectData, ServerEffectData } from "../Managers/DataInterpreter";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import RollDiceStackEffect from "./Roll DIce";
import ServerActivatePassive from "./ServerSideStackEffects/Server Activate Passive";
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectInterface from "./StackEffectInterface";
import { ActivatePassiveItemVis } from "./StackEffectVisualRepresentation/Activate Passive Item Vis";
import StackEffectVisManager from "../Managers/StackEffectVisManager";
import ChainEffects from "../CardEffectComponents/CardEffects/ChainEffects";
import { whevent } from "../../ServerClient/whevent";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import MultiPassiveEffectsChooseAsEffect from "../CardEffectComponents/CardEffects/MultiPassiveEffectsChooseAsEffect";


export default class ActivatePassiveEffect extends StackEffectConcrete {

    visualRepesentation: ActivatePassiveItemVis;

    name = `Activate Passive Effect`

    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.ACTIVATE_PASSIVE_EFFECT;
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
    cardActivatorId: number
    cardWithEffect: cc.Node;
    effectToDo: Effect;
    effectPassiveMeta: PassiveMeta
    hasDataBeenCollectedYet: boolean = false;
    effectCollectedData: ServerEffectData = null;
    index: number = null;
    isAfterActivation: boolean = null

    constructor(creatorCardId: number, hasLockingStackEffect: boolean, cardActivatorId: number, cardWithEffect: cc.Node, effectToDo: Effect, hasDataBeenCollectedYet: boolean, isAfterActivation: boolean, index?: number, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)
        this.hasLockingStackEffect = hasLockingStackEffect;
        this.effectToDo = effectToDo;
        this.cardActivatorId = cardActivatorId;
        if (this.hasLockingStackEffect) { this.hasLockingStackEffectResolved = false; }
        this.cardWithEffect = cardWithEffect;
        this.hasDataBeenCollectedYet = hasDataBeenCollectedYet;
        this.visualRepesentation = new ActivatePassiveItemVis(cardWithEffect, this.cardWithEffect.getComponent(Card).cardSprite)
        this.index = index;
        this.isAfterActivation = isAfterActivation
        let firstLable
        if (this.effectToDo) {
            //if the effect should be silent 
            if (this.effectToDo.isSilent) {
                this.isSilent = true
            }
            const prev = StackEffectVisManager.$.getPreviewByStackId(this.entityId)
            if (prev && this.effectToDo.node) {
                prev.addSelectedEffectHighlight(this.effectToDo)
            }
            firstLable = `Activate ${this.cardWithEffect.name} Effect ${this.effectToDo.name}`
        } else { firstLable = `Activate ${this.cardWithEffect.name} ` }
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(firstLable, false)
        }
    }

    async putOnStack() {
        const card = this.cardWithEffect.getComponent(Card);
        const cardEffect = this.cardWithEffect.getComponent(CardEffect)

        const player = PlayerManager.getPlayerByCard(this.cardWithEffect)
        let cardOwner: cc.Node
        if (player != null) {

            cardOwner = player.node
        } else {
            cardOwner = this.cardWithEffect
        }
        let id: number = this.cardActivatorId;
        // if (player) {
        //     id = cardOwner.getComponent(Player).playerId
        // } else {
        //     id = cardOwner.getComponent(Card)._cardId
        // }
        if (!this.effectToDo) {
            if (cardEffect.hasMultipleEffects) {
                const multiEffectCollector = cardEffect.getMultiEffectCollector();
                //if the card has multiple effects and the player needs to choose
                if (multiEffectCollector instanceof MultiEffectChoose) {
                    const effectChosen = await multiEffectCollector.collectData({ cardPlayed: this.cardWithEffect, cardPlayerId: this.cardActivatorId })
                    this.effectToDo = effectChosen;
                    const prev = StackEffectVisManager.$.getPreviewByStackId(this.entityId)
                    if (prev && this.effectToDo.node) {
                        prev.addSelectedEffectHighlight(this.effectToDo)
                    }
                }
            }
        }
        if (this.effectToDo) {
            //special cases:
            //EFfect has "Player may activate"
            if (this.effectToDo.optionalBeforeDataCollection) {
                const doEffect = await cardOwner.getComponent(Player).giveYesNoChoice(this.effectToDo.optionalFlavorText)
                if (!doEffect) {
                    await Stack.fizzleStackEffect(this, false, true)
                    return
                }
            }

            if (this.effectToDo instanceof MultiEffectRollEffect) {
                for (const effect of this.effectToDo.effectsAndNumbers.map(eAn => eAn.effect)) {

                    await this.checkForSpeciealCollector(effect, id)
                }
            } else if (this.effectToDo instanceof ChainEffects) {
                for (const effect of this.effectToDo.getEffectsToChain()) {
                    await this.checkForSpeciealCollector(effect, id)
                }
            } else {
                await this.checkForSpeciealCollector(this.effectToDo, id)
            }
            cc.log(`if effect has dataCollector use it`)
            cc.log(this.effectToDo)
            if (this.effectToDo.conditionsIdsFinal.length > 0) {
                cc.log(`collect data for ${this.effectToDo.effectName}`)
                const collectedData = await cardEffect.collectEffectData(this.effectToDo, { cardId: this.cardWithEffect.getComponent(Card)._cardId, cardPlayerId: id })
                cardEffect.effectData = collectedData;
                this.effectCollectedData = collectedData;
                this.hasDataBeenCollectedYet = true;
            }
        }
        if (this.effectToDo) {
            const prev = StackEffectVisManager.$.getPreviewByStackId(this.entityId)
            if (prev && this.effectToDo.node) {
                prev.addSelectedEffectHighlight(this.effectToDo)
            }
            this.setLable(`Activate ${this.cardWithEffect.name} effect ${this.effectToDo.name}`, true)
        } else { this.setLable(`Activate ${this.cardWithEffect.name} `, true) }
    }

    async resolve() {
        const cardEffect = this.cardWithEffect.getComponent(CardEffect)
        let selectedEffect: Effect = null;
        this.isAfterActivation == true ? this.effectPassiveMeta = PassiveManager.afterActivationMap.get(this.index) : this.effectPassiveMeta = PassiveManager.beforeActivationMap.get(this.index)

        if (!this.effectPassiveMeta) {
            Logger.error(`passive effect meta was not found by index ${this.index}`, { after: PassiveManager.afterActivationMap, before: PassiveManager.beforeActivationMap })
        }

        //Special Cases
        //1. Passive card which says "when .... roll: do:1,2,3"
        if (this.effectToDo instanceof MultiEffectRollEffect) {
            //if this effect has locking stack effect (first only "roll:" for a dice roll) and it has not yet resolved
            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == false) {
                const lockingStackEffect = new RollDiceStackEffect(this.creatorCardId, this)
                await Stack.addToStack(lockingStackEffect, true)
            }

            if (this.hasLockingStackEffect && this.hasLockingStackEffectResolved == true) {
                const owner = PlayerManager.getPlayerByCard(CardManager.getCardOwner(this.cardWithEffect))
                // const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ROLL_DICE, [this.LockingResolve, ROLL_TYPE.EFFECT], null, owner.node, this.entityId)
                // const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
                // this.LockingResolve = afterPassiveMeta.args[0]
                try {
                    selectedEffect = (this.effectToDo as MultiEffectRollEffect).getEffectByNumberRolled(this.LockingResolve, this.cardWithEffect)
                } catch (error) {
                    Logger.error(error)
                }
            }
        } else if (this.effectToDo instanceof MultiPassiveEffectsChooseAsEffect) {
            selectedEffect = await this.effectToDo.chooseAnEffect(this.cardWithEffect)
        } else {
            selectedEffect = this.effectToDo
        }
        this.effectToDo = selectedEffect
        const prev = StackEffectVisManager.$.getPreviewByStackId(this.entityId)
        if (prev && this.effectToDo.node) {
            prev.addSelectedEffectHighlight(this.effectToDo)
        }
        await this.doCardEffect(this.effectToDo, this.hasDataBeenCollectedYet);
        this.setLable(`Activated ${this.cardWithEffect.name} Effect`, true)
        // this.effectToDo = null;
        this.effectPassiveMeta = null

    }

    async doCardEffect(effect: Effect, hasDataBeenCollectedYet: boolean) {
        if (!effect) {
            throw new Error("Effect passed to `Do Card Effect` was null")
        }
        const cardEffect = this.cardWithEffect.getComponent(CardEffect)
        const serverEffect = await cardEffect.getServerEffect(effect, this.cardActivatorId, !this.hasDataBeenCollectedYet)
        const passiveData = DataInterpreter.makeEffectData(this.effectPassiveMeta, this.cardWithEffect, this.cardActivatorId, false, false)

        let data: ServerEffectData
        if (cardEffect.effectData) {
            data = cardEffect.effectData
        } else if (this.effectCollectedData) {
            data = this.effectCollectedData
        }

        if (data) {
            if (cardEffect.effectData instanceof Array) {
                passiveData.effectTargets.push(...cardEffect.effectData)
            } else if (data.effectTargets.length > 0) {
                if (data.isTargetStackEffect) {
                    passiveData.effectTargets = data.effectTargets.map((target) => new EffectTarget(Stack._currentStack.find(stackEffect => stackEffect.entityId == target)))
                } else {
                    passiveData.effectTargets = data.effectTargets.map((target) => new EffectTarget(CardManager.getCardById(target, true)))
                }
            }
        }
        if (passiveData) {
            serverEffect.cardEffectData = passiveData as PassiveEffectData;
        }

        const newPassiveMethodData = await cardEffect.doServerEffect2(serverEffect, Stack._currentStack)

        debugger
        // PassiveManager.updatePassiveMethodData((newPassiveMethodData as PassiveEffectData),this.isAfterActivation,true)
        this.effectPassiveMeta.args = (newPassiveMethodData as PassiveEffectData).methodArgs
        this.effectPassiveMeta.preventMethod = (newPassiveMethodData as PassiveEffectData).terminateOriginal

        // PassiveManager.passiveMethodData.args = (newPassiveMethodData as PassiveEffectData).methodArgs
        // PassiveManager.passiveMethodData.preventMethod = (newPassiveMethodData as PassiveEffectData).terminateOriginal
        PassiveManager.updatePassiveMethodData(this.effectPassiveMeta, this.isAfterActivation, true)

    }

    convertToServerStackEffect() {
        const serverActivatePassive = new ServerActivatePassive(this);
        return serverActivatePassive;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Activate Passive Effect\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.effectToDo) { endString = endString + `Effect:${this.effectToDo.name}\n` }
        if (this.cardActivatorId) { endString = endString + `Effect Played By:${CardManager.getCardById(this.cardActivatorId).name}\n` }
        if (this.cardWithEffect) { endString = endString + `Card With Effect:${this.cardWithEffect.name}\n` }
        return endString
    }

    async checkForSpeciealCollector(effect: Effect, id: number) {
        const cardEffect = this.cardWithEffect.getComponent(CardEffect)
        if (effect.conditionsIdsFinal.length > 0) {
            const specialDataCollector = effect.getDataCollectors().find(dataCollector => {
                // Special Cases:
                if (dataCollector instanceof GetTargetFromPassiveMeta) {
                    return true
                }
            })
            if (specialDataCollector && specialDataCollector instanceof GetTargetFromPassiveMeta) {
                cc.log(`effect ${effect.name} has special collector, set meta index and is afteractivation`)
                specialDataCollector.metaIndex = this.index
                specialDataCollector.isAfterActivation = this.isAfterActivation
            }

        }
    }

}
