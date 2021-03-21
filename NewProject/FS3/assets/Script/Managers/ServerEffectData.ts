import { ServerEffect } from "../Entites/ServerCardEffect";

export class ServerEffectData {

    effectTargetCard!: number;
    effectTargets: number[] = [];
    isTargetStackEffect!: boolean;
    effectOriginPlayer!: number;
    effectCard!: number;
    effectCardOwner!: number;
    effectCardPlayer!: number;
    cardEffect!: ServerEffect;
    numberRolled!: number;
    chainEffectsData: Array<{
        effectIndex: number,
        data: any[];
    }> = []
    methodArgs: Map<string, any> = new Map();
    terminateOriginal!: boolean;
    isPassive!: boolean;
}
