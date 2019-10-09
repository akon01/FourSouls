
import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { CARD_TYPE } from "../Constants";
import ActionLable from "../LableScripts/Action Lable";
import ActionManager from "../Managers/ActionManager";
import PileManager from "../Managers/PileManager";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectVisManager from "../Managers/StackEffectVisManager";
import TurnsManager from "../Managers/TurnsManager";
import PlayLootCardStackEffect from "../StackEffects/Play Loot Card";
import ServerStackEffectInterface from "../StackEffects/ServerSideStackEffects/ServerStackEffectInterface";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import Card from "./GameEntities/Card";
import Player from "./GameEntities/Player";
import Effect from "../CardEffectComponents/CardEffects/Effect";


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

    static async startResponseCheck() {
        ActionLable.$.publishMassage(`Start Response Check `, 0)
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
            ActionLable.$.publishMassage(`Wait For Response From Player ${nextPlayer.playerId} `, 0)
            let hasOtherPlayerResponded = await this.givePlayerPriority(nextPlayer)
            //if player did respond
            if (hasOtherPlayerResponded == true) {
                return true;
                //if player didnt respond
            } else {

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
        let id = this._currentStackEffectsResolving[this._currentStackEffectsResolving.length - 1]
        return this._currentStack.find(stackEffect => stackEffect.entityId == id)
    }

    static async doStackEffectFromTop(sendToServer: boolean) {
        let mePlayer = PlayerManager.mePlayer.getComponent(Player)
        let stackEffect = this._currentStack[this._currentStack.length - 1]
        ActionLable.$.publishMassage(`Resolve Top Stack Effect `, 0)
        if (mePlayer.character.getComponent(Card)._cardId == stackEffect.creatorCardId || (PlayerManager.getPlayerByCardId(stackEffect.creatorCardId) == null)) {
            //if a StackEffect is in its resolve function (should be true only if the StackEffect has locking effect.)
            if ((!this._currentStackEffectsResolving.includes(stackEffect.entityId))) {
                //    this.isInResolvePhase = true;
                this._currentStackEffectsResolving.push(stackEffect.entityId);
                let newStack
                try {
                    newStack = await stackEffect.resolve()
                } catch (error) {
                    cc.error(`error while resolving stack effect ${stackEffect.entityId}`)
                    cc.error(error)
                }
                this._currentStackEffectsResolving.splice(this._currentStackEffectsResolving.indexOf(stackEffect.entityId));
                if (sendToServer) {
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
            let stackEffectPlayer = PlayerManager.getPlayerByCardId(stackEffect.creatorCardId)
            let serverStack = this._currentStack.map(stackEffect => stackEffect.convertToServerStackEffect())
            ServerClient.$.send(Signal.DO_STACK_EFFECT, { originPlayerId: mePlayer.playerId, playerId: stackEffectPlayer.playerId, currentStack: serverStack })
            let newStack = await this.waitForStackEffectResolve();
            await this.replaceStack(newStack, sendToServer)
            if (sendToServer) {
                let stackEffectToRemove = Stack._currentStack.find(effect => effect.entityId == stackEffect.entityId)

                // await this.removeFromTopOfStack(sendToServer)
                await this.removeAfterResolve(stackEffectToRemove, sendToServer)
            } else {
                return newStack;
            }
        }
    }

    static async addToStackBelow(stackEffectToAdd: StackEffectInterface, stackEffectToAddBelowTo: StackEffectInterface, deleteOriginal: boolean) {
        let stackEffectIndex = this._currentStack.indexOf(stackEffectToAddBelowTo)

        let newStack: StackEffectInterface[] = []
        if (this._currentStack.length == 1) {
            this._currentStack.unshift(stackEffectToAdd)
            newStack = this._currentStack
        } else {
            this._currentStack.splice(stackEffectIndex, 0, stackEffectToAdd)
            newStack = this._currentStack;
            //newStack = this._currentStack.fill(stackEffectToAdd, stackEffectIndex, stackEffectIndex + 1)
        }

        await stackEffectToAdd.putOnStack()
        StackEffectVisManager.$.addPreview(stackEffectToAdd)
        // await ActionManager.updateActions() 
        // cc.error(`if delete original`)
        // if (deleteOriginal) {
        //     cc.log(newStack)
        //     newStack.splice(newStack.indexOf(stackEffectToAddBelowTo), 1)
        //     cc.log(newStack)
        // }

        await this.replaceStack(newStack, true)
    }

    static async addToStackAbove(stackEffectToAdd: StackEffectInterface) {
        this._currentStack.push(stackEffectToAdd)
        await stackEffectToAdd.putOnStack()
        StackEffectVisManager.$.addPreview(stackEffectToAdd)
        // await ActionManager.updateActions()
        await this.replaceStack(this._currentStack, true)
    }

    static async givePlayerPriority(playerToSendTo: Player) {
        let id = playerToSendTo.playerId

        let meId = PlayerManager.mePlayer.getComponent(Player).playerId
        this.hasOtherPlayerRespondedYet = false;
        await playerToSendTo.givePriority(true)
        ServerClient.$.send(Signal.GET_REACTION, { nextPlayerId: id, activePlayerId: meId })
        let hasPlayerResponded = await this.waitForPlayerReaction()
        this.hasOtherPlayerRespond = false;
        return hasPlayerResponded
    }

    /**
     * will end after all available StackEffects are resolved.
     * @param stackEffect 
     */
    static async addToStack(stackEffect: StackEffectInterface, sendToServer: boolean) {


        this._currentStack.push(stackEffect)
        StackEffectVisManager.$.addPreview(stackEffect)


        if (sendToServer) {

            cc.log(`b4 ${stackEffect.entityId} put on stack`)
            await stackEffect.putOnStack()
            cc.log(`after ${stackEffect.entityId} put on stack`)
            //await ActionManager.updateActions()

            let serverStackEffect: ServerStackEffectInterface = stackEffect.convertToServerStackEffect()
            ServerClient.$.send(Signal.ADD_TO_STACK, { stackEffect: serverStackEffect })
            //do check for responses.



            let hasAPlayerResponded = await this.startResponseCheck()


            if (hasAPlayerResponded) {

                // cc.log(hasAPlayerResponded)
                // await this.addToStack(hasAPlayerResponded)
                return;
            } else {

                //if there are more stackEffects to do.
                if (this._currentStack.length > 0) {
                    cc.log(`there are ${this._currentStack.length} effects left,  resolve top effect`)
                    //  if (PlayerManager.mePlayer.getComponent(Player) == TurnsManager.currentTurn.getTurnPlayer()) {
                    await this.doStackEffectFromTop(sendToServer)
                    // } else {
                    //     ServerClient.$.send(Signal.TURN_PLAYER_DO_STACK_EFFECT, { playerId: TurnsManager.currentTurn.getTurnPlayer().playerId })
                    // }
                }
                else {
                    cc.log('no more stack effect to do!')

                    //when there are no more stack effects to do
                    //TODO give turn player control. (update his actions)
                }
            }
        }
    }


    static async fizzleStackEffect(stackEffect: StackEffectInterface, sendToServer: boolean) {
        cc.log(`start fizzle stack effect`)
        this._currentStack = this._currentStack.filter(effect => {
            if (effect != stackEffect) return true;
        })
        this._currentStackEffectsResolving = this._currentStackEffectsResolving.filter(effect => {
            if (effect != stackEffect.entityId) return true;
        })
        StackEffectVisManager.$.removePreview(stackEffect)
        if (sendToServer) {
            ActionLable.$.publishMassage(`${stackEffect.stackEffectType} was fizzled`, 5)
            if (stackEffect instanceof PlayLootCardStackEffect) {
                cc.log(`stackEffect is Play loot card, add card to pile`)
                await PileManager.addCardToPile(CARD_TYPE.LOOT, stackEffect.lootToPlay, true)
            }
        }
        cc.log(`end fizzle stack effect`)
        // throw `implement fizzle stack effect`
    }

    static async removeFromTopOfStack(sendToServer: boolean) {
        ActionLable.$.publishMassage(`Remove Top Stack Effect `, 0)
        let lastOfStack = this._currentStack.pop();
        StackEffectVisManager.$.removePreview(lastOfStack)
        if (sendToServer) {
            ServerClient.$.send(Signal.REMOVE_FROM_STACK)

            let hasAnyoneResponded = await this.startResponseCheck()
            if (hasAnyoneResponded) {
                return;
            } else {
                if (this._currentStack.length > 0) {
                    await this.doStackEffectFromTop(sendToServer)
                } else {
                    ActionLable.$.publishMassage(`Stack Was Emptied `, 5)
                    if (PlayerManager.mePlayer.getComponent(Player) != TurnsManager.currentTurn.getTurnPlayer()) {
                        ServerClient.$.send(Signal.TURN_PLAYER_DO_STACK_EFFECT, { playerId: TurnsManager.currentTurn.getTurnPlayer().playerId })
                    } else {
                        await ActionManager.updateActions()
                    }
                    //when there are no more stack effects to do
                    //TODO give turn player control. (update his actions)
                }
            }
        } else {
            await ActionManager.updateActions()
        }
        //  cc.log(`update actions after removeal of stack effect`)
    }

    static async removeAfterResolve(stackEffectToRemove: StackEffectInterface, sendToServer: boolean) {

        if (Stack._currentStack.map(effect => effect.entityId).includes(stackEffectToRemove.entityId)) {
            ActionLable.$.publishMassage(`Remove Stack Effect ${stackEffectToRemove.stackEffectType} after resolve `, 0)
            let lastOfStack = stackEffectToRemove;
            Stack._currentStack.splice(Stack._currentStack.indexOf(stackEffectToRemove), 1)
            StackEffectVisManager.$.removePreview(lastOfStack)
            if (sendToServer) {
                ServerClient.$.send(Signal.REMOVE_FROM_STACK, { stackEffect: stackEffectToRemove.convertToServerStackEffect() })

                let hasAnyoneResponded = await this.startResponseCheck()
                if (hasAnyoneResponded) {
                    return;
                } else {
                    if (this._currentStack.length > 0) {
                        await this.doStackEffectFromTop(sendToServer)
                    } else {
                        ActionLable.$.publishMassage(`Stack Was Emptied `, 5)
                        if (PlayerManager.mePlayer.getComponent(Player) != TurnsManager.currentTurn.getTurnPlayer()) {
                            ServerClient.$.send(Signal.TURN_PLAYER_DO_STACK_EFFECT, { playerId: TurnsManager.currentTurn.getTurnPlayer().playerId })
                        } else {
                            await ActionManager.updateActions()
                        }
                        //when there are no more stack effects to do
                        //TODO give turn player control. (update his actions)
                    }
                }
            } else {
                await ActionManager.updateActions()
            }
        } else {
            cc.log(`stack effect ${stackEffectToRemove.stackEffectType} is not in the current stack`)
        }
        //  cc.log(`update actions after removeal of stack effect`)
    }

    static replaceStack(newStack: StackEffectInterface[], sendToServer: boolean) {

        this._currentStack = []
        if (Array.isArray(newStack)) {

            this._currentStack = this._currentStack.concat(newStack);
        } else {
            this._currentStack.push(newStack)
        }
        //
        // this._currentStackEffectsResolving = []
        // this._currentStackEffectsResolving.push(this._currentStack.filter(effect=>{
        //     effect.
        // }))

        StackEffectVisManager.$.clearPreviews()
        for (const stackEffect of this._currentStack) {
            StackEffectVisManager.$.addPreview(stackEffect)
        }
        StackEffectVisManager.$.updateAvailablePreviews();
        if (sendToServer) {
            let serverStack = this._currentStack.map(stackEffect => stackEffect.convertToServerStackEffect())
            ServerClient.$.send(Signal.REPLACE_STACK, { currentStack: serverStack })
        }
    }


    static waitForPlayerReaction(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let check = () => {
                if (this.hasOtherPlayerRespondedYet == true) {
                    this.hasOtherPlayerRespondedYet = false;
                    resolve(this.hasOtherPlayerRespond);
                } else {
                    setTimeout(check, 50);
                }
            };
            check.bind(this);
            setTimeout(check, 50);
        });
    }
    static waitForStackEmptied(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let check = () => {
                if (this._currentStack.length == 0) {
                    resolve();
                } else {
                    setTimeout(check, 50);
                }
            };
            check.bind(this);
            setTimeout(check, 50);
        });
    }



    static waitForStackEffectResolve(): Promise<StackEffectInterface[]> {
        return new Promise((resolve, reject) => {
            let check = () => {
                if (this.hasStackEffectResolvedAtAnotherPlayer == true) {
                    this.hasStackEffectResolvedAtAnotherPlayer = false;
                    resolve(this.newStack);
                } else {
                    setTimeout(check, 50);
                }
            };
            check.bind(this);
            setTimeout(check, 50);
        });
    }


}