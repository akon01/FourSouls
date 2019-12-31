import { TARGETTYPE } from "../Constants";
import Character from "../Entites/CardTypes/Character";
import Item from "../Entites/CardTypes/Item";
import Monster from "../Entites/CardTypes/Monster";
import Card from "../Entites/GameEntities/Card";
import Deck from "../Entites/GameEntities/Deck";
import Dice from "../Entites/GameEntities/Dice";
import Player from "../Entites/GameEntities/Player";
import Pile from "../Entites/Pile";
import { ServerEffect } from "../Entites/ServerCardEffect";
import Stack from "../Entites/Stack";
import StackEffectConcrete from "../StackEffects/StackEffectConcrete";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import StackEffectPreview from "../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";
import CardManager from "./CardManager";
import PlayerManager from "./PlayerManager";
import { Logger } from "../Entites/Logger";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DataInterpreter {

    static makeEffectData(data, effectCard, cardPlayerId, isActive: boolean, isChainCollectorData: boolean): ActiveEffectData | PassiveEffectData {

        let effectData: ActiveEffectData | PassiveEffectData
        if (isActive) {
            effectData = new ActiveEffectData();
            if (data != null) {
                if (isChainCollectorData) {
                    effectData.chainEffectsData = data;
                } else {
                    if (Array.isArray(data)) {
                        if (data[0] instanceof EffectTarget) {
                            effectData.effectTargets = data;
                        } else if (data[0] instanceof cc.Node) {
                            effectData.effectTargets = data.map(node => new EffectTarget(node))
                        } else {
                            cc.error(data)
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

                    effectData.effectCardPlayer = PlayerManager.getPlayerById(data.cardPlayer).character
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
            const owner = PlayerManager.getPlayerByCard(effectCard);
            if (owner != null) {
                effectData.effectCardOwner = owner.character
            } else {

                effectData.effectCardOwner = effectCard
            }
        }
        if (effectData.effectCardPlayer == null) {
            effectData.effectCardPlayer = effectData.effectCardOwner
        }

        return effectData
    }

    static convertToEffectData(serverEffectData: ServerEffectData) {
        let effectData: ActiveEffectData | PassiveEffectData;
        if (serverEffectData != null) {
            if (serverEffectData.isPassive) {
                effectData = new PassiveEffectData()
                if (serverEffectData.methodArgs) {
                    effectData.methodArgs = serverEffectData.methodArgs;
                    effectData.terminateOriginal = serverEffectData.terminateOriginal
                }
            } else {
                effectData = new ActiveEffectData()
            }
            if (serverEffectData.effectTargets.length > 0) {
                if (serverEffectData.isTargetStackEffect) {
                    effectData.effectTargets = serverEffectData.effectTargets.map((target) => new EffectTarget(Stack._currentStack.find(stackEffect => stackEffect.entityId == target)))
                } else {
                    effectData.effectTargets = serverEffectData.effectTargets.map((target) => new EffectTarget(CardManager.getCardById(target, true)))
                }
            }

            if (serverEffectData.effectCard != null) {
                effectData.effectCard = CardManager.getCardById(serverEffectData.effectCard, true)
            }
            if (serverEffectData.effectCardOwner != null) {
                effectData.effectCardOwner = CardManager.getCardById(serverEffectData.effectCardOwner, true)

            }
            if (serverEffectData.effectCardPlayer != null) {
                effectData.effectCardPlayer = CardManager.getCardById(serverEffectData.effectCardPlayer, true)
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
                        { effectIndex: chainEffectData.effectIndex, data: chainEffectData.data.map(data => DataInterpreter.convertToEffectData(data) as any) }
                    )
                }
            }

        }
        return effectData;
    }

    static convertToServerData(effectData: ActiveEffectData | PassiveEffectData) {
        if (effectData == null) {
            return
        }
        const serverEffectData = new ServerEffectData()
        if (effectData instanceof ActiveEffectData) {
            serverEffectData.isPassive = false;
            if (effectData.effectTargets.length > 0) {
                serverEffectData.effectTargets = effectData.effectTargets.map((target) => {
                    cc.log(target)
                    if (target.effectTargetStackEffectId != null) {
                        serverEffectData.isTargetStackEffect = true;
                        return target.effectTargetStackEffectId.entityId
                    } else {
                        return target.effectTargetCard.getComponent(Card)._cardId
                    }
                })
            }
            if (effectData.effectCard != null) {
                if (effectData.effectCard.getComponent(Dice) != null) {
                    serverEffectData.effectCard = effectData.effectCard.getComponent(Dice).diceId;
                } else {

                    serverEffectData.effectCard = effectData.effectCard.getComponent(Card)._cardId;
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
                serverEffectData.methodArgs = effectData.methodArgs;
            }
            if (effectData.terminateOriginal != null) {
                serverEffectData.terminateOriginal = effectData.terminateOriginal
            }
            if (effectData.effectTargets.length > 0) {
                serverEffectData.effectTargets = effectData.effectTargets.map((target) => {
                    if (target.effectTargetCard.getComponent(StackEffectPreview) != null) {
                        serverEffectData.isTargetStackEffect = true
                        return target.effectTargetCard.getComponent(StackEffectPreview).stackEffect.entityId
                    } else {

                        return target.effectTargetCard.getComponent(Card)._cardId
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

                        newData.push(DataInterpreter.convertToServerData(data))
                    } catch (error) {
                        cc.error(error)
                        Logger.error(error)
                    }
                }
                serverEffectData.chainEffectsData.push(
                    { effectIndex: chainEffectData.effectIndex, data: newData }
                )
            }
        }
        if (effectData.effectCardOwner != null) {
            serverEffectData.effectCardOwner = effectData.effectCardOwner.getComponent(Card)._cardId;

        }
        if (effectData.effectCardPlayer != null) {
            serverEffectData.effectCardPlayer = effectData.effectCardPlayer.getComponent(Card)._cardId;
        }
        return serverEffectData;
    }

    static getNodeFromData(data) {

        if (data != null) {
            if (data.cardActivated != null) {
                return CardManager.getCardById(data.cardActivated, true)
            }
            if (data.cardOwner != null) {
                return PlayerManager.getPlayerById(data.cardOwner).node;

            }
            if (data.cardPlayer != null) {
                return PlayerManager.getPlayerById(data.cardPlayer).node;

            }
            if (data.cardsIds != null) {
                const cards = [];
                for (const id of data.cardsIds) {
                    cards.push(CardManager.getCardById(id, true))
                }
                return cards
            }
            if (data.cardChosenId != null) {
                let card;
                card = CardManager.getCardById(data.cardChosenId, true)
                if (card == null) {
                    card = PlayerManager.getPlayerById(data.cardChosenId).node
                }
                return card
            }
        }
    }
}

export class EffectData {
    effectCard: cc.Node;
    effectCardOwner: cc.Node;
    effectCardPlayer: cc.Node;
    chainEffectsData: Array<{ effectIndex: number, data: ActiveEffectData[] | PassiveEffectData[] }> = [];
    effectTargets: EffectTarget[] = [];

    addTarget(target) {
        if (target instanceof EffectTarget) {
            this.effectTargets.push(target)
        } else {
            const newTarget = new EffectTarget(target);
            this.effectTargets.push(newTarget)
        }
    }
}

export class PassiveEffectData extends EffectData {
    methodArgs: any[] = [];
    terminateOriginal: boolean = false;

    getTargets(targetType: TARGETTYPE) {
        const targets: EffectTarget[] = []
        for (const target of this.effectTargets) {
            if (target.targetType == targetType) { targets.push(target) }
        }
        if (targetType != TARGETTYPE.STACK_EFFECT) {

            return targets.map(target => target.effectTargetCard);
        } else { return targets.map(target => target.effectTargetStackEffectId); }
    }
    getTarget(targetType: TARGETTYPE) {
        if (targetType == TARGETTYPE.STACK_EFFECT) {
            for (const target of this.effectTargets) {
                if (target.targetType == targetType) {
                    return target.effectTargetStackEffectId
                }
            }
        } else
            if (targetType == TARGETTYPE.CARD) {
                return this.effectTargets[this.effectTargets.length - 1].effectTargetCard
            } else {

                for (const target of this.effectTargets) {
                    if (target.targetType == targetType) {
                        return target.effectTargetCard
                    }
                }
            }
        return null
    }

}

export class ActiveEffectData extends EffectData {

    effectOriginPlayer: cc.Node;
    cardEffect: ServerEffect;
    numberRolled: number;

    getTargets(targetType: TARGETTYPE) {
        const targets: EffectTarget[] = []
        for (const target of this.effectTargets) {
            if (target.targetType == targetType) {
                targets.push(target)
            } else if (targetType == TARGETTYPE.CARD && target.targetType != TARGETTYPE.STACK_EFFECT) {
                targets.push(target)
            }
        }
        if (targetType != TARGETTYPE.STACK_EFFECT) {

            return targets.map(target => target.effectTargetCard);
        } else { return targets.map(target => target.effectTargetStackEffectId); }
    }
    getTarget(targetType: TARGETTYPE) {
        if (targetType == TARGETTYPE.STACK_EFFECT) {
            for (const target of this.effectTargets) {
                if (target.targetType == targetType) {
                    return target.effectTargetStackEffectId
                }
            }
        } else if (targetType == TARGETTYPE.CARD) {
            return this.effectTargets[this.effectTargets.length - 1].effectTargetCard
        } else {
            for (const target of this.effectTargets) {
                if (target.targetType == targetType) {
                    return target.effectTargetCard
                }
            }
        }
        cc.error("no target was found")
        return null
    }

}

export class ServerEffectData {

    effectTargetCard: number;
    effectTargets: number[] = [];
    isTargetStackEffect: boolean
    effectOriginPlayer: number;
    effectCard: number;
    effectCardOwner: number;
    effectCardPlayer: number;
    cardEffect: ServerEffect;
    numberRolled: number;
    chainEffectsData: Array<{
        effectIndex: number,
        data: any[];
    }> = []
    methodArgs: any[] = [];
    terminateOriginal: boolean
    isPassive: boolean
}

export class EffectTarget {

    constructor(targetCard) {
        if (targetCard instanceof cc.Node) {
            this.effectTargetCard = targetCard;
            this.targetType = this.getTargetCardType(this.effectTargetCard)
        }
        if (targetCard instanceof StackEffectPreview) {
            this.effectTargetStackEffectId = targetCard.stackEffect;
            this.targetType = TARGETTYPE.STACK_EFFECT
        }
        if (targetCard instanceof StackEffectConcrete) {
            this.effectTargetStackEffectId = targetCard;
            this.targetType = TARGETTYPE.STACK_EFFECT
        }
    }

    effectTargetStackEffectId: StackEffectInterface
    effectTargetCard: cc.Node;
    targetType: TARGETTYPE;

    getTargetCardType(targetNode: cc.Node) {

        if (targetNode != undefined) {

            if (targetNode.getComponent(Character) != null) { return TARGETTYPE.PLAYER }
            if (targetNode.getComponent(Item) != null) { return TARGETTYPE.ITEM }
            if (targetNode.getComponent(Monster) != null) { return TARGETTYPE.MONSTER }
            if (targetNode.getComponent(Pile) != null) { return TARGETTYPE.PILE }
            if (targetNode.getComponent(Deck) != null) { return TARGETTYPE.DECK }
            if (targetNode.getComponent(Card) != null) { return TARGETTYPE.CARD }
            if (targetNode.getComponent(StackEffectPreview) != null) { return TARGETTYPE.STACK_EFFECT }
        }
    }

}
