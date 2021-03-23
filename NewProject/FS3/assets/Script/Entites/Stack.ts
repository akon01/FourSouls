import { Component, log, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { whevent } from "../../ServerClient/whevent";
import { GAME_EVENTS } from "../Constants";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectConcrete } from "../StackEffects/StackEffectConcrete";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { Card } from "./GameEntities/Card";
import { Player } from "./GameEntities/Player";
const { ccclass, property } = _decorator;



@ccclass('Stack')
export class Stack extends Component {
    stackEffectsIds: number = 0;

    _currentStack: StackEffectInterface[] = []

    _currentStackEffectsResolving: number[] = [];

    isInResolvePhase: boolean = false;

    hasOtherPlayerRespondedYet: boolean = false;

    hasOtherPlayerRespond: boolean = false;

    hasStackEffectResolvedAtAnotherPlayer: boolean = false;

    newStack: StackEffectInterface[] | null = null;

    delaydShowStackEffect: number = -1;

    getNextStackEffectId() {
        WrapperProvider.serverClientWrapper.out.send(Signal.NEXT_STACK_ID)
        this.stackEffectsIds++
        return this.stackEffectsIds
    }

    checkColor = 0;

    async startResponseCheck(actionMessageId?: number) {
        if (!WrapperProvider.mainScriptWrapper.out.gameHasStarted) { return false }
        if (this.hasAnyoneResponded) { return true }

        this.checkColor += 10;
        let lastPlayer: Player = new Player
        let nextPlayer: Player = new Player

        for (let i = 0; i < WrapperProvider.playerManagerWrapper.out.players.length; i++) {
            if (nextPlayer == null) {
                nextPlayer = WrapperProvider.playerManagerWrapper.out.getPriorityPlayer()!;
            } else {
                nextPlayer = WrapperProvider.playerManagerWrapper.out.getNextPlayer(lastPlayer)!
            }

            lastPlayer = nextPlayer!

            const amId = WrapperProvider.actionLableWrapper.out.publishMassage(`Wait For Response From Player ${nextPlayer.playerId} `, 0, true, actionMessageId)
            const hasOtherPlayerResponded = await this.givePlayerPriority(nextPlayer)
            WrapperProvider.actionLableWrapper.out.removeMessage(amId, true)

            // if player did respond
            if (hasOtherPlayerResponded == true) {
                //WrapperProvider.actionLableWrapper.out.publishMassage(`Player ${nextPlayer.playerId} did respond`, 1.5, true)
                return true;
                // if player didn't respond
            } else {
                // WrapperProvider.actionLableWrapper.out.publishMassage(`Player ${nextPlayer.playerId} didn't respond`, 1.5, true)
            }
        }
        return false;

    }

    setToCurrentStackEffectResolving(stackEffectsToSet: StackEffectInterface[], sendToServer: boolean) {
        this._currentStackEffectsResolving = []
        if (Array.isArray(stackEffectsToSet)) {
            stackEffectsToSet.forEach(se => { if (se != null && se != undefined) this._currentStackEffectsResolving.push(se.entityId) })
            if (sendToServer) {
                WrapperProvider.serverClientWrapper.out.send(Signal.UPDATE_RESOLVING_STACK_EFFECTS, { stackEffects: this._currentStack.filter(se => this._currentStackEffectsResolving.indexOf(se.entityId) >= 0).map(see => see.convertToServerStackEffect()) })
            }
        } else {
            throw new Error(`Set Current Stack Effect Resolving has failed, stackEffectsToSet are not an array`)
        }
    }


