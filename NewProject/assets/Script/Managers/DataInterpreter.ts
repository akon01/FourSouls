import Effect from "../CardEffectComponents/CardEffects/Effect";
import CardManager from "./CardManager";
import PlayerManager from "./PlayerManager";
import Player from "../Entites/GameEntities/Player";
import CardEffect from "../Entites/CardEffect";
import { ServerEffect } from "../Entites/ServerCardEffect";
import { TARGETTYPE } from "../Constants";
import Item from "../Entites/CardTypes/Item";
import Monster from "../Entites/CardTypes/Monster";
import Pile from "../Entites/Pile";
import Deck from "../Entites/GameEntities/Deck";
import Card from "../Entites/GameEntities/Card";
import Character from "../Entites/CardTypes/Character";
import Dice from "../Entites/GameEntities/Dice";


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
                        effectData.effectTargets = data;
                    }
                }
                if (typeof data === "number") {
                    effectData.numberRolled = data.valueOf();
                }
                if (data instanceof ServerEffect) {
                    effectData.cardEffect = data
                }
                if (data instanceof EffectTarget) {
                    effectData.effectTargetCard = data
                }

            }
        } else {
            effectData = new PassiveEffectData();
            if (data != null) {
                if (data.newArgs != null) {
                    effectData.methodArgs = data.newArgs
                }
                if (data.terminateOriginal != null) {
                    effectData.terminateOriginal = data.terminateOriginal
                }
            }
        }

        effectData.effectCard = effectCard;
        if (effectData.effectCardOwner == null) {
            let owner = PlayerManager.getPlayerByCard(effectCard);
            if (owner != null) {
                effectData.effectCardOwner = owner.character
            } else {
                owner = effectCard
            }
        }
        if (data.cardPlayer != null) {

            effectData.effectCardPlayer = PlayerManager.getPlayerById(data.cardPlayer).getComponent(Player).character
        }


        return effectData
    }

    static convertToActiveEffectData(serverEffectData: ServerEffectData) {
        cc.log(`converting to active effect data`)
        cc.log(serverEffectData)
        let effectData = new ActiveEffectData()
        if (serverEffectData.effectTargetCard != null) {
            effectData.effectTargetCard = new EffectTarget(CardManager.getCardById(serverEffectData.effectTargetCard, true))
        }
        if (serverEffectData.effectTargets.length > 0) {
            effectData.effectTargets = serverEffectData.effectTargets.map((target) => new EffectTarget(CardManager.getCardById(target, true)))
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

        if (serverEffectData.cardEffect != null) {
            effectData.cardEffect = serverEffectData.cardEffect;
        }
        if (serverEffectData.numberRolled != 0) {

            effectData.numberRolled = serverEffectData.numberRolled;
        }
        if (serverEffectData.chainEffectsData != null) {
            for (let i = 0; i < serverEffectData.chainEffectsData.length; i++) {
                const chainEffectData = serverEffectData.chainEffectsData[i];
                effectData.chainEffectsData.push(
                    { effectIndex: chainEffectData.effectIndex, data: chainEffectData.data.map(data => DataInterpreter.convertToActiveEffectData(data)) }
                )
            }
        }

        return effectData;
    }

    static convertToServerData(effectData: ActiveEffectData | PassiveEffectData) {
        let serverEffectData = new ServerEffectData()
        if (effectData instanceof ActiveEffectData) {
            if (effectData.effectTargetCard != null) {
                serverEffectData.effectTargetCard = effectData.effectTargetCard.effectTargetCard.getComponent(Card)._cardId;
            }
            if (effectData.effectTargets.length > 0) {
                serverEffectData.effectTargets = effectData.effectTargets.map((target) => target.effectTargetCard.getComponent(Card)._cardId)
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
            if (effectData.methodArgs != null) {
                serverEffectData.methodArgs = effectData.methodArgs;
            }
            if (effectData.terminateOriginal != null) {
                serverEffectData.terminateOriginal = effectData.terminateOriginal
            }
        }
        if (effectData.chainEffectsData != null) {
            for (const chainEffectData of effectData.chainEffectsData) {
                let newData: ServerEffectData[] = [];
                for (let i = 0; i < chainEffectData.data.length; i++) {
                    const data = chainEffectData.data[i];
                    newData.push(DataInterpreter.convertToServerData(data))
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
        cc.log(data)
        if (data != null) {
            if (data.cardActivated != null) {
                return CardManager.getCardById(data.cardActivated, true)
            }
            if (data.cardOwner != null) {
                return PlayerManager.getPlayerById(data.cardOwner);

            }
            if (data.cardPlayer != null) {
                return PlayerManager.getPlayerById(data.cardPlayer);

            }
            if (data.cardsIds != null) {
                let cards = [];
                for (const id of data.cardsIds) {
                    cards.push(CardManager.getCardById(id, true))
                }
                return cards
            }
            if (data.cardChosenId != null) {
                let card;
                card = CardManager.getCardById(data.cardChosenId, true)
                if (card == null) {
                    card = PlayerManager.getPlayerById(data.cardChosenId)
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
    chainEffectsData: { effectIndex: number, data: ActiveEffectData[] | PassiveEffectData[] }[] = [];
}

export class PassiveEffectData extends EffectData {
    methodArgs: any[] = [];
    terminateOriginal: boolean = false;

}

export class ActiveEffectData extends EffectData {
    effectTargetCard: EffectTarget;
    effectTargets: EffectTarget[] = [];
    effectOriginPlayer: cc.Node;
    cardEffect: ServerEffect;
    numberRolled: number;

    getTargets(targetType: TARGETTYPE) {
        let targets: EffectTarget[] = []
        for (const target of this.effectTargets) {
            if (target.targetType == targetType) targets.push(target)
        }
        return targets.map(target => target.effectTargetCard);
    }
    getTarget(targetType: TARGETTYPE) {
        if (this.effectTargetCard != null && (this.effectTargetCard.targetType == targetType || targetType == TARGETTYPE.CARD)) { cc.log(this.effectTargetCard.effectTargetCard.name); return this.effectTargetCard.effectTargetCard }
        for (const target of this.effectTargets) {
            if (target.targetType == targetType) {
                cc.log(target.effectTargetCard.name); return target.effectTargetCard
            }
        }
        cc.log('no target was found')
        return null
    }

    addTarget(target: cc.Node) {
        if (this.effectTargets.length == 0) {
            this.effectTargets.push(this.effectTargetCard);
            this.effectTargetCard = null;
        }
        cc.log(`add ${target.name} as a taget`)
        let newTarget = new EffectTarget(target);
        cc.log(newTarget)
        this.effectTargets.push(newTarget)
    }
}



export class ServerEffectData {

    effectTargetCard: number;
    effectTargets: number[] = [];
    effectOriginPlayer: number;
    effectCard: number;
    effectCardOwner: number;
    effectCardPlayer: number;
    cardEffect: ServerEffect;
    numberRolled: number;
    chainEffectsData: {
        effectIndex: number,
        data: any[];
    }[] = []
    methodArgs: any[] = [];
    terminateOriginal: boolean
}

export class EffectTarget {

    constructor(targetCard) {
        this.effectTargetCard = targetCard;
        this.targetType = this.getTargetType(this.effectTargetCard)
    }

    effectTargetCard: cc.Node;
    targetType: TARGETTYPE;

    getTargetType(targetNode: cc.Node) {
        cc.log(targetNode)
        if (targetNode != undefined) {

            if (targetNode.getComponent(Character) != null) return TARGETTYPE.PLAYER
            if (targetNode.getComponent(Item) != null) return TARGETTYPE.ITEM
            if (targetNode.getComponent(Monster) != null) return TARGETTYPE.MONSTER
            if (targetNode.getComponent(Pile) != null) return TARGETTYPE.PILE
            if (targetNode.getComponent(Deck) != null) return TARGETTYPE.DECK
            if (targetNode.getComponent(Card) != null) return TARGETTYPE.CARD
        }
    }

}