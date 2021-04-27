import { ARGS_TYPES, PASSIVE_EVENTS } from "../Constants";
import { PassiveMeta } from './PassiveMeta';
import { WrapperProvider } from "./WrapperProvider";


type ArgsType<T extends number | number[]> = {
    type: ARGS_TYPES
    number: T
}


export class ServerPassiveMeta {

    passiveEvent: PASSIVE_EVENTS | null = null;
    args: ArgsType<number | number[]>[] = [];
    result: any = null;
    preventMethod = false;
    methodScopeId: number | null = null;
    scopeIsPlayer = false;
    index: number | null = null;
    originStackId!: number;
    cardManagerWrapper: any;
    playerManagerWrapper: any;

    convertToPassiveMeta() {
        const args: any[] = [];
        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i];
            if (!Array.isArray(arg.number)) {
                this.handleSingleArg(arg as ArgsType<number>, args);
            } else {
                this.handleMultyArg(arg as ArgsType<number[]>, args)
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


    private handleSingleArg(arg: ArgsType<number>, args: any[]) {
        switch (arg.type) {
            case ARGS_TYPES.CARD:
                args.push(WrapperProvider.cardManagerWrapper.out.getCardById(arg.number as number, true));
                break;
            case ARGS_TYPES.PLAYER:
                args.push(WrapperProvider.playerManagerWrapper.out.getPlayerByCard(WrapperProvider.cardManagerWrapper.out.getCardById(arg.number as number, true)));
                break;
            case ARGS_TYPES.NUMBER:
                args.push(arg.number)
                break;
            default:
                break;
        }
    }

    private handleMultyArg(arg: ArgsType<number[]>, args: any[]) {
        switch (arg.type) {
            case ARGS_TYPES.CARD:
                args.push(arg.number.map(num => WrapperProvider.cardManagerWrapper.out.getCardById(num, true)));
                break;
            case ARGS_TYPES.PLAYER:
                args.push(arg.number.map(num => WrapperProvider.playerManagerWrapper.out.getPlayerByCard(WrapperProvider.cardManagerWrapper.out.getCardById(num, true))));
                break;
            case ARGS_TYPES.NUMBER:
                args.push(arg.number);
                break
            default:
                break;
        }
    }
}
