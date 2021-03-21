import { ARGS_TYPES, PASSIVE_EVENTS } from "../Constants";
import { PassiveMeta } from './PassiveMeta';
import { WrapperProvider } from "./WrapperProvider";


export class ServerPassiveMeta {

    passiveEvent: PASSIVE_EVENTS | null = null;
    args: Array<{ type: ARGS_TYPES; number: number; }> = [];
    result: any = null;
    preventMethod: boolean = false;
    methodScopeId: number | null = null;
    scopeIsPlayer: boolean = false;
    index: number | null = null;
    originStackId!: number;
    cardManagerWrapper: any;
    playerManagerWrapper: any;

    convertToPassiveMeta() {
        const args = [];
        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i];
            switch (arg.type) {
                case ARGS_TYPES.CARD:
                    args.push(WrapperProvider.cardManagerWrapper.out.getCardById(arg.number, true));
                    break;
                case ARGS_TYPES.PLAYER:
                    args.push(WrapperProvider.playerManagerWrapper.out.getPlayerByCard(WrapperProvider.cardManagerWrapper.out.getCardById(arg.number, true)));
                    break;
                case ARGS_TYPES.NUMBER:
                    args.push(arg);
                default:
                    break;
            }
        }
        let scope;
        if (!this.methodScopeId)
            throw new Error("No Method Scope Id");
        if (!this.passiveEvent)
            throw new Error("No PassiveEvent");

        this.scopeIsPlayer ? scope = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(WrapperProvider.cardManagerWrapper.out.getCardById(this.methodScopeId, true))!.node : scope = WrapperProvider.cardManagerWrapper.out.getCardById(this.methodScopeId, true);
        const passiveMeta = new PassiveMeta(this.passiveEvent, args, this.result, scope);
        passiveMeta.index = this.index;
        passiveMeta.originStackId = this.originStackId;
        return passiveMeta;
    }

}
