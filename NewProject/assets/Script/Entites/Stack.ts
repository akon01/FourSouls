
import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { whevent } from "../../ServerClient/whevent";
import { GAME_EVENTS } from "../Constants";
import ActionLable from "../LableScripts/Action Lable";
import AnnouncementLable from "../LableScripts/Announcement Lable";
import MainScript from "../MainScript";
import ActionManager from "../Managers/ActionManager";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectVisManager from "../Managers/StackEffectVisManager";
import TurnsManager from "../Managers/TurnsManager";
import StackEffectConcrete from "../StackEffects/StackEffectConcrete";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import DecisionMarker from "./Decision Marker";
import Card from "./GameEntities/Card";
import Player from "./GameEntities/Player";
import { Logger } from "./Logger";

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

    static delaydShowStackEffect: number = -1;

    static getNextStackEffectId() {
        ServerClient.$.send(Signal.NEXT_STACK_ID)
        this.stackEffectsIds++
        return this.stackEffectsIds
    }

    static checkColor = 0;

    static $: Stack = null

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
            const hasOtherPlayerResponded = await this.givePlayerPriority(nextPlayer)
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

    static setToCurrentStackEffectResolving(stackEffectsToSet: StackEffectInterface[], sendToServer: boolean) {
        this._currentStackEffectsResolving = []
        if (Array.isArray(stackEffectsToSet)) {
            stackEffectsToSet.forEach(se => { if (se != null && se != undefined) this._currentStackEffectsResolving.push(se.entityId) })
            if (sendToServer) {
                ServerClient.$.send(Signal.UPDATE_RESOLVING_STACK_EFFECTS, { stackEffects: this._currentStack.filter(se => this._currentStackEffectsResolving.includes(se.entityId)).map(see => see.convertToServerStackEffect()) })
            }
        } else {
            throw new Error(`Set Current Stack Effect Resolving has failed, stackEffectsToSet are not an array`)
        }
    }


    static addToCurrentStackEffectResolving(stackEffectToAdd: StackEffectInterface, sendToServer: boolean) {
        this._currentStackEffectsResolving.push(stackEffectToAdd.entityId)
        if (sendToServer) {
            ServerClient.$.send(Signal.UPDATE_RESOLVING_STACK_EFFECTS, { stackEffects: this._currentStack.filter(se => this._currentStackEffectsResolving.includes(se.entityId)).map(see => see.convertToServerStackEffect()) })
        }
    }

    static removeFromCurrentStackEffectResolving(stackEffectToRemoveId: number, sendToServer: boolean) {
        if (this._currentStackEffectsResolving.includes(stackEffectToRemoveId)) {
            this._currentStackEffectsResolving.splice(this._currentStackEffectsResolving.indexOf(stackEffectToRemoveId))
            if (sendToServer) {
                ServerClient.$.send(Signal.UPDATE_RESOLVING_STACK_EFFECTS, { stackEffects: this._currentStack.filter(se => this._currentStackEffectsResolving.includes(se.entityId)).map(see => see.convertToServerStackEffect()) })
            }
        }
    }

    static getCurrentResolvingStackEffect() {
        const id = this._currentStackEffectsResolving[this._currentStackEffectsResolving.length - 1]
        return this._currentStack.find(stackEffect => stackEffect.entityId == id)
    }

    static async doStackEffectFromTop(sendToServer: boolean) {
        const mePlayer = PlayerManager.mePlayer.getComponent(Player)
        const stackEffect = this._currentStack[this._currentStack.length - 1]
        cc.log(`Stack State: Do Stack Effect From Top`, stackEffect)
        //cc.error(`do ${stackEffect.constructor.name} ${stackEffect.entityId} from top`)
        let amId
        if (sendToServer) {
            amId = ActionLable.$.publishMassage(`Resolve ${stackEffect.name} ${stackEffect.entityId} `, 0)
        }
        if (mePlayer.character.getComponent(Card)._cardId == stackEffect.creatorCardId || (PlayerManager.getPlayerByCardId(stackEffect.creatorCardId) == null)) {
            // if a StackEffect is in its resolve function (should be true only if the StackEffect has locking effect.)
            if ((!this._currentStackEffectsResolving.includes(stackEffect.entityId))) {
                //    this.isInResolvePhase = true;

                this.addToCurrentStackEffectResolving(stackEffect, true)

                let newStack
                try {
                    cc.log(`Stack State: Resolve Stack Effect`, stackEffect)
                    newStack = await stackEffect.resolve(true)
                    if (!stackEffect.checkForFizzle()) {
                        ServerClient.$.send(Signal.UPDATE_STACK_EFFECT, { stackEffect: stackEffect.convertToServerStackEffect() })
                    } else {
                        cc.log(`${stackEffect.name} ${stackEffect.entityId} has been fizzled`)
                    }
                } catch (error) {
                    Logger.error(`error while resolving stack effect ${stackEffect.name} ${stackEffect.entityId}`)
                    Logger.error(error)
                }
                // cc.error(`b4 removing ${stackEffect.constructor.name} ${stackEffect.entityId} from currentStackEffectResolving`)
                Stack.removeFromCurrentStackEffectResolving(stackEffect.entityId, true)

                if (sendToServer) {
                    ActionLable.$.removeMessage(amId, true)
                    cc.log(`Stack State: B4 Remove After Resolve`, stackEffect)
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
            // if (sendToServer) {
            //     this.addToCurrentStackEffectResolving(stackEffect, true)
            // }
            ServerClient.$.send(Signal.DO_STACK_EFFECT, { originPlayerId: mePlayer.playerId, playerId: stackEffectPlayer.playerId, currentStack: serverStack })
            const newStack = await this.waitForStackEffectresolve(true);
            ActionLable.$.removeMessage(amId, true)
            await this.replaceStack(newStack, sendToServer)
            if (sendToServer) {
                Stack.removeFromCurrentStackEffectResolving(stackEffect.entityId, true)
                const stackEffectToRemove = Stack._currentStack.find(effect => effect.entityId == stackEffect.entityId)

                // await this.removeFromTopOfStack(sendToServer)

                /**
                 * Test Use next Stack Effect to Be Resolved To Send A New Signal To The next stackEffectPlayer To Remove and continue the loop,
                 * should keep the needed data at the correct player
                 */
                cc.log(`Stack State: B4 Remove After Resolve`, stackEffectToRemove)
                await this.removeAfterResolve(stackEffectToRemove, sendToServer)
            } else {
                return newStack;
            }
        }
    }

    static async addToStackBelow(stackEffectToAdd: StackEffectInterface, stackEffectToAddBelowTo: StackEffectInterface, deleteOriginal: boolean) {
        cc.log(`Stack State: Add To Stack Below`, stackEffectToAdd)
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
        cc.log(`Stack State: Put On Stack `, stackEffectToAdd)
        await stackEffectToAdd.putOnStack()
        //  StackEffectVisManager.$.addPreview(stackEffectToAdd, true)
        this.replaceStack(newStack, true)
        DecisionMarker.$.setStackIcon(StackEffectVisManager.$.stackIcons[0], true)
        this.delaydShowStackEffect = stackEffectToAdd.entityId
        //    await DecisionMarker.$.showStackEffect(stackEffectToAdd.entityId, true)
        //   ServerClient.$.send(Signal.UPDATE_STACK_EFFECT, { stackEffect: stackEffectToAdd.convertToServerStackEffect() })
        //   StackEffectVisManager.$.addPreview(stackEffectToAdd)
    }

    static async addToStackAbove(stackEffectToAdd: StackEffectInterface) {
        cc.log(`Stack State: Add To Stack Above `, stackEffectToAdd)
        //cc.error(`add ${stackEffectToAdd.constructor.name} ${stackEffectToAdd.entityId} to stack above`)
        if (this._currentStack.length == 0) {
            await this.addToStack(stackEffectToAdd, true)
        } else {
            this._currentStack.push(stackEffectToAdd)
            await this.replaceStack(this._currentStack, true)
            StackEffectVisManager.$.addPreview(stackEffectToAdd, true)
            DecisionMarker.$.setStackIcon(StackEffectVisManager.$.stackIcons[0], true)
            this.delaydShowStackEffect = stackEffectToAdd.entityId
            //await DecisionMarker.$.showStackEffect(stackEffectToAdd.entityId, true)
            cc.log(`Stack State: Put On Stack`, stackEffectToAdd)
            await stackEffectToAdd.putOnStack()
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
                Logger.error(error)
            }
        } else {
            ServerClient.$.send(Signal.GET_REACTION, { playerId: id, activePlayerId: meId })
            const hasPlayerResponded = await this.waitForPlayerReaction()
            this.hasOtherPlayerRespond = hasPlayerResponded;
        }
        return this.hasOtherPlayerRespond
    }

    static async putOnStackFromServer(stackEffect: StackEffectConcrete, playerToSendEnd: Player) {
        await stackEffect.putOnStack()
        ServerClient.$.send(Signal.UPDATE_STACK_EFFECT, { stackEffect: stackEffect.convertToServerStackEffect() })
        ServerClient.$.send(Signal.END_PUT_ON_STACK, { playerId: playerToSendEnd.playerId })
    }

    /**
     * will end after all available StackEffects are resolved.
     * @param stackEffect
     */
    static async addToStack(stackEffect: StackEffectConcrete, sendToServer: boolean) {
        //cc.error(`add ${stackEffect.constructor.name} ${stackEffect.entityId} to stack`)
        //Special Case: Silent Stack Effect (does not show up in the game,but will execute immidiatly)
        cc.log(`Stack State: Add To Stack`, stackEffect)
        if (sendToServer && stackEffect.isSilent) {
            await this.doStackEffectSilent(stackEffect)
            if (this._currentStack.length > 0) {
                cc.log(`Stack State:B4 Do Stack Effect From Top`)
                await this.doStackEffectFromTop(sendToServer)
                // } else {
                //     ServerClient.$.send(Signal.TURN_PLAYER_DO_STACK_EFFECT, { playerId: TurnsManager.currentTurn.getTurnPlayer().playerId })
                // }
            }
            return
        }

        this._currentStack.push(stackEffect)
        ActionManager.updateActionsForNotTurnPlayer(PlayerManager.mePlayer)
        if (sendToServer) {
            ServerClient.$.send(Signal.ADD_TO_STACK, { stackEffect: stackEffect.convertToServerStackEffect() })
            StackEffectVisManager.$.addPreview(stackEffect, true)
            DecisionMarker.$.setStackIcon(StackEffectVisManager.$.stackIcons[0], true)
            await DecisionMarker.$.showStackEffect(stackEffect.entityId, true)
        }

        if (sendToServer) {
            //disable all card actions until the stack ends
            const amId = ActionLable.$.publishMassage(`Add ${stackEffect.name} ${stackEffect.entityId} `, 0)
            const stackEffectCreator = PlayerManager.getPlayerByCardId(stackEffect.creatorCardId)
            if (stackEffect.creatorCardId != PlayerManager.mePlayer.getComponent(Player).character.getComponent(Card)._cardId && stackEffectCreator != null) {
                ServerClient.$.send(Signal.PUT_ON_STACK, { stackEffect: stackEffect.convertToServerStackEffect(), playerId: stackEffectCreator.playerId, originPlayerId: PlayerManager.mePlayer.getComponent(Player).playerId })
                cc.log(`Stack State:Wait For Put On Stack Other Player`, stackEffect)
                await this.waitForPutOnStack()
            } else {
                cc.log(`Stack State: Put On Stack`, stackEffect)
                await stackEffect.putOnStack()
                ServerClient.$.send(Signal.UPDATE_STACK_EFFECT, { stackEffect: stackEffect.convertToServerStackEffect() })
            }
            ActionLable.$.removeMessage(amId, true)
            // const serverStackEffect: ServerStackEffectInterface = stackEffect.convertToServerStackEffect()
            // ServerClient.$.send(Signal.ADD_TO_STACK, { stackEffect: serverStackEffect })
            // do check for responses.
            const amId2 = ActionLable.$.publishMassage(`Response Adding ${stackEffect.name} ${stackEffect.entityId}`, 0, true, amId)
            this.hasAnyoneResponded = await this.startResponseCheck(amId)
            //   cc.error(`after Response Check For Adding ${stackEffect.constructor.name} ${stackEffect.entityId}`)
            ActionLable.$.removeMessage(amId2, true)
            if (this.hasAnyoneResponded) {
                if (this._currentStack.length == 1) {
                    PlayerManager.mePlayer.getComponent(Player)._reactionToggle.check(true);
                } else {
                }
                this.hasAnyoneResponded = false;
                return;
            } else {
                // if there are more stackEffects to do.
                if (this._currentStack.length > 0) {
                    cc.log(`Stack State:B4 Do Stack Effect From Top`)
                    await this.doStackEffectFromTop(sendToServer)
                    // } else {
                    //     ServerClient.$.send(Signal.TURN_PLAYER_DO_STACK_EFFECT, { playerId: TurnsManager.currentTurn.getTurnPlayer().playerId })
                    // }
                }
            }
        }
    }

    static async doStackEffectSilent(stackEffect: StackEffectConcrete) {
        await stackEffect.putOnStack()
        await stackEffect.resolve(true)
    }

    static async fizzleStackEffect(stackEffect: StackEffectInterface, isSilent: boolean, sendToServer: boolean) {
        this._currentStack = this._currentStack.filter(effect => {
            if (effect != stackEffect) { return true; }
        })
        if (this._currentStack.length == 0) { whevent.emit(GAME_EVENTS.STACK_EMPTIED) }
        if (sendToServer) {
            this.removeFromCurrentStackEffectResolving(stackEffect.entityId, true)
            StackEffectVisManager.$.removePreview(stackEffect.entityId, true)
            if (!isSilent) {
                ActionLable.$.publishMassage(`Fizzle ${stackEffect.name} ${stackEffect.entityId}`, 3)
                AnnouncementLable.$.showAnnouncement(`${stackEffect.name} ${stackEffect.entityId} Was Fizzled`, 2, true)
            }
            stackEffect.fizzleThis()
            // if (stackEffect instanceof PlayLootCardStackEffect) { 
            //     PileManager.removeFromPile(stackEffect.lootToPlay, true)
            //     await PileManager.addCardToPile(CARD_TYPE.LOOT, stackEffect.lootToPlay, true)
            // }

            ServerClient.$.send(Signal.FIZZLE_STACK_EFFECT, { entityId: stackEffect.entityId, isSilent: isSilent })
            if (!isSilent && this.delaydShowStackEffect != -1) {
                await DecisionMarker.$.showStackEffect(this.delaydShowStackEffect, true)
                this.delaydShowStackEffect = -1;
            }
        }
        // throw `implement fizzle stack effect`
    }


    static hasAnyoneResponded: boolean = false;

    static async removeAfterResolve(stackEffectToRemove: StackEffectInterface, sendToServer: boolean) {
        cc.log(`Stack State: Remove After Resolve`, stackEffectToRemove)
        if (stackEffectToRemove != null && Stack._currentStack.map(effect => effect.entityId).includes(stackEffectToRemove.entityId)) {
            const lastOfStack = Stack._currentStack.find((effect) => effect.entityId == stackEffectToRemove.entityId);
            const index = Stack._currentStack.indexOf(stackEffectToRemove)
            //    cc.log(`index of the stack effect in current stack is ${index}`)
            if (sendToServer) {
                DecisionMarker.$.setStackIcon(StackEffectVisManager.$.stackIcons[1], true)
                await DecisionMarker.$.showStackEffect(stackEffectToRemove.entityId, true)
                StackEffectVisManager.$.removePreview(stackEffectToRemove.entityId, true)
                if (this.delaydShowStackEffect != -1) {
                    await DecisionMarker.$.showStackEffect(this.delaydShowStackEffect, true)
                    this.delaydShowStackEffect = -1;
                }
            }
            //  cc.log(`current stack after removal:\n${Stack._currentStack.map(effect => effect.toString())}`)
            Stack._currentStack.splice(index, 1)
            if (sendToServer) {
                const amId = ActionLable.$.publishMassage(`Remove After Resolve ${stackEffectToRemove.name} ${stackEffectToRemove.entityId}  `, 3)
                ServerClient.$.send(Signal.REMOVE_FROM_STACK, { stackEffect: stackEffectToRemove.convertToServerStackEffect() })
                const amId2 = ActionLable.$.publishMassage(`Response Remove After Resolve ${stackEffectToRemove.name} ${stackEffectToRemove.entityId}`, 0, true, amId)
                this.hasAnyoneResponded = await this.startResponseCheck(amId)
                ActionLable.$.removeMessage(amId2, true)
                if (this.hasAnyoneResponded) {
                    this.hasAnyoneResponded = false
                    return;
                } else {
                    if (this._currentStack.length > 0) {
                        cc.log(`Stack State: B4 Do Stack Effect From Top`)
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
        } else if (sendToServer) {
            if (this._currentStack.length > 0) {
                cc.log(`Stack State: B4 Do Stack Effect From Top`)
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

    static replaceStack(newStack: StackEffectConcrete[], sendToServer: boolean) {
        cc.log(`Stack State: Replace Stack`, newStack)
        let toContinue = true;
        newStack.forEach(effect => {
            if (!(effect instanceof StackEffectConcrete)) {
                toContinue = false
            }
        });
        if (!toContinue) {
            Logger.error(newStack)
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
                if (!this._currentStack.map(stackEffect => stackEffect.entityId).includes(stackEffectId)) {
                    this.removeFromCurrentStackEffectResolving(stackEffectId, false)
                }
            });

            oldResolving = [...this._currentStackEffectsResolving]
            this._currentStack.forEach(stackEffect => {
                if (oldResolving.includes(stackEffect.entityId)) {
                    this.removeFromCurrentStackEffectResolving(stackEffect.entityId, false)
                    this.addToCurrentStackEffectResolving(stackEffect, false)
                } else {

                }
            });

            StackEffectVisManager.$.setPreviews(this._currentStack, true)
            const serverStack = this._currentStack.map(stackEffect => stackEffect.convertToServerStackEffect())
            ServerClient.$.send(Signal.REPLACE_STACK, { currentStack: serverStack })
        }
    }


    static waitForPutOnStack(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.PUT_ON_STACK_END, () => {
                resolve(true);
            });
        })
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
                resolve(true);
            })
        });
    }

    static waitForStackEffectresolve(true): Promise<StackEffectInterface[]> {
        return new Promise((resolve, reject) => {
            whevent.onOnce(GAME_EVENTS.STACK_STACK_EFFECT_RESOLVED_AT_OTHER_PLAYER, () => {
                this.hasStackEffectResolvedAtAnotherPlayer = false;
                resolve(this.newStack);
            })
        });
    }
    onLoad() {
        Stack.$ = this
        whevent.on(GAME_EVENTS.STACK_EMPTIED, async () => {
            await this.onStackEmptied()
        }, this)
    }

    async onStackEmptied() {
        cc.log(`Stack emptied`)
        if (TurnsManager.currentTurn.getTurnPlayer().me) {
            await ActionManager.updateActions();
            StackEffectVisManager.$.clearPreviews(true)
            if ((TurnsManager.currentTurn.getTurnPlayer()._endTurnFlag || TurnsManager.currentTurn.getTurnPlayer()._isDead) && TurnsManager.currentTurn.getTurnPlayer().me) {
                await TurnsManager.currentTurn.getTurnPlayer().endTurn(true)
                //TurnsManager.currentTurn.getTurnPlayer()._endTurnFlag = true
            }
        } else {
            await ActionManager.updateActions();
            ServerClient.$.send(Signal.STACK_EMPTIED, { playerId: TurnsManager.currentTurn.getTurnPlayer().playerId })
        }
    }

}