    addToCurrentStackEffectResolving(stackEffectToAdd: StackEffectInterface, sendToServer: boolean) {
        this._currentStackEffectsResolving.push(stackEffectToAdd.entityId)
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.UPDATE_RESOLVING_STACK_EFFECTS, { stackEffects: this._currentStack.filter(se => this._currentStackEffectsResolving.indexOf(se.entityId) >= 0).map(see => see.convertToServerStackEffect()) })
        }
    }

    removeFromCurrentStackEffectResolving(stackEffectToRemoveId: number, sendToServer: boolean) {
        if (this._currentStackEffectsResolving.indexOf(stackEffectToRemoveId) >= 0) {
            this._currentStackEffectsResolving.splice(this._currentStackEffectsResolving.indexOf(stackEffectToRemoveId))
            if (sendToServer) {
                WrapperProvider.serverClientWrapper.out.send(Signal.UPDATE_RESOLVING_STACK_EFFECTS, { stackEffects: this._currentStack.filter(se => this._currentStackEffectsResolving.indexOf(se.entityId) >= 0).map(see => see.convertToServerStackEffect()) })
            }
        }
    }

    getCurrentResolvingStackEffect() {
        const id = this._currentStackEffectsResolving[this._currentStackEffectsResolving.length - 1]
        return this._currentStack.find(stackEffect => stackEffect.entityId == id)
    }

    async doStackEffectFromTop(sendToServer: boolean) {
        const mePlayer = WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!
        const stackEffect = this._currentStack[this._currentStack.length - 1]
        log(`Stack State: Do Stack Effect From Top`, stackEffect)
        //error(`do ${stackEffect.constructor.name} ${stackEffect.entityId} from top`)
        let amId: number = -1
        if (sendToServer) {
            amId = WrapperProvider.actionLableWrapper.out.publishMassage(`Resolve ${stackEffect.name} ${stackEffect.entityId} `, 0)
        }
        if (mePlayer.character!.getComponent(Card)!._cardId == stackEffect.creatorCardId || (WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(stackEffect.creatorCardId) == null)) {
            // if a StackEffect is in its resolve function (should be true only if the StackEffect has locking effect.)
            if ((!(this._currentStackEffectsResolving.indexOf(stackEffect.entityId) >= 0))) {
                //    this.isInResolvePhase = true;

                this.addToCurrentStackEffectResolving(stackEffect, true)
                try {
                    log(`Stack State: Resolve Stack Effect`, stackEffect)
                    await stackEffect.resolve()
                    if (!stackEffect.checkForFizzle()) {
                        WrapperProvider.serverClientWrapper.out.send(Signal.UPDATE_STACK_EFFECT, { stackEffect: stackEffect.convertToServerStackEffect() })
                    } else {
                        log(`${stackEffect.name} ${stackEffect.entityId} has been fizzled`)
                    }
                } catch (error) {
                    WrapperProvider.loggerWrapper.out.error(`error while resolving stack effect ${stackEffect.name} ${stackEffect.entityId}`)
                    WrapperProvider.loggerWrapper.out.error(error)
                }
                // error(`b4 removing ${stackEffect.constructor.name} ${stackEffect.entityId} from currentStackEffectResolving`)
                this.removeFromCurrentStackEffectResolving(stackEffect.entityId, true)

                if (sendToServer) {
                    WrapperProvider.actionLableWrapper.out.removeMessage(amId, true)
                    log(`Stack State: B4 Remove After Resolve`, stackEffect)
                    await this.removeAfterResolve(stackEffect, sendToServer)
                } else {

                    return undefined;
                }
            } else {
                if (this._currentStackEffectsResolving.indexOf(stackEffect.entityId) >= 0) {
                    return this._currentStack;
                }
            }
        } else {
            const stackEffectPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(stackEffect.creatorCardId)!
            const serverStack = this._currentStack.map(stackEffect => stackEffect.convertToServerStackEffect())
            // if (sendToServer) {
            //     this.addToCurrentStackEffectResolving(stackEffect, true)
            // }
            WrapperProvider.serverClientWrapper.out.send(Signal.DO_STACK_EFFECT, { originPlayerId: mePlayer.playerId, playerId: stackEffectPlayer.playerId, currentStack: serverStack })
            const newStack = await this.waitForStackEffectresolve();
            WrapperProvider.actionLableWrapper.out.removeMessage(amId, true)
            await this.replaceStack(newStack, sendToServer)
            if (sendToServer) {
                this.removeFromCurrentStackEffectResolving(stackEffect.entityId, true)
                const stackEffectToRemove = this._currentStack.find(effect => effect.entityId == stackEffect.entityId)!

                // await this.removeFromTopOfStack(sendToServer)

                /**
                 * Test Use next Stack Effect to Be Resolved To Send A New Signal To The next stackEffectPlayer To Remove and continue the loop,
                 * should keep the needed data at the correct player
                 */
                log(`Stack State: B4 Remove After Resolve`, stackEffectToRemove)
                await this.removeAfterResolve(stackEffectToRemove, sendToServer)
            } else {
                return newStack;
            }
        }
    }

    async addToStackBelow(stackEffectToAdd: StackEffectInterface, stackEffectToAddBelowTo: StackEffectInterface, deleteOriginal: boolean) {
        log(`Stack State: Add To Stack Below`, stackEffectToAdd)
        //error(`add ${stackEffectToAdd.constructor.name} ${stackEffectToAdd.entityId} to stack below`)
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
        log(`Stack State: Put On Stack `, stackEffectToAdd)
        await stackEffectToAdd.putOnStack()
        //  WrapperProvider.stackEffectVisManagerWrapper.out.addPreview(stackEffectToAdd, true)
        this.replaceStack(newStack, true)
        WrapperProvider.decisionMarkerWrapper.out.setStackIcon(WrapperProvider.stackEffectVisManagerWrapper.out.stackIcons[0], true)
        this.delaydShowStackEffect = stackEffectToAdd.entityId
        //    await WrapperProvider.decisionMarkerWrapper.out.showStackEffect(stackEffectToAdd.entityId, true)
        //   WrapperProvider.serverClientWrapper.out.send(Signal.UPDATE_STACK_EFFECT, { stackEffect: stackEffectToAdd.convertToServerStackEffect() })
        //   WrapperProvider.stackEffectVisManagerWrapper.out.addPreview(stackEffectToAdd)
    }

    async addToStackAbove(stackEffectToAdd: StackEffectInterface) {
        log(`Stack State: Add To Stack Above `, stackEffectToAdd)
        //error(`add ${stackEffectToAdd.constructor.name} ${stackEffectToAdd.entityId} to stack above`)
        if (this._currentStack.length == 0) {
            await this.addToStack(stackEffectToAdd, true)
        } else {
            this._currentStack.push(stackEffectToAdd)
            await this.replaceStack(this._currentStack, true)
            WrapperProvider.stackEffectVisManagerWrapper.out.addPreview(stackEffectToAdd, true)
            WrapperProvider.decisionMarkerWrapper.out.setStackIcon(WrapperProvider.stackEffectVisManagerWrapper.out.stackIcons[0], true)
            this.delaydShowStackEffect = stackEffectToAdd.entityId
            //await WrapperProvider.decisionMarkerWrapper.out.showStackEffect(stackEffectToAdd.entityId, true)
            log(`Stack State: Put On Stack`, stackEffectToAdd)
            await stackEffectToAdd.putOnStack()
        }
        // await WrapperProvider.actionManagerWrapper.out.updateActions()
    }

    async givePlayerPriority(playerToSendTo: Player) {
        const id = playerToSendTo.playerId

        const meId = WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId
        this.hasOtherPlayerRespondedYet = false;
        playerToSendTo.givePriority(true)
        if (playerToSendTo == WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)) {
            try {
                this.hasOtherPlayerRespond = (await playerToSendTo.getResponse(playerToSendTo.playerId))!
            } catch (error) {
                WrapperProvider.loggerWrapper.out.error(error)
            }
        } else {
            WrapperProvider.serverClientWrapper.out.send(Signal.GET_REACTION, { playerId: id, activePlayerId: meId })
            const hasPlayerResponded = await this.waitForPlayerReaction()
            this.hasOtherPlayerRespond = hasPlayerResponded;
        }
        return this.hasOtherPlayerRespond
    }

    async putOnStackFromServer(stackEffect: StackEffectInterface, playerToSendEnd: Player) {
        await stackEffect.putOnStack()
        WrapperProvider.serverClientWrapper.out.send(Signal.UPDATE_STACK_EFFECT, { stackEffect: stackEffect.convertToServerStackEffect() })
        WrapperProvider.serverClientWrapper.out.send(Signal.END_PUT_ON_STACK, { playerId: playerToSendEnd.playerId })
    }

    /**
     * will end after all available StackEffects are resolved.
     * @param stackEffect
     */
    async addToStack(stackEffect: StackEffectInterface, sendToServer: boolean) {
        //error(`add ${stackEffect.constructor.name} ${stackEffect.entityId} to stack`)
        //Special Case: Silent Stack Effect (does not show up in the game,but will execute immidiatly)
        log(`Stack State: Add To Stack`, stackEffect)
        if (sendToServer && stackEffect.isSilent) {
            await this.doStackEffectSilent(stackEffect)
            if (this._currentStack.length > 0) {
                log(`Stack State:B4 Do Stack Effect From Top`)
                await this.doStackEffectFromTop(sendToServer)
                // } else {
                //     WrapperProvider.serverClientWrapper.out.send(Signal.TURN_PLAYER_DO_STACK_EFFECT, { playerId: WrapperProvider.turnsManagerWrapper.out.currentTurn.getTurnPlayer().playerId })
                // }
            }
            return
        }

        this._currentStack.push(stackEffect)
        WrapperProvider.actionManagerWrapper.out.updateActionsForNotTurnPlayer(WrapperProvider.playerManagerWrapper.out.mePlayer!)
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.ADD_TO_STACK, { stackEffect: stackEffect.convertToServerStackEffect() })
            WrapperProvider.stackEffectVisManagerWrapper.out.addPreview(stackEffect, true)
            WrapperProvider.decisionMarkerWrapper.out.setStackIcon(WrapperProvider.stackEffectVisManagerWrapper.out.stackIcons[0], true)
            await WrapperProvider.decisionMarkerWrapper.out.showStackEffect(stackEffect.entityId, true)
        }

        if (sendToServer) {
            //disable all card actions until the stack ends
            const amId = WrapperProvider.actionLableWrapper.out.publishMassage(`Add ${stackEffect.name} ${stackEffect.entityId} `, 0)
            const stackEffectCreator = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(stackEffect.creatorCardId)
            if (stackEffect.creatorCardId != WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.character!.getComponent(Card)!._cardId && stackEffectCreator != null) {
                WrapperProvider.serverClientWrapper.out.send(Signal.PUT_ON_STACK, { stackEffect: stackEffect.convertToServerStackEffect(), playerId: stackEffectCreator.playerId, originPlayerId: WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId })
                log(`Stack State:Wait For Put On Stack Other Player`, stackEffect)
                await this.waitForPutOnStack()
            } else {
                log(`Stack State: Put On Stack`, stackEffect)
                await stackEffect.putOnStack()
                WrapperProvider.serverClientWrapper.out.send(Signal.UPDATE_STACK_EFFECT, { stackEffect: stackEffect.convertToServerStackEffect() })
            }
            WrapperProvider.actionLableWrapper.out.removeMessage(amId, true)
            // const serverStackEffect: ServerStackEffectInterface = stackEffect.convertToServerStackEffect()
            // WrapperProvider.serverClientWrapper.out.send(Signal.ADD_TO_STACK, { stackEffect: serverStackEffect })
            // do check for responses.
            const amId2 = WrapperProvider.actionLableWrapper.out.publishMassage(`Response Adding ${stackEffect.name} ${stackEffect.entityId}`, 0, true, amId)
            this.hasAnyoneResponded = await this.startResponseCheck(amId)
            //   error(`after Response Check For Adding ${stackEffect.constructor.name} ${stackEffect.entityId}`)
            WrapperProvider.actionLableWrapper.out.removeMessage(amId2, true)
            if (this.hasAnyoneResponded) {
                if (this._currentStack.length == 1) {
                    WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!._reactionToggle!.check(true);
                } else {
                }
                this.hasAnyoneResponded = false;
                return;
            } else {
                // if there are more stackEffects to do.
                if (this._currentStack.length > 0) {
                    log(`Stack State:B4 Do Stack Effect From Top`)
                    await this.doStackEffectFromTop(sendToServer)
                    // } else {
                    //     WrapperProvider.serverClientWrapper.out.send(Signal.TURN_PLAYER_DO_STACK_EFFECT, { playerId: WrapperProvider.turnsManagerWrapper.out.currentTurn.getTurnPlayer().playerId })
                    // }
                }
            }
        }
    }

    async doStackEffectSilent(stackEffect: StackEffectInterface) {
        await stackEffect.putOnStack()
        await stackEffect.resolve()
    }

    async fizzleStackEffect(stackEffect: StackEffectInterface, isSilent: boolean, sendToServer: boolean) {
        this._currentStack = this._currentStack.filter(effect => {
            if (effect != stackEffect) { return true; }
        })
        if (this._currentStack.length == 0) { whevent.emit(GAME_EVENTS.STACK_EMPTIED) }
        if (sendToServer) {
            this.removeFromCurrentStackEffectResolving(stackEffect.entityId, true)
            WrapperProvider.stackEffectVisManagerWrapper.out.removePreview(stackEffect.entityId, true)
            if (!isSilent) {
                WrapperProvider.actionLableWrapper.out.publishMassage(`Fizzle ${stackEffect.name} ${stackEffect.entityId}`, 3)
                WrapperProvider.announcementLableWrapper.out.showAnnouncement(`${stackEffect.name} ${stackEffect.entityId} Was Fizzled`, 2, true)
            }
            stackEffect.fizzleThis()
            // if (stackEffect instanceof PlayLootCardStackEffect) { 
            //     PileManager.removeFromPile(stackEffect.lootToPlay, true)
            //     await PileManager.addCardToPile(CARD_TYPE.LOOT, stackEffect.lootToPlay, true)
            // }

            WrapperProvider.serverClientWrapper.out.send(Signal.FIZZLE_STACK_EFFECT, { entityId: stackEffect.entityId, isSilent: isSilent })
            if (!isSilent && this.delaydShowStackEffect != -1) {
                await WrapperProvider.decisionMarkerWrapper.out.showStackEffect(this.delaydShowStackEffect, true)
                this.delaydShowStackEffect = -1;
            }
        }
        // throw `implement fizzle stack effect`
    }


    hasAnyoneResponded: boolean = false;

    async removeAfterResolve(stackEffectToRemove: StackEffectInterface, sendToServer: boolean) {
        log(`Stack State: Remove After Resolve`, stackEffectToRemove)
        if (stackEffectToRemove != null && this._currentStack.map(effect => effect.entityId).indexOf(stackEffectToRemove.entityId) >= 0) {
            const lastOfStack = this._currentStack.find((effect) => effect.entityId == stackEffectToRemove.entityId);
            const index = this._currentStack.indexOf(stackEffectToRemove)
            //    log(`index of the stack effect in current stack is ${index}`)
            if (sendToServer) {
                WrapperProvider.decisionMarkerWrapper.out.setStackIcon(WrapperProvider.stackEffectVisManagerWrapper.out.stackIcons[1], true)
                await WrapperProvider.decisionMarkerWrapper.out.showStackEffect(stackEffectToRemove.entityId, true)
                WrapperProvider.stackEffectVisManagerWrapper.out.removePreview(stackEffectToRemove.entityId, true)
                if (this.delaydShowStackEffect != -1) {
                    await WrapperProvider.decisionMarkerWrapper.out.showStackEffect(this.delaydShowStackEffect, true)
                    this.delaydShowStackEffect = -1;
                }
            }
            //  log(`current stack after removal:\n${this._currentStack.map(effect => effect.toString())}`)
            this._currentStack.splice(index, 1)
            if (sendToServer) {
                const amId = WrapperProvider.actionLableWrapper.out.publishMassage(`Remove After Resolve ${stackEffectToRemove.name} ${stackEffectToRemove.entityId}  `, 3)
                WrapperProvider.serverClientWrapper.out.send(Signal.REMOVE_FROM_STACK, { stackEffect: stackEffectToRemove.convertToServerStackEffect() })
                const amId2 = WrapperProvider.actionLableWrapper.out.publishMassage(`Response Remove After Resolve ${stackEffectToRemove.name} ${stackEffectToRemove.entityId}`, 0, true, amId)
                this.hasAnyoneResponded = await this.startResponseCheck(amId)
                WrapperProvider.actionLableWrapper.out.removeMessage(amId2, true)
                if (this.hasAnyoneResponded) {
                    this.hasAnyoneResponded = false
                    return;
                } else {
                    if (this._currentStack.length > 0) {
                        log(`Stack State: B4 Do Stack Effect From Top`)
                        await this.doStackEffectFromTop(sendToServer)
                    } else {
                        WrapperProvider.actionLableWrapper.out.publishMassage(`Stack Was Emptied `, 1.5)
                        whevent.emit(GAME_EVENTS.STACK_EMPTIED)
                        if (WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player) != WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()) {
                            WrapperProvider.serverClientWrapper.out.send(Signal.TURN_PLAYER_DO_STACK_EFFECT, { playerId: WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!.playerId })
                        } else {
                            await WrapperProvider.actionManagerWrapper.out.updateActions()
                        }
                        // when there are no more stack effects to do
                        // TODO give turn player control. (update his actions)
                    }
                }
            } else {
                await WrapperProvider.actionManagerWrapper.out.updateActions()
            }
        } else if (sendToServer) {
            if (this._currentStack.length > 0) {
                log(`Stack State: B4 Do Stack Effect From Top`)
                await this.doStackEffectFromTop(sendToServer)
            } else {
                WrapperProvider.actionLableWrapper.out.publishMassage(`Stack Was Emptied `, 1.5)
                whevent.emit(GAME_EVENTS.STACK_EMPTIED)
                if (WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player) != WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()) {
                    WrapperProvider.serverClientWrapper.out.send(Signal.TURN_PLAYER_DO_STACK_EFFECT, { playerId: WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!.playerId })
                } else {
                    await WrapperProvider.actionManagerWrapper.out.updateActions()
                }
                // when there are no more stack effects to do
                // TODO give turn player control. (update his actions)
            }
        }

        //  log(`update actions after removal of stack effect`)
    }

    replaceStack(newStack: StackEffectInterface[], sendToServer: boolean) {
        log(`Stack State: Replace Stack`, newStack)
        let toContinue = true;
        newStack.forEach(effect => {
            if (!(effect instanceof StackEffectConcrete)) {
                toContinue = false
            }
        });
        if (!toContinue) {
            WrapperProvider.loggerWrapper.out.error(newStack)
            throw new Error(`New Stack in Replace Stack is Not StackEffectConcrete`)
        }

        this._currentStack = []
        if (Array.isArray(newStack)) {
            this._currentStack = newStack;
        } else {
            this._currentStack.push(newStack)
        }

        if (this._currentStack.length == 0) { whevent.emit(GAME_EVENTS.STACK_EMPTIED) }

        if (sendToServer) {
            let oldResolving = [...this._currentStackEffectsResolving]
            oldResolving.forEach(stackEffectId => {
                if (!(this._currentStack.map(stackEffect => stackEffect.entityId).indexOf(stackEffectId) >= 0)) {
                    this.removeFromCurrentStackEffectResolving(stackEffectId, false)
                }
            });

            oldResolving = [...this._currentStackEffectsResolving]
            this._currentStack.forEach(stackEffect => {
                if (oldResolving.indexOf(stackEffect.entityId) >= 0) {
                    this.removeFromCurrentStackEffectResolving(stackEffect.entityId, false)
                    this.addToCurrentStackEffectResolving(stackEffect, false)
                } else {

                }
            });

            WrapperProvider.stackEffectVisManagerWrapper.out.setPreviews(this._currentStack, true)
            const serverStack = this._currentStack.map(stackEffect => stackEffect.convertToServerStackEffect())
            WrapperProvider.serverClientWrapper.out.send(Signal.REPLACE_STACK, { currentStack: serverStack })
        }
    }


    waitForPutOnStack(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.PUT_ON_STACK_END, () => {
                resolve(true);
            });
        })
    }

    waitForPlayerReaction(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.PLAYER_RESPOND, () => {
                resolve(this.hasOtherPlayerRespond);
            });
        })
    }

    waitForStackEmptied(): Promise<boolean> {
        if (this._currentStack.length == 0) { return new Promise((res, rej) => res(true)) }
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.STACK_EMPTIED, () => {
                resolve(true);
            })
        });
    }

    waitForStackEffectresolve(): Promise<StackEffectInterface[]> {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.STACK_STACK_EFFECT_RESOLVED_AT_OTHER_PLAYER, () => {
                this.hasStackEffectResolvedAtAnotherPlayer = false;
                resolve(this.newStack!);
            })
        });
    }
    onLoad() {
        whevent.on(GAME_EVENTS.STACK_EMPTIED, async () => {
            await this.onStackEmptied()
        }, this)
    }

    async onStackEmptied() {
        log(`Stack emptied`)
        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!;
        if (turnPlayer.me) {
            await WrapperProvider.actionManagerWrapper.out.updateActions();
            WrapperProvider.stackEffectVisManagerWrapper.out.clearPreviews(true)
            if ((turnPlayer._endTurnFlag || turnPlayer._isDead) && turnPlayer.me) {
                await turnPlayer.endTurn(true)
                //turnPlayer._endTurnFlag = true
            }
        } else {
            await WrapperProvider.actionManagerWrapper.out.updateActions();
            WrapperProvider.serverClientWrapper.out.send(Signal.STACK_EMPTIED, { playerId: turnPlayer.playerId })
        }
    }

}
