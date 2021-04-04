import { Component, log, Node, _decorator } from 'cc';
import { Card } from "../Entites/GameEntities/Card";
import { Dice } from "../Entites/GameEntities/Dice";
import { ServerEffect } from "../Entites/ServerCardEffect";
import { StackEffectPreview } from "../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";
import { ActiveEffectData } from './ActiveEffectData';
import { IEffectData } from "./IEffectData.1";
import { EffectTarget } from './EffectTarget';
import { EffectTargetFactory } from './EffectTargetFactory';
import { PassiveEffectData } from './PassiveEffectData';
import { ServerEffectData } from './ServerEffectData';
import { WrapperProvider } from './WrapperProvider';
const { ccclass, property } = _decorator;

interface IDataInterpreter {
    dataInerpreterWrapper: any
    makeEffectData(data: any, effectCard: any, cardPlayerId: any, isActive: boolean, isChainCollectorData: boolean): ActiveEffectData | PassiveEffectData
    convertToEffectData(serverEffectData: ServerEffectData | ActiveEffectData | PassiveEffectData): ActiveEffectData | PassiveEffectData | null
    convertToServerData(effectData: IEffectData): ServerEffectData
    getNodeFromData(data: any): any
}

@ccclass("DataInterpreter")
export class DataInterpreter extends Component implements IDataInterpreter {




    dataInerpreterWrapper: any;
    makeEffectData(data: any, effectCard: any, cardPlayerId: any, isActive: boolean, isChainCollectorData: boolean): ActiveEffectData | PassiveEffectData {
        let effectData: ActiveEffectData | PassiveEffectData
        if (isActive) {
            effectData = new ActiveEffectData();
            if (data != null) {
                if (isChainCollectorData) {
                    effectData.chainEffectsData = data;
                } else {
                    if (Array.isArray(data) && data.length > 0) {
                        if (data[0] instanceof EffectTarget) {
                            effectData.effectTargets = data;
                        } else if (data[0] instanceof Node) {
                            effectData.effectTargets = data.map(node => WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(node))
                        } else {
                            WrapperProvider.loggerWrapper.out.error(`when making effect data, data was not of required type (effectTarget[]/cc.node[])`, data)
                            throw new Error(`when making effect data, data was not of required type (effectTarget[]/cc.node[])`)
                        }
                    }
                    if (data instanceof EffectTarget) {
                        effectData.effectTargets.push(data)
                    }
                }
                if (typeof data === "number") {
                    effectData.numberRolled = data.valueOf();
                }
                if (data instanceof ServerEffect) {
                    effectData.cardEffect = data
                }
                if (data.cardPlayer != null) {

                    effectData.effectCardPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayer)!.character
                }
            }
        } else {
            effectData = new PassiveEffectData();
            if (data != null) {
                if (data.newArgs != null) {
                    effectData.methodArgs = data.newArgs
                }
                if (data.args != null) {
                    effectData.methodArgs = data.args
                }
                if (data.terminateOriginal != null) {
                    effectData.terminateOriginal = data.terminateOriginal
                }
                if (Array.isArray(data) && data[0] instanceof EffectTarget) {
                    effectData.effectTargets = data;
                }
                if (data instanceof EffectTarget) {
                    effectData.effectTargets.push(data)
                }
            }
        }

        effectData.effectCard = effectCard;

        if (effectData.effectCardOwner == null) {
            const owner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(effectCard)!;
            if (owner != null) {
                effectData.effectCardOwner = owner.character!
            } else {

                effectData.effectCardOwner = effectCard
            }
        }
        if (effectData.effectCardPlayer == null) {
            effectData.effectCardPlayer = effectData.effectCardOwner
        }

