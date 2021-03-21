import { Component, Node } from 'cc';
import { ARGS_TYPES, PASSIVE_EVENTS } from "../Constants";
import { Card } from "../Entites/GameEntities/Card";
import { Player } from "../Entites/GameEntities/Player";
import { ServerPassiveMeta } from "./ServerPassiveMeta";
import { WrapperProvider } from './WrapperProvider';


export class PassiveMeta {


    constructor(passiveEvent: PASSIVE_EVENTS, args: any[] | null, result: any, methodScope: Node, originStackId?: number) {
        this.args = args;
        this.passiveEvent = passiveEvent;
        this.methodScope = methodScope;
        this.preventMethod = false;
        this.result = result;
        if (originStackId) { this.originStackId = originStackId; }
    }

    passiveEvent: PASSIVE_EVENTS | null = null;
    args: any[] | null = [];
    result: any = null;
    preventMethod: boolean = false;
    methodScope: Node | null = null;
    index: number | null = null;
    originStackId: number = -1;

    convertToServerPassiveMeta() {
        const serverPassiveMeta = new ServerPassiveMeta();
        serverPassiveMeta.passiveEvent = this.passiveEvent;
        serverPassiveMeta.preventMethod = this.preventMethod;
        serverPassiveMeta.result = this.result;
        if (this.args) {
            for (let i = 0; i < this.args.length; i++) {
                let arg = this.args[i];
                if (arg instanceof Component) {
                    const card = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(arg.node);
                    if (card != null && card != undefined) {
                        arg = card;
                    }
                }
                if (arg instanceof Node) {
                    if (arg.getComponent(Card)) {
                        serverPassiveMeta.args.push({ type: ARGS_TYPES.CARD, number: arg.getComponent(Card)!._cardId });
                    } else if (arg.getComponent(Player)) {
                        serverPassiveMeta.args.push({ type: ARGS_TYPES.PLAYER, number: arg.getComponent(Player)!.character!.getComponent(Card)!._cardId });
                    }
                } else {
                    serverPassiveMeta.args.push({ type: ARGS_TYPES.NUMBER, number: arg });
                }
            }
        }
        if (!this.methodScope)
            throw new Error("No Method Scope Found");

        if (this.methodScope.getComponent(Card)) {
            serverPassiveMeta.methodScopeId = this.methodScope.getComponent(Card)!._cardId;
        } else if (this.methodScope.getComponent(Player)) {
            serverPassiveMeta.methodScopeId = this.methodScope.getComponent(Player)!.character!.getComponent(Card)!._cardId;
            serverPassiveMeta.scopeIsPlayer = true;
        }
        serverPassiveMeta.index = this.index;
        serverPassiveMeta.originStackId = this.originStackId;
        return serverPassiveMeta;
    }

}
