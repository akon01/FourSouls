
import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import { CARD_TYPE, GAME_EVENTS } from "../Constants";
import ActionLable from "../LableScripts/Action Lable";
import MainScript from "../MainScript";
import ActionManager from "../Managers/ActionManager";
import PassiveManager from "../Managers/PassiveManager";
import PileManager from "../Managers/PileManager";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectVisManager from "../Managers/StackEffectVisManager";
import TurnsManager from "../Managers/TurnsManager";
import PlayLootCardStackEffect from "../StackEffects/Play Loot Card";
import ServerStackEffectInterface from "../StackEffects/ServerSideStackEffects/ServerStackEffectInterface";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import Card from "./GameEntities/Card";
import Player from "./GameEntities/Player";
import { Logger } from "./Logger";
import CardManager from "../Managers/CardManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Stack extends cc.Component {

    static stackEffectsIds: number = 0;

    static _currentStack: StackEffectInterface[] = []

    static _currentStackEffectsResolving: number[] = [];

    static isInResolvePhase: boolean = false;

    static hasOtherPlayerRespondedYet: boolean = false;

    static hasOtherPlayerRespond: boolean = null;

    static hasStackEffectResolvedAtAnotherPlayer: boolean = false;

    static newStack = null;

    static getNextStackEffectId() {
        ServerClient.$.send(Signal.NEXT_STACK_ID)
        this.stackEffectsIds++
        return this.stackEffectsIds
    }

    static checkColor = 0;

    static async startResponseCheck(actionMessageId?: number) {
        if (!MainScript.gameHasStarted) { return false }
        if (this.hasAnyoneResponded) { return true }

        Stack.checkColor += 10;
        let lastPlayer: Player = null
        let nextPlayer: Player = null

        for (let i = 0; i < PlayerManager.players.length; i++) {
            if (nextPlayer == null) {
                nextPlayer = PlayerManager.getPriorityPlayer();
            } else {
                nextPlayer = PlayerManager.getNextPlayer(lastPlayer)
            }

            lastPlayer = nextPlayer

            const amId = ActionLable.$.publishMassage(`Wait For Response From Player ${nextPlayer.playerId} `, 0, true, actionMessageId)
            cc.error(`publish get response amId ${amId}`)
            const hasOtherPlayerResponded = await this.givePlayerPriority(nextPlayer)
            cc.log(`remove get response `)
            ActionLable.$.removeMessage(amId, true)

            // if player did respond
            if (hasOtherPlayerResponded == true) {
                //ActionLable.$.publishMassage(`Player ${nextPlayer.playerId} did respond`, 1.5, true)
                return true;
                // if player didn't respond
            } else {
                // ActionLable.$.publishMassage(`Player ${nextPlayer.playerId} didn't respond`, 1.5, true)
            }
        }
        return false;

    }

    static addToCurrentStackEffectResolving(stackEffectToAdd: StackEffectInterface, sendToServer: boolean) {
        this._currentStackEffectsResolving.push(stackEffectToAdd.entityId)
        if (sendToServer) {
            ServerClient.$.send(Signal.ADD_RESOLVING_STACK_EFFECT, { stackEffect: stackEffectToAdd.convertToServerStackEffect() })
        }
    }

    static removeFromCurrentStackEffectResolving(stackEffectToAdd: StackEffectInterface, sendToServer: boolean) {
        this._currentStackEffectsResolving.splice(this._currentStackEffectsResolving.indexOf(stackEffectToAdd.entityId))
        if (sendToServer) {
            ServerClient.$.send(Signal.REMOVE_RESOLVING_STACK_EFFECT, { stackEffect: stackEffectToAdd.convertToServerStackEffect() })
        }
    }

    static getCurrentResolvingStackEffect() {
        const id = this._currentStackEffectsResolving[this._currentStackEffectsResolving.length - 1]
        return this._currentStack.find(stackEffect => stackEffect.entityId == id)
    }

    static async doStackEffectFromTop(sendToServer: boolean) {
        const mePlayer = PlayerManager.mePlayer.getComponent(Player)
        const stackEffect = this._currentStack[this._currentStack.length - 1]
        //cc.error(`do ${stackEffect.constructor.name} ${stackEffect.entityId} from top`)
        let amId
        if (sendToServer) {
            amId = ActionLable.$.publishMassage(`Resolve ${stackEffect.constructor.name} ${stackEffect.entityId} `, 0)
        }
        if (mePlayer.character.getComponent(Card)._cardId == stackEffect.creatorCardId || (PlayerManager.getPlayerByCardId(stackEffect.creatorCardId) == null)) {
            // if a StackEffect is in its resolve function (should be true only if the StackEffect has locking effect.)
            if ((!this._currentStackEffectsResolving.includes(stackEffect.entityId))) {
                //    this.isInResolvePhase = true;
                this._currentStackEffectsResolving.push(stackEffect.entityId);
                let newStack
                try {
                    newStack = await stackEffect.resolve()
                    cc.log(stackEffect)
                    if (!stackEffect.checkForFizzle()) {
                        ServerClient.$.send(Signal.UPDATE_STACK_EFFECT, { stackEffect: stackEffect.convertToServerStackEffect() })
                    } else {
                        cc.log(`${stackEffect.constructor.name} ${stackEffect.entityId} has been fizzled`)
                    }
                } catch (error) {
                    cc.error(`error while resolving stack effect ${stackEffect.toString()}`)
                    cc.error(error)
                    Logger.error(`error while resolving stack effect ${stackEffect.entityId}`)
                    Logger.error(error)
                }
                // cc.error(`b4 removing ${stackEffect.constructor.name} ${stackEffect.entityId} from currentStackEffectResolving`)
                this._currentStackEffectsResolving.splice(this._currentStackEffectsResolving.indexOf(stackEffect.entityId));
                if (sendToServer) {
                    ActionLable.$.removeMessage(amId, true)
                    await this.removeAfterResolve(stackEffect, sendToServer)
                } else {

                    return newStack;
                }
            } else {
                if (this._currentStackEffectsResolving.includes(stackEffect.entityId)) {
                    return this._currentStack;
                }
            }
        } else {
            const stackEffectPlayer = PlayerManager.getPlayerByCardId(stackEffect.creatorCardId)
            const serverStack = this._currentStack.map(stackEffect => stackEffect.convertToServerStackEffect())
            ServerClient.$.send(Signal.DO_STACK_EFFECT, { originPlayerId: mePlayer.playerId, playerId: stackEffectPlayer.playerId, currentStack: serverStack })
            const newStack = await this.waitForStackEffectResolve();
            ActionLable.$.removeMessage(amId, true)
            await this.replaceStack(newStack, sendToServer)
            if (sendToServer) {
                const stackEffectToRemove = Stack._currentStack.find(effect => effect.entityId == stackEffect.entityId)

                // await this.removeFromTopOfStack(sendToServer)

                await this.removeAfterResolve(stackEffectToRemove, sendToServer)
            } else {
                return newStack;
            }
        }
    }

    static async addToStackBelow(stackEffectToAdd: StackEffectInterface, stackEffectToAddBelowTo: StackEffectInterface, deleteOriginal: boolean) {
        //cc.error(`add ${stackEffectToAdd.constructor.name} ${stackEffectToAdd.entityId} to stack below`)
        const stackEffectIndex = this._currentStack.indexOf(stackEffectToAddBelowTo)

        let newStack: StackEffectInterface[] = []
        if (this._currentStack.length == 1) {
            this._currentStack.unshift(stackEffectToAdd)
            newStack = this._currentStack
        } else {
            this._currentStack.splice(stackEffectIndex, 0, stackEffectToAdd)
            newStack = this._currentStack;
            // newStack = this._currentStack.fill(stackEffectToAdd, stackEffectIndex, stackEffectIndex + 1)
        }

        await stackEffectToAdd.putOnStack()
        cc.log(stackEffectToAdd)
        ServerClient.$.send(Signal.UPDATE_STACK_EFFECT, { stackEffect: stackEffectToAdd.convertToServerStackEffect() })
        //   StackEffectVisManager.$.addPreview(stackEffectToAdd)
        await this.replaceStack(newStack, true)
    }

    static async addToStackAbove(stackEffectToAdd: StackEffectInterface) {
        //cc.error(`add ${stackEffectToAdd.constructor.name} ${stackEffectToAdd.entityId} to stack above`)
        if (this._currentStack.length == 0) {
            await this.addToStack(stackEffectToAdd, true)
        } else {
            this._currentStack.push(stackEffectToAdd)
            await stackEffectToAdd.putOnStack()
            cc.log(stackEffectToAdd)
            ServerClient.$.send(Signal.UPDATE_STACK_EFFECT, { stackEffect: stackEffectToAdd.convertToServerStackEffect() })
            //     StackEffectVisManager.$.addPreview(stackEffectToAdd)
            await this.replaceStack(this._currentStack, true)
        }
        // await ActionManager.updateActions()
    }

    static async givePlayerPriority(playerToSendTo: Player) {
        const id = playerToSendTo.playerId

        const meId = PlayerManager.mePlayer.getComponent(Player).playerId
        this.hasOtherPlayerRespondedYet = false;
        playerToSendTo.givePriority(true)
        if (playerToSendTo == PlayerManager.mePlayer.getComponent(Player)) {
            try {
                this.hasOtherPlayerRespond = await playerToSendTo.getResponse(playerToSendTo.playerId)
            } catch (error) {
                cc.error(error)
                Logger.error(error)
            }
        } else {
            ServerClient.$.send(Signal.GET_REACTION, { playerId: id, activePlayerId: meId })
            const hasPlayerResponded = await this.waitForPlayerReaction()
            this.hasOtherPlayerRespond = hasPlayerResponded;
        }
        return this.hasOtherPlayerRespond
    }

    /**
     * will end after all available StackEffects are resolved.
     * @param stackEffect
     */
    static async addToStack(stackEffect: StackEffectInterface, sendToServer: boolean) {
        //cc.error(`add ${stackEffect.constructor.name} ${stackEffect.entityId} to stack`)
        this._currentStack.push(stackEffect)
        if (sendToServer) {
            ServerClient.$.send(Signal.ADD_TO_STACK, { stackEffect: stackEffect.convertToServerStackEffect() })
        }
        StackEffectVisManager.$.addPreview(stackEffect)

        if (sendToServer) {

            //disable all card actions until the stack ends


            const amId = ActionLable.$.publishMassage(`Add ${stackEffect.constructor.name} ${stackEffect.entityId} `, 0)
            await stackEffect.putOnStack()
            ActionLable.$.removeMessage(amId, true)
            ServerClient.$.send(Signal.UPDATE_STACK_EFFECT, { stackEffect: stackEffect.convertToServerStackEffect() })
            // const serverStackEffect: ServerStackEffectInterface = stackEffect.convertToServerStackEffect()
            // ServerClient.$.send(Signal.ADD_TO_STACK, { stackEffect: serverStackEffect })
            // do check for responses.
            const amId2 = ActionLable.$.publishMassage(`Response Adding ${stackEffect.constructor.name} ${stackEffect.entityId}`, 0, true, amId)
            this.hasAnyoneResponded = await this.startResponseCheck(amId)
            //   cc.error(`after Response Check For Adding ${stackEffect.constructor.name} ${stackEffect.entityId}`)
            ActionLable.$.removeMessage(amId2, true)
            if (this.hasAnyoneResponded) {
                this.hasAnyoneResponded = false;
                return;
            } else {
                // if there are more stackEffects to do.
                if (this._currentStack.length > 0) {
                    await this.doStackEffectFromTop(sendToServer)
                    // } else {
                    //     ServerClient.$.send(Signal.TURN_PLAYER_DO_STACK_EFFECT, { playerId: TurnsManager.currentTurn.getTurnPlayer().playerId })
                    // }
                }
            }
        }
    }

    static async fizzleStackEffect(stackEffect: StackEffectInterface, sendToServer: boolean) {
        this._currentStack = this._currentStack.filter(effect => {
            if (effect != stackEffect) { return true; }
        })
        if (this._currentStack.length == 0) { whevent.emit(GAME_EVENTS.STACK_EMPTIED) }
        this._currentStackEffectsResolving = this._currentStackEffectsResolving.filter(effect => {
            if (effect != stackEffect.entityId) { return true; }
        })
        StackEffectVisManager.$.removePreview(stackEffect)
        if (sendToServer) {
            ActionLable.$.publishMassage(`Fizzle ${stackEffect.constructor.name} ${stackEffect.entityId}`, 3)
            if (stackEffect instanceof PlayLootCardStackEffect) {
                await PileManager.addCardToPile(CARD_TYPE.LOOT, stackEffect.lootToPlay, true)
            }
        }
        // throw `implement fizzle stack effect`
    }

    static async removeFromTopOfStack(sendToServer: boolean) {
        const lastOfStack = this._currentStack.pop();
        StackEffectVisManager.$.removePreview(lastOfStack)
        if (sendToServer) {
            const amId = ActionLable.$.publishMassage(`Remove ${lastOfStack.constructor.name} ${lastOfStack.entityId}`, 3)
            ServerClient.$.send(Signal.REMOVE_FROM_STACK)
            const amId2 = ActionLable.$.publishMassage(`Response Removing ${lastOfStack.constructor.name} ${lastOfStack.entityId}`, 0, true, amId)
            this.hasAnyoneResponded = await this.startResponseCheck(amId)
            ActionLable.$.removeMessage(amId2, true)
            if (this.hasAnyoneResponded) {
                this.hasAnyoneResponded = false
                return;
            } else {
                if (this._currentStack.length > 0) {
                    await this.doStackEffectFromTop(sendToServer)
                } else {
                    ActionLable.$.publishMassage(`Stack Was Emptied `, 1.5)
                    whevent.emit(GAME_EVENTS.STACK_EMPTIED)
                    if (PlayerManager.mePlayer.getComponent(Player) != TurnsManager.currentTurn.getTurnPlayer()) {
                        ServerClient.$.send(Signal.TURN_PLAYER_DO_STACK_EFFECT, { playerId: TurnsManager.currentTurn.getTurnPlayer().playerId })
                    } else {
                        await ActionManager.updateActions()
                    }
                    // when there are no more stack effects to do
                    // TODO give turn player control. (update his actions)
                }
            }
        } else {
            await ActionManager.updateActions()
        }
        //  cc.log(`update actions after removal of stack effect`)
    }

    static hasAnyoneResponded: boolean = false;

    static async removeAfterResolve(stackEffectToRemove: StackEffectInterface, sendToServer: boolean) {
        // cc.error(`remove ${stackEffectToRemove.constructor.name} ${stackEffectToRemove.entityId} after resolve`)
        //    cc.log(`remove stack effect:\n${stackEffectToRemove.toString()}`)
        //  cc.log(`current stack:\n${Stack._currentStack.map(effect => effect.toString())}`)
        if (Stack._currentStack.map(effect => effect.entityId).includes(stackEffectToRemove.entityId)) {
            const lastOfStack = Stack._currentStack.find((effect) => effect.entityId == stackEffectToRemove.entityId);
            const index = Stack._currentStack.indexOf(lastOfStack)
            //    cc.log(`index of the stack effect in current stack is ${index}`)
            Stack._currentStack.splice(index, 1)
            //  cc.log(`current stack after removal:\n${Stack._currentStack.map(effect => effect.toString())}`)
            StackEffectVisManager.$.removePreview(lastOfStack)
            if (sendToServer) {
                const amId = ActionLable.$.publishMassage(`Remove After Resolve ${lastOfStack.constructor.name} ${lastOfStack.entityId}  `, 3)
                ServerClient.$.send(Signal.REMOVE_FROM_STACK, { stackEffect: lastOfStack.convertToServerStackEffect() })
                const amId2 = ActionLable.$.publishMassage(`Response Remove After Resolve ${lastOfStack.constructor.name} ${lastOfStack.entityId}`, 0, true, amId)
                this.hasAnyoneResponded = await this.startResponseCheck(amId)
                ActionLable.$.removeMessage(amId2, true)
                if (this.hasAnyoneResponded) {
                    this.hasAnyoneResponded = false
                    return;
                } else {
                    if (this._currentStack.length > 0) {
                        await this.doStackEffectFromTop(sendToServer)
                    } else {
                        ActionLable.$.publishMassage(`Stack Was Emptied `, 1.5)
                        whevent.emit(GAME_EVENTS.STACK_EMPTIED)
                        if (PlayerManager.mePlayer.getComponent(Player) != TurnsManager.currentTurn.getTurnPlayer()) {
                            ServerClient.$.send(Signal.TURN_PLAYER_DO_STACK_EFFECT, { playerId: TurnsManager.currentTurn.getTurnPlayer().playerId })
                        } else {
                            await ActionManager.updateActions()
                        }
                        // when there are no more stack effects to do
                        // TODO give turn player control. (update his actions)
                    }
                }
            } else {
                await ActionManager.updateActions()
            }
        } else {
            if (this._currentStack.length > 0) {
                await this.doStackEffectFromTop(sendToServer)
            } else {
                ActionLable.$.publishMassage(`Stack Was Emptied `, 1.5)
                whevent.emit(GAME_EVENTS.STACK_EMPTIED)
                if (PlayerManager.mePlayer.getComponent(Player) != TurnsManager.currentTurn.getTurnPlayer()) {
                    ServerClient.$.send(Signal.TURN_PLAYER_DO_STACK_EFFECT, { playerId: TurnsManager.currentTurn.getTurnPlayer().playerId })
                } else {
                    await ActionManager.updateActions()
                }
                // when there are no more stack effects to do
                // TODO give turn player control. (update his actions)
            }
        }

        //  cc.log(`update actions after removal of stack effect`)
    }

    static replaceStack(newStack: StackEffectInterface[], sendToServer: boolean) {

        this._currentStack = []
        if (Array.isArray(newStack)) {

            this._currentStack = this._currentStack.concat(newStack);
        } else {
            this._currentStack.push(newStack)
        }

        if (this._currentStack.length == 0) { whevent.emit(GAME_EVENTS.STACK_EMPTIED) }

        // StackEffectVisManager.$.clearPreviews()
        // for (const stackEffect of this._currentStack) {
        //     StackEffectVisManager.$.addPreview(stackEffect)
        // }
        // StackEffectVisManager.$.updateAvailablePreviews();
        StackEffectVisManager.$.setPreviews(this._currentStack)
        if (sendToServer) {
            const serverStack = this._currentStack.map(stackEffect => stackEffect.convertToServerStackEffect())
            ServerClient.$.send(Signal.REPLACE_STACK, { currentStack: serverStack })
        }
    }

    static waitForPlayerReaction(): Promise<boolean> {

        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.PLAYER_RESPOND, () => {
                resolve(this.hasOtherPlayerRespond);
            });
        })
    }
    static waitForStackEmptied(): Promise<boolean> {
        if (this._currentStack.length == 0) { return }
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.STACK_EMPTIED, () => {
                resolve();
            })
        });
    }

    static waitForStackEffectResolve(): Promise<StackEffectInterface[]> {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.STACK_STACK_EFFECT_RESOLVED_AT_OTHER_PLAYER, () => {
                this.hasStackEffectResolvedAtAnotherPlayer = false;
                resolve(this.newStack);
            })
        });
    }
    onLoad() {
        whevent.on(GAME_EVENTS.STACK_EMPTIED, async () => {
            // PassiveManager.afterActivationMap.clear()
            // PassiveManager.beforeActivationMap.clear()
            cc.log(`Stack emptied`)
            if (TurnsManager.currentTurn.getTurnPlayer()._isDead && TurnsManager.currentTurn.getTurnPlayer().me) {
                await TurnsManager.currentTurn.getTurnPlayer().endTurn(true)
            }
        })
    }

}