        return effectData
    }
    convertToEffectData(serverEffectData: ServerEffectData | ActiveEffectData | PassiveEffectData): ActiveEffectData | PassiveEffectData | null {
        let effectData: ActiveEffectData | PassiveEffectData | null = null;
        if (!(serverEffectData instanceof ServerEffectData)) {
            return serverEffectData as ActiveEffectData | PassiveEffectData
        }
        if (serverEffectData != null && serverEffectData instanceof ServerEffectData) {
            if (serverEffectData.isPassive) {
                effectData = new PassiveEffectData() as PassiveEffectData
                const x = new Map<string, any>()
                if (serverEffectData.methodArgs && typeof serverEffectData.methodArgs == typeof x) {
                    serverEffectData.methodArgs.forEach((arg, type, map) => {
                        if (type == typeof Node) {
                            (effectData as PassiveEffectData).methodArgs.push(WrapperProvider.cardManagerWrapper.out.getCardById(arg))
                        } else {
                            (effectData as PassiveEffectData).methodArgs.push(arg)
                        }
                    });
                    effectData.terminateOriginal = serverEffectData.terminateOriginal
                }
            } else {
                effectData = new ActiveEffectData()
            }
            if (serverEffectData.effectTargets.length > 0) {
                if (serverEffectData.isTargetStackEffect) {
                    effectData.effectTargets = serverEffectData.effectTargets.map((target) => WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(WrapperProvider.stackWrapper.out._currentStack.find(stackEffect => stackEffect.entityId == target) as any))
                } else {
                    effectData.effectTargets = serverEffectData.effectTargets.map((target) => WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(WrapperProvider.cardManagerWrapper.out.getCardById(target, true)))
                }
            }

            if (serverEffectData.effectCard != null) {
                effectData.effectCard = WrapperProvider.cardManagerWrapper.out.getCardById(serverEffectData.effectCard, true)
            }
            if (serverEffectData.effectCardOwner != null) {
                effectData.effectCardOwner = WrapperProvider.cardManagerWrapper.out.getCardById(serverEffectData.effectCardOwner, true)

            }
            if (serverEffectData.effectCardPlayer != null) {
                effectData.effectCardPlayer = WrapperProvider.cardManagerWrapper.out.getCardById(serverEffectData.effectCardPlayer, true)
            }
            if (!serverEffectData.isPassive) {
                if (serverEffectData.cardEffect != null) {
                    (effectData as ActiveEffectData).cardEffect = serverEffectData.cardEffect;
                }
                if (serverEffectData.numberRolled != 0) {

                    (effectData as ActiveEffectData).numberRolled = serverEffectData.numberRolled;
                }
            }
            if (serverEffectData.chainEffectsData != null) {
                for (let i = 0; i < serverEffectData.chainEffectsData.length; i++) {
                    const chainEffectData = serverEffectData.chainEffectsData[i];
                    effectData.chainEffectsData.push(
                        { effectIndex: chainEffectData.effectIndex, data: chainEffectData.data.map(data => WrapperProvider.dataInerpreterWrapper.out.convertToEffectData(data) as any) }
                    )
                }
            }

        }
        return effectData;
    }
    convertToServerData(effectData: IEffectData): ServerEffectData {
        if (effectData == null) {
            throw new Error("No Effect Data !!!")
        }
        const serverEffectData = new ServerEffectData()
        if (effectData instanceof ActiveEffectData) {
            serverEffectData.isPassive = false;
            if (effectData.effectTargets.length > 0) {
                serverEffectData.effectTargets = effectData.effectTargets.map((target) => {
                    console.log(target)
                    if (target.effectTargetStackEffectId != null) {
                        serverEffectData.isTargetStackEffect = true;
                        return target.effectTargetStackEffectId.entityId
                    } else {
                        return target.effectTargetCard.getComponent(Card)!._cardId
                    }
                })
            }
            if (effectData.effectCard != null) {
                if (effectData.effectCard.getComponent(Dice) != null) {
                    serverEffectData.effectCard = effectData.effectCard.getComponent(Dice)!.diceId;
                } else {

                    serverEffectData.effectCard = effectData.effectCard.getComponent(Card)!._cardId;
                }
            }
            if (effectData.cardEffect != null) {
                serverEffectData.cardEffect = effectData.cardEffect;
            }
            if (effectData.numberRolled != 0) {
                serverEffectData.numberRolled = effectData.numberRolled;
            }
        }
        if (effectData instanceof PassiveEffectData) {
            serverEffectData.isPassive = true;
            if (effectData.methodArgs != null) {
                effectData.methodArgs.forEach(arg => {
                    if (arg instanceof Component) {
                        arg = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(arg.node)
                    }
                    if (arg instanceof Node) {
                        serverEffectData.methodArgs.set(typeof Node, arg.getComponent(Card)!._cardId)
                    } else {
                        serverEffectData.methodArgs.set(typeof arg, arg)
                    }
                });
                serverEffectData.methodArgs = effectData.methodArgs as any;
            }
            if (effectData.terminateOriginal != null) {
                serverEffectData.terminateOriginal = effectData.terminateOriginal
            }
            if (effectData.effectTargets.length > 0) {
                serverEffectData.effectTargets = effectData.effectTargets.map((target) => {
                    if (target.effectTargetCard.getComponent(StackEffectPreview) != null) {
                        serverEffectData.isTargetStackEffect = true
                        return target.effectTargetCard.getComponent(StackEffectPreview)!.stackEffect!.entityId
                    } else {

                        return target.effectTargetCard.getComponent(Card)!._cardId
                    }
                })
            }
        }
        if (effectData.chainEffectsData != null) {
            for (const chainEffectData of effectData.chainEffectsData) {
                const newData: ServerEffectData[] = [];
                for (let i = 0; i < chainEffectData.data.length; i++) {
                    const data = chainEffectData.data[i];
                    try {

                        newData.push(WrapperProvider.dataInerpreterWrapper.out.convertToServerData(data) as any)
                    } catch (error) {
                        WrapperProvider.loggerWrapper.out.error(error)
                    }
                }
                serverEffectData.chainEffectsData.push(
                    { effectIndex: chainEffectData.effectIndex, data: newData }
                )
            }
        }
        if (effectData.effectCardOwner != null) {
            serverEffectData.effectCardOwner = effectData.effectCardOwner.getComponent(Card)!._cardId;

        }
        if (effectData.effectCardPlayer != null) {
            serverEffectData.effectCardPlayer = effectData.effectCardPlayer.getComponent(Card)!._cardId;
        }
        return serverEffectData;
    }
    getNodeFromData(data: any): any {

        if (data != null) {
            if (data.cardActivated != null) {
                return WrapperProvider.cardManagerWrapper.out.getCardById(data.cardActivated, true)
            }
            if (data.cardOwner != null) {
                return WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardOwner)!.node;

            }
            if (data.cardPlayer != null) {
                return WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayer)!.node;

            }
            if (data.cardsIds != null) {
                const cards = [];
                for (const id of data.cardsIds) {
                    cards.push(WrapperProvider.cardManagerWrapper.out.getCardById(id, true))
                }
                return cards
            }
            if (data.cardChosenId != null) {
                let card;
                card = WrapperProvider.cardManagerWrapper.out.getCardById(data.cardChosenId, true)
                if (card == null) {
                    card = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardChosenId)!.node
                }
                return card
            }
        }
    }
}


